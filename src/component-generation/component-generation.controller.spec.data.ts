import { AngularComponentPropertyDto } from './dto/angular-property-config.dto';
import { BindingType } from './services/template-components/angular/binding-and-attribute-provider';

export const testComponentGenerationConfig = {
  componentName: 'test-counter',
  export: true,
  inputs: [
    {
      name: 'initialValue',
      type: 'number',
    },
  ],
  outputs: [
    {
      name: 'increased',
      type: 'Subject<number>',
    },
  ],
  children: [
    {
      name: 'p',
      bindings: [
        {
          type: BindingType.innerText,
          to: 'value',
          toType: 'number',
        },
      ],
    },
    {
      name: 'button',
      value: 'Increase',
      bindings: [
        {
          type: BindingType.event,
          from: 'click',
          to: 'increaseValue()',
        },
      ],
    },
    {
      name: 'app-footer',
      bindings: [
        {
          type: BindingType.property,
          from: 'text',
          to: 'customText',
          toType: 'string',
        },
      ],
    },
  ],
};

export const testFormConfig = {
  componentName: 'sign-in-form',
  children: [
    {
      name: 'form',
      bindings: [
        {
          type: BindingType.property,
          from: 'formGroup',
          to: 'formGroup',
          toType: 'FormGroup',
        },
      ],
      children: [
        {
          name: 'div',
          children: [
            {
              name: 'label',
              value: 'Username',
            },
            {
              name: 'input',
              attributes: [
                {
                  name: 'formControlName',
                  value: 'username',
                },
              ],
            },
          ],
        },
        {
          name: 'div',
          children: [
            {
              name: 'label',
              value: 'Password',
            },
            {
              name: 'input',
              attributes: [
                {
                  name: 'formControlName',
                  value: 'password',
                },
              ],
            },
          ],
        },
        {
          name: 'button',
          value: 'Sign in',
        },
      ],
    },
  ],
};

export const testComplexFormConfig: AngularComponentPropertyDto = {
  componentName: 'complex-sign-in-form',
  children: [
    {
      name: 'form',
      bindings: [
        {
          type: BindingType.property,
          from: 'formGroup',
          to: 'formGroup',
          toType: 'FormGroup',
        },
      ],
      children: [
        {
          name: 'div',
          children: [
            {
              name: 'label',
              value: 'Username',
            },
            {
              name: 'input',
              attributes: [
                {
                  name: 'formControlName',
                  value: 'username',
                },
              ],
            },
          ],
        },
        {
          name: 'div',
          children: [
            {
              name: 'label',
              value: 'Password',
            },
            {
              name: 'input',
              attributes: [
                {
                  name: 'formControlName',
                  value: 'password',
                },
              ],
            },
          ],
        },
        {
          name: 'div',
          attributes: [
            {
              name: 'formGroupName',
              value: 'address',
            },
          ],
          children: [
            {
              name: 'label',
              value: 'City',
            },
            {
              name: 'input',
              attributes: [
                {
                  name: 'formControlName',
                  value: 'city',
                },
              ],
            },
            {
              name: 'div',
              attributes: [
                {
                  name: 'formArrayName',
                  value: 'streets',
                },
              ],
              children: [
                {
                  name: 'div',
                  attributes: [
                    {
                      name: '*ngFor',
                      value: 'let control of streetControls; let i = index',
                    },
                    {
                      name: 'formGroupName',
                      value: 'i',
                    },
                  ],
                  children: [
                    {
                      name: 'input',
                      attributes: [
                        {
                          name: 'formControlName',
                          value: 'streetName',
                        },
                      ],
                    },
                    {
                      name: 'input',
                      attributes: [
                        {
                          name: 'formControlName',
                          value: 'district',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: 'button',
          value: 'Sign in',
        },
      ],
    },
  ],
};
