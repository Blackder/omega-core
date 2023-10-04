import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ComponentGenerationModule } from './component-generation/component-generation.module';
import configModule from './config.module';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [configModule, ComponentGenerationModule],
})
export class AppModule {}
