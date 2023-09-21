export function escapeSpace(windowOSPath: string): string {
  let foundSpace = false;
  let pathPart = '';
  let escapedPath = '';

  for (let i = 0; i < windowOSPath.length; i++) {
    const c = windowOSPath[i];
    if (c === '\\' || i === windowOSPath.length - 1) {
      if (foundSpace) {
        let escapedPart = '';
        foundSpace = false;
        let characterCount = 0;
        for (const character of pathPart) {
          if (characterCount === 6) {
            break;
          }
          escapedPart += character.toUpperCase();
          characterCount++;
        }

        escapedPart += '~1';
        pathPart = escapedPart;
      }
      escapedPath += `${pathPart}${c}`;
      pathPart = '';
    } else {
      if (c === ' ') {
        foundSpace = true;
      } else {
        pathPart += c;
      }
    }
  }

  return escapedPath;
}
