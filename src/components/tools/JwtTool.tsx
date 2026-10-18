// ============================================================
// Editron — JWT Tool
// ============================================================

import React, { useState } from 'react';
import { jwtDecode, type JWTDecoded } from '../../services/encoderService';
import { Copy, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export const JwtTool: React.FC = () => {
  const [token, setToken] = useState('');
  const [decoded, setDecoded] = useState<JWTDecoded | null>(null);
  const [error, setError] = useState('');

  const decode = () => {
    setError('');
    setDecoded(null);
    try {
      setDecoded(jwtDecode(token));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString();
  };

  const renderJson = (obj: Record<string, unknown>, colorClass: string) => (
    <pre className="tool-result" style={{ color: `var(--${colorClass})`, fontSize: 11, maxHeight: 120 }}>
      {JSON.stringify(obj, null, 2)}
    </pre>
  );

  // Tokenize display: header.payload.signature with different colors
  const renderColoredToken = () => {
    if (!token.trim()) return null;
    const parts = token.trim().split('.');
    if (parts.length !== 3) return null;
    return (
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, wordBreak: 'break-all', padding: '8px 10px', background: 'var(--bg-tertiary)', borderRadius: 6, border: '1px solid var(--border)' }}>
        <span style={{ color: 'var(--error)' }}>{parts[0]}</span>
        <span style={{ color: 'var(--text-muted)' }}>.</span>
        <span style={{ color: 'var(--accent)' }}>{parts[1]}</span>
        <span style={{ color: 'var(--text-muted)' }}>.</span>
        <span style={{ color: 'var(--success)' }}>{parts[2]}</span>
      </div>
    );
  };

  return (
    <div className="tool-section">
      <div className="tool-section-title">JWT Decoder</div>

      <label className="tool-label">JWT Token</label>
      <textarea
        className="tool-textarea"
        placeholder="Paste your JWT token here..."
        value={token}
        onChange={(e) => setToken(e.target.value)}
        rows={4}
        style={{ fontSize: 11 }}
      />

      <div className="tool-btn-row">
        <button className="tool-btn primary" onClick={decode} style={{ flex: 1 }}>
          Decode
        </button>
        <button className="tool-btn" onClick={() => { setToken(''); setDecoded(null); setError(''); }}>
          Clear
        </button>
        <button
          className="tool-btn"
          onClick={() => navigator.clipboard.readText().then(setToken)}
          title="Paste from clipboard"
        >
          Paste
        </button>
      </div>

      {error && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--error)', fontSize: 12, padding: '4px 0' }}>
          <AlertTriangle size={13} /> {error}
        </div>
      )}

      {decoded && (
        <div>
          {/* Status */}
          <div style={{
            display: 'flex', gap: 8, alignItems: 'center', padding: '6px 10px',
            borderRadius: 6, marginBottom: 10,
            background: decoded.isExpired ? 'var(--error-muted)' : 'var(--success-muted)',
            border: `1px solid ${decoded.isExpired ? 'var(--error)' : 'var(--success)'}`,
          }}>
            {decoded.isExpired
              ? <AlertTriangle size={13} style={{ color: 'var(--error)' }} />
              : <CheckCircle size={13} style={{ color: 'var(--success)' }} />
            }
            <span style={{ fontSize: 12, color: decoded.isExpired ? 'var(--error)' : 'var(--success)' }}>
              {decoded.isExpired ? 'Token Expired' : 'Token Valid'}
            </span>
            {decoded.expiresAt && (
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={11} /> {formatDate(decoded.expiresAt)}
              </span>
            )}
          </div>

          {/* Colored token */}
          {renderColoredToken()}

          {/* Header */}
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--error)', marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
              <span>HEADER</span>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                onClick={() => navigator.clipboard.writeText(JSON.stringify(decoded.header, null, 2))}>
                <Copy size={11} />
              </button>
            </div>
            {renderJson(decoded.header, 'error')}
          </div>

          {/* Payload */}
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
              <span>PAYLOAD</span>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                onClick={() => navigator.clipboard.writeText(JSON.stringify(decoded.payload, null, 2))}>
                <Copy size={11} />
              </button>
            </div>
            {renderJson(decoded.payload, 'accent')}
          </div>

          {/* Signature */}
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--success)', marginBottom: 4 }}>SIGNATURE</div>
            <div className="tool-result" style={{ color: 'var(--success)', fontSize: 11, wordBreak: 'break-all' }}>
              {decoded.signature}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
