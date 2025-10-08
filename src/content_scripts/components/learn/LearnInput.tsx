import React, { useEffect, useState } from 'react';
// import CSS as raw text so we can inject it into the popup ShadowRoot
import { fetchDictionary } from '../../api/dictionary';

type Props = {
  selectedText?: string;
  onEnsureParts?: (parts: string[]) => void;
  shadowRoot?: ShadowRoot;
};

type DictionaryEntry = any;

const TranslateControls: React.FC<{ source: string; target: string; onSourceChange: (s: string) => void; onTargetChange: (t: string) => void; }> = ({ source, target, onSourceChange, onTargetChange }) => (
  <div className="translate-controls">
    <select title="Current Language" value={source} onChange={(e) => onSourceChange(e.target.value)}>
      <option value="auto">auto</option>
      <option value="en">en</option>
    </select>
    <select title="Target Language" value={target} onChange={(e) => onTargetChange(e.target.value)}>
      <option value="vi">vi</option>
      <option value="en">en</option>
    </select>
  </div>
);

const Badges: React.FC<{ parts: string[]; active?: string | null; onSelect?: (p: string) => void }> = ({ parts, active, onSelect }) => (
  <div className="badges">
    {parts.map((p) => (
      <button key={p} className={`badge ${p === active ? 'active' : ''}`} onClick={() => onSelect && onSelect(p)}>{p}</button>
    ))}
  </div>
);

type MeaningProps = {
  pos: string;
  index: number;
  title?: string;
  definition?: string;
  example?: string;
  expanded?: boolean;
  marked?: boolean;
  onToggleExpand?: () => void;
  onToggleMark?: () => void;
  onChange?: (fields: { definition?: string; example?: string }) => void;
  onAttachImage?: (pos: string, index: number) => void;
  onGenerateImage?: (pos: string, index: number) => void;
  onRegisterDef?: (el: HTMLTextAreaElement | null) => void;
  onRegisterMeaning?: (el: HTMLElement | null) => void;
  onRegisterExample?: (el: HTMLTextAreaElement | null) => void;
};

const MeaningItem: React.FC<MeaningProps> = ({ pos, index, title, definition = '', example = '', expanded = false, marked = false, onToggleExpand, onToggleMark, onChange, onAttachImage, onGenerateImage, onRegisterDef, onRegisterMeaning, onRegisterExample }) => {
  const [localExpanded, setLocalExpanded] = useState<boolean>(expanded);
  useEffect(() => { setLocalExpanded(expanded); }, [expanded]);

  const handleToggle = () => {
    setLocalExpanded((v) => !v);
    onToggleExpand && onToggleExpand();
  };

  return (
    <div className={`meaning ${localExpanded ? 'expanded' : ''}`} data-pos={pos} data-index={index} ref={(el) => { if (onRegisterMeaning) onRegisterMeaning(el); }}>
      <div className="title">
        <div className="left" onClick={handleToggle} style={{ cursor: 'pointer' }}>
          {/* Prefer showing the current definition's first line as the title if available; otherwise fall back to provided title */}
          {(() => {
            const display = (definition && definition.toString().trim().length) ? definition.split('\n')[0] : (title || '');
            return <div className="title-text" title={display}>{display}</div>;
          })()}
        </div>
        <div className="right">
          <span className="mark-wrap">
            <button className={`form-button ${marked ? 'form-button-marked' : ''}`} onClick={(e) => { e.stopPropagation(); onToggleMark && onToggleMark(); }}>{marked ? '🟢' : '◯'}</button>
            <span className="tooltip">{marked ? 'Marked' : 'Mark to Save'}</span>
          </span>
          <span className="toggle-icon" onClick={(e) => { e.stopPropagation(); handleToggle(); }}>{localExpanded ? '▴' : '▾'}</span>
        </div>
      </div>
      <div className="body" style={{ display: localExpanded ? 'block' : 'none' }}>
  <textarea className="form-input" rows={3} value={definition} onChange={(e) => onChange && onChange({ definition: e.target.value })} ref={(el) => { if (onRegisterDef) onRegisterDef(el as HTMLTextAreaElement | null); }} />
        {example ? <>
          <div className="small">Example</div>
          <textarea className="form-input" rows={2} value={example} onChange={(e) => onChange && onChange({ example: e.target.value })} ref={(el) => { if (onRegisterExample) onRegisterExample(el as HTMLTextAreaElement | null); }} />
        </> : (
          <button className="form-button small" onClick={(ev) => { ev.preventDefault(); onChange && onChange({ example: ' ' }); /* parent's effect will focus */ }}>Add example</button>
        )}
        <div className="form-actions">
          <button className="form-button" onClick={(e) => { e.preventDefault(); onAttachImage && onAttachImage(pos, index); }}>Add Image</button>
          <button className="form-button primary" onClick={(e) => { e.preventDefault(); onGenerateImage && onGenerateImage(pos, index); }}>Generate Image</button>
        </div>
      </div>
    </div>
  );
};

