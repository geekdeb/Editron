// ============================================================
// Editron — Find & Replace Bar
// ============================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Replace, X, ChevronDown, ChevronUp, CaseSensitive, Regex, WholeWord } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

export const FindReplace: React.FC = () => {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [matchCount, setMatchCount] = useState<{ current: number; total: number } | null>(null);

  const findRef = useRef<HTMLInputElement>(null);
  const { setShowFindReplace } = useUIStore();

  useEffect(() => {
    findRef.current?.focus();
  }, []);

  const handleClose = useCallback(() => {
    setShowFindReplace(false);
  }, [setShowFindReplace]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [handleClose]);

  const getMatchInfo = () => {
    if (!findText || !matchCount) return null;
    return `${matchCount.current} of ${matchCount.total}`;
  };

  return (
    <div className="find-bar" style={{ flexDirection: 'column', gap: 0, padding: 0 }}>
      {/* Find Row */}
      <div className="find-bar" style={{ paddingRight: 4 }}>
        <button
          className="find-btn"
          onClick={() => setShowReplace(!showReplace)}
          title="Toggle Replace"
          style={{ marginLeft: 2 }}
        >
          {showReplace ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>

        <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />

        <input
          ref={findRef}
          className="find-input"
          placeholder="Find..."
          value={findText}
          onChange={(e) => setFindText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { /* navigate next */ }
          }}
        />

        {/* Options */}
        <button
          className={`find-btn ${caseSensitive ? 'active' : ''}`}
          onClick={() => setCaseSensitive(!caseSensitive)}
          title="Match Case (Alt+C)"
        >
          <CaseSensitive size={14} />
        </button>
        <button
          className={`find-btn ${wholeWord ? 'active' : ''}`}
          onClick={() => setWholeWord(!wholeWord)}
          title="Whole Word (Alt+W)"
        >
          <WholeWord size={14} />
        </button>
        <button
          className={`find-btn ${useRegex ? 'active' : ''}`}
          onClick={() => setUseRegex(!useRegex)}
          title="Use Regex (Alt+R)"
        >
          <Regex size={14} />
        </button>

        <span className="find-count">{getMatchInfo() || (findText ? '0 of 0' : '')}</span>

        {/* Navigate */}
        <button className="find-btn" title="Previous Match (Shift+F3)">
          <ChevronUp size={14} />
        </button>
        <button className="find-btn" title="Next Match (F3)">
          <ChevronDown size={14} />
        </button>

        <button
          className="find-btn"
          onClick={handleClose}
          title="Close (Esc)"
          style={{ marginLeft: 'auto' }}
        >
          <X size={13} />
        </button>
      </div>

      {/* Replace Row */}
      {showReplace && (
        <div className="find-bar" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ width: 26 }} />
          <Replace size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />

          <input
            className="find-input"
            placeholder="Replace..."
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
          />

          <button
            className="find-btn"
            style={{ padding: '2px 10px', width: 'auto', fontSize: '11px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
            title="Replace"
          >
            Replace
          </button>
          <button
            className="find-btn"
            style={{ padding: '2px 10px', width: 'auto', fontSize: '11px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
            title="Replace All"
          >
            All
          </button>
        </div>
      )}
    </div>
  );
};
