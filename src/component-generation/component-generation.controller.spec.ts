import { Test, TestingModule } from '@nestjs/testing';
import { ComponentGenerationController } from './component-generation.controller';
import { createWriteStream, rmSync } from 'fs';
import AdmZip from 'adm-zip';
import { ComponentGenerationModule } from './component-generation.module';
import configModule from '../config.module';

describe('ComponentGenerationController', () => {
  let controller: ComponentGenerationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [configModule, ComponentGenerationModule],
    }).compile();

    controller = module.get<ComponentGenerationController>(
      ComponentGenerationController,
    );
  });

  afterEach(async () => {
    rmSync('./test-component.zip', {
      force: true,
      recursive: true,
    });
    rmSync('./download/test-counter.zip', {
      force: true,
      recursive: true,
    });
  });

  it('should generate correct zip file', async () => {
    const file = await controller.generate(`{
      "framework": "angular",
      "name": "test-counter",
      "export": true,
      "inputs": [
        {
          "name": "initialValue",
          "type": "number"
        }
      ],
      "outputs": [
        {
          "name": "increased",
          "type": "Subject<number>"
        }
      ],
      "children": [
        {
          "name": "p",
          "bindings": [
            {
              "type": "innerText",
              "to": "value",
              "toType": "number"
            }
          ]
        },
        {
          "name": "button",
          "bindings": [
            {
              "type": "event",
              "from": "click",
              "to": "increaseValue()"
            }
          ]
        },
        {
          "name": "app-footer",
          "bindings": [
            {
              "type": "property",
              "from": "text",
              "to": "customText",
              "toType": "string"
            }
          ]
        }
      ]
    }`);
    const writeStream = createWriteStream('./test-component.zip');
    file.getStream().pipe(writeStream);

    return new Promise((resolve, reject) => {
      writeStream.on('finish', () => {
        try {
          const zipFile = new AdmZip('./test-component.zip');
          const entries = zipFile.getEntries();

          expect(entries.length).toBe(3);

          const compare = (expected: string, actual: string) => {
            let expectedIndex = 0,
              actualIndex = 0;
            while (
              expectedIndex < expected.length &&
              actualIndex < actual.length
            ) {
              while (
                expected[expectedIndex] === ' ' ||
                expected[expectedIndex] === '\n'
              ) {
                expectedIndex++;
              }
              while (
                actual[actualIndex] === ' ' ||
                actual[actualIndex] === '\n'
              ) {
                actualIndex++;
              }
              expect(actual[actualIndex++]).toBe(expected[expectedIndex++]);
            }
          };

          for (const entry of entries) {
            const entryContent = entry.getData().toString('utf8');

            if (entry.entryName === 'test-counter.component.html') {
              compare(
                `<p>{{ value }}</p>
      <button (click)="increaseValue()"></button>
      <app-footer [text]="customText"> </app-footer>`,
                entryContent,
              );
            } else if (entry.entryName === 'test-counter.component.ts') {
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
          resolve(null);
        } catch (ex) {
          reject(ex);
        }
      });
    });
  });
});
