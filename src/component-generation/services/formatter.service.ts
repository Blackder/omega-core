import { format } from 'prettier';

export const formatHtml = async (content: string) => {
  return await format(content, {
    parser: 'html',
  });
};

export const formatTypescript = async (content: string) => {
  return await format(content, {
    parser: 'typescript',
  });
};
