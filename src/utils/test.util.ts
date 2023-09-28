import { StreamableFile } from '@nestjs/common';
import AdmZip from 'adm-zip';
import { createWriteStream } from 'fs';

export function compare(expected: string, actual: string) {
  let expectedIndex = 0,
    actualIndex = 0;
  while (expectedIndex < expected.length && actualIndex < actual.length) {
    while (
      expected[expectedIndex] === ' ' ||
      expected[expectedIndex] === '\n'
    ) {
      expectedIndex++;
    }
    while (actual[actualIndex] === ' ' || actual[actualIndex] === '\n') {
      actualIndex++;
    }
    expect(actual[actualIndex++]).toBe(expected[expectedIndex++]);
  }
}

export function downloadAndAssert(
  file: StreamableFile,
  downloadedPath: string,
  assert: (zipFile: AdmZip) => void,
): Promise<unknown> {
  const writeStream = createWriteStream(downloadedPath);
  file.getStream().pipe(writeStream);

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => {
      try {
        const zipFile = new AdmZip(downloadedPath);
        assert(zipFile);
        resolve(null);
      } catch (ex) {
        reject(ex);
      }
    });
  });
}
