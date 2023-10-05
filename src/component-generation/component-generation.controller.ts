import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Res,
  StreamableFile,
} from '@nestjs/common';
import {
  FileWriter,
  FileWriterInjectionToken,
} from './services/file-writer.service';
import { createReadStream, rmSync } from 'fs';
import { join } from 'path';
import { AngularOutputProvider } from './services/output-provider.service';
import { ServerResponse } from 'http';
import { ComponentProviderResolver } from './services/component-provider/component-provider-resolver.service';
import { ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { configurationKeys } from '../configuration.constant';
import { AngularComponentPropertyDto } from './dto/angular-property-config.dto';
import { ApiFileResponse } from '../utils/decorator';

@ApiTags('component-generation')
@Controller('component-generation')
export class ComponentGenerationController {
  constructor(
    @Inject(FileWriterInjectionToken) private fileWriter: FileWriter,
    private componeProviderResolver: ComponentProviderResolver,
    private configService: ConfigService,
  ) {}

  @Get('frameworks')
  getFrameworks(): string[] {
    return ['angular'];
  }

  @Get(':framework')
  getComponentList(@Param('framework') framework: string): string[] {
    return this.componeProviderResolver.getProvider(framework).getComponents();
  }

  @Post()
  @ApiFileResponse('application/zip')
  async generateAngularComponent(
    @Body() config: AngularComponentPropertyDto,
    @Res({ passthrough: true }) res: ServerResponse,
  ): Promise<StreamableFile> {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${config.componentName}.zip"`,
    );
    let filePath = await this.fileWriter.zipFile(
      new AngularOutputProvider(
        this.configService.get(configurationKeys.angular_selector_prefix),
      ),
      config,
    );
    const file = createReadStream(join(process.cwd(), filePath));
    file.on('end', () => {
      rmSync(filePath, {
        recursive: true,
        force: true,
      });
    });
    return Promise.resolve(new StreamableFile(file));
  }
}
