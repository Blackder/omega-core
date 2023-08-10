import { Body, Controller, Header, Inject, Post, Res, StreamableFile } from '@nestjs/common';
import {
  FileWriter,
  FileWriterInjectionToken,
} from './services/file-writer.service';
import { createReadStream } from 'fs';
import { join } from 'path';
import { OutputProviderResolver } from './services/output-provider.service';
import { ServerResponse } from 'http';

@Controller('component-generation')
export class ComponentGenerationController {
  constructor(
    @Inject(FileWriterInjectionToken) private fileWriter: FileWriter,
    private outputProviderResolver: OutputProviderResolver,
  ) {}

  @Post()
  @Header('Content-Type', 'application/zip')
  async generate(@Body() config: any, @Res({ passthrough: true }) res: ServerResponse): Promise<StreamableFile> {
    res.setHeader('Content-Disposition',`attachment; filename="${config.name}.zip"`);
    let filePath = await this.fileWriter.zipFile(
      this.outputProviderResolver.resolve(config),
      config,
    );
    const file = createReadStream(join(process.cwd(), filePath));
    return Promise.resolve(new StreamableFile(file));
  }
}
