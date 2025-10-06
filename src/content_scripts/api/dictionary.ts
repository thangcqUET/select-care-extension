// Client-side adapter that proxies dictionary lookups to the background script.
// Keeps the same export signature: fetchDictionary(word): Promise<any[]>
export async function fetchDictionary(word: string): Promise<any[]> {
  if (!word) return [];
  return new Promise<any[]>((resolve) => {
    chrome.runtime.sendMessage({ action: 'fetchDictionary', word }, (resp: any) => {
      if (!resp || !resp.success) return resolve([]);
      return resolve(resp.data || []);
    });
  });
}

export default { fetchDictionary };
