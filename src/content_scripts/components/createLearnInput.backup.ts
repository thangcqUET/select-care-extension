//   private createLearnInputComponent(): HTMLElement {
//     // Create root container for learn UI
//     const container = document.createElement('div');
//     container.id = 'mainInput';
//     container.style.display = 'flex';
//     container.style.flexDirection = 'column';
//     container.style.gap = '10px';

//     // Use a shadow root to isolate styles
//     const shadow = container.attachShadow({ mode: 'closed' });

//     const style = document.createElement('style');
//     style.textContent = `
//   .learn-root { max-width: 320px; width: 100%; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #000; overflow: visible; }
//       .translate-controls { display:flex; gap:8px; align-items:center; }
//       .translate-controls select { flex:1; padding:6px 8px; border-radius:8px; border:1px solid rgba(63,63,63,0.12); background: rgba(255,255,255,0.6); }
//       .badges { display:flex; gap:6px; flex-wrap:wrap; margin-top:6px; }
//       .badge { padding:6px 8px; border-radius:999px; background: rgba(0,0,0,0.04); cursor:pointer; font-size:12px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; border: none; }
//       .badge.active { border: 1px solid rgba(63,63,63,0.2); }
//   .tabs { margin-top:8px; }
//   .meanings-wrap { width: 100%; max-width: 100%; max-height: 230px; overflow-y: auto; padding-right: 6px; box-sizing: border-box; }
//   /* hide native scrollbars while preserving scroll behavior */
//   .meanings-wrap::-webkit-scrollbar { width: 0; height: 0; }
//   .meanings-wrap { -ms-overflow-style: none; /* IE and Edge */ scrollbar-width: none; /* Firefox */ }
//   .meanings-wrap::-webkit-scrollbar-thumb { background: transparent; }
//   /* ensure flex children inside meanings don't force width expansion */
//   .meanings-wrap > .meaning { min-width: 0; }
//       .tab { display:none; }
//       .tab.active { display:block; }
//   .meaning { border:1px solid rgba(63,63,63,0.12); border-radius:12px; padding:8px; padding-top:6px; margin-bottom:8px; background: rgba(255,255,255,0.4); backdrop-filter: blur(5px); box-sizing:border-box; position: relative; }
//   .meaning .title { display:flex; gap:8px; align-items:center; cursor:default; justify-content:space-between; }
//   .meaning .title .left { display:flex; align-items:center; gap:8px; flex:1 1 auto; min-width:0; }
//   .meaning .title .right { display:flex; gap:6px; flex:0 0 auto; align-items:center; }
//       .meaning .body { margin-top:8px; display:none; }
//       .meaning.expanded .body { display:block; }
//   .form-input { width:100%; max-width:100%; padding:6px 10px; border-radius:8px; border:1px solid rgba(63,63,63,0.2); background: rgba(255,255,255,0.6); margin-bottom:8px; box-sizing:border-box; font-size:13px; min-width:0; overflow-wrap:anywhere; }
//   /* Title input (shorter height, bold) */
//   .meaning .title .form-input { padding:8px 12px; font-weight:600; border-radius:10px; }
//   .form-input:focus { outline:none; border-color: rgba(63,63,63,0.36); background: rgba(255,255,255,0.8); }
//     .form-actions { display:flex; gap:8px; margin-top:6px; flex-wrap:wrap; }
//   .form-button { flex: 0 0 auto; padding:6px 10px; border-radius:8px; border:1px solid rgba(63,63,63,0.12); background: rgba(255,255,255,0.6); cursor:pointer; white-space:nowrap; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;}
//   .form-button.small { padding:6px 8px; font-size:12px; }
//   .form-button.primary { background: linear-gradient(90deg,#7c3aed,#06b6d4); color:#fff; border:none; }
//   .form-button-marked { color: white; border: none; }
//   .mark-wrap { position: relative; display: inline-flex; align-items: center; }
//   .mark-wrap .tooltip { display: none; position: absolute; top: 50%; left: auto; right: calc(100% + 8px); transform: translateY(-50%); background: rgba(0,0,0,0.85); color: #fff; padding:6px 8px; border-radius:6px; font-size:12px; white-space:nowrap; z-index:2147483647; pointer-events: none; }
//   .mark-wrap:hover .tooltip { display: block; }
//   .mark-wrap .check { font-size:14px; line-height:1; display:inline-block; }
//   .toggle-icon { font-size:14px; display:inline-block; }
//       .syn-list { margin-top:8px; font-size:13px; color:rgba(0,0,0,0.75); }
//       .small { font-size:12px; color:rgba(0,0,0,0.6); }
//       /* Loading / skeleton styles for async dictionary fetch */
//       .learn-loading { display:flex; flex-direction:column; gap:8px; padding:8px 0; }
//       .learn-loading .skeleton-line { height:12px; background:linear-gradient(90deg, rgba(0,0,0,0.06), rgba(0,0,0,0.12), rgba(0,0,0,0.06)); border-radius:6px; position:relative; overflow:hidden; }
//       .learn-loading .skeleton-line::after { content: ''; position: absolute; top:0; left:-150%; height:100%; width:150%; background: linear-gradient(90deg, rgba(255,255,255,0.0), rgba(255,255,255,0.35), rgba(255,255,255,0.0)); transform: skewX(-20deg); }
//       .learn-loading .skeleton-line.short { width:35%; }
//       .learn-loading .skeleton-line.medium { width:60%; }
//       .learn-loading .skeleton-line.long { width:90%; }
//       /* shimmer animation */
//       @keyframes shimmer {
//         0% { transform: translateX(-150%) skewX(-20deg); }
//         100% { transform: translateX(150%) skewX(-20deg); }
//       }
//       .learn-loading .skeleton-line.animated::after { animation: shimmer 1.1s linear infinite; }
//       .no-results { margin-top:8px; padding:8px; border-radius:8px; background: rgba(255,255,255,0.2); border:1px dashed rgba(63,63,63,0.08); font-size:13px; color: rgba(0,0,0,0.6); }
//     `;

