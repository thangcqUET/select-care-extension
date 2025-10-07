// Background-side dictionary adapter. Runs in the service worker so network
// requests and caching are centralized and don't suffer from page CSP.
const BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en';

import type { DictionaryEntry } from './types';

// Driver interface: consumers can register their own driver that implements
// fetch(word) => Promise<DictionaryEntry[]>
export interface DictionaryDriver {
  fetch(word: string): Promise<DictionaryEntry[]>;
}

// Default driver implementation (uses dictionaryapi.dev)
const defaultCache = new Map<string, { ts: number; data: DictionaryEntry[] }>();
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

const defaultDriver: DictionaryDriver = {
  async fetch(word: string) {
    if (!word) return [];
    const key = word.toLowerCase().trim();
    const cached = defaultCache.get(key);
    if (cached && (Date.now() - cached.ts) < CACHE_TTL) return cached.data;

    try {
      const url = `${BASE}/${encodeURIComponent(key)}`;
      const res = await timeoutFetch(url, TIMEOUT);
      if (!res.ok) {
        // dictionaryapi.dev returns 404 for missing words
        return [];
      }
      const json = await res.json();
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

      defaultCache.set(key, { ts: Date.now(), data: entries });
      return entries;
    } catch (err) {
      console.warn('fetchDictionary error (background default driver)', err);
      return [];
    }
  }
};

// Active driver — can be replaced by calling registerDriver()
let activeDriver: DictionaryDriver = defaultDriver;

export function registerDriver(driver: DictionaryDriver) {
  if (driver && typeof driver.fetch === 'function') {
    activeDriver = driver;
  }
}

// Delegating fetchDictionary function used by the rest of the codebase
export async function fetchDictionary(word: string): Promise<DictionaryEntry[]> {
  return activeDriver.fetch(word);
}

export default { fetchDictionary, registerDriver };
