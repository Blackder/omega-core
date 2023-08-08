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
  getOutput(config: any): FolderOutput;
}

export class AngularOutputProvider implements OutputProvider {
  constructor(private selectorPrefix: string) {}

  getOutput(config: any): FolderOutput {
    // The stuff that a component should import is irrelevant to the template and module import,
    // so we let the component build process use a separate ImportStatementCollection
    const componentBuildProcess = new AngularComponentBuildProcess(
      new DefaultAngularComponentBuilder(
        this.selectorPrefix,
        new ImportStatementCollection(),
      ),
    );
    const componentContent = componentBuildProcess.build(config);

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
    const templateContent = templateBuildProcess.build(config);

    const moduleBuildProcess = new AngularModuleBuildProcess(
      importStatementCollection,
    );
    const moduleContent = moduleBuildProcess.build(config);

    return {
      path: `./${config.name}`,
      files: [
        {
          path: `${config.name}.component.ts`,
          content: componentContent,
        },
        {
          path: `${config.name}.component.html`,
          content: templateContent,
        },
        {
          path: `${config.name}.module.ts`,
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

@Injectable()
export class OutputProviderResolver {
  constructor(private configService: ConfigService) {}

  resolve(config: any) {
    switch (config.framework) {
      case frameworks.angular:
        return new AngularOutputProvider(
          this.configService.get(configurationKeys.angular_selector_prefix),
        );
      default:
        return null;
    }
  }
}
