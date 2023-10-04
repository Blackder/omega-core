import { Module } from '@nestjs/common';
import { ComponentGenerationController } from './component-generation.controller';
import { ConfigModule } from '@nestjs/config';
import {
  DefaultFileWriter,
  FileWriterInjectionToken,
} from './services/file-writer.service';
import { ComponentProviderResolver } from './services/component-provider/component-provider-resolver.service';

@Module({
  imports: [ConfigModule],
  controllers: [ComponentGenerationController],
  providers: [
    {
      provide: FileWriterInjectionToken,
      useClass: DefaultFileWriter,
    },
    ComponentProviderResolver,
  ],
})
export class ComponentGenerationModule {}
