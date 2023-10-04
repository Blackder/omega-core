import { Module } from '@nestjs/common';
import { ComponentGenerationModule } from './component-generation/component-generation.module';
import configModule from './config.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './exception-filter';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [configModule, ComponentGenerationModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
