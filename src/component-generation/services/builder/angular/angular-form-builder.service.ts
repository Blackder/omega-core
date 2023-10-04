export interface FormControlCollection {
  controls: AngularFormControl[];
  add(control: AngularFormControl): void;
}

export class AngularFormControl {
  constructor(public name?: string) {}

  toString(): string {
    return `${this.name}: this.fb.control('')`;
  }
}

export class AngularFormGroup
  extends AngularFormControl
  implements FormControlCollection
{
  public controls: AngularFormControl[] = [];

  add(control: AngularFormControl): void {
    this.controls.push(control);
  }

  override toString(): string {
    return `${this.name ? `${this.name}: ` : ''}this.fb.group({
            ${this.controls.map((c) => c.toString()).join(',\n')}
        })`;
  }
}
export class AngularFormArray
  extends AngularFormControl
  implements FormControlCollection
{
  public controls: AngularFormControl[] = [];

  add(control: AngularFormControl): void {
    this.controls.push(control);
  }

  override toString(): string {
    return `${this.name}: this.fb.array([
            ${this.controls.map((c) => c.toString()).join(',\n')}
    ])`;
  }
}
