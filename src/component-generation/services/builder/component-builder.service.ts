import {
  ImportStatement,
  ImportStatementCollection,
} from '../importers/importer.service';

export interface ComponentBuilder {
  import(toImport: string, from: string): ComponentBuilder;
  build(): Promise<string>;
}

export abstract class BaseComponentBuilder implements ComponentBuilder {
  constructor(private importStatementCollection: ImportStatementCollection) {}

  import(toImport: string, from: string): ComponentBuilder {
    this.importStatementCollection.import(toImport, from);
    return this;
  }

  abstract build(): Promise<string>;

  protected getImportStatements(): string {
    return this.importStatementCollection.getImportStatements();
  }
}
