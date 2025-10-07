// Driver for calling the Next.js translate API from the extension/service-worker context.
// Input: { word, target, source, context }
// Output: { translatedText, detectedSource, partOfSpeech }

export type TranslateRequest = {
  word: string;
  target: string;
  source?: string;
  context?: string;
};

import type { TranslationMeaning } from './types';

// Translate returns a TranslationMeaning which is compatible with dictionary
// `Meaning` objects but carries the translated text in `translation`.
export type TranslateResponse = TranslationMeaning;

// Very small POS heuristic/lookup (for example words). This is intentionally minimal
// because full POS tagging isn't available inside the service worker. It helps provide
// a best-effort part-of-speech label for UX purposes.
const posLookup: Record<string, string> = {
  run: 'verb',
  runs: 'verb',
  running: 'verb',
  ran: 'verb',
  cat: 'noun',
  dog: 'noun',
  house: 'noun',
  beautiful: 'adjective',
  quickly: 'adverb',
  and: 'conjunction',
  but: 'conjunction',
  the: 'determiner',
  a: 'determiner',
  an: 'determiner',
};

function guessPartOfSpeech(word: string): string | null {
  if (!word) return null;
  const lower = word.trim().toLowerCase();
  // exact lookup
  if (posLookup[lower]) return posLookup[lower];
  // simple heuristics
  if (/ing$/.test(lower)) return 'verb';
  if (/ed$/.test(lower)) return 'verb';
  if (/ly$/.test(lower)) return 'adverb';
  if (/ous$/.test(lower) || /ful$/.test(lower) || /able$/.test(lower) || /ive$/.test(lower)) return 'adjective';
  // numbers
  if (/^\d+$/.test(lower)) return 'numeral';
  // fallback
  return 'unknown';
}

export async function translateDriver(req: TranslateRequest): Promise<TranslateResponse> {
  const { word, target, source, context } = req;
  const payload = {
    text: word,
    target,
    source: source || 'auto',
    context,
  } as any;
  console.log('translateDriver payload:', payload);
  try {
    // Build an absolute URL for the Next.js translate route. In a service
    // worker context a relative URL may fail (no page origin). Allow the
    // origin to be configured via chrome.storage.local under a few keys.
    let cfg: any = {};
    try {
      cfg = await chrome.storage.local.get(['apiOrigin', 'extensionApiOrigin', 'frontendOrigin']);
    } catch (e) {
      // storage may not be available in some contexts; ignore and use fallback
      cfg = {};
    }
    const origin = (cfg && (cfg.apiOrigin || cfg.extensionApiOrigin || cfg.frontendOrigin)) || null;
    // Fallback origin if nothing configured. Keep simple to avoid dynamic imports.
    const originCandidate = origin || 'http://localhost:3001';
    const base = originCandidate.replace(/\/$/, '');
    const candidates = [base];
    if (base.startsWith('http://')) {
      candidates.push(base.replace(/^http:\/\//, 'https://'));
    } else if (base.startsWith('https://')) {
      candidates.push(base.replace(/^https:\/\//, 'http://'));
    }

    // Helper to perform fetch with timeout
    const TIMEOUT_MS = 4000;
    async function fetchWithTimeout(url: string, opts: RequestInit = {}) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const res = await fetch(url, { signal: controller.signal, ...opts });
        return res;
      } finally {
        clearTimeout(id);
      }
    }

    let lastErr: any = null;
    let res: Response | null = null;
    for (const candidate of candidates) {
      const url = candidate.replace(/\/$/, '') + '/api/extension/translate';
      try {
        // log attempt so background console shows which URL failed
        console.debug('translateDriver: attempting fetch to', url);
        res = await fetchWithTimeout(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          // use CORS mode explicitly; extension background may need host permission
          mode: 'cors'
        });
        // if fetch succeeded (even with non-2xx) break and let later logic handle status

        break;
      } catch (err) {
        lastErr = err;
        console.warn('translateDriver: fetch to', url, 'failed:', err);
        // try next candidate
      }
    }

    if (!res) {
      // Provide a clearer error message including attempted origins
      throw new Error(`Translate API fetch failed (attempted: ${candidates.join(', ')}). last error: ${String(lastErr)}`);
    }

    if (!res.ok) {
      // Attempt to parse error body
      let errBody = null;
      try { errBody = await res.json(); } catch (e) { /* ignore */ }
      throw new Error(`Translate API error: ${res.status} ${JSON.stringify(errBody)}`);
    }

    const body = await res.json();

    // Expecting route.ts to return { success: true, result: translation }
    const translation = body?.result?.translations?.[0] || body?.result || null;
    const detected = translation?.detectedSource ?? null;
    const translatedText = translation?.translatedText ?? null;
    // Use API-provided partOfSpeech when available; otherwise fall back to local guesser.
    const apiPOS = translation?.partOfSpeech ?? null;

    const meaning: TranslationMeaning = {
      partOfSpeech: apiPOS ?? guessPartOfSpeech(word),
      definitions: [
        {
          definition: translatedText ?? '',
        },
      ],
      detectedSource: detected ?? null,
    } as TranslationMeaning;

    return meaning;
  } catch (err: any) {
    console.error('translateDriver error', err);
    return {
      partOfSpeech: guessPartOfSpeech(word),
      definitions: [ { definition: '' } ],
    } as TranslationMeaning;
  }
}