const Tabs: React.FC<{ 
  parts: string[]; 
  active: string | null; 
  meanings: Record<string, any[]>; 
  loading?: boolean; 
  onCustom?: (pos: string) => void; 
  onToggleExpand?: (pos: string, idx: number) => void; 
  onToggleMark?: (pos: string, idx: number) => void; 
  onChangeMeaning?: (pos: string, idx: number, fields: any) => void; 
  onAttachImage?: (pos: string, idx: number) => void; 
  onGenerateImage?: (pos: string, idx: number) => void; 
  onRegisterDef?: (pos: string, idx: number, el: HTMLTextAreaElement | null) => void; 
  onRegisterExample?: (pos: string, idx: number, el: HTMLTextAreaElement | null) => void; 
  onRegisterMeaning?: (pos: string, idx: number, el: HTMLElement | null) => void; 
  onRegisterWrap?: (pos: string, el: HTMLElement | null) => void }> = (
    { 
      parts, 
      active, 
      meanings, 
      loading = false, 
      onCustom, 
      onToggleExpand, 
      onToggleMark, 
      onChangeMeaning, 
      onAttachImage, 
      onGenerateImage, 
      onRegisterDef, 
      onRegisterExample, 
      onRegisterMeaning, 
      onRegisterWrap 
    }) => {
      console.log("parts");
      console.log(parts);
      console.log("meanings");
      console.log(meanings);
      console.log("loading");
      console.log(loading);
      return (
        <div className="tabs">
          {parts.length ? parts.map((p) => (
            <div key={p} className={`tab ${p === active ? 'active' : ''}`} data-pos={p}>
              <div className="meanings-wrap" ref={(el) => onRegisterWrap && onRegisterWrap(p, el as HTMLElement | null)}>
                {(meanings[p] || []).length ? (meanings[p] || []).map((m, i) => (
                  <MeaningItem
                    key={i}
                    pos={p}
                    index={i}
                    title={m.title}
                    definition={m.definition}
                    example={m.example}
                    expanded={!!m.expanded}
                    marked={!!m.marked}
                    onToggleExpand={() => onToggleExpand && onToggleExpand(p, i)}
                    onToggleMark={() => onToggleMark && onToggleMark(p, i)}
                    onChange={(fields) => onChangeMeaning && onChangeMeaning(p, i, fields)}
                    onAttachImage={() => onAttachImage && onAttachImage(p, i)}
                    onGenerateImage={() => onGenerateImage && onGenerateImage(p, i)}
                                      onRegisterDef={(el) => onRegisterDef && onRegisterDef(p, i, el)}
                                      onRegisterMeaning={(el) => onRegisterMeaning && onRegisterMeaning(p, i, el)}
                                      onRegisterExample={(el) => onRegisterExample && onRegisterExample(p, i, el)}
                  />
                )):<></>}
              </div>
              <button className="form-button" style={{ marginTop: 6 }} onClick={() => onCustom && onCustom(p)}>Custom Definition</button>
            </div>
          )): (
                  // show skeleton only for active tab while loading
                  loading && (
                    <div className="learn-loading">
                      <div className="skeleton-line long animated" />
                      <div className="skeleton-line medium animated" />
                      <div className="skeleton-line short animated" />
                    </div>
                  ) 
                )}
        </div>
      )
  };

