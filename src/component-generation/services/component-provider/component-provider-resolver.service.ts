import { Injectable } from '@nestjs/common';
import { AngularComponentProvider } from './angular/angular-component-provider.service';
import {
  ComponentProvider,
  HtmlComponentProvider,
} from './component-provider.service';

@Injectable()
export class ComponentProviderResolver {
  private frameworkMap = {
    angular: new AngularComponentProvider(new HtmlComponentProvider()),
  };

  getProvider(forFramework: string): ComponentProvider {
    if (Object.prototype.hasOwnProperty.call(this.frameworkMap, forFramework)) {
      return this.frameworkMap[forFramework];
    }
    return new HtmlComponentProvider();
  }
}