//     shadow.appendChild(style);

//     const root = document.createElement('div');
//     root.className = 'learn-root';

//     // Helper to show an inline message inside the learn popup (reusable)
//     const showInlineMessage = (msg: string, kind: 'info' | 'error' = 'info') => {
//       // remove existing inline messages first
//       const prev = root.querySelector('.inline-message');
//       if (prev && prev.parentElement) prev.parentElement.removeChild(prev);
//       const el = document.createElement('div');
//       el.className = 'inline-message no-results';
//       if (kind === 'error') {
//         el.style.borderStyle = 'solid';
//       }
//       el.textContent = msg;
//       root.appendChild(el);
//       return el;
//     };

//     // Listen for audio playback failures bubbled from services and show a helpful inline message
//     const onAudioPlayFailed = (_ev: Event) => {
//       try {
//         // Show a consistent user-facing message for CSP/media playback failures
//         showInlineMessage('Cannot play pronunciation audio on this page. Media may be blocked by the site\'s Content Security Policy or browser settings.', 'error');
//       } catch (e) {
//         // fallback to a basic alert if something goes wrong
//         try { alert('Cannot play pronunciation audio on this page.'); } catch {}
//       }
//     };
//     document.addEventListener('audioPlayFailed', onAudioPlayFailed as EventListener);

//     // Translate controls
//     const controls = document.createElement('div');
//     controls.className = 'translate-controls';

//     // Current/source language (detect or set explicitly)
//     const sourceSelect = document.createElement('select');
//     sourceSelect.title = 'Current Language';
//     ['auto', 'en'].forEach(code => {
//       const o = document.createElement('option'); o.value = code; o.textContent = code; sourceSelect.appendChild(o);
//     });

