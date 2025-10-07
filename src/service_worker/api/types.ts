// Shared API types used by service-worker API modules
export type Definition = { definition?: string; example?: string; synonyms?: string[]; antonyms?: string[] };
export type Meaning = { partOfSpeech?: string; definitions?: Definition[]; synonyms?: string[]; antonyms?: string[] };

export type DictionaryEntry = { word: string; phonetics?: { text?: string; audio?: string }[]; meanings?: Meaning[] };

export default {};

// TranslationMeaning is a Meaning used for translation results. It reuses
// the dictionary Meaning shape but adds an optional `translation` field so
// consumers can access the translated text directly.
// detectedSource is included so translation results can carry source language info
export type TranslationMeaning = Meaning & { detectedSource?: string | null };

