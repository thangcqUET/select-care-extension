export const genLearningAnki = (items: any[], opts: any) => {
  // opts.includeFields may contain granular Anki options:
  // selectionText, definitionOrTranslation, example, phonetics_text, phonetics_audio,
  // image_url, part_of_speech, target_language
  return items.map((s: any) => {
    const fields: string[] = [];

    // helper to pick piece by target language if available
    const pickPiece = () => {
      const pieces = s.pieces || [];
      if (!Array.isArray(pieces) || pieces.length === 0) return {} as any;
      const preferred = opts.preferredTargetLanguage || opts.targetLanguage || null;
      if (preferred) {
        const found = pieces.find((p: any) => p.target_language === preferred);
        if (found) return found;
      }
      return pieces[0];
    };

    const piece = pickPiece();

    if (opts.includeFields?.selectionText) fields.push(s.selectionText || s.text || s.front || '');

    if (opts.includeFields?.definitionOrTranslation) {
      // prefer translation when available, fall back to definition
      const val = piece?.translation || piece?.definition || '';
      fields.push(val);
    }

    if (opts.includeFields?.example) fields.push(piece?.example || '');
    if (opts.includeFields?.phonetics_text) fields.push(piece?.phonetics_text || '');
    if (opts.includeFields?.phonetics_audio) fields.push(piece?.phonetics_audio || '');
    if (opts.includeFields?.image_url) fields.push(piece?.image_url || '');
    if (opts.includeFields?.part_of_speech) fields.push(piece?.part_of_speech || '');
    if (opts.includeFields?.target_language) fields.push(piece?.target_language || '');

    // allow legacy front/back behavior if caller still uses those flags
    if (opts.includeFields?.front && !opts.includeFields?.selectionText) fields.unshift(s.front || s.text || '');
    if (opts.includeFields?.back && !opts.includeFields?.definitionOrTranslation) fields.push(s.back || s.translation || piece?.translation || '');

    // choose delimiter based on requested format
    const fmt = opts?.format || 'tsv';
    const delim = fmt === 'csv' ? ',' : '\t';
    const escapeField = (v: any) => {
      if (v == null) return '';
      const s = String(v);
      if (fmt === 'csv') {
        // simple CSV quoting
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };
    return fields.map(escapeField).join(delim);
  }).join('\n');
};

export default genLearningAnki;
