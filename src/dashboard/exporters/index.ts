import genLearningAnki from './anki';
import genLearningQuizlet from './quizlet';
import genNoteNotion from './notion';
import genNoteLogseq from './logseq';

export const generators: Record<string, (items: any[], opts: any) => string> = {
  'learning:anki': genLearningAnki,
  'learning:quizlet': genLearningQuizlet,
  'note:notion': genNoteNotion,
  'note:logseq': genNoteLogseq,
};

export const defaultGenerator = (items: any[]) => JSON.stringify(items, null, 2);

export default generators;

// Exporter metadata describing UI controls and defaults for each exporter
export const exporterMeta: Record<string, any> = {
  'learning:anki': {
    label: 'Anki',
    defaultIncludeFields: {
      selectionText: true,
      definitionOrTranslation: true,
      example: false,
      phonetics_text: false,
      phonetics_audio: false,
      image_url: false,
      part_of_speech: false,
      target_language: false,
    },
    controls: [
      { id: 'selectionText', type: 'checkbox', label: 'Selection text' },
      { id: 'definitionOrTranslation', type: 'checkbox', label: 'Definition / Translation' },
      { id: 'example', type: 'checkbox', label: 'Example' },
      { id: 'phonetics_text', type: 'checkbox', label: 'Phonetics (text)' },
      { id: 'phonetics_audio', type: 'checkbox', label: 'Phonetics (audio URL)' },
      { id: 'image_url', type: 'checkbox', label: 'Image URL' },
      { id: 'part_of_speech', type: 'checkbox', label: 'Part of speech' },
      { id: 'target_language', type: 'checkbox', label: 'Include target language' },
    ]
    ,
    formats: ['csv']
  },
  'learning:quizlet': {
    label: 'Quizlet',
    // Use same granular options as Anki so UI and export fields match
    defaultIncludeFields: {
      selectionText: true,
      definitionOrTranslation: true,
      example: false,
      phonetics_text: false,
      phonetics_audio: false,
      image_url: false,
      part_of_speech: false,
      target_language: false,
    },
  controls: [
      { id: 'selectionText', type: 'checkbox', label: 'Selection text' },
      { id: 'definitionOrTranslation', type: 'checkbox', label: 'Definition / Translation' },
      { id: 'example', type: 'checkbox', label: 'Example' },
      { id: 'phonetics_text', type: 'checkbox', label: 'Phonetics (text)' },
      { id: 'phonetics_audio', type: 'checkbox', label: 'Phonetics (audio URL)' },
      { id: 'image_url', type: 'checkbox', label: 'Image URL' },
      { id: 'part_of_speech', type: 'checkbox', label: 'Part of speech' },
      { id: 'target_language', type: 'checkbox', label: 'Include target language' },
      { id: 'tags', type: 'checkbox', label: 'Tags' },
    ]
    ,
    formats: ['csv']
  },
  'note:notion': {
    label: 'Notion',
    // Notes should include text, tags, comment (comment maps to body/notes)
    defaultIncludeFields: { text: true, tags: true, comments: true },
    controls: [
      { id: 'text', type: 'checkbox', label: 'Text' },
      { id: 'tags', type: 'checkbox', label: 'Tags' },
      { id: 'comments', type: 'checkbox', label: 'Comments' },
    ]
    ,
    formats: ['csv']
  },
  // 'note:logseq': {
  //   label: 'LogSeq',
  //   defaultIncludeFields: { text: true, tags: true, comment: true },
  //   controls: [
  //     { id: 'text', type: 'checkbox', label: 'Text' },
  //     { id: 'tags', type: 'checkbox', label: 'Tags' },
  //     { id: 'comment', type: 'checkbox', label: 'Comment' },
  //   ]
  //   ,
  //   formats: ['markdown', 'md']
  // }
};
