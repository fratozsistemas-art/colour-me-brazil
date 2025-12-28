export const sanitizeText = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.replace(/<[^>]*>?/gm, '').trim();
};