//     // Target language (what to translate/learn into)
//     const targetSelect = document.createElement('select');
//     targetSelect.title = 'Target Language';
//     ['vi','en'].forEach(code => {
//       const o = document.createElement('option'); o.value = code; o.textContent = code; targetSelect.appendChild(o);
//     });
//     // Small inline preview for translation results when user switches target language
//     const translationPreview = document.createElement('div');
//     translationPreview.className = 'small';
//     translationPreview.style.marginLeft = '6px';
//     translationPreview.style.fontSize = '12px';
//     translationPreview.style.minWidth = '60px';
//     translationPreview.textContent = '';
//     // Try to use browser locale as default
//     const locale = navigator.language ? navigator.language.split('-')[0] : 'en';
//     const defaultOption = Array.from(targetSelect.options).find((opt:any) => opt.value === locale);
//     if (defaultOption) defaultOption.selected = true;

//     // Debounced translate when target changes to a different language than source
//     // small cache to remember translations per source:target so switching back restores previous preview
//     const translationCache = new Map<string, { text: string; detected: string; pos: string | null }>();

//     const doTranslate = async () => {
//       try {
//         const srcValue = sourceSelect.value;
//         const tgtValue = targetSelect.value;
//         // only translate when target differs from source and we have selected text
//         if (!tgtValue || tgtValue === srcValue) {
//           translationPreview.textContent = '';
//           return;
//         }
//         const currentSelected = this.selectedText?.split('\n')[0]?.trim() || '';
//         if (!currentSelected) return;

//         const cacheKey = `${srcValue}:${tgtValue}`;
//         // If we previously fetched this source->target, restore cached preview immediately
//         const cached = translationCache.get(cacheKey);
//         if (cached) {
//           translationPreview.textContent = cached.text ? `${cached.text}${cached.detected ? ` (${cached.detected})` : ''}${cached.pos ? ` — ${cached.pos}` : ''}` : '';
//           if (cached.pos) {
//             try { this.ensureParts([cached.pos]); } catch (e) { /* ignore */ }
//           }
//           return;
//         }

//         chrome.runtime.sendMessage({ action: 'translate', text: currentSelected, target: tgtValue, source: srcValue }, (resp: any) => {
//           if (!resp) return;
//           if (resp.success && resp.result) {
//             console.log('Learn UI translate response:', resp);
//             // New preferred shape: background returns a TranslationMeaning (dictionary Meaning + translation)
//             // resp.result.translation (string) and resp.result.definitions[0].definition contain the translated text.
//             // Keep fallback to legacy nested shape { translations: [ { text, detected_source, partOfSpeech } ] }
//             let text = '';
//             let detected = '';
//             let pos: string | null = null;

//             // If result has a `translation` field (TranslationMeaning), prefer it
//             if (resp.result && typeof (resp.result as any).translation === 'string') {
//               text = (resp.result as any).translation || '';
//               detected = (resp.result as any).detectedSource ?? '';
//               pos = (resp.result as any).partOfSpeech ?? null;
//             } else if (resp.result && Array.isArray(resp.result?.definitions) && resp.result.definitions[0]) {
//               // dictionary-style meaning: use first definition
//               text = resp.result.definitions[0].definition || '';
//               detected = (resp.result as any).detectedSource ?? '';
//               pos = resp.result.partOfSpeech ?? null;
//             } else {
//               // legacy shape
//               const tr = resp.result.translations?.[0] || resp.result;
//               text = tr?.text ?? '';
//               detected = tr?.detected_source ?? resp.result?.source ?? '';
//               pos = tr?.partOfSpeech ?? tr?.part_of_speech ?? null;
//             }
//             translationPreview.textContent = text ? `${text}${detected ? ` (${detected})` : ''}${pos ? ` — ${pos}` : ''}` : '';
//             // cache result so switching back restores previous preview
//             try {
//               translationCache.set(cacheKey, { text, detected, pos });
//             } catch (e) { /* ignore caching failures */ }
//             // Ask the form popup to ensure a POS badge/tab exists for this part if provided
//             console.log('Learn UI translate preview:', { text, detected, pos });
//             if (pos) {
//               try { this.ensureParts([pos]); } catch (e) { /* ignore */ }
//             }
//           } else {
//             translationPreview.textContent = '';
//           }
//         });
//       } catch (e) {
//         // ignore errors; keep preview empty
//         translationPreview.textContent = '';
//       }
//     };

