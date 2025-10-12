import cleanTags from './utils';

export const genLearningQuizlet = (items: any[], opts: any) => {
  // Mirror Anki's granular field handling so Quizlet UI can be identical
  const pickPiece = (s: any) => {
    const pieces = s.pieces || [];
    if (!Array.isArray(pieces) || pieces.length === 0) return {} as any;
    const preferred = opts.preferredTargetLanguage || opts.targetLanguage || null;
    if (preferred) {
      const found = pieces.find((p: any) => p.target_language === preferred);
      if (found) return found;
    }
    return pieces[0];
  };

  // build a mapping from field id -> value for this item
    const buildFieldMap = (s: any) => {
    const piece = pickPiece(s);
    const map: Record<string, any> = {
      selectionText: s.selectionText || s.text || s.front || '',
      definitionOrTranslation: piece?.translation || piece?.definition || '',
      example: piece?.example || '',
      phonetics_text: piece?.phonetics_text || '',
      phonetics_audio: piece?.phonetics_audio || '',
      image_url: piece?.image_url || '',
      part_of_speech: piece?.part_of_speech || '',
      target_language: piece?.target_language || '',
      front: s.front || s.text || '',
      back: s.back || s.translation || piece?.translation || '',
      tags: (cleanTags(s.tags) || []).join(','),
    };
    return map;
  };

  const fmt = opts?.format || 'tsv';
  const delim = fmt === 'csv' ? ',' : '\t';
  const escapeVal = (v: any) => {
    if (v == null) return '';
    const s = String(v);
    if (fmt === 'csv') return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  return items.map((s: any) => {
    const map = buildFieldMap(s);
    const order = opts?.includeOrder && opts.includeOrder.length ? opts.includeOrder : Object.keys(map);
    const row = order.map((id: string) => {
      // only include columns that are enabled in includeFields
      if (opts.includeFields && id in opts.includeFields && !opts.includeFields[id]) return '';
      return escapeVal(map[id]);
    });
    return row.join(delim);
  }).join('\n');
};

export default genLearningQuizlet;
