export class ImportStatement {
  private toImportSet = new Set<string>();

  constructor(public from: string, public toImports: string[] = []) {}

  public import(toImport: string): void {
    if (this.toImportSet.has(toImport)) {
      return;
    }

    this.toImportSet.add(toImport);
    this.toImports.push(toImport);
  }

  public toString(): string {
    if (this.toImports.length === 0) {
      throw new Error('Import list must not be empty');
    }
    return `import { ${this.toImports.join(',')} } from '${this.from}'`;
  }
}

export class ImportStatementCollection {
  private importMap: { [from: string]: ImportStatement } = {};

  public import(toImport: string, from: string): void {
    const existingImport = this.importMap[from];

    if (existingImport) {
      existingImport.import(toImport);
    } else {
      this.importMap[from] = new ImportStatement(from, [toImport]);
    }
  }

  getImportStatements(): string {
    let result = '';
    for (const key in this.importMap) {
      result += `${this.importMap[key].toString()};\n`;
    }
    return result;
  }

  getImportModules(): string[] {
    const result = [];

    for (const key in this.importMap) {
      const modules = this.importMap[key].toImports.filter(
        (i) => i !== 'NgModule' && i.endsWith('Module'),
      );

      if (modules.length > 0) {
        result.push(modules);
      }
    }

    return result;
  }
}
