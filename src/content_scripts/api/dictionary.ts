// Lightweight adapter for https://dictionaryapi.dev
// Exports fetchDictionary(word): Promise<any[]>
const BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en';

type Phonetic = { text?: string; audio?: string };
type Definition = { definition?: string; example?: string; synonyms?: string[]; antonyms?: string[] };
type Meaning = { partOfSpeech?: string; definitions?: Definition[]; synonyms?: string[]; antonyms?: string[] };
type DictionaryEntry = { word: string; phonetics?: Phonetic[]; meanings?: Meaning[] };

const cache = new Map<string, { ts: number; data: DictionaryEntry[] }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const TIMEOUT = 5000;

function timeoutFetch(url: string, ms = TIMEOUT) {
  return new Promise<Response>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    fetch(url).then(res => {
      clearTimeout(timer);
      resolve(res);
    }).catch(err => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

export async function fetchDictionary(word: string): Promise<DictionaryEntry[]> {
  if (!word) return [];
  const key = word.toLowerCase().trim();
  const cached = cache.get(key);
  if (cached && (Date.now() - cached.ts) < CACHE_TTL) return cached.data;

  try {
    const url = `${BASE}/${encodeURIComponent(key)}`;
    const res = await timeoutFetch(url, TIMEOUT);
    if (!res.ok) {
      // dictionaryapi.dev returns 404 for missing words
      return [];
    }
    const json = await res.json();
    // Normalize to expected shape (word, phonetics, meanings)
    const entries: DictionaryEntry[] = (Array.isArray(json) ? json : []).map((e:any) => ({
      word: e.word,
      phonetics: Array.isArray(e.phonetics) ? e.phonetics.map((p:any) => ({ text: p.text, audio: p.audio })) : [],
      meanings: Array.isArray(e.meanings) ? e.meanings.map((m:any) => ({
        partOfSpeech: m.partOfSpeech,
        definitions: Array.isArray(m.definitions) ? m.definitions.map((d:any) => ({ definition: d.definition, example: d.example, synonyms: d.synonyms || [], antonyms: d.antonyms || [] })) : [],
        synonyms: m.synonyms || [],
        antonyms: m.antonyms || []
      })) : []
    }));

    cache.set(key, { ts: Date.now(), data: entries });
    return entries;
  } catch (err) {
    console.warn('fetchDictionary error', err);
    return [];
  }
}

export default { fetchDictionary };
