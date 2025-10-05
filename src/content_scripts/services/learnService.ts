import { fetchDictionary } from '../api/mockDictionary';

// Populate the learn UI (controls, badgesWrap, tabs) for the selected word.
export async function populateLearnUI(selectedWord: string, controls: HTMLElement, badgesWrap: HTMLElement, tabs: HTMLElement, synWrap?: HTMLElement) {
  if (!selectedWord) return;
  try {
    const data = await fetchDictionary(selectedWord);
    if (!data || !Array.isArray(data) || data.length === 0) return;
    // Keep the main entry for meanings as the first result
    const entry = data[0];

    // phonetics: scan all results for a preferred phonetic. Preference order across all entries:
    // 1) phonetic with both text and audio
    // 2) phonetic with audio
    // 3) phonetic with text
    let preferred: any = null;
    // first look for text+audio
    for (const ent of data) {
      const phs = ent.phonetics || [];
      const found = phs.find((p:any) => p.text && p.audio);
      if (found) { preferred = found; break; }
    }
    // then look for audio-only
    if (!preferred) {
      for (const ent of data) {
        const phs = ent.phonetics || [];
        const found = phs.find((p:any) => p.audio);
        if (found) { preferred = found; break; }
      }
    }
    // then text-only
    if (!preferred) {
      for (const ent of data) {
        const phs = ent.phonetics || [];
        const found = phs.find((p:any) => p.text);
        if (found) { preferred = found; break; }
      }
    }

    if (preferred) {
      const phonWrap = document.createElement('div');
      phonWrap.className = 'small';
      phonWrap.style.marginTop = '8px';
      phonWrap.innerHTML = '<strong>Phonetics:</strong> ' + (preferred.text || '');
      if (preferred.audio) {
        const a = document.createElement('button');
        a.className = 'form-button small';
        a.textContent = '🔊';
        a.title = 'Play pronunciation';
        a.addEventListener('click', () => { new Audio(preferred.audio).play().catch(()=>{}); });
        phonWrap.appendChild(a);
      }
      controls.parentElement?.insertBefore(phonWrap, badgesWrap);
    }

    // meanings: build badges and dispatch addMeaning events to existing UI components
    if (entry.meanings && entry.meanings.length > 0) {
      // collect unique parts of speech in order
      const parts: string[] = [];
      entry.meanings.forEach((m:any) => {
        const pos = m.partOfSpeech || 'noun';
        if (!parts.includes(pos)) parts.push(pos);
      });

      // Clear existing badges and create badges based on API parts
      badgesWrap.innerHTML = '';
  parts.forEach((pos, idx) => {
        const b = document.createElement('button');
        b.className = 'badge';
        if (idx === 0) b.classList.add('active');
        b.textContent = pos;
        b.addEventListener('click', () => {
          // toggle active badge
          badgesWrap.querySelectorAll('.badge').forEach(el => el.classList.remove('active'));
          b.classList.add('active');
          // show corresponding tab
          tabs.querySelectorAll('.tab').forEach(t => (t as HTMLElement).classList.remove('active'));
          const tab = tabs.querySelector(`[data-pos="${pos}"]`) as HTMLElement | null;
          if (tab) tab.classList.add('active');
        });
        badgesWrap.appendChild(b);

        // Ensure corresponding tab exists; if missing, create an empty tab structure
        let tab = tabs.querySelector(`[data-pos="${pos}"]`) as HTMLElement | null;
        if (!tab) {
          tab = document.createElement('div');
          tab.className = 'tab';
          tab.setAttribute('data-pos', pos);
          if (idx === 0) tab.classList.add('active');

          const meaningsWrap = document.createElement('div');
          meaningsWrap.className = 'meanings-wrap';
          const customBtn = document.createElement('button');
          customBtn.className = 'form-button';
          customBtn.textContent = 'Custom Definition';
          customBtn.addEventListener('click', () => {
            const newIdx = meaningsWrap.querySelectorAll('.meaning').length;
            const evt = new CustomEvent('addMeaning', { detail: { pos, index: newIdx, title: '', definition: '', example: '' } });
            meaningsWrap.dispatchEvent(evt);
          });
          tab.appendChild(meaningsWrap);
          tab.appendChild(customBtn);
          // Per-tab syn-list removed; using global synWrap instead
          tabs.appendChild(tab);
        }
      });

      // Dispatch addMeaning events to respective meaning containers
      // Collect global synonyms/antonyms across all meanings (deduplicated)
      const globalSyns = new Set<string>();
      const globalAnts = new Set<string>();

      entry.meanings.forEach((m:any) => {
        const pos = m.partOfSpeech || 'noun';
        const tab = tabs.querySelector(`[data-pos="${pos}"]`) as HTMLElement | null;
        const target = tab ? tab.querySelector('.meanings-wrap') as HTMLElement : tabs.querySelector('[data-pos="noun"] .meanings-wrap') as HTMLElement;
        if (!target) return;

        if (m.synonyms && Array.isArray(m.synonyms)) m.synonyms.forEach((s:string) => { if (s && s.trim()) globalSyns.add(s.trim()); });
        if (m.antonyms && Array.isArray(m.antonyms)) m.antonyms.forEach((a:string) => { if (a && a.trim()) globalAnts.add(a.trim()); });

        (m.definitions || []).forEach((d:any, idx:number) => {
          const evt = new CustomEvent('addMeaning', { detail: { pos, index: idx, title: d.definition || '', definition: d.definition || '', example: d.example || '' } });
          target.dispatchEvent(evt);
        });
      });

      // Populate global syn/ant if synWrap provided
      if (synWrap) {
        const synSpan = synWrap.querySelector('[data-syn]') as HTMLElement | null;
        const antSpan = synWrap.querySelector('[data-ant]') as HTMLElement | null;
        if (synSpan) synSpan.textContent = Array.from(globalSyns).join(', ');
        if (antSpan) antSpan.textContent = Array.from(globalAnts).join(', ');
      }
    }
  } catch (err) {
    console.error('populateLearnUI failed', err);
  }
}
