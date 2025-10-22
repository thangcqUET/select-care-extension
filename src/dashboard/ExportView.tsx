import React from 'react';
import { generators, defaultGenerator, exporterMeta } from './exporters';
import { analytics, EventAction } from '../lib/analytics';
import { t } from '../lib/i18n';

type Props = {
  exportSelections: () => Promise<any[]>;
  copyToClipboard: (text: string) => Promise<void>;
};

const ExportPreview: React.FC<{ text: string }> = ({ text }) => (
  <textarea readOnly value={text} className="w-full h-64 p-2 text-xs font-mono border rounded" />
);

const ExportView: React.FC<Props> = ({ exportSelections, copyToClipboard }) => {
  const [exportWhat, setExportWhat] = React.useState<'learning' | 'note'>('learning');
  const [targetApp, setTargetApp] = React.useState<string>('anki');
  const [previewText, setPreviewText] = React.useState<string>('');
  const [sending, setSending] = React.useState(false);
  const [connected, setConnected] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [selectedFormat, setSelectedFormat] = React.useState<string | null>(null);
  const [includeOrder, setIncludeOrder] = React.useState<string[]>([]);
  

  const learningTargets = [
    { id: 'anki', label: 'Anki' },
    { id: 'quizlet', label: 'Quizlet' },
  ];
  const noteTargets = [
    { id: 'notion', label: 'Notion' },
    // { id: 'logseq', label: 'LogSeq' },
  ];

  const buildPayload = (items: any[]) => {
    const key = `${exportWhat}:${targetApp}`;
    const gen = (generators && (generators as any)[key]) || defaultGenerator || ((i: any[]) => JSON.stringify(i, null, 2));
    const options = { exportWhat, targetApp, includeFields, includeOrder, format: selectedFormat };
    return gen(items, options);
  };

  const refreshPreview = async () => {
  const all = await exportSelections();
  const items = exportWhat === 'learning' ? all.filter((s: any) => s.type === 'learn') : all.filter((s: any) => s.type === 'note');
    setPreviewText(buildPayload(items));
  };

  React.useEffect(() => { void refreshPreview(); }, [exportWhat, targetApp]);

  // field selections
  const defaultKey = `${exportWhat}:${targetApp}`;
  const exporterDefaults = (exporterMeta && exporterMeta[defaultKey] && exporterMeta[defaultKey].defaultIncludeFields) || {};
  const [includeFields, setIncludeFields] = React.useState<Record<string, any>>(exporterDefaults);

  // When export type or target app changes, reset the fields to exporter defaults
  React.useEffect(() => {
    const key = `${exportWhat}:${targetApp}`;
    const def = (exporterMeta && exporterMeta[key] && exporterMeta[key].defaultIncludeFields) || {};
    setIncludeFields(def);
    const order = (exporterMeta && exporterMeta[key] && exporterMeta[key].controls && exporterMeta[key].controls.map((c: any) => c.id)) || [];
    setIncludeOrder(order);
    // initialize selected format from exporter metadata when available
    const fmt = (exporterMeta && exporterMeta[key] && exporterMeta[key].formats && exporterMeta[key].formats[0]) || null;
    setSelectedFormat(fmt);
  }, [exportWhat, targetApp]);

  // When the export kind changes, pick a sensible default target app
  React.useEffect(() => {
    if (exportWhat === 'learning') setTargetApp('anki');
    else if (exportWhat === 'note') setTargetApp('notion');
    
    // Track export app selection
    analytics.trackExportAction(EventAction.EXPORT_APP_SELECTED, targetApp, {
      exportType: exportWhat
    });
  }, [exportWhat]);

  // drag and drop refs/handlers for reordering
  const dragIdRef = React.useRef<string | null>(null);
  const onDragStart = (id: string) => (e: React.DragEvent) => {
    dragIdRef.current = id;
    try { e.dataTransfer?.setData('text/plain', id); } catch (err) {}
    e.dataTransfer!.effectAllowed = 'move';
  };
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer!.dropEffect = 'move'; };
  const onDrop = (targetId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    const srcId = dragIdRef.current || e.dataTransfer?.getData('text/plain');
    if (!srcId || srcId === targetId) return;
    setIncludeOrder((prev) => {
      const next = prev.slice();
      const i = next.indexOf(srcId);
      const j = next.indexOf(targetId);
      if (i === -1 || j === -1) return prev;
      next.splice(i, 1);
      next.splice(j, 0, srcId);
      return next;
    });
    dragIdRef.current = null;
  };

  const download = (text: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ext = selectedFormat ? selectedFormat.replace(/^\./, '') : 'txt';
    a.download = `${exportWhat}_${targetApp}_${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const startOAuth = async (provider: string) => {
    try {
      const resp = await chrome.runtime.sendMessage({ action: 'startOAuth', provider });
      if (resp?.success) setConnected(true);
      return resp;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const handleApiExport = async () => {
    setSending(true);
    try {
      const all = await exportSelections();
    const items = exportWhat === 'learning' ? all.filter((s: any) => s.type === 'learn') : all.filter((s: any) => s.type === 'note');
      const payload = buildPayload(items);
      const resp = await chrome.runtime.sendMessage({ action: 'exportToService', provider: targetApp, data: payload });
      if (!resp?.success) throw new Error(resp?.error || 'unknown');
    } catch (e) {
      console.error('API export failed', e);
    } finally {
      setSending(false);
    }
  };

  const availableMethods = React.useMemo(() => {
    const methods: ('file'|'copy'|'api')[] = ['file', 'copy'];
    // if (exportWhat === 'note' && targetApp === 'notion') methods.push('api');
    return methods;
  }, [exportWhat, targetApp]);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-100 shadow-sm">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-blue-700">{t('exportTitle')}</h2>
        <div className="text-xs text-blue-500">{t('exportSubtitle')}</div>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-xs text-gray-600 mb-1">{t('exportWhat')}</label>
          <select
            value={exportWhat}
            onChange={(e) => setExportWhat(e.target.value as any)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="learning">{t('exportLearning')}</option>
            <option value="note">{t('exportNote')}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">{t('exportTargetApp')}</label>
          <select
            value={targetApp}
            onChange={(e) => setTargetApp(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {(exportWhat === 'learning' ? learningTargets : noteTargets).map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
          {/* Format selection depends on exporter metadata */}
          {(() => {
            const key = `${exportWhat}:${targetApp}`;
            const meta = (exporterMeta && exporterMeta[key]) || null;
            if (!meta || !meta.formats) return null;
            return (
              <div className="mt-2">
                <label className="block text-xs text-gray-600 mb-1">{t('exportFormat')}</label>
                <select
                  value={selectedFormat ?? meta.formats[0]}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {meta.formats.map((f: string) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            );
          })()}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs text-gray-600 mb-1">{t('exportFieldsToInclude')}</label>
  <div className="text-xs text-gray-500 mb-2">{t('exportDragToReorder')}</div>
        {/* Render exporter-specific controls when metadata is available */}
        {(() => {
          const key = `${exportWhat}:${targetApp}`;
          const meta = (exporterMeta && exporterMeta[key]) || null;
          if (!meta || !meta.controls) {
            // Fallback to previous generic UI (vertical list)
            return exportWhat === 'learning' ? (
              <div className="flex flex-col gap-3">
                  <label className={`inline-flex items-center gap-3 px-3 py-1 rounded-full border shadow-sm text-sm cursor-pointer ${includeFields.front ? 'bg-blue-50 border-blue-200' : 'bg-white/80 border-gray-200'}`}>
                    <input className="w-4 h-4 text-blue-600" type="checkbox" checked={!!includeFields.front} onChange={(e) => setIncludeFields((prev: Record<string, any>) => ({ ...prev, front: e.target.checked }))} />
                    <span className={`${includeFields.front ? 'text-blue-800' : 'text-gray-800'}`}>{t('exportFront')}</span>
                  </label>
                  <label className={`inline-flex items-center gap-3 px-3 py-1 rounded-full border shadow-sm text-sm cursor-pointer ${includeFields.back ? 'bg-blue-50 border-blue-200' : 'bg-white/80 border-gray-200'}`}>
                    <input className="w-4 h-4 text-blue-600" type="checkbox" checked={!!includeFields.back} onChange={(e) => setIncludeFields((prev: Record<string, any>) => ({ ...prev, back: e.target.checked }))} />
                    <span className={`${includeFields.back ? 'text-blue-800' : 'text-gray-800'}`}>{t('exportBack')}</span>
                  </label>
                  <label className={`inline-flex items-center gap-3 px-3 py-1 rounded-full border shadow-sm text-sm cursor-pointer ${includeFields.tags ? 'bg-blue-50 border-blue-200' : 'bg-white/80 border-gray-200'}`}>
                    <input className="w-4 h-4 text-blue-600" type="checkbox" checked={!!includeFields.tags} onChange={(e) => setIncludeFields((prev: Record<string, any>) => ({ ...prev, tags: e.target.checked }))} />
                    <span className={`${includeFields.tags ? 'text-blue-800' : 'text-gray-800'}`}>{t('exportTags')}</span>
                  </label>
                  <label className={`inline-flex items-center gap-3 px-3 py-1 rounded-full border shadow-sm text-sm cursor-pointer ${includeFields.source ? 'bg-blue-50 border-blue-200' : 'bg-white/80 border-gray-200'}`}>
                    <input className="w-4 h-4 text-blue-600" type="checkbox" checked={!!includeFields.source} onChange={(e) => setIncludeFields((prev: Record<string, any>) => ({ ...prev, source: e.target.checked }))} />
                    <span className={`${includeFields.source ? 'text-blue-800' : 'text-gray-800'}`}>{t('exportSource')}</span>
                  </label>
                </div>
            ) : (
              <div className="flex flex-col gap-3">
                <label className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-white/80 border shadow-sm text-sm cursor-pointer">
                  <input className="w-4 h-4" type="checkbox" checked={!!includeFields.title} onChange={(e) => setIncludeFields((prev: Record<string, any>) => ({ ...prev, title: e.target.checked }))} />
                  <span>{t('exportTitle_field')}</span>
                </label>
                <label className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-white/80 border shadow-sm text-sm cursor-pointer">
                  <input className="w-4 h-4" type="checkbox" checked={!!includeFields.body} onChange={(e) => setIncludeFields((prev: Record<string, any>) => ({ ...prev, body: e.target.checked }))} />
                  <span>{t('exportBody')}</span>
                </label>
                <label className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-white/80 border shadow-sm text-sm cursor-pointer">
                  <input className="w-4 h-4" type="checkbox" checked={!!includeFields.tags} onChange={(e) => setIncludeFields((prev: Record<string, any>) => ({ ...prev, tags: e.target.checked }))} />
                  <span>{t('exportTags')}</span>
                </label>
                <label className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-white/80 border shadow-sm text-sm cursor-pointer">
                  <input className="w-4 h-4" type="checkbox" checked={!!includeFields.source} onChange={(e) => setIncludeFields((prev: Record<string, any>) => ({ ...prev, source: e.target.checked }))} />
                  <span>{t('exportSource')}</span>
                </label>
              </div>
            );
          }

                  // Render controls in includeOrder. Provide drag-and-drop to reorder.
                  const controlsById = new Map((meta.controls || []).map((c: any) => [c.id, c as any]));
                  // compute display order numbers that only count enabled fields
                  const orderNumberById = new Map<string, number | null>();
                  (includeOrder || []).forEach((id: string) => {
                    // we will assign numbers incrementally only for enabled fields
                    // do this by scanning and counting enabled ones
                    // first initialize to null; actual numbers assigned next
                    orderNumberById.set(id, null);
                  });
                  let ord = 0;
                  (includeOrder || []).forEach((id: string) => {
                    if (includeFields && includeFields[id]) {
                      ord += 1;
                      orderNumberById.set(id, ord);
                    }
                  });
                  // move function removed — drag-and-drop is used for ordering

                  return (
                    <div className="flex flex-col gap-3">
                      {includeOrder.map((id: string) => {
                        const c = controlsById.get(id) as any;
                        if (!c) return null;
                        return (
                          <div
                          key={id}
                          className={`inline-flex items-center justify-between gap-3 px-3 py-1 rounded-full border shadow-sm text-sm cursor-grab w-full ${includeFields[id] ? 'bg-blue-50 border-blue-200' : 'bg-white/80 border-gray-200'}`}
                            draggable
                            onDragStart={onDragStart(id)}
                            onDragOver={onDragOver}
                            onDrop={onDrop(id)}
                            onDragEnd={() => { dragIdRef.current = null; }}
                            aria-grabbed={dragIdRef.current === id}
                          >
                          <div className="flex items-center gap-3">
                            <div className={`flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full ${includeFields[id] ? 'bg-blue-50 text-blue-700' : 'bg-transparent text-gray-300'}`}>{orderNumberById.get(id) ?? null}</div>
                              {c.type === 'checkbox' ? (
                              <label className="text-sm flex items-center gap-2">
                                <input
                                  className="w-4 h-4 text-blue-600 mr-2"
                                  type="checkbox"
                                  checked={!!includeFields[id]}
                                  onChange={(e) => setIncludeFields((prev: Record<string, any>) => ({ ...prev, [id]: e.target.checked }))}
                                />
                                <span className={`${includeFields[id] ? 'text-blue-800' : 'text-gray-800'}`}>{c.label}</span>
                              </label>
                              ) : c.type === 'text' ? (
                              <label className="text-sm flex items-center gap-2">
                                <span className="mr-1">{c.label}</span>
                                <input
                                  type="text"
                                  placeholder={c.placeholder || ''}
                                  value={includeFields[id] ?? ''}
                                  onChange={(e) => setIncludeFields((prev: Record<string, any>) => ({ ...prev, [id]: e.target.value }))}
                                  className="px-2 py-1 text-sm border rounded"
                                />
                              </label>
                              ) : null}
                            </div>
                          <div className="text-xs text-blue-400">⋮</div>
                          </div>
                        );
                      })}
                    </div>
                  );
        })()}
      </div>

      <div className="mb-4">
        <label className="block text-xs text-gray-600 mb-1">{t('exportActions')}</label>
        <div className="flex gap-2 flex-wrap">
          {availableMethods.map(m => (
            <button
              key={m}
              onClick={async () => {
                const all = await exportSelections();
                const items = exportWhat === 'learning' ? all.filter((s: any) => s.type === 'learn') : all.filter((s: any) => s.type === 'note');
                const payload = buildPayload(items);
                
                // Track export action
                const exportAction = exportWhat === 'learning' ? EventAction.EXPORT_LEARN : EventAction.EXPORT_NOTE;
                analytics.trackExportAction(exportAction, targetApp, {
                  method: m,
                  itemCount: items.length,
                  format: selectedFormat
                });
                
                if (m === 'file') download(payload);
                else if (m === 'copy') {
                  await copyToClipboard(payload);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }
                else if (m === 'api') {
                  if (!connected) {
                    const r = await startOAuth(targetApp);
                    if (!r?.success) return;
                    setConnected(true);
                  }
                  await handleApiExport();
                }
              }}
              className="px-3 py-1 text-sm rounded border transition-colors bg-white hover:bg-gray-50 cursor-pointer"
              disabled={sending}
            >
              {m === 'file' ? `${t('exportDownload')} ${exportWhat}` : m === 'copy' ? t('exportCopy') : `${t('exportTo')} ${targetApp}`}
              {m === 'copy' && copied ? <span className="ml-2 inline-block px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">{t('exportCopied')}</span> : null}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-600 mb-2">{t('exportPreview')}</div>
      <div className="mb-3">
        <button
          onClick={() => void refreshPreview()}
          className="px-3 py-1 text-sm bg-gray-50 rounded border cursor-pointer"
          disabled={sending}
        >
          {t('exportUpdatePreview')}
        </button>
      </div>
      <ExportPreview text={previewText} />
    </div>
  );
};

export default ExportView;

