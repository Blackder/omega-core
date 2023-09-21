import { applyDecorators } from '@nestjs/common';
import { ApiProduces, ApiResponse } from '@nestjs/swagger';

export function ApiFileResponse(...mimeTypes: string[]) {
  return applyDecorators(
    ApiResponse({
      schema: {
        type: 'string',
        format: 'binary',
      },
    }),
    ApiProduces(...mimeTypes),
  );
}
