export function pascalToKebabCase(toConvert: string): string {
  let result = '';

  for (let i = 0; i < toConvert.length; i++) {
    let c = toConvert[i];
    if (c >= 'A' && c <= 'Z') {
      if (i !== 0) {
        result += `-${c.toLowerCase()}`;
      } else {
        result += c.toLowerCase();
      }
    } else {
      result += c;
    }
  }
  return result;
}

export function kebabToPascalCase(toConvert: string): string {
  let result = '';
  let foundDash = false;

  for (let i = 0; i < toConvert.length; i++) {
    let c = toConvert[i];

    if (i === 0 || foundDash) {
      foundDash = false;
      result += c.toUpperCase();
    } else {
      if (c === '-') {
        foundDash = true;
        continue;
      }
      result += c;
    }
  }
  return result;
}
