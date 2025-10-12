export const genNoteNotion = (items: any[], opts: any) => {
  const fmt = opts?.format || 'md';
  if (fmt === 'csv') {
    // CSV: header row then rows with selected fields
    const headers: string[] = [];
    if (opts.includeFields?.text) headers.push('text');
    if (opts.includeFields?.tags) headers.push('tags');
  if (opts.includeFields?.comments) headers.push('comments');

    const escape = (v: any) => {
      if (v == null) return '';
      const s = String(v);
      return `"${s.replace(/"/g, '""')}"`;
    };

    const rows = items.map((s: any) => {
      const cols: string[] = [];
      if (opts.includeFields?.text) cols.push(escape(s.text || s.body || s.title || ''));
      if (opts.includeFields?.tags) cols.push(escape((s.tags || []).join(',')));
      if (opts.includeFields?.comments) cols.push(escape((s.comments || []).join(' | ')));
      return cols.join(',');
    });
    return [headers.join(','), ...rows].join('\n');
  }

  // default: markdown/plain
  return items.map((s: any) => {
    const parts: string[] = [];
    if (opts.includeFields?.text) parts.push(s.text || s.body || s.title || '');
    if (opts.includeFields?.tags && (s.tags || []).length) parts.push(`Tags: ${(s.tags || []).join(',')}`);
    if (opts.includeFields?.comments && (s.comments || []).length) parts.push('Comments:\n' + (s.comments || []).map((c: any) => `- ${c}`).join('\n'));
    return parts.join('\n');
  }).join('\n\n');
};

export default genNoteNotion;
