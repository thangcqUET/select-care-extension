import { fetchDictionary } from '../api/dictionary';

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
        const playAudio = async () => {
          try {
            const audio = new Audio(preferred.audio);
            // attach an error handler for cases where CSP blocks media or load fails
            let handled = false;
            const onErr = (ev: any) => {
              handled = true;
              // dispatch a small helper event so FormPopup (which owns the UI) can show an inline message if it wants
              const evt = new CustomEvent('audioPlayFailed', { detail: { src: preferred.audio, reason: ev?.message || 'playback error' } });
              document.dispatchEvent(evt);
              audio.removeEventListener('error', onErr);
            };
            audio.addEventListener('error', onErr);
            await audio.play();
            // small timeout to check if error event fired synchronously
            setTimeout(() => {
              if (handled) return;
              audio.removeEventListener('error', onErr);
            }, 50);
          } catch (e:any) {
            // Playback failed (e.g., CSP or user gesture requirement). Notify the popup.
            const evt = new CustomEvent('audioPlayFailed', { detail: { src: preferred.audio, reason: e?.message || 'playback failed' } });
            document.dispatchEvent(evt);
          }
        };
        a.addEventListener('click', () => { void playAudio(); });
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
          // show corresponding tab; if the exact POS tab doesn't exist, fall back
          // to the first available tab so the meanings are visible.
          tabs.querySelectorAll('.tab').forEach(t => (t as HTMLElement).classList.remove('active'));
          const tab = tabs.querySelector(`[data-pos="${pos}"]`) as HTMLElement | null;
          if (tab) {
            tab.classList.add('active');
          } else {
            const firstTab = tabs.querySelector('.tab') as HTMLElement | null;
            if (firstTab) firstTab.classList.add('active');
          }
        });
        badgesWrap.appendChild(b);

        // Note: do not create tabs here — `FormPopup` creates tabs and attaches
        // the `addMeaning` listener. If a tab for `pos` doesn't exist, we will
        // dispatch meanings into the noun tab (fallback) below.
      });
        // Inform the popup which parts to create. Prefer a direct function if
        // the UI exposes it; otherwise fall back to the legacy event.
        const anyTabs = tabs as any;
        if (typeof anyTabs.ensureParts === 'function') {
          try { anyTabs.ensureParts(parts); } catch (e) { /* ignore */ }
        } else {
          const setPartsEvt = new CustomEvent('setParts', { detail: { parts } });
          tabs.dispatchEvent(setPartsEvt);
        }

        // Ensure the visible tab matches the active badge (first part)
        if (parts.length > 0) {
          // clear any existing active tab (FormPopup may have pre-created tabs)
          tabs.querySelectorAll('.tab').forEach(t => (t as HTMLElement).classList.remove('active'));
          let firstTab = tabs.querySelector(`[data-pos="${parts[0]}"]`) as HTMLElement | null;
          if (!firstTab) firstTab = tabs.querySelector('.tab') as HTMLElement | null;
          if (firstTab) firstTab.classList.add('active');
        }

      // Dispatch addMeaning events to respective meaning containers
      // Collect global synonyms/antonyms across all meanings (deduplicated)
      const globalSyns = new Set<string>();
      const globalAnts = new Set<string>();

      entry.meanings.forEach((m:any) => {
        const pos = m.partOfSpeech || 'noun';
        // prefer exact matching tab; otherwise fallback to the first available tab
        let tab = tabs.querySelector(`[data-pos="${pos}"]`) as HTMLElement | null;
        if (!tab) {
          // fallback: find any existing tab with a meanings-wrap
          tab = tabs.querySelector('.tab') as HTMLElement | null;
        }
        const target = tab ? tab.querySelector('.meanings-wrap') as HTMLElement | null : null;
        if (!target) return; // nothing to attach to

        if (m.synonyms && Array.isArray(m.synonyms)) m.synonyms.forEach((s:string) => { if (s && s.trim()) globalSyns.add(s.trim()); });
        if (m.antonyms && Array.isArray(m.antonyms)) m.antonyms.forEach((a:string) => { if (a && a.trim()) globalAnts.add(a.trim()); });

        (m.definitions || []).forEach((d:any, idx:number) => {
          const evt = new CustomEvent('addMeaning', { detail: { pos, index: idx, title: d.definition || '', definition: d.definition || '', example: d.example || '' } });
          target.dispatchEvent(evt);
        });
      });

      // Populate global syn/ant if synWrap provided. Only show the block when we have data.
      if (synWrap) {
        const synSpan = synWrap.querySelector('[data-syn]') as HTMLElement | null;
        const antSpan = synWrap.querySelector('[data-ant]') as HTMLElement | null;
        const synText = Array.from(globalSyns).join(', ');
        const antText = Array.from(globalAnts).join(', ');
        if (synSpan) synSpan.textContent = synText;
        if (antSpan) antSpan.textContent = antText;
        if ((synText && synText.trim().length > 0) || (antText && antText.trim().length > 0)) {
          synWrap.style.display = 'block';
        } else {
          synWrap.style.display = 'none';
        }
      }
    }
  } catch (err) {
    console.error('populateLearnUI failed', err);
  }
}
