import { ApiProperty } from '@nestjs/swagger';
import { BindingType } from '../services/template-components/angular/binding-and-attribute-provider';

export class AttributeDto {
  name: string;
  value: string;
}

export class InputDto {
  name: string;
  type: string;
}

export class OutputDto {
  name: string;
  type: string;
}

export class BindingDto {
  type: BindingType;
  from?: any;
  to?: any;
  toType?: string;
  toValue?: any;
}

export class AngularBuildingBlockPropertyDto {
  name?: string;
  value?: string;
  attributes?: AttributeDto[];
  bindings?: BindingDto[];
  children?: AngularBuildingBlockPropertyDto[] = [];
}

export class AngularComponentPropertyDto {
  componentName?: string = '';
  export?: boolean;
  inputs?: InputDto[];
  outputs?: OutputDto[];
  children?: AngularBuildingBlockPropertyDto[];
}
