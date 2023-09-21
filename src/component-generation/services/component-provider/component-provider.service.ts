export interface ComponentProvider {
  getComponents(): string[];
}

export class HtmlComponentProvider implements ComponentProvider {
  getComponents(): string[] {
    return [
      'a',
      'button',
      'div',
      'fieldset',
      'form',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'img',
      'input',
      'label',
      'li',
      'p',
      'span',
      'ul',
    ];
  }
}
