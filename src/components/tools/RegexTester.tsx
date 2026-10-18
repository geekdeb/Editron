// ============================================================
// Editron — Regex Tester Tool
// ============================================================

import React, { useState, useMemo } from 'react';

export const RegexTester: React.FC = () => {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');

  const result = useMemo(() => {
    if (!pattern || !testString) return null;
    try {
      const re = new RegExp(pattern, flags);
      const matches: Array<{ match: string; index: number; groups: string[] }> = [];
      let m: RegExpExecArray | null;
      const testRe = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
      while ((m = testRe.exec(testString)) !== null) {
        matches.push({ match: m[0], index: m.index, groups: m.slice(1) });
        if (!flags.includes('g')) break;
      }
      return { valid: true, matches, count: matches.length };
    } catch (e) {
      return { valid: false, error: (e as Error).message, matches: [], count: 0 };
    }
  }, [pattern, flags, testString]);

  // Highlight matches in test string
  const highlightedHtml = useMemo(() => {
    if (!result?.valid || !result.matches.length) return testString;
    let html = '';
    let lastIndex = 0;
    result.matches.forEach(({ match, index }) => {
      html += escapeHtml(testString.slice(lastIndex, index));
      html += `<mark style="background:var(--warning-muted);color:var(--warning);border-radius:2px;padding:0 2px">${escapeHtml(match)}</mark>`;
      lastIndex = index + match.length;
    });
    html += escapeHtml(testString.slice(lastIndex));
    return html;
  }, [result, testString]);

  return (
    <div className="tool-section">
      <div className="tool-section-title">Regex Tester</div>

      <label className="tool-label">Pattern</label>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', paddingLeft: 8 }}>
          <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>/</span>
          <input
            className="tool-input"
            style={{ flex: 1, border: 'none', background: 'transparent', padding: '5px 4px' }}
            placeholder="pattern"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
          />
          <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', paddingRight: 6 }}>/</span>
        </div>
        <input
          className="tool-input"
          style={{ width: 50 }}
          placeholder="gim"
          value={flags}
          onChange={(e) => setFlags(e.target.value)}
          title="Flags: g=global, i=case-insensitive, m=multiline"
        />
      </div>

      <label className="tool-label">Test String</label>
      <textarea
        className="tool-textarea"
        placeholder="Enter text to test against..."
        value={testString}
        onChange={(e) => setTestString(e.target.value)}
        rows={4}
      />

      {result && (
        <div style={{ marginTop: 8 }}>
          {!result.valid ? (
            <div style={{ color: 'var(--error)', fontSize: 12 }}>⚠ {(result as { error?: string }).error}</div>
          ) : (
            <>
              <div style={{ fontSize: 12, marginBottom: 6, color: result.count > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                {result.count > 0 ? `✓ ${result.count} match${result.count > 1 ? 'es' : ''}` : 'No matches'}
              </div>

              {testString && (
                <div className="tool-result" style={{ fontSize: 13, lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
              )}

              {result.matches.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>MATCHES</div>
                  {result.matches.slice(0, 20).map((m, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, fontSize: 11, padding: '3px 6px', borderRadius: 4, background: i % 2 ? 'var(--bg-tertiary)' : 'transparent' }}>
                      <span style={{ color: 'var(--text-muted)', minWidth: 30 }}>#{i + 1}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--warning)', flex: 1 }}>{m.match}</span>
                      <span style={{ color: 'var(--text-muted)' }}>@{m.index}</span>
                    </div>
                  ))}
                  {result.matches.length > 20 && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', padding: '4px 6px' }}>
                      + {result.matches.length - 20} more...
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
