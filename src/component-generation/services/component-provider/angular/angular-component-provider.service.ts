import {
  ComponentProvider,
  HtmlComponentProvider,
} from '../component-provider.service';

export class AngularComponentProvider implements ComponentProvider {
  constructor(private htmlComponentProvider: HtmlComponentProvider) {}

  getComponents(): string[] {
    return ['custom-component'].concat(
      this.htmlComponentProvider.getComponents(),
    );
  }
}
