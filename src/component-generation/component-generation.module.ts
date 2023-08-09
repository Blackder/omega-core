import { Module } from '@nestjs/common';
import { ComponentGenerationController } from './component-generation.controller';
import { OutputProviderResolver } from './services/output-provider.service';
import { ConfigModule } from '@nestjs/config';
import {
  DefaultFileWriter,
  FileWriterInjectionToken,
} from './services/file-writer.service';

@Module({
  imports: [ConfigModule],
  controllers: [ComponentGenerationController],
  providers: [
    {
      provide: OutputProviderResolver,
      useClass: OutputProviderResolver,
    },
    {
      provide: FileWriterInjectionToken,
      useClass: DefaultFileWriter,
    },
  ],
})
export class ComponentGenerationModule {}
