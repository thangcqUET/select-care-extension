// Simple mock detection API used by the background service worker.
// Keeps the same response shape used by the content script: { alternatives: [], detectedLanguage: { confidence, language }, translatedText }
// This module is intentionally small so it can be swapped out for a real API call later.

export async function detectLanguage(text: string): Promise<{ success: true; result: { alternatives: any[]; detectedLanguage: { confidence: number; language: string }; translatedText: string } } | { success: false; error: string }> {
    console.log('Mock detect language for text:', text);
  let sampleReturn = {
    "alternatives": [],
    "detectedLanguage": {
    "confidence": 8,
    "language": "en"
    },
    "translatedText": "hello"
  };
  return { success: true, result: sampleReturn };
}
