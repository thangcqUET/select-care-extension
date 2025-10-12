export const cleanTags = (tags: any): string[] => {
  if (!Array.isArray(tags)) return [];
  return tags.filter((t: any) => typeof t === 'string' && !t.startsWith('fn_'));
};

export default cleanTags;
