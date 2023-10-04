import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { OpenApiNestFactory } from 'nest-openapi-tools';
import { DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { configurationKeys } from './configuration.constant';
import { resolve } from 'path';
import { escapeSpace } from './utils/path.utils';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    const configService = app.get<ConfigService>(ConfigService);

    let fileAndClientGenerationOptions = {};

    if (!JSON.parse(configService.get(configurationKeys.in_production))) {
      fileAndClientGenerationOptions = {
        fileGeneratorOptions: {
          enabled: true,
          outputFilePath: './openapi.yaml',
        },
        clientGeneratorOptions: {
          enabled: true,
          type: 'typescript-angular',
          // Change your .env.development api_client_folder_path to the correct path of your local environment web client
          outputFolderPath: escapeSpace(
            resolve(
              configService.get(configurationKeys.api_client_folder_path),
            ),
          ),
          additionalProperties:
            'apiPackage=clients,modelPackage=models,withoutPrefixEnums=true,withSeparateModelsAndApi=true',
          openApiFilePath: './openapi.yaml',
        },
      };
    }

    await OpenApiNestFactory.configure(
      app,
      new DocumentBuilder().setTitle('Omega API'),
      {
        webServerOptions: {
          enabled: true,
          path: 'api-docs',
        },
        ...fileAndClientGenerationOptions,
      },
    );

    app.enableCors({
      origin: configService.get(configurationKeys.allow_origin),
      exposedHeaders: configService.get(configurationKeys.exposed_headers),
    });

    await app.listen(3000);
  } catch (error) {
    console.error(error);
  }
}

bootstrap();
