// ============================================================
// Editron — JSON Format & Validate Tool
// ============================================================

import React, { useState } from 'react';
import { Copy, Check, AlertCircle } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

export const JsonFormatTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indentSize, setIndentSize] = useState(2);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const { addToast } = useUIStore();

  const format = (val: string, indent = indentSize) => {
    setError('');
    setIsValid(null);
    if (!val.trim()) { setOutput(''); return; }

    try {
      const parsed = JSON.parse(val);
      const formatted = JSON.stringify(parsed, null, indent);
      setOutput(formatted);
      setIsValid(true);
    } catch (e: unknown) {
      setError((e as Error).message);
      setIsValid(false);
      setOutput('');
    }
  };

  const minify = () => {
    try {
      const parsed = JSON.parse(input || output);
      setOutput(JSON.stringify(parsed));
      setIsValid(true);
      setError('');
    } catch (e: unknown) {
      setError((e as Error).message);
      setIsValid(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    addToast('Copied to clipboard!', 'success');
  };

  const handleInput = (val: string) => {
    setInput(val);
    if (val.trim()) format(val);
    else { setOutput(''); setIsValid(null); setError(''); }
  };

  return (
    <div className="tool-body">
      <div className="tool-toolbar">
        <div className="tool-mode-tabs">
          <button className="tool-mode-tab active" onClick={() => format(input)}>Format</button>
          <button className="tool-mode-tab" onClick={minify}>Minify</button>
        </div>
        <div className="tool-indent-row">
          <label className="tool-label-inline">Indent:</label>
          {[2, 4].map((n) => (
            <button
              key={n}
              className={`tool-mode-tab ${indentSize === n ? 'active' : ''}`}
              onClick={() => { setIndentSize(n); format(input, n); }}
            >
              {n}
            </button>
          ))}
          <button
            className={`tool-mode-tab ${indentSize === 0 ? 'active' : ''}`}
            onClick={() => { setIndentSize(0); format(input, 0); }}
          >
            Tab
          </button>
        </div>
      </div>

      <div className="tool-validation-row">
        {isValid === true && (
          <span className="validation-badge validation-badge--valid">
            <Check size={12} /> Valid JSON
          </span>
        )}
        {isValid === false && (
          <span className="validation-badge validation-badge--invalid">
            <AlertCircle size={12} /> Invalid JSON
          </span>
        )}
      </div>

      <label className="tool-label">Input JSON</label>
      <textarea
        className={`tool-textarea ${error ? 'tool-textarea--error' : ''}`}
        value={input}
        onChange={(e) => handleInput(e.target.value)}
        placeholder='{"key": "value"}'
        rows={6}
        spellCheck={false}
      />

      {error && <div className="tool-error">{error}</div>}

      {output && (
        <>
          <label className="tool-label">Formatted</label>
          <div className="tool-output-wrapper">
            <textarea
              className="tool-textarea tool-textarea--output"
              value={output}
              readOnly
              rows={10}
              spellCheck={false}
            />
            <button className="tool-copy-btn" onClick={copy} title="Copy">
              <Copy size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
