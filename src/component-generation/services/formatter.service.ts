import { format } from 'prettier';

export const formatHtml = (content: string) => {
  return format(content, {
    parser: 'html',
  });
};

export const formatTypescript = (content: string) => {
  return format(content, {
    parser: 'typescript',
  });
};