//     const debouncedTranslate = debounce(doTranslate, 250);
//     sourceSelect.addEventListener('change', debouncedTranslate);
//     targetSelect.addEventListener('change', debouncedTranslate);

//   controls.appendChild(sourceSelect);
//   controls.appendChild(targetSelect);
//   // Add the inline translation preview to the controls so it's visible beside the selects
//   controls.appendChild(translationPreview);

//     // Expose selects on the FormPopup instance so collectFormData can read them
//     (this as any).__learnSourceSelect = sourceSelect;
//     (this as any).__learnTargetSelect = targetSelect;

//     root.appendChild(controls);

//     // Badges for parts of speech (initially empty — populated by the service)
//     const badgesWrap = document.createElement('div');
//     badgesWrap.className = 'badges';
//     root.appendChild(badgesWrap);

//     // Tabs container
//     const tabs = document.createElement('div');
//     tabs.className = 'tabs';

//     // Helper to create a sample tab
//     const createPosTab = (pos: string) => {
//       const tab = document.createElement('div');
//       tab.className = 'tab';
//       tab.setAttribute('data-pos', pos);
//       if (pos === 'noun') tab.classList.add('active');

//       // Meanings list
//   const meaningsWrap = document.createElement('div');
//   meaningsWrap.className = 'meanings-wrap';

//       // Create few sample meanings (editable)
//       // helper to produce a meaning element so initial items and custom definitions share the same structure
//   const createMeaningElement = (pos:string, idx:number, opts?: {title?:string, expanded?:boolean, definition?:string, example?:string}) => {
//         const meaning = document.createElement('div');
//         meaning.className = 'meaning';

//         const title = document.createElement('div');
//         title.className = 'title';

//   // Title now rendered as a non-editable heading; it updates from the definition textarea
//   const titleText = document.createElement('div');
//   titleText.style.fontWeight = '500';
//   titleText.style.marginRight = '8px';
//   titleText.style.fontSize = '12px';
//   // If overflowing, use ellipsis
//   titleText.style.whiteSpace = 'nowrap';
//   titleText.style.overflow = 'hidden';
//   titleText.style.textOverflow = 'ellipsis';
//   titleText.title = opts?.title || opts?.definition || '';

//   // prefer explicit title, otherwise derive from provided definition (first line or truncated)
//   const deriveTitle = (text:string) => {
//     if (!text) return '';
//     const firstLine = text.split('\n')[0].trim();
//     return firstLine.length > 60 ? firstLine.slice(0,60).trim() + '…' : firstLine;
//   };
//   titleText.textContent = opts?.title && opts.title.length ? opts.title : deriveTitle(opts?.definition || '');

//         const toggle = document.createElement('span');
//         toggle.setAttribute('aria-expanded', 'false');
//         const toggleIcon = document.createElement('span'); toggleIcon.className = 'toggle-icon'; toggleIcon.textContent = '▾';
//         toggle.appendChild(toggleIcon);
//         toggle.addEventListener('click', () => {
//           this.toggleMeaning(meaning);
//         });

//         const left = document.createElement('div'); left.className = 'left';
        
//         // title toggle (expand/collapse)
//         left.addEventListener('click', () => {
//           this.toggleMeaning(meaning);
//         });
//         left.style.cursor = 'pointer';

//         const right = document.createElement('div'); right.className = 'right';
//         left.appendChild(titleText);

//         // Mark button sits outside the collapsible body so it's always visible
//         const markWrap = document.createElement('span'); markWrap.className='mark-wrap';
//         const markCtrl = document.createElement('span');
//         markCtrl.setAttribute('role','button'); markCtrl.tabIndex = 0;
//         const check = document.createElement('span'); check.className = 'check'; check.textContent = '◯';
//         markCtrl.appendChild(check);
//         const tooltip = document.createElement('span'); tooltip.className='tooltip'; tooltip.textContent='Mark to Save';
//         markWrap.appendChild(markCtrl);
//         markWrap.appendChild(tooltip);

