import cleanTags from './utils';

export const genNoteLogseq = (items: any[], opts: any) => {
  const fmt = opts?.format || 'markdown';
  if (fmt === 'json') {
    const arr = items.map((s: any) => {
      const obj: any = {};
      if (opts.includeFields?.text) obj.text = s.text || s.body || s.title || '';
      if (opts.includeFields?.tags) obj.tags = s.tags || [];
      if (opts.includeFields?.comments) obj.comments = s.comments || [];
      return obj;
    });
    return JSON.stringify(arr, null, 2);
  }

  return items.map((s: any) => {
    const parts: string[] = [];
    if (opts.includeFields?.text) parts.push(s.text || s.body || s.title || '');
  if (opts.includeFields?.tags && (s.tags || []).length) parts.push(`Tags:: ${(cleanTags(s.tags) || []).join(',')}`);
    if (opts.includeFields?.comments && (s.comments || []).length) parts.push('Comments:: ' + (s.comments || []).join(' | '));
    return parts.join('\n');
  }).join('\n\n');
};

export default genNoteLogseq;
