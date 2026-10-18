// ============================================================
// Editron — Regex Tester Tool
// ============================================================

import React, { useState, useMemo } from 'react';
import { Copy } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

interface Match {
  match: string;
  index: number;
  groups: Record<string, string> | null;
}

export const RegexTool: React.FC = () => {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');
  const [error, setError] = useState('');
  const { addToast } = useUIStore();

  const { matches, highlighted } = useMemo(() => {
    if (!pattern || !testString) return { matches: [], highlighted: '' };

    try {
      setError('');
      const regex = new RegExp(pattern, flags);
      const found: Match[] = [];
      let m: RegExpExecArray | null;

      if (flags.includes('g')) {
        while ((m = regex.exec(testString)) !== null) {
          found.push({
            match: m[0],
            index: m.index,
            groups: m.groups ? { ...m.groups } : null,
          });
          if (!flags.includes('g')) break;
        }
      } else {
        m = regex.exec(testString);
        if (m) {
          found.push({ match: m[0], index: m.index, groups: m.groups ? { ...m.groups } : null });
        }
      }

      // Highlight matches in test string
      let result = '';
      let lastIndex = 0;
      found.forEach(({ match, index }) => {
        result += escapeHtml(testString.slice(lastIndex, index));
        result += `<mark class="regex-match">${escapeHtml(match)}</mark>`;
        lastIndex = index + match.length;
      });
      result += escapeHtml(testString.slice(lastIndex));

      return { matches: found, highlighted: result };
    } catch (e: unknown) {
      setError((e as Error).message);
      return { matches: [], highlighted: '' };
    }
  }, [pattern, flags, testString]);

  const toggleFlag = (f: string) => {
    setFlags((prev) => prev.includes(f) ? prev.replace(f, '') : prev + f);
  };

  return (
    <div className="tool-body">
      {/* Pattern input */}
      <label className="tool-label">Regular Expression</label>
      <div className="regex-input-row">
        <span className="regex-delimiter">/</span>
        <input
          className="tool-input regex-pattern-input"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="pattern"
          spellCheck={false}
        />
        <span className="regex-delimiter">/</span>
        <div className="regex-flags">
          {['g', 'i', 'm', 's'].map((f) => (
            <button
              key={f}
              className={`regex-flag-btn ${flags.includes(f) ? 'active' : ''}`}
              onClick={() => toggleFlag(f)}
              title={f === 'g' ? 'global' : f === 'i' ? 'insensitive' : f === 'm' ? 'multiline' : 'dotAll'}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="tool-error">{error}</div>}

      {/* Test string */}
      <label className="tool-label">Test String</label>
      <textarea
        className="tool-textarea"
        value={testString}
        onChange={(e) => setTestString(e.target.value)}
        placeholder="Enter text to test against..."
        rows={5}
      />

      {/* Highlighted matches */}
      {highlighted && (
        <>
          <label className="tool-label">
            Matches
            <span className="tool-label-count">{matches.length}</span>
          </label>
          <div
            className="regex-highlighted"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </>
      )}

      {/* Match details */}
      {matches.length > 0 && (
        <div className="regex-matches-list">
          {matches.map((m, i) => (
            <div key={i} className="regex-match-item">
              <div className="regex-match-header">
                <span className="regex-match-number">Match {i + 1}</span>
                <span className="regex-match-index">@ index {m.index}</span>
                <button
                  className="tool-copy-btn-sm"
                  onClick={() => { navigator.clipboard.writeText(m.match); addToast('Copied!', 'success'); }}
                >
                  <Copy size={12} />
                </button>
              </div>
              <code className="regex-match-value">{m.match}</code>
              {m.groups && Object.keys(m.groups).length > 0 && (
                <div className="regex-groups">
                  {Object.entries(m.groups).map(([k, v]) => (
                    <div key={k} className="regex-group">
                      <span className="regex-group-name">{k}</span>
                      <span className="regex-group-value">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
