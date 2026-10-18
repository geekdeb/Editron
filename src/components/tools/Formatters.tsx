// ============================================================
// Editron — JSON / XML / YAML Formatter Tools
// ============================================================

import React, { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { useUIStore } from '../../store/uiStore';
import {
  jsonFormat, jsonMinify, jsonValidate, jsonSortKeys,
  xmlFormat, xmlMinify, xmlValidate,
  yamlFormat, yamlValidate, jsonToYaml, yamlToJson
} from '../../services/formatterService';
import { CheckCircle, XCircle, Copy, ArrowDownUp } from 'lucide-react';

// ── JSON Formatter ────────────────────────────────────────────
export const JsonFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState(2);
  const [status, setStatus] = useState<{ valid: boolean; msg: string } | null>(null);
  const activeTab = useEditorStore((s) => s.getActiveTab());
  const updateTab = useEditorStore((s) => s.updateTab);
  const addToast = useUIStore((s) => s.addToast);

  const getInput = () => input || activeTab?.content || '';

  const format = () => {
    const src = getInput();
    const v = jsonValidate(src);
    if (!v.valid) { setStatus({ valid: false, msg: v.error || 'Invalid JSON' }); setOutput(''); return; }
    setStatus({ valid: true, msg: 'Valid JSON' });
    setOutput(jsonFormat(src, indent));
  };

  const minify = () => {
    const src = getInput();
    const v = jsonValidate(src);
    if (!v.valid) { setStatus({ valid: false, msg: v.error || 'Invalid JSON' }); return; }
    setStatus({ valid: true, msg: 'Minified' });
    setOutput(jsonMinify(src));
  };

  const sortKeys = () => {
    const src = getInput();
    const v = jsonValidate(src);
    if (!v.valid) { setStatus({ valid: false, msg: v.error || 'Invalid JSON' }); return; }
    setOutput(jsonSortKeys(src, indent));
  };

  const applyToEditor = () => {
    if (output && activeTab) {
      updateTab(activeTab.id, { content: output, isDirty: true });
      addToast('Applied to editor', 'success');
    }
  };

  const toYaml = () => {
    try { setOutput(jsonToYaml(getInput())); setStatus({ valid: true, msg: 'Converted to YAML' }); }
    catch (e) { setStatus({ valid: false, msg: (e as Error).message }); }
  };

  return (
    <div className="tool-section">
      <div className="tool-section-title">JSON Formatter</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <label className="tool-label" style={{ margin: 0 }}>Indent:</label>
        <select className="tool-select" style={{ width: 60 }} value={indent} onChange={(e) => setIndent(+e.target.value)}>
          <option value={2}>2</option>
          <option value={4}>4</option>
          <option value={1}>Tab</option>
        </select>
        {status && (
          <span style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 11, color: status.valid ? 'var(--success)' : 'var(--error)', marginLeft: 'auto' }}>
            {status.valid ? <CheckCircle size={12} /> : <XCircle size={12} />}
            {status.msg}
          </span>
        )}
      </div>

      <label className="tool-label">Input (or uses active tab)</label>
      <textarea className="tool-textarea" placeholder='{"key":"value"}' value={input} onChange={(e) => setInput(e.target.value)} rows={4} />

      <div className="tool-btn-row">
        <button className="tool-btn primary" onClick={format} style={{ flex: 1 }}>Format</button>
        <button className="tool-btn" onClick={minify}>Minify</button>
        <button className="tool-btn" onClick={sortKeys}>Sort Keys</button>
        <button className="tool-btn" onClick={toYaml} title="Convert to YAML"><ArrowDownUp size={12} /> YAML</button>
      </div>

      {output && (
        <>
          <label className="tool-label">Result</label>
          <div style={{ position: 'relative' }}>
            <pre className="tool-result" style={{ maxHeight: 200, fontSize: 11 }}>{output}</pre>
            <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 4 }}>
              <button onClick={() => navigator.clipboard.writeText(output)} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <Copy size={12} />
              </button>
              <button onClick={applyToEditor} style={{ background: 'var(--accent)', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', color: 'white', fontSize: 10 }}>
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ── XML Formatter ─────────────────────────────────────────────
export const XmlFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState<{ valid: boolean; msg: string } | null>(null);
  const activeTab = useEditorStore((s) => s.getActiveTab());
  const updateTab = useEditorStore((s) => s.updateTab);
  const addToast = useUIStore((s) => s.addToast);

  const getInput = () => input || activeTab?.content || '';

  const format = () => {
    const src = getInput();
    const v = xmlValidate(src);
    if (!v.valid) { setStatus({ valid: false, msg: v.error || 'Invalid XML' }); setOutput(''); return; }
    setStatus({ valid: true, msg: 'Valid XML' });
    setOutput(xmlFormat(src));
  };

  const minify = () => {
    const src = getInput();
    setOutput(xmlMinify(src));
  };

  const applyToEditor = () => {
    if (output && activeTab) {
      updateTab(activeTab.id, { content: output, isDirty: true });
      addToast('Applied to editor', 'success');
    }
  };

  return (
    <div className="tool-section">
      <div className="tool-section-title">XML Formatter</div>

      {status && (
        <span style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 11, color: status.valid ? 'var(--success)' : 'var(--error)', marginBottom: 6 }}>
          {status.valid ? <CheckCircle size={12} /> : <XCircle size={12} />} {status.msg}
        </span>
      )}

      <label className="tool-label">Input (or uses active tab)</label>
      <textarea className="tool-textarea" placeholder="<root><child/></root>" value={input} onChange={(e) => setInput(e.target.value)} rows={4} />

      <div className="tool-btn-row">
        <button className="tool-btn primary" onClick={format} style={{ flex: 1 }}>Format</button>
        <button className="tool-btn" onClick={minify}>Minify</button>
      </div>

      {output && (
        <>
          <label className="tool-label">Result</label>
          <div style={{ position: 'relative' }}>
            <pre className="tool-result" style={{ maxHeight: 200, fontSize: 11 }}>{output}</pre>
            <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 4 }}>
              <button onClick={() => navigator.clipboard.writeText(output)} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <Copy size={12} />
              </button>
              <button onClick={applyToEditor} style={{ background: 'var(--accent)', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', color: 'white', fontSize: 10 }}>
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ── YAML Formatter ────────────────────────────────────────────
export const YamlFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState<{ valid: boolean; msg: string } | null>(null);
  const activeTab = useEditorStore((s) => s.getActiveTab());
  const updateTab = useEditorStore((s) => s.updateTab);
  const addToast = useUIStore((s) => s.addToast);

  const getInput = () => input || activeTab?.content || '';

  const format = () => {
    const src = getInput();
    const v = yamlValidate(src);
    if (!v.valid) { setStatus({ valid: false, msg: v.error || 'Invalid YAML' }); setOutput(''); return; }
    setStatus({ valid: true, msg: 'Valid YAML' });
    setOutput(yamlFormat(src));
  };

  const toJson = () => {
    try { setOutput(yamlToJson(getInput())); setStatus({ valid: true, msg: 'Converted to JSON' }); }
    catch (e) { setStatus({ valid: false, msg: (e as Error).message }); }
  };

  const applyToEditor = () => {
    if (output && activeTab) {
      updateTab(activeTab.id, { content: output, isDirty: true });
      addToast('Applied to editor', 'success');
    }
  };

  return (
    <div className="tool-section">
      <div className="tool-section-title">YAML Formatter</div>

      {status && (
        <span style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 11, color: status.valid ? 'var(--success)' : 'var(--error)', marginBottom: 6 }}>
          {status.valid ? <CheckCircle size={12} /> : <XCircle size={12} />} {status.msg}
        </span>
      )}

      <label className="tool-label">Input (or uses active tab)</label>
      <textarea className="tool-textarea" placeholder="key: value" value={input} onChange={(e) => setInput(e.target.value)} rows={4} />

      <div className="tool-btn-row">
        <button className="tool-btn primary" onClick={format} style={{ flex: 1 }}>Format</button>
        <button className="tool-btn" onClick={toJson} title="Convert to JSON"><ArrowDownUp size={12} /> JSON</button>
      </div>

      {output && (
        <>
          <label className="tool-label">Result</label>
          <div style={{ position: 'relative' }}>
            <pre className="tool-result" style={{ maxHeight: 200, fontSize: 11 }}>{output}</pre>
            <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 4 }}>
              <button onClick={() => navigator.clipboard.writeText(output)} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <Copy size={12} />
              </button>
              <button onClick={applyToEditor} style={{ background: 'var(--accent)', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', color: 'white', fontSize: 10 }}>
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
