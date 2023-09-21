import { DefaultAngularComponentBuilder } from './builder/angular/angular-component-builder.service';
import {
  AngularComponentBuildProcess,
  AngularModuleBuildProcess,
  AngularTemplateBuildProcess,
} from './process/angular/angular-build-process.service';
import { ImportStatementCollection } from './importers/importer.service';
import { AngularTemplateComponentResolver } from './template-components/angular/angular-template-component-resolver';
import { BindingAndAttributeProvider } from './template-components/angular/binding-and-attribute-provider';
import { ConfigService } from '@nestjs/config';
import { configurationKeys } from '../../configuration.constant';
import { Injectable } from '@nestjs/common';
import { AngularComponentPropertyDto } from '../dto/angular-property-config.dto';

export interface FolderOutput {
  path: string;
  files: FileOutput[];
}

export interface FileOutput {
  path: string;
  content: string;
}

export const OutputProviderInjectionToken = 'OutputProvider';

export interface OutputProvider {
  getOutput(config: any): Promise<FolderOutput>;
}

export class AngularOutputProvider implements OutputProvider {
  constructor(private selectorPrefix: string) {}

  async getOutput(config: AngularComponentPropertyDto): Promise<FolderOutput> {
    // The stuff that a component should import is irrelevant to the template and module import,
    // so we let the component build process use a separate ImportStatementCollection
    const componentBuildProcess = new AngularComponentBuildProcess(
      new DefaultAngularComponentBuilder(
        this.selectorPrefix,
        new ImportStatementCollection(),
      ),
    );
    const componentContent = await componentBuildProcess.build(config);

    // The stuff that the module must import is relevant to what is used in the template,
    // so they should share the same ImportStatementCollection,
    // and we should build the template before the module
    // to determine which other modules should be imported
    const importStatementCollection = new ImportStatementCollection();
    const templateBuildProcess = new AngularTemplateBuildProcess(
      new AngularTemplateComponentResolver(
        this.selectorPrefix,
        new BindingAndAttributeProvider(),
      ),
      importStatementCollection,
    );
    const templateContent = await templateBuildProcess.build(config);

    const moduleBuildProcess = new AngularModuleBuildProcess(
      importStatementCollection,
    );
    const moduleContent = await moduleBuildProcess.build(config);

    return {
      path: `./${config.componentName}`,
      files: [
        {
          path: `${config.componentName}.component.ts`,
          content: componentContent,
        },
        {
          path: `${config.componentName}.component.html`,
          content: templateContent,
        },
        {
          path: `${config.componentName}.module.ts`,
          content: moduleContent,
        },
      ],
    };
  }
}

const frameworks = {
  angular: 'angular',
  angularMaterial: 'angularMaterial',
};