//         // place mark left, toggle right
//         right.appendChild(markWrap);
//         right.appendChild(toggle);
//         title.appendChild(left);
//         title.appendChild(right);

//   const body = document.createElement('div'); body.className = 'body';
//   const fullDef = document.createElement('textarea'); fullDef.className = 'form-input'; fullDef.rows = 3; fullDef.value = opts?.definition || '';
//   // Example field: show only when example value exists; otherwise provide a small 'Add example' action
//   const examples = document.createElement('textarea'); examples.className = 'form-input'; examples.rows = 2; examples.value = opts?.example || '';
//   const exampleLabel = document.createElement('div'); exampleLabel.className = 'small'; exampleLabel.textContent = 'Example';
//   const addExampleBtn = document.createElement('button'); addExampleBtn.className = 'form-button small'; addExampleBtn.textContent = 'Add example';
//     const actions = document.createElement('div'); actions.className = 'form-actions';

//         const addImageBtn = document.createElement('button'); addImageBtn.className = 'form-button'; addImageBtn.textContent = 'Add Image';
//         addImageBtn.addEventListener('click', (e) => {
//           e.preventDefault();
//           const fileInput = document.createElement('input');
//           fileInput.type = 'file';
//           fileInput.accept = 'image/*';
//           fileInput.onchange = () => {
//             const file = fileInput.files && fileInput.files[0];
//             if (file) {
//               const reader = new FileReader();
//               reader.onload = () => {
//                 chrome.runtime.sendMessage({ action: 'attachImage', pos, index: idx, dataUrl: reader.result });
//               };
//               reader.readAsDataURL(file);
//             }
//           };
//           fileInput.click();
//         });

//         const genImageBtn = document.createElement('button'); genImageBtn.className = 'form-button primary'; genImageBtn.textContent = 'Generate Image';
//         genImageBtn.addEventListener('click', async (e) => {
//           e.preventDefault();
//           const payload = {
//             action: 'generateImage',
//             prompt: `${fullDef.value} ${examples.value}`,
//             pos,
//             index: idx
//           };
//           // remove reposition listeners and clear anchor
//           if (this.repositionHandler) {
//             window.removeEventListener('scroll', this.repositionHandler, true);
//             this.repositionHandler = undefined;
//           }
//           if (this.resizeHandler) {
//             window.removeEventListener('resize', this.resizeHandler);
//             this.resizeHandler = undefined;
//           }
//           chrome.runtime.sendMessage(payload);
//         });

//         actions.appendChild(addImageBtn); actions.appendChild(genImageBtn);
//         // Append definition
//         body.appendChild(fullDef);
//         // Append example only if provided; otherwise show the 'Add example' button
//         if (examples.value && examples.value.trim().length > 0) {
//           body.appendChild(exampleLabel);
//           body.appendChild(examples);
//         } else {
//           // show addExampleBtn which reveals the example input when clicked
//           addExampleBtn.addEventListener('click', (ev) => {
//             ev.preventDefault();
//             // replace button with label+textarea and insert them before the meaning actions so they stay in-place
//             if (addExampleBtn.parentElement) addExampleBtn.parentElement.removeChild(addExampleBtn);
//             // insert before the actions block to ensure correct position
//             body.insertBefore(exampleLabel, actions);
//             body.insertBefore(examples, actions);
//             // small delay to ensure appended then focus
//             setTimeout(() => { examples.focus(); examples.scrollIntoView({ block: 'nearest' }); }, 10);
//           });
//           body.appendChild(addExampleBtn);
//         }
//         body.appendChild(actions);
//         meaning.appendChild(title); meaning.appendChild(body);

