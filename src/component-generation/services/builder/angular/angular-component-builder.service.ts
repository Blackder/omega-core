import {
  BaseComponentBuilder,
  ComponentBuilder,
} from '../component-builder.service';
import { ImportStatementCollection } from '../../importers/importer.service';
import { kebabToPascalCase } from '../../../../utils/string.util';
import { formatTypescript } from '../../formatter.service';

export class Input {
  constructor(private name: string, private type: string) {}

  toString(): string {
    return `@Input() ${this.name}: ${this.type};`;
  }
}

export class Output {
  constructor(private name: string, private type: string) {}

  toString(): string {
    return `@Output() ${this.name}: ${this.type};`;
  }
}

export interface AngularComponentBuilder extends ComponentBuilder {
  setSelector(name: string): AngularComponentBuilder;
  addInput(name: string, type: string): AngularComponentBuilder;
  addOutput(name: string, type: string): AngularComponentBuilder;
}

export class DefaultAngularComponentBuilder
  extends BaseComponentBuilder
  implements AngularComponentBuilder
{
  private className: string = '';
  private selector: string = '';
  private inputs: Input[] = [];
  private outputs: Output[] = [];

  constructor(
    private selectorPrefix: string,
    importStatementCollection: ImportStatementCollection,
  ) {
    super(importStatementCollection);
  }

  getInputDeclaration(): string {
    return `${this.inputs.map((i) => i.toString()).join('\n')}\n`;
  }

  getOutputDeclaration(): string {
    return `${this.outputs.map((o) => o.toString()).join('\n')}\n`;
  }

  build(): string {
    return formatTypescript(`${this.getImportStatements()}
@Component({
    selector: '${this.selectorPrefix}-${this.selector}',
    templateUrl: './${this.selector}.component.html',
    styleUrls: ['./${this.selector}.component.scss'],
})
export class ${this.className} {
  ${this.getInputDeclaration()}
  ${this.getOutputDeclaration()}
}
    `);
  }
  setSelector(name: string): AngularComponentBuilder {
    this.className = `${kebabToPascalCase(name)}Component`;
    this.selector = name;
    return this;
  }
  addInput(name: string, type: string): AngularComponentBuilder {
    this.inputs.push(new Input(name, type));
    return this;
  }
  addOutput(name: string, type: string): AngularComponentBuilder {
    this.outputs.push(new Output(name, type));
    return this;
  }
}
