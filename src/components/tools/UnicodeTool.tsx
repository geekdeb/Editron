// ============================================================
// Editron — Unicode Inspector Tool
// ============================================================

import React, { useState, useMemo } from 'react';
import { Copy } from 'lucide-react';
import { inspectCharacter } from '../../services/encoderService';
import { useUIStore } from '../../store/uiStore';

export const UnicodeTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [selectedChar, setSelectedChar] = useState<string>('');
  const { addToast } = useUIStore();

  const chars = useMemo(() => {
    if (!input) return [];
    return Array.from(input).map((c) => ({ char: c, info: inspectCharacter(c) }));
  }, [input]);

  const selected = useMemo(() => {
    if (!selectedChar) return null;
    try { return inspectCharacter(selectedChar); } catch { return null; }
  }, [selectedChar]);

  const copy = (val: string) => {
    navigator.clipboard.writeText(val);
    addToast('Copied!', 'success');
  };

  return (
    <div className="tool-body">
      <label className="tool-label">Text to inspect</label>
      <textarea
        className="tool-textarea"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type or paste text to inspect Unicode characters..."
        rows={4}
      />

      {chars.length > 0 && (
        <>
          <label className="tool-label">
            Characters
            <span className="tool-label-count">{chars.length}</span>
          </label>
          <div className="unicode-char-grid">
            {chars.map((item, i) => (
              <button
                key={i}
                className={`unicode-char-cell ${selectedChar === item.char && i === chars.findIndex(c => c.char === item.char) ? 'selected' : ''}`}
                onClick={() => setSelectedChar(item.char)}
                title={item.info.hex}
              >
                <span className="unicode-char-glyph">{item.char === ' ' ? '·' : item.char}</span>
                <span className="unicode-char-code">{item.info.hex.replace('U+', '')}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Detail view */}
      {selected && (
        <div className="unicode-detail">
          <div className="unicode-detail-glyph">{selectedChar}</div>
          <div className="unicode-detail-grid">
            <div className="unicode-detail-row">
              <span className="unicode-detail-label">Code Point</span>
              <span className="unicode-detail-value">{selected.hex}</span>
              <button className="tool-copy-btn-sm" onClick={() => copy(selected.hex)}><Copy size={12} /></button>
            </div>
            <div className="unicode-detail-row">
              <span className="unicode-detail-label">Decimal</span>
              <span className="unicode-detail-value">{selected.codePoint}</span>
            </div>
            <div className="unicode-detail-row">
              <span className="unicode-detail-label">UTF-8 Bytes</span>
              <span className="unicode-detail-value">{selected.utf8Bytes}</span>
            </div>
            <div className="unicode-detail-row">
              <span className="unicode-detail-label">Block</span>
              <span className="unicode-detail-value">{selected.block}</span>
            </div>
            <div className="unicode-detail-row">
              <span className="unicode-detail-label">HTML Entity</span>
              <span className="unicode-detail-value">&#123;&amp;#{selected.codePoint};&#125;</span>
              <button className="tool-copy-btn-sm" onClick={() => copy(`&#${selected.codePoint};`)}><Copy size={12} /></button>
            </div>
            <div className="unicode-detail-row">
              <span className="unicode-detail-label">CSS Escape</span>
              <span className="unicode-detail-value">\\{selected.codePoint.toString(16)}</span>
              <button className="tool-copy-btn-sm" onClick={() => copy(`\\${selected.codePoint.toString(16)}`)}><Copy size={12} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