//         // mark/unmark handler (uses current DOM index when needed)
//         const markHandler = () => {
//           const isMarked = markCtrl.getAttribute('data-marked') === '1';
//           // Client-only marking: update UI state and attribute. Saving will
//           // collect marked meanings locally and send only those to background.
//           if (!isMarked) {
//             markCtrl.setAttribute('data-marked','1');
//             check.textContent = '🟢'; // green circle
//             markCtrl.classList.add('form-button-marked');
//             tooltip.textContent = 'Marked';
//           } else {
//             markCtrl.removeAttribute('data-marked');
//             check.textContent = '◯';
//             markCtrl.classList.remove('form-button-marked');
//             tooltip.textContent = 'Mark to Save';
//           }
//         };
//         markCtrl.addEventListener('click', markHandler);
//         markCtrl.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); markHandler(); } });

//         // update title when definition textarea changes
//         fullDef.addEventListener('input', () => {
//           const t = deriveTitle(fullDef.value || '');
//           titleText.textContent = t;
//         });

//         if (opts?.expanded) {
//           meaning.classList.add('expanded');
//           const bodyEl = meaning.querySelector('.body') as HTMLElement | null;
//           if (bodyEl) bodyEl.style.display = 'block';
//         }

//         return meaning;
//       };

//       // No placeholder meanings here; the learn service will populate meanings based on API data.

//       // Custom definition button
//       const customBtn = document.createElement('button');
//   customBtn.className = 'form-button';
//   customBtn.textContent = 'Custom Definition';
//   customBtn.style.marginTop = '6px';
//       customBtn.addEventListener('click', () => {
//         // Append an empty meaning item (user will fill contents). Mark as user-initiated
//         const newIdx = meaningsWrap.querySelectorAll('.meaning').length;
//         const evt = new CustomEvent('addMeaning', { detail: { pos, index: newIdx, title: '', definition: 'Define here...', example: '', userInitiated: true } });
//         meaningsWrap.dispatchEvent(evt);
//       });

//         tab.appendChild(meaningsWrap);
//         tab.appendChild(customBtn);

//       // Listen for addMeaning events to create editable meaning
//       meaningsWrap.addEventListener('addMeaning', (_ev:any) => {
//         const detail = _ev?.detail || {};
//         const userInitiated = !!detail.userInitiated;
//         const newIdx = meaningsWrap.querySelectorAll('.meaning').length;
//         // create collapsed by default
//         const el = createMeaningElement(pos, newIdx, { title: detail.title || '', definition: detail.definition || '', example: detail.example || '' });
//         meaningsWrap.appendChild(el);
//         // Only focus/scroll when the addition was user-initiated (e.g., Custom Definition)
//         if (userInitiated) {
//           setTimeout(() => {
//             const input = el.querySelector('.form-input') as HTMLElement | null;
//             if (input) {
//               try { (input as HTMLInputElement).focus?.(); } catch {}
//               el.scrollIntoView({ block: 'nearest' });
//             }
//           }, 10);
//         }
//       });

//       return tab;
//     };

//     // Tabs will be created dynamically when the service provides parts via
//     // a CustomEvent('setParts', { detail: { parts: string[] } }).
//     // Provide a helper to ensure a tab exists for a given POS.
//     const ensureTabForPos = (pos: string, activate = false) => {
//       let tab = tabs.querySelector(`[data-pos="${pos}"]`) as HTMLElement | null;
//       if (!tab) {
//         tab = createPosTab(pos);
//         tabs.appendChild(tab);
//       }
//       if (activate) {
//         tabs.querySelectorAll('.tab').forEach(t => (t as HTMLElement).classList.remove('active'));
//         tab.classList.add('active');
//       }
//       return tab;
//     };

