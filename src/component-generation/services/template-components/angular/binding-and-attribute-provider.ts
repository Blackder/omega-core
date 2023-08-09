enum BindingType {
  innerText = 'innerText',
  property = 'property',
  twoWay = 'twoway',
  event = 'event',
}

const nonAttributeKeys = [
  'name',
  'inputs',
  'outputs',
  'children',
  'bindings',
  'framework',
  'export',
];

interface Binding {
  type: BindingType;
  from: any;
  to?: any;
  toValue?: any;
}

export class BindingAndAttributeProvider {
  public getInnerTextBindings(config: any, isSelfClosed: boolean): string[] {
    if (!config.bindings) {
      return [];
    }

    if (isSelfClosed) {
      return [];
    }

    return config.bindings
      .filter((b) => b.type === BindingType.innerText)
      .map((b) => `{{ ${b.to} }}`);
  }

  public getPropertyBindingAndAttributes(config: any): string[] {
    return this.getPropertyAndEventBindings(config).concat(
      this.getAttributes(config),
    );
  }

  private getPropertyAndEventBindings(config: any): string[] {
    if (!config.bindings) {
      return [];
    }

    return config.bindings
      .filter(
        (b) =>
          b.type === BindingType.property ||
          b.type === BindingType.event ||
          b.type === BindingType.twoWay,
      )
      .map((b) =>
        b.type === BindingType.property
          ? this.getPropertyBinding(b)
          : b.type === BindingType.twoWay
          ? `[(${b.from})]="${b.to}"`
          : `(${b.from})="${b.to}"`,
      );
  }

  private getPropertyBinding(binding: Binding) {
    return binding.to
      ? `[${binding.from}]="${binding.to}"`
      : `${binding.from}="${binding.toValue}"`;
  }

  private getAttributes(config: any): string[] {
    const result = [];

    for (const key in config) {
      if (nonAttributeKeys.includes(key)) {
        continue;
      }
      const value = config[key];
      result.push(`${key}=${value}`);
    }

    return result;
  }
}
