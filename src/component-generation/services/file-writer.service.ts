import { ConfigService } from '@nestjs/config';
import { join, resolve } from 'path';
import { configurationKeys } from '../../configuration.constant';
import { OutputProvider } from './output-provider.service';
import { Injectable } from '@nestjs/common';
import AdmZip from 'adm-zip';
import { v4 } from 'uuid';
const fs = require('@cyclic.sh/s3fs');

export const FileWriterInjectionToken = 'FileWriter';

export interface FileWriter {
  // Zip and return the zipped file path
  zipFile(provider: OutputProvider, config: any): Promise<string>;
}

@Injectable()
export class DefaultFileWriter implements FileWriter {
  private outputFolderPath: string;

  constructor(configService: ConfigService) {
    this.outputFolderPath = configService.get(
      configurationKeys.downloadable_files_directory,
    );
    fs.mkdirSync(resolve(this.outputFolderPath), {
      recursive: true,
    });
  }

  async zipFile(provider: OutputProvider, config: any): Promise<string> {
    let zip = new AdmZip();
    let output = await provider.getOutput(config);
    let basePath = join(this.outputFolderPath, output.path);

    for (const file of output.files) {
      zip.addFile(file.path, Buffer.from(file.content, 'utf8'));
    }

    let zipOutput = `${basePath}-${v4()}.zip`;
    zip.writeZip(zipOutput);

    return zipOutput;
  }
}