//     // Build parts helper used by the service. Attach it to the tabs element so
//     // consumers can call it directly (preferred) or dispatch a 'setParts' event
//     // (legacy fallback). Also expose a FormPopup instance method that forwards
//     // to this implementation so callers can reuse it directly from the class.
//     const buildParts = (parts: string[]) => {
//       // Clear existing badges
//       badgesWrap.innerHTML = '';
//       parts.forEach((p, idx) => {
//         const b = document.createElement('button');
//         b.className = 'badge';
//         if (idx === 0) b.classList.add('active');
//         b.textContent = p;
//         b.addEventListener('click', () => {
//           // toggle active badge
//           badgesWrap.querySelectorAll('.badge').forEach(el => el.classList.remove('active'));
//           b.classList.add('active');
//           // activate corresponding tab, falling back to first tab if missing
//           tabs.querySelectorAll('.tab').forEach(t => (t as HTMLElement).classList.remove('active'));
//           const tab = tabs.querySelector(`[data-pos="${p}"]`) as HTMLElement | null;
//           if (tab) tab.classList.add('active');
//           else {
//             const firstTab = tabs.querySelector('.tab') as HTMLElement | null;
//             if (firstTab) firstTab.classList.add('active');
//           }
//         });
//         badgesWrap.appendChild(b);
//         // Ensure the tab exists (but don't necessarily activate besides first)
//         ensureTabForPos(p, idx === 0);
//       });
//     };

//     // attach helper implementation to the instance so ensureParts() can call it
//     this._ensurePartsImpl = buildParts;
//     // also expose the helper directly on the tabs element for backward-compat
//     (tabs as any).ensureParts = (p: string[]) => { this.ensureParts(p); };

//     // legacy event-based API — still supported
//     tabs.addEventListener('setParts', (ev: any) => {
//       const parts: string[] = ev?.detail?.parts || [];
//       buildParts(parts);
//     });

//     root.appendChild(tabs);

//     // Global synonyms/antonyms area (not tied to partOfSpeech) — place at bottom of learn root
//     const globalSynWrap = document.createElement('div');
//     globalSynWrap.className = 'syn-list';
//     // Build a collapsible block: header + content. Keep existing font sizes.
//     const synHeader = document.createElement('div');
//     synHeader.style.display = 'flex';
//     synHeader.style.alignItems = 'center';
//     synHeader.style.fontWeight = '600';
//     synHeader.style.justifyContent = 'space-between';
//     synHeader.style.cursor = 'pointer';
//     synHeader.innerHTML = `<div class="small">Synonyms & Antonyms</div><div class="small">▾</div>`;

//     const synContent = document.createElement('div');
//     synContent.style.display = 'none'; // collapsed by default
//     synContent.innerHTML = `<div class="small">Synonyms: <span data-syn></span></div><div class="small">Antonyms: <span data-ant></span></div>`;

//     synHeader.addEventListener('click', () => {
//       const expanded = synContent.style.display === 'block';
//       synContent.style.display = expanded ? 'none' : 'block';
//       // toggle icon
//       const icon = synHeader.querySelectorAll('div')[1] as HTMLElement | null;
//       if (icon) icon.textContent = expanded ? '▾' : '▴';
//     });

//   globalSynWrap.appendChild(synHeader);
//   globalSynWrap.appendChild(synContent);
//   // hide by default; the service will show it only when there is data
//   globalSynWrap.style.display = 'none';
//   root.appendChild(globalSynWrap);

//     // If we have a selected text, show loading UI and delegate dictionary fetch + UI population to the service
//     const selected = this.selectedText?.split('\n')[0]?.trim() || '';
//     const loadingWrap = document.createElement('div');
//     loadingWrap.className = 'learn-loading';
//     loadingWrap.innerHTML = `
//       <div class="skeleton-line long animated"></div>
//       <div class="skeleton-line medium animated"></div>
//       <div class="skeleton-line short animated"></div>
//     `;
//     // Insert loading placeholder into the first tab (noun fallback) so it's visible while fetching
//     const firstTab = tabs.querySelector('.tab') as HTMLElement | null;
//     const initialTarget = firstTab ? (firstTab.querySelector('.meanings-wrap') as HTMLElement | null) : null;
//     if (initialTarget) {
//       initialTarget.appendChild(loadingWrap);
//     } else {
//       // no tab exists yet — append to the tabs container so the skeleton is visible
//       tabs.appendChild(loadingWrap);
//     }

