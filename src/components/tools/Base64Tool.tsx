// ============================================================
// Editron — Base64 Tool
// ============================================================

import React, { useState } from 'react';
import { base64Encode, base64Decode } from '../../services/encoderService';
import { Copy, ArrowDownUp } from 'lucide-react';

export const Base64Tool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState('');

  const run = () => {
    setError('');
    try {
      const result = mode === 'encode' ? base64Encode(input) : base64Decode(input);
      setOutput(result);
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  };

  const swap = () => {
    setInput(output);
    setOutput('');
    setMode(mode === 'encode' ? 'decode' : 'encode');
  };

  const copy = () => { navigator.clipboard.writeText(output); };

  return (
    <div className="tool-section">
      <div className="tool-section-title">Base64</div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <button
          className={`tool-btn ${mode === 'encode' ? 'primary' : ''}`}
          onClick={() => setMode('encode')}
          style={{ flex: 1 }}
        >Encode</button>
        <button
          className={`tool-btn ${mode === 'decode' ? 'primary' : ''}`}
          onClick={() => setMode('decode')}
          style={{ flex: 1 }}
        >Decode</button>
      </div>

      <label className="tool-label">Input</label>
      <textarea
        className="tool-textarea"
        placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={4}
      />

      <div className="tool-btn-row">
        <button className="tool-btn primary" onClick={run} style={{ flex: 1 }}>
          {mode === 'encode' ? 'Encode →' : '← Decode'}
        </button>
        <button className="tool-btn" onClick={swap} title="Swap & flip mode">
          <ArrowDownUp size={13} />
        </button>
      </div>

      {error && (
        <div style={{ color: 'var(--error)', fontSize: 12, padding: '4px 0' }}>⚠ {error}</div>
      )}

      {output && (
        <>
          <label className="tool-label">Output</label>
          <div style={{ position: 'relative' }}>
            <div className="tool-result">{output}</div>
            <button
              onClick={copy}
              style={{
                position: 'absolute', top: 6, right: 6, background: 'var(--bg-elevated)',
                border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px',
                cursor: 'pointer', color: 'var(--text-secondary)',
              }}
              title="Copy"
            >
              <Copy size={12} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
