import { ImportStatement } from '../importers/importer.service';

export interface TemplateComponent {
  getTemplate(): string;
}
