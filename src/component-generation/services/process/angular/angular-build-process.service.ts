import { kebabToPascalCase } from '../../../../utils/string.util';
import {
  AccessModifier,
  AngularComponentBuilder,
} from '../../builder/angular/angular-component-builder.service';
import { AngularTemplateComponentResolver } from '../../template-components/angular/angular-template-component-resolver';
import { BuildProcess } from '../build-process.service';
import { ImportStatementCollection } from '../../importers/importer.service';
import { formatHtml, formatTypescript } from '../../formatter.service';
import { BindingType } from '../../template-components/angular/binding-and-attribute-provider';
import {
  AngularBuildingBlockPropertyDto,
  AngularComponentPropertyDto,
  BindingDto,
} from 'src/component-generation/dto/angular-property-config.dto';
import {
  AngularFormArray,
  AngularFormControl,
  AngularFormGroup,
  FormControlCollection,
} from '../../builder/angular/angular-form-builder.service';

export class AngularComponentBuildProcess implements BuildProcess {
  constructor(
    private builder: AngularComponentBuilder,
    private moduleImportStatementCollection: ImportStatementCollection,
    private componentImportStatementCollection: ImportStatementCollection,
  ) {}
  build(config: AngularComponentPropertyDto): Promise<string> {
    this.builder.setSelector(`${config.componentName}`);

    this.builder.import('Component', '@angular/core');

    if (config.inputs && config.inputs.length > 0) {
      this.builder.import('Input', '@angular/core');

      for (const input of config.inputs) {
        this.builder.addInput(input.name, input.type);
      }
    }

    if (config.outputs && config.outputs.length > 0) {
      this.builder.import('Output', '@angular/core');
      for (const output of config.outputs) {
        this.builder.addOutput(output.name, output.type);

        if (output.type.includes('Subject')) {
          this.builder.import('Subject', 'rxjs');
        }
      }
    }

    const { formGroupName, formGroup } = this.buildBindingAndFormGroup(
      null,
      config.children,
    );

    if (formGroup?.controls.length > 0) {
      this.builder.addVariable(
        formGroupName,
        'FormGroup',
        formGroup.toString(),
      );
      this.componentImportStatementCollection.import(
        'FormBuilder',
        '@angular/forms',
      );
      this.componentImportStatementCollection.import(
        'FormGroup',
        '@angular/forms',
      );
      this.builder.addConstructorParam(
        'fb',
        'FormBuilder',
        AccessModifier.private,
      );
      this.moduleImportStatementCollection.import(
        'ReactiveFormsModule',
        '@angular/forms',
      );
    }

    return Promise.resolve(this.builder.build());
  }

  private buildBindingAndFormGroup(
    parent: FormControlCollection,
    children: AngularBuildingBlockPropertyDto[],
    // Each child control of a form array will have its name as the index
    // so we're passing this indexVariable to see if the new control is a child control of a form array
    indexVariableName?: string,
  ): {
    formGroupName: string;
    formGroup: AngularFormGroup;
  } {
    let formGroupName = '';
    if (!children) {
      return;
    }
    for (const child of children) {
      const formControls: AngularFormControl[] = [];
      if (child.bindings) {
        for (const binding of child.bindings) {
          this.addBinding(binding);

          if (binding.from === 'formGroup') {
            const formGroup = new AngularFormGroup();
            formControls.push(formGroup);
            formGroupName = binding.to;
            parent = formGroup;
          }
        }
      }

      let indexName = null;
      if (child.attributes) {
        if (indexVariableName) {
          indexName = indexVariableName;
        } else {
          const indexRegex = new RegExp(/let\s*(\w+)\s*=\s*index/g);

          const ngForAttr = child.attributes.find((a) => a.name === '*ngFor');

          if (ngForAttr) {
            const result = indexRegex.exec(ngForAttr.value);
            indexName = result[1];
          }
        }

        for (const attribute of child.attributes) {
          const controlName =
            attribute.value === indexName ? '' : attribute.value;

          if (attribute.name === 'formGroupName') {
            formControls.push(new AngularFormGroup(controlName));
          } else if (attribute.name === 'formArrayName') {
            formControls.push(new AngularFormArray(controlName));
          } else if (attribute.name === 'formControlName') {
            formControls.push(new AngularFormControl(controlName));
          }
        }
      }

      if (formControls.length > 1) {
        throw new Error(
          `More than 1 form binding found for '${child.name}' element`,
        );
      }

      if (formControls.length === 1 && parent && parent !== formControls[0]) {
        parent.add(formControls[0]);
      }

      this.buildBindingAndFormGroup(
        formControls.length === 1 &&
          (formControls[0] as FormControlCollection).controls
          ? (formControls[0] as FormControlCollection)
          : parent,
        child.children,
        indexName,
      );
    }

    return { formGroupName, formGroup: parent as AngularFormGroup };
  }

  private isFormRelatedBinding(binding: BindingDto): boolean {
    return binding.from === 'formGroup';
  }

  private addBinding(binding: BindingDto): void {
    if (
      binding.type === BindingType.innerText ||
      binding.type === BindingType.property ||
      binding.type === BindingType.twoWay
    ) {
      // Form config variable is built differently
      if (binding.to && !this.isFormRelatedBinding(binding)) {
        this.builder.addVariable(binding.to, binding.toType);
      }
    } else {
      // If a function call includes a dot, that means the function is already defined,
      // and doesn't need to be added to the component
      if (!binding.to.includes('.')) {
        this.builder.addFunction(binding.to);
      }
    }
  }
}

export class AngularModuleBuildProcess implements BuildProcess {
  constructor(private importStatementCollection: ImportStatementCollection) {
    importStatementCollection.import('NgModule', '@angular/core');
    importStatementCollection.import('CommonModule', '@angular/common');
  }

  async build(config: AngularComponentPropertyDto): Promise<string> {
    const moduleName = kebabToPascalCase(config.componentName);
    const componentName = `${moduleName}Component`;
    this.importStatementCollection.import(
      componentName,
      `./${config.componentName}.component.ts`,
    );

    return await formatTypescript(`${this.importStatementCollection.getImportStatements()}
@NgModule({
  declarations: [
    ${componentName}
  ],
  imports: [
    ${this.importStatementCollection.getImportModules().join(',')}
  ],
  ${
    config.export
      ? `exports: [
    ${componentName}
  ]`
      : ''
  }
})
export class ${moduleName}Module {}
    `);
  }
}

export class AngularTemplateBuildProcess implements BuildProcess {
  constructor(
    private templateComponentResolver: AngularTemplateComponentResolver,
    private importStatementCollection: ImportStatementCollection,
  ) {}

  async build(config: AngularComponentPropertyDto): Promise<string> {
    return await formatHtml(
      this.templateComponentResolver
        .get(config, this.importStatementCollection)
        .getTemplate(),
    );
  }
}
