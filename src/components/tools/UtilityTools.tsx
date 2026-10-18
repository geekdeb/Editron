// ============================================================
// Editron — Timestamp Converter & Unicode Inspector Tools
// ============================================================

import React, { useState } from 'react';
import { inspectCharacter } from '../../services/encoderService';
import { RefreshCw } from 'lucide-react';

// ── Timestamp Converter ───────────────────────────────────────
export const TimestampTool: React.FC = () => {
  const [unix, setUnix] = useState('');
  const [datetime, setDatetime] = useState('');
  const [converted, setConverted] = useState<{ unix?: number; iso?: string; local?: string; utc?: string } | null>(null);

  const fromUnix = () => {
    const n = parseInt(unix);
    if (isNaN(n)) return;
    const d = new Date(n * 1000);
    setConverted({
      unix: n,
      iso: d.toISOString(),
      local: d.toLocaleString(),
      utc: d.toUTCString(),
    });
  };

  const fromDatetime = () => {
    const d = new Date(datetime);
    if (isNaN(d.getTime())) return;
    setConverted({
      unix: Math.floor(d.getTime() / 1000),
      iso: d.toISOString(),
      local: d.toLocaleString(),
      utc: d.toUTCString(),
    });
  };

  const now = () => {
    const d = new Date();
    const u = Math.floor(d.getTime() / 1000);
    setUnix(u.toString());
    setConverted({
      unix: u,
      iso: d.toISOString(),
      local: d.toLocaleString(),
      utc: d.toUTCString(),
    });
  };

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 8 }}>
      <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</span>
      <div style={{ display: 'flex', gap: 4 }}>
        <code className="tool-result" style={{ flex: 1, fontSize: 11, cursor: 'pointer' }}
          onClick={() => navigator.clipboard.writeText(value)}>
          {value}
        </code>
      </div>
    </div>
  );

  return (
    <div className="tool-section">
      <div className="tool-section-title">Timestamp Converter</div>

      <label className="tool-label">Unix Timestamp (seconds)</label>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <input className="tool-input" style={{ flex: 1 }} placeholder="1700000000" value={unix} onChange={(e) => setUnix(e.target.value)} />
        <button className="tool-btn primary" onClick={fromUnix}>→</button>
      </div>

      <label className="tool-label">Date / Time String</label>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <input className="tool-input" style={{ flex: 1 }} type="datetime-local" value={datetime} onChange={(e) => setDatetime(e.target.value)} />
        <button className="tool-btn primary" onClick={fromDatetime}>→</button>
      </div>

      <button className="tool-btn" onClick={now} style={{ width: '100%', marginBottom: 10 }}>
        <RefreshCw size={12} /> Use Current Time
      </button>

      {converted && (
        <div>
          {converted.unix !== undefined && <Row label="Unix (seconds)" value={String(converted.unix)} />}
          {converted.iso && <Row label="ISO 8601" value={converted.iso} />}
          {converted.utc && <Row label="UTC" value={converted.utc} />}
          {converted.local && <Row label="Local" value={converted.local} />}
        </div>
      )}
    </div>
  );
};

// ── Unicode Inspector ─────────────────────────────────────────
export const UnicodeTool: React.FC = () => {
  const [text, setText] = useState('');

  const chars = text ? Array.from(text).map((c) => inspectCharacter(c)) : [];

  return (
    <div className="tool-section">
      <div className="tool-section-title">Unicode Inspector</div>

      <label className="tool-label">Input Text</label>
      <input
        className="tool-input"
        style={{ fontSize: 20, padding: '8px 10px', marginBottom: 8, letterSpacing: '4px' }}
        placeholder="Type characters..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {chars.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
          {chars.map((info, i) => (
            <div key={i} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '6px 8px', background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)', borderRadius: 6, cursor: 'default',
              minWidth: 50,
            }}
              title={`${info.hex} — ${info.block}\nUTF-8: ${info.utf8Bytes} byte${info.utf8Bytes > 1 ? 's' : ''}`}>
              <span style={{ fontSize: 20 }}>{info.char}</span>
              <span style={{ fontSize: 9, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{info.hex}</span>
              <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{info.utf8Bytes}B</span>
            </div>
          ))}
        </div>
      )}

      {chars.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>DETAILS</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: 12 }}>
            {chars.slice(0, 10).map((info, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, padding: '3px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', minWidth: 60 }}>{info.hex}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{info.block}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common Unicode blocks reference */}
      <div style={{ marginTop: 12, padding: 8, background: 'var(--bg-tertiary)', borderRadius: 6 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Quick Insert</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {['✓', '✗', '→', '←', '↑', '↓', '«', '»', '•', '…', '©', '®', '™', '°', '±', '×', '÷', '∞', 'π', '√', '∑', '∆', '♠', '♥', '♦', '♣'].map((c) => (
            <button key={c} onClick={() => setText(text + c)}
              style={{ padding: '4px 6px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer', fontSize: 14, color: 'var(--text-primary)' }}>
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
