// ============================================================
// Editron — Timestamp Converter Tool
// ============================================================

import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

const FORMATS = [
  { label: 'ISO 8601', key: 'iso', fn: (d: Date) => d.toISOString() },
  { label: 'UTC String', key: 'utc', fn: (d: Date) => d.toUTCString() },
  { label: 'Local String', key: 'local', fn: (d: Date) => d.toLocaleString() },
  { label: 'Date Only', key: 'date', fn: (d: Date) => d.toLocaleDateString() },
  { label: 'Time Only', key: 'time', fn: (d: Date) => d.toLocaleTimeString() },
  { label: 'Unix (seconds)', key: 'unix', fn: (d: Date) => Math.floor(d.getTime() / 1000).toString() },
  { label: 'Unix (ms)', key: 'unix_ms', fn: (d: Date) => d.getTime().toString() },
];

export const TimestampTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [now, setNow] = useState(new Date());
  const { addToast } = useUIStore();

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const parse = (val: string) => {
    setError('');
    if (!val.trim()) { setDate(null); return; }

    // Try unix timestamp (seconds or ms)
    if (/^\d+$/.test(val.trim())) {
      const num = parseInt(val.trim(), 10);
      // Heuristic: if > 1e10, treat as ms
      const d = new Date(num > 1e10 ? num : num * 1000);
      if (isNaN(d.getTime())) { setError('Invalid timestamp'); return; }
      setDate(d);
      return;
    }

    // Try parsing as date string
    const d = new Date(val.trim());
    if (isNaN(d.getTime())) { setError('Could not parse date'); return; }
    setDate(d);
  };

  const useNow = () => {
    const n = new Date();
    setInput(n.toISOString());
    setDate(n);
    setError('');
  };

  const copy = (val: string) => {
    navigator.clipboard.writeText(val);
    addToast('Copied!', 'success');
  };

  return (
    <div className="tool-body">
      {/* Live clock */}
      <div className="timestamp-clock">
        <span className="timestamp-clock-label">Current time:</span>
        <span className="timestamp-clock-value">{now.toISOString()}</span>
        <span className="timestamp-clock-unix">{Math.floor(now.getTime() / 1000)}</span>
      </div>

      <label className="tool-label">Input (timestamp or date string)</label>
      <div className="tool-input-row">
        <input
          className="tool-input"
          value={input}
          onChange={(e) => { setInput(e.target.value); parse(e.target.value); }}
          placeholder="e.g. 1700000000 or 2024-01-15T12:00:00Z"
        />
        <button className="tool-btn-secondary" onClick={useNow} title="Use current time">
          <RefreshCw size={14} />
          Now
        </button>
      </div>

      {error && <div className="tool-error">{error}</div>}

      {date && (
        <div className="timestamp-results">
          <label className="tool-label">Conversions</label>
          {FORMATS.map((fmt) => {
            const val = fmt.fn(date);
            return (
              <div key={fmt.key} className="timestamp-row">
                <span className="timestamp-format-label">{fmt.label}</span>
                <span className="timestamp-format-value">{val}</span>
                <button
                  className="tool-copy-btn-sm"
                  onClick={() => copy(val)}
                  title="Copy"
                >
                  <Copy size={12} />
                </button>
              </div>
            );
          })}

          {/* Relative time */}
          <div className="timestamp-row">
            <span className="timestamp-format-label">Relative</span>
            <span className="timestamp-format-value">{getRelativeTime(date)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

function getRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const absDiff = Math.abs(diff);
  const future = diff < 0;

  if (absDiff < 5000) return 'just now';
  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  let str = '';
  if (years > 0) str = `${years} year${years > 1 ? 's' : ''}`;
  else if (months > 0) str = `${months} month${months > 1 ? 's' : ''}`;
  else if (days > 0) str = `${days} day${days > 1 ? 's' : ''}`;
  else if (hours > 0) str = `${hours} hour${hours > 1 ? 's' : ''}`;
  else if (minutes > 0) str = `${minutes} minute${minutes > 1 ? 's' : ''}`;
  else str = `${seconds} seconds`;

  return future ? `in ${str}` : `${str} ago`;
}