const SynList: React.FC<{ syns: string[]; ants: string[] }> = ({ syns, ants }) => {
  const [collapsed, setCollapsed] = useState(true);
  const hasData = (syns && syns.length > 0) || (ants && ants.length > 0);
  if (!hasData) return null;

  return (
    <div className="syn-list">
      <div className="syn-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setCollapsed(!collapsed)}>
        <div className="small">Synonyms & Antonyms</div>
        <div className="small">{collapsed ? '▾' : '▴'}</div>
      </div>
      <div className="syn-content" style={{ display: collapsed ? 'none' : 'block', marginTop: 8 }}>
        <div className="small">Synonyms: <span>{syns.join(', ')}</span></div>
        <div className="small">Antonyms: <span>{ants.join(', ')}</span></div>
      </div>
    </div>
  );
};

// React implementation: fetch dictionary, optionally detect language, and populate state
// Expose an imperative API so the host (FormPopup) can ask whether the learn UI is focused
// and dispatch synthesized keystrokes into the currently focused definition textarea.
const LearnInput = React.forwardRef((props: Props, ref: React.Ref<any>) => {
  const { selectedText, shadowRoot } = props;
  useEffect(() => {
  }, []);
  // registry for definition textarea elements keyed by `${pos}:${index}`
  const defRefs = React.useRef<Map<string, HTMLTextAreaElement | null>>(new Map());
  // registry for example textarea elements keyed by `${pos}:${index}`
  const exampleRefs = React.useRef<Map<string, HTMLTextAreaElement | null>>(new Map());
  // registry for meaning elements and wrap containers
  const wrapRefs = React.useRef<Map<string, HTMLElement | null>>(new Map());
  const meaningRefs = React.useRef<Map<string, HTMLElement | null>>(new Map());
  // desired caret positions to restore after a state update (keyed by `${pos}:${index}`)
  const caretRestoreRef = React.useRef<Map<string, number>>(new Map());
  // remember the last toggled meaning so we can scroll after DOM update
  const lastToggled = React.useRef<{ pos: string; idx: number } | null>(null);

  // register definition textarea refs
  const handleRegisterDef = (pos: string, idx: number, el: HTMLTextAreaElement | null) => {
    console.debug("register def", { pos, idx, el });
    try {
      defRefs.current.set(`${pos}:${idx}`, el);
    } catch (e) {
      // ignore
    }
  };

  const handleRegisterExample = (pos: string, idx: number, el: HTMLTextAreaElement | null) => {
    try {
      exampleRefs.current.set(`${pos}:${idx}`, el);
    } catch (e) { /* ignore */ }
  };

  const handleCustom = (pos: string) => {
    // append a new meaning for the pos and focus its definition textarea
    let focusKey = '';
    setMeanings((prev) => {
      const list = prev[pos] ? [...prev[pos]] : [];
      const newIdx = list.length;
      list.push({ title: '', definition: 'Define here...', example: '', expanded: true });
      focusKey = `${pos}:${newIdx}`;
      return { ...prev, [pos]: list };
    });
    // ensure the part exists and activate it
    setParts((prev) => (prev.includes(pos) ? prev : [...prev, pos]));
    setActivePart(pos);
    // focus after render
    setTimeout(() => {
      const el = defRefs.current.get(focusKey);
      if (el) {
        try { el.focus(); el.scrollIntoView({ block: 'nearest' }); } catch (e) { }
      }
    }, 10);
  };
  const [loading, setLoading] = useState(false);
  const [inlineMessage, setInlineMessage] = useState<{ text: string; kind: 'info' | 'error' } | null>(null);
  
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('en');
  const [phonetic, setPhonetic] = useState<{ text?: string; audio?: string } | null>(null);
  const [parts, setParts] = useState<string[]>([]);
  const [activePart, setActivePart] = useState<string | null>( null );
  const [meanings, setMeanings] = useState<Record<string, any[]>>({});
  const [syns, setSyns] = useState<string[]>([]);
  const [ants, setAnts] = useState<string[]>([]);

  // Cache meanings by a key combining selectedText + sourceLang + targetLang
  const cacheByLangPair = React.useRef<Map<string, { meanings: Record<string, any[]>; parts: string[]; syns: string[]; ants: string[]; phonetic: any }>>(new Map());

  const makeCacheKey = (text?: string, src?: string, tgt?: string) => `${(text||'').split('\n')[0].trim()}|${src||'auto'}|${tgt||'en'}`;


  // Detect language helper: returns { detectedOk, detected }
  // - detectedOk: whether it's OK to proceed with dictionary lookup (false means skip)
  // - detected: detected language code (or null)
  const detectLanguage = async (textToDetect: string): Promise<{ detectedOk: boolean; detected?: string | null }> => {
    if (sourceLang !== 'auto') return { detectedOk: true, detected: sourceLang };
    try {
      const resp: any = await new Promise((resolve) => chrome.runtime.sendMessage({ action: 'detectLanguage', text: textToDetect }, (r: any) => resolve(r)));
      const detected = resp?.result?.detectedLanguage?.language;
      if (detected && detected !== 'en') {
        return { detectedOk: false, detected };
      }
      return { detectedOk: true, detected: detected || null };
    } catch (e) {
      // on error, proceed
      return { detectedOk: true, detected: null };
    }
  };
  // Debounced translate -> inject translation as a meaning when target differs from source
  // lookupDictionary extracts the dictionary population logic into a reusable function
  const lookupDictionary = async (textToLookup: string) => {
    let mounted = true;
    try {
      // If the current language pair implies a translation (target !== source), skip dictionary lookup
      try {
        const data: DictionaryEntry[] = await fetchDictionary((textToLookup || '').trim());
        
        setLoading(false);
        if (!mounted) return;
        if (!data || !Array.isArray(data) || data.length === 0) {
          setMeanings({ noun: [] });
          setParts(['noun']);
          setSyns([]);
          setAnts([]);
          setPhonetic(null);
          // onEnsureParts && onEnsureParts(['noun']);
          if (mounted) setInlineMessage({ text: `No dictionary meanings found for "${(textToLookup||'').split('\n')[0].trim()}". Use "Custom Definition" to add your own.`, kind: 'info' });
          return;
        }

        // pick preferred phonetic (text+audio > audio > text)
        let preferred: any = null;
        for (const ent of data) {
          const phs = ent.phonetics || [];
          const found = phs.find((p: any) => p.text && p.audio);
          if (found) { preferred = found; break; }
        }
        if (!preferred) {
          for (const ent of data) {
            const phs = ent.phonetics || [];
            const found = phs.find((p: any) => p.audio);
            if (found) { preferred = found; break; }
          }
        }
        if (!preferred) {
          for (const ent of data) {
            const phs = ent.phonetics || [];
            const found = phs.find((p: any) => p.text);
            if (found) { preferred = found; break; }
          }
        }
        setPhonetic(preferred || null);

        const entry = data[0];
        const newParts: string[] = [];
        if (entry.meanings && Array.isArray(entry.meanings)) {
          entry.meanings.forEach((m: any) => {
            const pos = m.partOfSpeech || 'noun';
            if (!newParts.includes(pos)) newParts.push(pos);
          });
        }
        if (newParts.length === 0) newParts.push('noun');
        setParts(newParts);
        setActivePart(newParts[0]);

        // Build meanings map
        const map: Record<string, any[]> = {};
        const globalSyns = new Set<string>();
        const globalAnts = new Set<string>();
        data.forEach((ent) => {
          (ent.meanings || []).forEach((m: any) => {
            const pos = m.partOfSpeech || 'noun';
            if (!map[pos]) map[pos] = [];
            (m.definitions || []).forEach((d: any) => {
              map[pos].push({ title: d.definition || '', definition: d.definition || '', example: d.example || '' });
            });
            if (m.synonyms && Array.isArray(m.synonyms)) m.synonyms.forEach((s: string) => s && globalSyns.add(s));
            if (m.antonyms && Array.isArray(m.antonyms)) m.antonyms.forEach((a: string) => a && globalAnts.add(a));
          });
        });

        setMeanings(map);
        setSyns(Array.from(globalSyns));
        setAnts(Array.from(globalAnts));
        // onEnsureParts && onEnsureParts(newParts);
        // persist into cache for this language pair
        try {
          const key = makeCacheKey(textToLookup, sourceLang, targetLang);
          cacheByLangPair.current.set(key, { meanings: map, parts: newParts, syns: Array.from(globalSyns), ants: Array.from(globalAnts), phonetic: preferred || null });
        } catch (e) { /* ignore cache write errors */ }
      } catch (err) {
        console.error('learn fetch error', err);
        if (mounted) setInlineMessage({ text: 'Failed to load dictionary data', kind: 'error' });
      } finally {
        // leave loading control to caller
      }
    } finally {
      // no-op: mounted scope cleanup available via returned cancel function if needed
    }
    return;
  };
  // Translate the selected text via background service and insert as a meaning.
  const translateText = async (textToTranslate: string, localTargetLang: string, localSourceLang: string) => {
    console.log('Translating', { textToTranslate, localTargetLang, localSourceLang });
    return new Promise<void>((resolve) => {
      let mounted = true;
      setTimeout(() => {
        try {
          chrome.runtime.sendMessage({ action: 'translate', text: textToTranslate.trim(), target: localTargetLang, source: localSourceLang }, (resp: any) => {
            if (!mounted || !resp) { resolve(); return; }
            try {
              setLoading(false);
              if (resp.success && resp.result) {
                let text = '';
                let detected = '';
                let pos: string | null = null;

                if (resp.result && typeof (resp.result as any).translation === 'string') {
                  text = (resp.result as any).translation || '';
                  detected = (resp.result as any).detectedSource ?? '';
                  pos = (resp.result as any).partOfSpeech ?? null;
                } else if (resp.result && Array.isArray(resp.result?.definitions) && resp.result.definitions[0]) {
                  text = resp.result.definitions[0].definition || '';
                  detected = (resp.result as any).detectedSource ?? '';
                  pos = resp.result.partOfSpeech ?? null;
                } else {
                  const tr = resp.result.translations?.[0] || resp.result;
                  text = tr?.text ?? '';
                  detected = tr?.detected_source ?? resp.result?.source ?? '';
                  pos = tr?.partOfSpeech ?? tr?.part_of_speech ?? null;
                }

                if (text && mounted) {
                  const usePos = pos || 'noun';
                  setParts((prev) => (prev.includes(usePos) ? prev : [...prev, usePos]));
                  setActivePart(usePos);
                  setMeanings((prev) => {
                    const next = { ...prev };
                    const list = next[usePos] ? [...next[usePos]] : [];
                    const already = list.some((m) => (m.definition || m.title || '').trim() === text.trim());
                    if (!already) {
                      list.unshift({ title: text, definition: text, example: detected ? `(${detected})` : '' });
                    }
                    next[usePos] = list;
                    return next;
                  });
                  // persist translation into cache for this language pair
                  try {
                    const key = makeCacheKey(textToTranslate, sourceLang, targetLang);
                    cacheByLangPair.current.set(key, { meanings: (() => {
                      const tmp = { ...(meanings || {}) };
                      const l = tmp[usePos] ? [...tmp[usePos]] : [];
                      const already = l.some((m:any) => (m.definition||m.title||'').trim() === text.trim());
                      if (!already) l.unshift({ title: text, definition: text, example: detected ? `(${detected})` : '' });
                      tmp[usePos] = l;
                      return tmp;
                    })(), parts: (parts && parts.length) ? parts : [usePos], syns, ants, phonetic });
                  } catch (e) { /* ignore */ }
                }
              }
            } catch (e) {
              // ignore parsing errors
            }
            resolve();
          });
        } catch (e) {
          resolve();
        }
      }, 250);
    });
  };

  // detect, lookup, or translate whenever selectedText, sourceLang, or targetLang changes
  const getDefinationAndTranslate = async () => {
    if (!selectedText || selectedText.trim().length === 0) return;
    // If sourceLang is 'auto', detect language first
    const doDetect = sourceLang === 'auto';
    let newSourceLang: { detectedOk: boolean; detected?: string | null } = { detectedOk: true, detected: null };
    if (doDetect) {
      newSourceLang = await detectLanguage(selectedText);
      if (!newSourceLang.detectedOk) {
        // detected language is not supported for dictionary lookup, skip
        setMeanings({});
        setParts([]);
        setSyns([]);
        setAnts([]);
        setPhonetic(null);
        setInlineMessage({ text: `Detected language "${newSourceLang.detected}" is not supported for dictionary lookup.`, kind: 'info' });
        return;
      }
      if (newSourceLang.detected && newSourceLang.detected !== sourceLang) {
        setSourceLang(newSourceLang.detected);
      }
    }
    if (targetLang && targetLang !== sourceLang && sourceLang !== 'auto') {
      translateText(selectedText, targetLang, doDetect ? (newSourceLang.detected || 'auto') : sourceLang);
    } else {
      lookupDictionary(selectedText);
    }
  }

  
  // When the language pair changes, immediately clear current visible meanings so old list is removed while new data loads
  useEffect(() => {
    setMeanings({});
    setParts([]);
    setSyns([]);
    setAnts([]);
    setPhonetic(null);
    setActivePart(null);
    setInlineMessage(null);
  }, [sourceLang, targetLang, selectedText]);
  // On selectedText/sourceLang/targetLang change: check cache first, if not found, detect/lookup/translate
  useEffect(() => {
    if (!selectedText || selectedText.trim().length === 0) return;
    //check cache first, if it exists, restore it and skip lookup/translate
    const cacheKey = makeCacheKey(selectedText, sourceLang, targetLang);
    try {
      const cached = cacheByLangPair.current.get(cacheKey);
      if (cached) {
        // clone cached structures so subsequent state mutations don't mutate the cache
        try {
          const clonedMeanings = cached.meanings ? JSON.parse(JSON.stringify(cached.meanings)) : { noun: [] };
          const clonedParts = cached.parts && cached.parts.length ? [...cached.parts] : ['noun'];
          const clonedSyns = cached.syns ? [...cached.syns] : [];
          const clonedAnts = cached.ants ? [...cached.ants] : [];
          const clonedPhonetic = cached.phonetic ? JSON.parse(JSON.stringify(cached.phonetic)) : null;

          setMeanings(clonedMeanings);
          setParts(clonedParts);
          setActivePart(clonedParts[0] || 'noun');
          setSyns(clonedSyns);
          setAnts(clonedAnts);
          setPhonetic(clonedPhonetic);
          // onEnsureParts && onEnsureParts(clonedParts);
        } catch (e) {
          // fallback to shallow copies if cloning fails for any reason
          setMeanings(cached.meanings || { noun: [] });
          setParts(cached.parts && cached.parts.length ? cached.parts : ['noun']);
          setActivePart((cached.parts && cached.parts[0]) || 'noun');
          setSyns(cached.syns || []);
          setAnts(cached.ants || []);
          setPhonetic(cached.phonetic || null);
          // onEnsureParts && onEnsureParts(cached.parts || ['noun']);
        }
        return;
      }
    } catch (e) {
      // ignore cache read errors and proceed to fetch
    }
    setLoading(true);
    getDefinationAndTranslate()
  }, [selectedText, sourceLang, targetLang]);


  // Persist current meanings/parts/syns/ants/phonetic to cache whenever they change for the current language pair
  useEffect(() => {
    try {
      const key = makeCacheKey(selectedText, sourceLang, targetLang);
      cacheByLangPair.current.set(key, { meanings, parts, syns, ants, phonetic });
    } catch (e) {
      // ignore
    }
  }, [meanings, parts, syns, ants, phonetic]);


  // If parts are populated but activePart is not set, default activePart to the first part
  useEffect(() => {
    if ((!activePart || activePart === null) && parts && parts.length > 0) {
      setActivePart(parts[0]);
    }
  }, [parts]);

  // After meanings state changes, if a meaning was recently toggled, ensure it's visible
  React.useLayoutEffect(() => {
    const toggled = lastToggled.current;
    if (!toggled) return;
    try {
      const { pos, idx } = toggled;
      const wrap = wrapRefs.current.get(pos) || null;
      const meaningEl = meaningRefs.current.get(`${pos}:${idx}`) || null;
      if (!wrap || !meaningEl) return;
      const wrapRect = wrap.getBoundingClientRect();
      const meaningRect = meaningEl.getBoundingClientRect();
      const topDelta = meaningRect.top - wrapRect.top;
      const bottomDelta = meaningRect.bottom - wrapRect.bottom;
      if (topDelta < 0) {
        const target = wrap.scrollTop + topDelta;
        try { wrap.scrollTo({ top: target, behavior: 'smooth' }); } catch { wrap.scrollTop = target; }
      } else if (bottomDelta > 0) {
        const target = wrap.scrollTop + bottomDelta;
        try { wrap.scrollTo({ top: target, behavior: 'smooth' }); } catch { wrap.scrollTop = target; }
      }
    } catch (e) {
      // ignore
    } finally {
      lastToggled.current = null;
    }
  }, [meanings]);

  // After meanings update, restore caret positions requested by dispatchKeyEvent
  React.useLayoutEffect(() => {
    try {
      for (const [key, pos] of caretRestoreRef.current) {
        // Try definition refs first, then example refs
        let el = defRefs.current.get(key) || null;
        if (!el) el = exampleRefs.current.get(key) || null;
        if (el) {
          try {
            // Focus and restore caret to the requested position
            el.focus();
            el.selectionStart = el.selectionEnd = pos;
            // ensure element is visible
            try { el.scrollIntoView({ block: 'nearest' }); } catch {}
          } catch (e) { /* ignore per-element errors */ }
        }
      }
    } catch (e) {
      // ignore
    } finally {
      caretRestoreRef.current.clear();
    }
  }, [meanings]);

  // Imperative handle: expose isFocused() and dispatchKeyEvent(...) to host
  React.useImperativeHandle(ref, () => ({
    isFocused: () => {
      try {
        let active = shadowRoot ? (shadowRoot.activeElement as HTMLElement | null) : document.activeElement as HTMLElement | null;
        if (!active) return false;
        // if active element is inside the shadowRoot, re-resolve it to the main document
        // check registered definition textareas first
        for (const [, el] of defRefs.current) {
          if (!el) continue;
          if (el.contains(active)) return true;
        }
        console.debug("not a def");
        // check if active element is inside any registered wrap or meaning elements
        for (const [, wrap] of wrapRefs.current) {
          if (!wrap) continue;
          if (wrap.contains(active)) return true;
        }
        console.debug("not a wrap");
        for (const [, meaningEl] of meaningRefs.current) {
          if (!meaningEl) continue;
          if (meaningEl.contains(active)) return true;
        }
        console.debug("not a meaning");
      } catch (e) {
        // ignore
      }
      return false;
    },
    dispatchKeyEvent: (key: string, options: { ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean; shiftKey?: boolean } = {}) => {
      try {
        const active = shadowRoot ? (shadowRoot.activeElement as HTMLElement | null) : document.activeElement as HTMLElement | null;
        if (!active) return;
        // Determine whether active element is a definition or example textarea
        let focusedDefKey: string | null = null;
        for (const [k, el] of defRefs.current) {
          if (!el) continue;
          if (el === active) { focusedDefKey = k; break; }
        }
        let focusedExampleKey: string | null = null;
        for (const [k, el] of exampleRefs.current) {
          if (!el) continue;
          if (el === active) { focusedExampleKey = k; break; }
        }

        const noModifiers = !options.ctrlKey && !options.metaKey && !options.altKey;
        if (key.length === 1 && noModifiers) {
          try {
            if (focusedDefKey) {
              const [pos, idxStr] = focusedDefKey.split(':');
              const idx = parseInt(idxStr || '0', 10);
              if (!pos || Number.isNaN(idx)) return;
              const textarea = defRefs.current.get(focusedDefKey);
              if (!textarea) return;
              const start = typeof textarea.selectionStart === 'number' ? textarea.selectionStart : (textarea.value || '').length;
              const end = typeof textarea.selectionEnd === 'number' ? textarea.selectionEnd : start;
              setMeanings((prev) => {
                const next = { ...prev };
                const list = next[pos] ? [...next[pos]] : [];
                if (idx < 0 || idx >= list.length) return prev;
                const current = list[idx] || { definition: '' };
                const curDef = current.definition || '';
                const newDef = curDef.slice(0, start) + key + curDef.slice(end);
                list[idx] = { ...current, definition: newDef };
                next[pos] = list;
                try { caretRestoreRef.current.set(focusedDefKey!, (start || 0) + key.length); } catch (e) { /* ignore */ }
                return next;
              });
            } else if (focusedExampleKey) {
              const [pos, idxStr] = focusedExampleKey.split(':');
              const idx = parseInt(idxStr || '0', 10);
              if (!pos || Number.isNaN(idx)) return;
              const textarea = exampleRefs.current.get(focusedExampleKey);
              if (!textarea) return;
              const start = typeof textarea.selectionStart === 'number' ? textarea.selectionStart : (textarea.value || '').length;
              const end = typeof textarea.selectionEnd === 'number' ? textarea.selectionEnd : start;
              setMeanings((prev) => {
                const next = { ...prev };
                const list = next[pos] ? [...next[pos]] : [];
                if (idx < 0 || idx >= list.length) return prev;
                const current = list[idx] || { example: '' };
                const curEx = current.example || '';
                const newEx = curEx.slice(0, start) + key + curEx.slice(end);
                list[idx] = { ...current, example: newEx };
                next[pos] = list;
                try { caretRestoreRef.current.set(focusedExampleKey!, (start || 0) + key.length); } catch (e) { /* ignore */ }
                return next;
              });
            }
            // caret restoration will be handled by layout effect after meanings update
          } catch (e) {
            // ignore
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }), [defRefs, wrapRefs, meaningRefs, setMeanings, meanings]);

  // play phonetic audio with unified error handling and inline message
  const handlePlayAudio = (audioUrl?: string) => {
    if (!audioUrl) return;
    try {
      const a = new Audio(audioUrl);
      void a.play().catch((err) => {
        console.error('audio play failed', err);
        setInlineMessage({ text: "Cannot play pronunciation audio on this page. Media may be blocked by the site's Content Security Policy or browser settings.", kind: 'error' });
        try { document.dispatchEvent(new Event('audioPlayFailed')); } catch {}
      });
    } catch (e) {
      try { document.dispatchEvent(new Event('audioPlayFailed')); } catch {}
      setInlineMessage({ text: "Cannot play pronunciation audio on this page. Media may be blocked by the site's Content Security Policy or browser settings.", kind: 'error' });
    }
  };
  
  return (
    <div className="learn-root" style={{ maxWidth: 320, width: '100%' }}>
      {/* inline messages (info / error) matching legacy behavior */}
      {inlineMessage ? (
        <div className={`inline-message no-results`} style={{ marginTop: 8 }}>
          {inlineMessage.text}
        </div>
      ) : null}
      <TranslateControls source={sourceLang} target={targetLang} onSourceChange={setSourceLang} onTargetChange={setTargetLang} />

      {phonetic ? (
        <div className="small" style={{ marginTop: 8 }}>
          <strong>Phonetics:</strong> {phonetic.text || ''}
          {phonetic.audio ? <button className="form-button small" onClick={() => handlePlayAudio(phonetic.audio)}>🔊</button> : null}
        </div>
      ) : null}
      <Badges parts={parts} active={activePart} onSelect={(p) => setActivePart(p)} />
    <Tabs parts={parts} active={activePart} meanings={meanings} loading={loading}
          onCustom={handleCustom}
              onToggleExpand={(pos, idx) => {
                  // record which meaning was toggled so a layout effect can scroll after render
                  lastToggled.current = { pos, idx };
                  // toggle expanded flag in meanings state
                  setMeanings((prev) => ({
                      ...prev,
                      [pos]: prev[pos].map((m, i) => i === idx ? { ...m, expanded: !m.expanded } : m)
                  }));
                  }} 
          onToggleMark={(pos, idx) => {
              setMeanings((prev) => ({
              ...prev,
              [pos]: prev[pos].map((m, i) => i === idx ? { ...m, marked: !m.marked } : m)
              }));
          }} 
          onChangeMeaning={(pos, idx, fields) => {
              setMeanings((prev) => ({
              ...prev,
              [pos]: prev[pos].map((m, i) => i === idx ? { ...m, ...fields } : m)
              }));
          }} 
          onAttachImage={(pos, idx) => {
              // open file picker and send to background
              const input = document.createElement('input');
              input.type = 'file'; input.accept = 'image/*';
              input.onchange = () => {
              const file = input.files && input.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => chrome.runtime.sendMessage({ action: 'attachImage', pos, index: idx, dataUrl: reader.result });
              reader.readAsDataURL(file);
              };
              input.click();
          }} 
          onGenerateImage={(pos, idx) => {
              const m = meanings[pos]?.[idx];
              const prompt = `${m?.definition || ''} ${m?.example || ''}`;
              chrome.runtime.sendMessage({ action: 'generateImage', prompt, pos, index: idx });
          }}
      onRegisterDef={handleRegisterDef}
      onRegisterExample={handleRegisterExample}
      onRegisterWrap={(pos, el) => { wrapRefs.current.set(pos, el); }}
      onRegisterMeaning={(pos, idx, el) => { meaningRefs.current.set(`${pos}:${idx}`, el); }}
      />
      <SynList syns={syns} ants={ants} />
  {/* skeleton loader is now rendered inside the active tab by Tabs */}
    </div>
  );
});

export default LearnInput;
