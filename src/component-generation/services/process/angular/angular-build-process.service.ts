import { kebabToPascalCase } from '../../../../utils/string.util';
import { AngularComponentBuilder } from '../../builder/angular/angular-component-builder.service';
import { AngularTemplateComponentResolver } from '../../template-components/angular/angular-template-component-resolver';
import { BuildProcess } from '../build-process.service';
import { ImportStatementCollection } from '../../importers/importer.service';
import { formatHtml, formatTypescript } from '../../formatter.service';

export class AngularComponentBuildProcess implements BuildProcess {
  constructor(private builder: AngularComponentBuilder) {}
  build(config: any): string {
    this.builder.setSelector(`${config.name}`);

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

    return this.builder.build();
  }
}

export class AngularModuleBuildProcess implements BuildProcess {
  constructor(private importStatementCollection: ImportStatementCollection) {
    importStatementCollection.import('NgModule', '@angular/core');
    importStatementCollection.import('CommonModule', '@angular/common');
  }

  build(config: any): string {
    const moduleName = kebabToPascalCase(config.name);
    const componentName = `${moduleName}Component`;
    this.importStatementCollection.import(
      componentName,
      `./${config.name}.component.ts`,
    );

    return formatTypescript(`${this.importStatementCollection.getImportStatements()}
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

  build(config: any): string {
    return formatHtml(
      this.templateComponentResolver
        .get(config, this.importStatementCollection)
        .getTemplate(),
    );
  }
}
