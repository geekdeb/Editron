// ============================================================
// Editron — URL Encode/Decode Tool
// ============================================================

import React, { useState } from 'react';
import { urlEncode, urlDecode, htmlEncode, htmlDecode, unicodeEscape, unicodeUnescape } from '../../services/encoderService';
import { Copy, ArrowDownUp } from 'lucide-react';

type SubTool = 'url' | 'html' | 'unicode';

export const UrlTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [subTool, setSubTool] = useState<SubTool>('url');
  const [error, setError] = useState('');

  const run = () => {
    setError('');
    try {
      let result = '';
      if (subTool === 'url') result = mode === 'encode' ? urlEncode(input) : urlDecode(input);
      else if (subTool === 'html') result = mode === 'encode' ? htmlEncode(input) : htmlDecode(input);
      else result = mode === 'encode' ? unicodeEscape(input) : unicodeUnescape(input);
      setOutput(result);
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  };

  return (
    <div className="tool-section">
      <div className="tool-section-title">Text Encoder</div>

      {/* Sub-tool tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {(['url', 'html', 'unicode'] as SubTool[]).map((t) => (
          <button
            key={t}
            className={`tool-btn ${subTool === t ? 'primary' : ''}`}
            onClick={() => { setSubTool(t); setOutput(''); }}
            style={{ flex: 1, textTransform: 'uppercase', fontSize: 10 }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Mode */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <button className={`tool-btn ${mode === 'encode' ? 'primary' : ''}`} onClick={() => setMode('encode')} style={{ flex: 1 }}>
          Encode
        </button>
        <button className={`tool-btn ${mode === 'decode' ? 'primary' : ''}`} onClick={() => setMode('decode')} style={{ flex: 1 }}>
          Decode
        </button>
      </div>

      <label className="tool-label">Input</label>
      <textarea className="tool-textarea" placeholder="Enter text..." value={input} onChange={(e) => setInput(e.target.value)} rows={3} />

      <div className="tool-btn-row">
        <button className="tool-btn primary" onClick={run} style={{ flex: 1 }}>
          {mode === 'encode' ? 'Encode →' : '← Decode'}
        </button>
        <button className="tool-btn" onClick={() => { setInput(output); setOutput(''); setMode(m => m === 'encode' ? 'decode' : 'encode'); }} title="Swap">
          <ArrowDownUp size={13} />
        </button>
      </div>

      {error && <div style={{ color: 'var(--error)', fontSize: 12 }}>⚠ {error}</div>}

      {output && (
        <>
          <label className="tool-label">Output</label>
          <div style={{ position: 'relative' }}>
            <div className="tool-result">{output}</div>
            <button onClick={() => navigator.clipboard.writeText(output)}
              style={{ position: 'absolute', top: 6, right: 6, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <Copy size={12} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
