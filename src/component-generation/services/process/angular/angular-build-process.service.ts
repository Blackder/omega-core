import { kebabToPascalCase } from '../../../../utils/string.util';
import { AngularComponentBuilder } from '../../builder/angular/angular-component-builder.service';
import { AngularTemplateComponentResolver } from '../../template-components/angular/angular-template-component-resolver';
import { BuildProcess } from '../build-process.service';
import { ImportStatementCollection } from '../../importers/importer.service';
import { formatHtml, formatTypescript } from '../../formatter.service';
import { BindingType } from '../../template-components/angular/binding-and-attribute-provider';
import { AngularBuildingBlockPropertyDto, AngularComponentPropertyDto, BindingDto } from 'src/component-generation/dto/angular-property-config.dto';

export class AngularComponentBuildProcess implements BuildProcess {
  constructor(private builder: AngularComponentBuilder) {}
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

    if (config.children) {
      const bindings = this.getAllBindings(config.children);

      for (const binding of bindings) {
        if (
          binding.type === BindingType.innerText ||
          binding.type === BindingType.property ||
          binding.type === BindingType.twoWay
        ) {
          if (binding.to) {
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

    return Promise.resolve(this.builder.build());
  }

  private getAllBindings(children: AngularBuildingBlockPropertyDto[]): BindingDto[] {
    if (!children || children.length === 0) {
      return [];
    }

    let result = children.flatMap(c => c.bindings);
    for (const child of children) {
      result = result.concat(this.getAllBindings(child.children));
    }

    return result;
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
