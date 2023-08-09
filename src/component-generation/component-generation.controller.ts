import { Controller, Inject, Post, StreamableFile } from '@nestjs/common';
import {
  FileWriter,
  FileWriterInjectionToken,
} from './services/file-writer.service';
import { createReadStream } from 'fs';
import { join } from 'path';
import { OutputProviderResolver } from './services/output-provider.service';

@Controller('component-generation')
export class ComponentGenerationController {
  constructor(
    @Inject(FileWriterInjectionToken) private fileWriter: FileWriter,
    private outputProviderResolver: OutputProviderResolver,
  ) {}

  @Post()
  async generate(config: string): Promise<StreamableFile> {
    let componentConfig = JSON.parse(config);
    let filePath = await this.fileWriter.zipFile(
      this.outputProviderResolver.resolve(componentConfig),
      componentConfig,
    );
    const file = createReadStream(join(process.cwd(), filePath));
    return Promise.resolve(new StreamableFile(file));
  }
}
