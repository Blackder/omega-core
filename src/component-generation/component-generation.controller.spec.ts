import { Test, TestingModule } from '@nestjs/testing';
import { ComponentGenerationController } from './component-generation.controller';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { ComponentGenerationModule } from './component-generation.module';
import configModule from '../config.module';
import { ServerResponse } from 'http';
import { compare, downloadAndAssert } from '../utils/test.util';
import {
  testComplexFormConfig,
  testComponentGenerationConfig,
  testFormConfig,
} from './component-generation.controller.spec.data';

const downloadPath = './test-download';

describe('ComponentGenerationController', () => {
  let controller: ComponentGenerationController;
  let response: Partial<ServerResponse>;

  beforeAll(() => {
    if (!existsSync(downloadPath)) {
      mkdirSync(downloadPath);
    }
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [configModule, ComponentGenerationModule],
    }).compile();

    controller = module.get<ComponentGenerationController>(
      ComponentGenerationController,
    );

    response = {
      setHeader: jest.fn().mockImplementation(),
    };
  });

  afterAll(async () => {
    rmSync('./test-download', {
      recursive: true,
      force: true,
    });
  });

  it('should return correct component list for Angular', () => {
    const componentList = controller.getComponentList('angular');

    expect(componentList).toEqual([
      'custom-component',
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
    ]);
  });

  it('should generate correct zip file', async () => {
    const file = await controller.generateAngularComponent(
      testComponentGenerationConfig,
      response as ServerResponse,
    );

    const componentName = 'test-counter';

    return downloadAndAssert(
      file,
      `${downloadPath}/${componentName}.zip`,
      (zipFile) => {
        const entries = zipFile.getEntries();

        expect(entries.length).toBe(3);

        for (const entry of entries) {
          const entryContent = entry.getData().toString('utf8');

          if (entry.entryName === `${componentName}.component.html`) {
            compare(
              `<p>{{ value }}</p>
  <button (click)="increaseValue()">Increase</button>
  <app-footer [text]="customText"> </app-footer>`,
              entryContent,
            );
          } else if (entry.entryName === `${componentName}.component.ts`) {
            compare(
              `import { Component, Input, Output } from "@angular/core";
            import { Subject } from "rxjs";
            @Component({
              selector: "app-test-counter",
              templateUrl: "./test-counter.component.html",
              styleUrls: ["./test-counter.component.scss"],
            })
            export class TestCounterComponent {
              @Input() initialValue: number;
              @Output() increased: Subject<number>;
              value: number;
              customText: string;
              increaseValue(): void {}
            }`,
              entryContent,
            );
          } else {
            compare(
              `import { NgModule } from "@angular/core";
            import { CommonModule } from "@angular/common";
            import { TestCounterComponent } from "./test-counter.component.ts";
            
            @NgModule({
              declarations: [TestCounterComponent],
              imports: [CommonModule],
              exports: [TestCounterComponent],
            })
            export class TestCounterModule {}`,
              entryContent,
            );
          }
        }
      },
    );
  });

  it('should generate form settings', async () => {
    const file = await controller.generateAngularComponent(
      testFormConfig,
      response as ServerResponse,
    );

    const componentName = 'sign-in-form';

    return downloadAndAssert(
      file,
      `${downloadPath}/${componentName}.component.zip`,
      (zipFile) => {
        const entries = zipFile.getEntries();

        expect(entries.length).toBe(3);

        for (const entry of entries) {
          const entryContent = entry.getData().toString('utf8');

          if (entry.entryName === `${componentName}.component.html`) {
            compare(
              `<form [formGroup]="formGroup">
              <div>
                <label>Username </label>
                <input formControlName="username" />
              </div>
              <div>
                <label>Password </label>
                <input formControlName="password" />
              </div>
              <button>Sign in</button>
            </form>
            `,
              entryContent,
            );
          } else if (entry.entryName === `${componentName}.component.ts`) {
            compare(
              `import { Component } from "@angular/core";
              import { FormBuilder, FormGroup } from "@angular/forms";

              @Component({
                selector: "app-sign-in-form",
                templateUrl: "./sign-in-form.component.html",
                styleUrls: ["./sign-in-form.component.scss"],
              })
              export class SignInFormComponent {
                formGroup: FormGroup = this.fb.group({
                  username: this.fb.control(""),
                  password: this.fb.control(""),
                });
              
                constructor(private fb: FormBuilder) {}
              }
            `,
              entryContent,
            );
          } else {
            compare(
              `import { ReactiveFormsModule } from "@angular/forms";
              import { NgModule } from "@angular/core";
              import { CommonModule } from "@angular/common";
              import { SignInFormComponent } from "./sign-in-form.component.ts";
              
              @NgModule({
                declarations: [SignInFormComponent],
                imports: [ReactiveFormsModule, CommonModule],
              })
              export class SignInFormModule {}
            `,
              entryContent,
            );
          }
        }
      },
    );
  });

  it('should correct generate complex form settings', async () => {
    const file = await controller.generateAngularComponent(
      testComplexFormConfig,
      response as ServerResponse,
    );

    const componentName = 'complex-sign-in-form';

    return downloadAndAssert(
      file,
      `${downloadPath}/${componentName}.component.zip`,
      (zipFile) => {
        const entries = zipFile.getEntries();

        expect(entries.length).toBe(3);

        for (const entry of entries) {
          const entryContent = entry.getData().toString('utf8');

          if (entry.entryName === `${componentName}.component.html`) {
            compare(
              `<form [formGroup]="formGroup">
              <div>
                <label>Username </label>
                <input formControlName="username" />
              </div>
              <div>
                <label>Password </label>
                <input formControlName="password" />
              </div>
              <div formGroupName="address">
                <label>City </label>
                <input formControlName="city" />
                <div formArrayName="streets">
                  <div
                    *ngFor="let control of streetControls; let i = index"
                    formGroupName="i"
                  >
                    <input formControlName="streetName" />
                    <input formControlName="district" />
                  </div>
                </div>
              </div>
              <button>Sign in</button>
            </form>
            `,
              entryContent,
            );
          } else if (entry.entryName === `${componentName}.component.ts`) {
            compare(
              `import { Component } from "@angular/core";
              import { FormBuilder, FormGroup } from "@angular/forms";
              
              @Component({
                selector: "app-complex-sign-in-form",
                templateUrl: "./complex-sign-in-form.component.html",
                styleUrls: ["./complex-sign-in-form.component.scss"],
              })
              export class ComplexSignInFormComponent {
                formGroup: FormGroup = this.fb.group({
                  username: this.fb.control(""),
                  password: this.fb.control(""),
                  address: this.fb.group({
                    city: this.fb.control(""),
                    streets: this.fb.array([
                      this.fb.group({
                        streetName: this.fb.control(""),
                        district: this.fb.control(""),
                      }),
                    ]),
                  }),
                });
              
                constructor(private fb: FormBuilder) {}
              }
            `,
              entryContent,
            );
          } else {
            compare(
              `import { ReactiveFormsModule } from "@angular/forms";
              import { NgModule } from "@angular/core";
              import { CommonModule } from "@angular/common";
              import { ComplexSignInFormComponent } from "./complex-sign-in-form.component.ts";
              
              @NgModule({
                declarations: [ComplexSignInFormComponent],
                imports: [ReactiveFormsModule, CommonModule],
              })
              export class ComplexSignInFormModule {}
            `,
              entryContent,
            );
          }
        }
      },
    );
  });
});