//     if (selected.length > 0) {
//       // If user set source language to 'auto', ask the background to detect language first
//       const srcSel = (this as any).__learnSourceSelect as HTMLSelectElement | undefined;
//       const srcValue = srcSel?.value || 'auto';

//       const runPopulate = async () => {
//         await populateLearnUI(selected, controls, badgesWrap, tabs, globalSynWrap);
//         return true;
//       };

//       const tryDetectThenPopulate = async () => {
//         if (srcValue === 'auto') {
//           try {
//             const resp = await new Promise<any>((resolve) => {
//               chrome.runtime.sendMessage({ action: 'detectLanguage', text: selected }, (r:any) => resolve(r));
//             });
//             if (resp && resp.success && resp.result && resp.result.detectedLanguage) {
//               const detected = resp.result.detectedLanguage.language;
//               // If detected language is not English, show an inline message and don't run dictionary lookup
//               if (detected && detected !== 'en') {
//                 showInlineMessage(`Detected language: ${detected}. Dictionary lookup (English) skipped.`, 'info');
//                 // still allow user to open the popup, but don't call populate
//                 return Promise.resolve(false);
//               }
//               // if English, proceed to populate
//               return runPopulate();
//             } else {
//               // detection failed — fall back to populate
//               return runPopulate();
//             }
//           } catch (err) {
//             // on error, fall back to populate
//             return runPopulate();
//           }
//         } else if (srcValue === 'en') {
//           return runPopulate();
//         } else {
//           // unsupported source language for now — show inline message in the popup and skip lookup
//           showInlineMessage(`Source language set to "${srcValue}". Dictionary lookup (English) skipped.`, 'info');
//           return Promise.resolve(false);
//         }
//       };

//       // call detection+populate and handle UI updates via promise callbacks
//       tryDetectThenPopulate()
//         .then((didRun: boolean) => {
//           if (loadingWrap.parentElement) loadingWrap.parentElement.removeChild(loadingWrap);
//           const anyMeaning = tabs.querySelector('.meanings-wrap .meaning');
//           // Only show the 'no meanings' hint when we actually ran populate
//           if (didRun && !anyMeaning) {
//             // Ensure there's at least a default tab (noun) so users can add custom definitions
//             const nounTab = ensureTabForPos('noun', true);
//             const targetWrap = nounTab ? (nounTab.querySelector('.meanings-wrap') as HTMLElement | null) : null;
//               if (targetWrap) {
//               // remove any previous placeholder nodes
//               const prevHint = targetWrap.querySelector('.no-results-hint');
//               if (prevHint && prevHint.parentElement) prevHint.parentElement.removeChild(prevHint);
//               // use reusable inline message helper so placement and styling are consistent
//               const hintEl = showInlineMessage(`No dictionary meanings found for "${selected}". Use "Custom Definition" to add your own.`, 'info');
//               hintEl.classList.add('small', 'no-results-hint');
//               // ensure the hint is placed inside the meanings wrap for context
//               targetWrap.appendChild(hintEl);
//             } else {
//               // fallback: append a small hint to the root
//               const noResults = document.createElement('div');
//               noResults.className = 'no-results';
//               noResults.textContent = `No results for "${selected}"`;
//               root.appendChild(noResults);
//             }
//           }
//   })
//   .catch((err) => {
//           console.error('populateLearnUI error', err);
//           if (loadingWrap.parentElement) loadingWrap.parentElement.removeChild(loadingWrap);
//           const errEl = document.createElement('div');
//           errEl.className = 'no-results';
//           errEl.textContent = 'Failed to load dictionary data';
//           root.appendChild(errEl);
//         });
//     } else {
//       // No selected text — remove loading and show hint
//       if (loadingWrap.parentElement) loadingWrap.parentElement.removeChild(loadingWrap);
//       const hint = document.createElement('div');
//       hint.className = 'no-results';
//       hint.textContent = 'Select a word to look up meanings';
//       root.appendChild(hint);
//     }

//     shadow.appendChild(root);

//     // Return the container which holds the shadow DOM
//     return container;
//   }