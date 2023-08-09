import { ConfigService } from '@nestjs/config';
import {
  AngularHtmlTemplateComponent,
  AngularTemplateComponent,
} from './angular-template-component';
import { configurationKeys } from 'src/configuration.constant';
import { BindingAndAttributeProvider } from './binding-and-attribute-provider';
import { ImportStatementCollection } from '../../importers/importer.service';

export class AngularTemplateComponentResolver {
  constructor(
    private selectorPrefix: string,
    private bindingAndAttributeProvider: BindingAndAttributeProvider,
  ) {}

  get(
    config: any,
    importStatementCollection: ImportStatementCollection,
  ): AngularTemplateComponent {
    return new AngularHtmlTemplateComponent(
      config,
      this.bindingAndAttributeProvider,
      this,
      importStatementCollection,
    );
  }
}
