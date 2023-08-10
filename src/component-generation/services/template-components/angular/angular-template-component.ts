import { ImportStatementCollection } from '../../importers/importer.service';
import { TemplateComponent } from '../template-component';
import { AngularTemplateComponentResolver } from './angular-template-component-resolver';
import { BindingAndAttributeProvider } from './binding-and-attribute-provider';
import { formatHtml } from '../../formatter.service';

const selfClosedTags = ['input', 'img'];

export abstract class AngularTemplateComponent implements TemplateComponent {
  constructor(private importStatementCollection: ImportStatementCollection) {
    this.registerImportModules(importStatementCollection);
  }
  protected abstract registerImportModules(
    importStatementCollection: ImportStatementCollection,
  );

  abstract getTemplate(): string;
}

export class AngularHtmlTemplateComponent extends AngularTemplateComponent {
  private isSelfClosed: boolean;
  private children: AngularTemplateComponent[] = [];

  constructor(
    private config: any,
    private bindingAndAttributeProvider: BindingAndAttributeProvider,
    private templateComponentResolver: AngularTemplateComponentResolver,
    importStatementCollection: ImportStatementCollection,
  ) {
    super(importStatementCollection);

    this.isSelfClosed = this.isSelfClosedTag();
    if (this.config.children) {
      if (this.isSelfClosed) {
        throw new Error('Self-closed elements cannot have children.');
      }
      for (const child of this.config.children) {
        this.children.push(
          this.templateComponentResolver.get(child, importStatementCollection),
        );
      }
    }
  }

  protected registerImportModules(
    _importStatementCollection: ImportStatementCollection,
  ) {
    // Html template doesn't need to import any module
  }

  getTemplate(): string {
    let propertyBindingsAndAttributes =
      this.bindingAndAttributeProvider.getPropertyBindingAndAttributes(
        this.config,
      );
    let innerTextBindings =
      this.bindingAndAttributeProvider.getInnerTextBindings(
        this.config,
        this.isSelfClosed,
      );

    if (this.isSelfClosed) {
      return `<${this.config.name} ${
        propertyBindingsAndAttributes.length > 0
          ? `${propertyBindingsAndAttributes.join(' ')}`
          : ''
      }/>`;
    }

    const innerHtml = `${
      innerTextBindings.length > 0 ? `${innerTextBindings.join(' ')}\n` : ''
    }${this.config.innerHtml ? this.config.innerHtml : ''}${
      this.children.length > 0
        ? this.children.map((c) => c.getTemplate()).join('\n')
        : ''
    }`;

    // Don't include the root element
    if (this.config.framework) {
      return innerHtml;
    }

    return `<${this.config.name}${
      propertyBindingsAndAttributes.length > 0
        ? ` ${propertyBindingsAndAttributes.join(' ')}`
        : ''
    }>${innerHtml}
      </${this.config.name}>`;
  }

  private isSelfClosedTag(): boolean {
    return selfClosedTags.findIndex((t) => t === this.config.name) !== -1;
  }
}
