import {
  BaseComponentBuilder,
  ComponentBuilder,
} from '../component-builder.service';
import { ImportStatementCollection } from '../../importers/importer.service';
import { kebabToPascalCase } from '../../../../utils/string.util';
import { formatTypescript } from '../../formatter.service';

class Input {
  constructor(
    private name: string,
    private type: string,
  ) {}

  toString(): string {
    return `@Input() ${this.name}: ${this.type};`;
  }
}

class Output {
  constructor(
    private name: string,
    private type: string,
  ) {}

  toString(): string {
    return `@Output() ${this.name}: ${this.type};`;
  }
}

class ConstructorParam {
  constructor(
    private name: string,
    private type: string,
    private accessModifier?: AccessModifier,
  ) {}

  toString(): string {
    return `${this.accessModifier ? `${this.accessModifier} ` : ''}${
      this.name
    }: ${this.type}`;
  }
}

class Variable {
  constructor(
    private name: string,
    private type: string,
    private value?: string,
  ) {}

  toString(): string {
    return `${this.name}: ${this.type}${this.value ? ` = ${this.value}` : ''};`;
  }
}

export enum AccessModifier {
  private = 'private',
  protected = 'protected',
  public = 'public',
}

export interface AngularComponentBuilder extends ComponentBuilder {
  setSelector(name: string): AngularComponentBuilder;
  addVariable(name: string, type: string, value?: string);
  addFunction(fn: string);
  addInput(name: string, type: string): AngularComponentBuilder;
  addOutput(name: string, type: string): AngularComponentBuilder;
  addConstructorParam(
    name: string,
    type: string,
    accessModifier?: AccessModifier,
  );
}

export class DefaultAngularComponentBuilder
  extends BaseComponentBuilder
  implements AngularComponentBuilder
{
  private className: string = '';
  private selector: string = '';
  private inputs: Input[] = [];
  private outputs: Output[] = [];
  private constructorParams: ConstructorParam[] = [];
  private variables: Variable[] = [];
  private funcs: string[] = [];

  constructor(
    private selectorPrefix: string,
    importStatementCollection: ImportStatementCollection,
  ) {
    super(importStatementCollection);
  }

  private getInputDeclaration(): string {
    return this.inputs.length > 0
      ? `${this.inputs.map((i) => i.toString()).join('\n')}\n`
      : '';
  }

  private getOutputDeclaration(): string {
    return this.outputs.length > 0
      ? `${this.outputs.map((o) => o.toString()).join('\n')}\n`
      : '';
  }

  private getConstructor(): string {
    return this.constructorParams.length > 0
      ? `constructor(${this.constructorParams
          .map((p) => p.toString())
          .join(',')}) {}`
      : '';
  }

  private getVariables(): string {
    return this.variables.length > 0
      ? `${this.variables.map((v) => v.toString()).join('\n')}\n`
      : '';
  }

  private getFunctions(): string {
    return this.funcs.length > 0 ? `${this.funcs.join('\n')}\n` : '';
  }

  async build(): Promise<string> {
    return await formatTypescript(`${this.getImportStatements()}
@Component({
    selector: '${this.selectorPrefix}-${this.selector}',
    templateUrl: './${this.selector}.component.html',
    styleUrls: ['./${this.selector}.component.scss'],
})
export class ${this.className} {
  ${this.getInputDeclaration()}
  ${this.getOutputDeclaration()}
  ${this.getVariables()}
  ${this.getConstructor()}
  ${this.getFunctions()}
}
    `);
  }
  setSelector(name: string): AngularComponentBuilder {
    this.className = `${kebabToPascalCase(name)}Component`;
    this.selector = name;
    return this;
  }

  addVariable(name: string, type: string, value?: string) {
    this.variables.push(new Variable(name, type, value));
  }

  addFunction(fn: string) {
    let funcSignature = '';
    let index = -1;
    do {
      index++;
      funcSignature += fn[index];
    } while (fn[index] !== '(');

    do {
      index++;

      let param = '';
      while (fn[index] !== ',' && fn[index] !== ')') {
        if (fn[index] === ' ') {
          index++;
          continue;
        }
        param += fn[index++];
      }
      funcSignature = funcSignature + param + fn[index];
    } while (fn[index] !== ')');

    funcSignature += ':void {}';

    this.funcs.push(funcSignature);
  }

  addInput(name: string, type: string): AngularComponentBuilder {
    this.inputs.push(new Input(name, type));
    return this;
  }

  addOutput(name: string, type: string): AngularComponentBuilder {
    this.outputs.push(new Output(name, type));
    return this;
  }

  addConstructorParam(
    name: string,
    type: string,
    accessModifier?: AccessModifier,
  ) {
    this.constructorParams.push(
      new ConstructorParam(name, type, accessModifier),
    );
  }
}
