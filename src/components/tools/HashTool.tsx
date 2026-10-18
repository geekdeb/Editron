// ============================================================
// Editron — Hash Generator Tool
// ============================================================

import React, { useState } from 'react';
import { generateHash } from '../../services/encoderService';
import { Copy, Hash } from 'lucide-react';

const ALGORITHMS = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

export const HashTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<Record<string, string>>({});
  const [selectedAlgo, setSelectedAlgo] = useState('SHA-256');
  const [isLoading, setIsLoading] = useState(false);

  const run = async () => {
    if (!input) return;
    setIsLoading(true);
    const newResults: Record<string, string> = {};
    try {
      const hash = await generateHash(input, selectedAlgo);
      newResults[selectedAlgo] = hash;
    } catch (e) {
      newResults[selectedAlgo] = `Error: ${(e as Error).message}`;
    }
    setResults(newResults);
    setIsLoading(false);
  };

  const runAll = async () => {
    if (!input) return;
    setIsLoading(true);
    const newResults: Record<string, string> = {};
    await Promise.all(
      ALGORITHMS.map(async (algo) => {
        try {
          newResults[algo] = await generateHash(input, algo);
        } catch (e) {
          newResults[algo] = `Error: ${(e as Error).message}`;
        }
      })
    );
    setResults(newResults);
    setIsLoading(false);
  };

  return (
    <div className="tool-section">
      <div className="tool-section-title">Hash Generator</div>

      <label className="tool-label">Input Text</label>
      <textarea
        className="tool-textarea"
        placeholder="Enter text to hash..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={3}
      />

      <label className="tool-label" style={{ marginTop: 8 }}>Algorithm</label>
      <select
        className="tool-select"
        value={selectedAlgo}
        onChange={(e) => setSelectedAlgo(e.target.value)}
      >
        {ALGORITHMS.map((a) => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>

      <div className="tool-btn-row" style={{ marginTop: 8 }}>
        <button className="tool-btn primary" onClick={run} style={{ flex: 1 }} disabled={isLoading || !input}>
          {isLoading ? '...' : <><Hash size={12} /> Hash</>}
        </button>
        <button className="tool-btn" onClick={runAll} disabled={isLoading || !input} title="Generate all algorithms">
          All
        </button>
      </div>

      {Object.entries(results).length > 0 && (
        <div style={{ marginTop: 8 }}>
          {Object.entries(results).map(([algo, hash]) => (
            <div key={algo} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 3, display: 'flex', justifyContent: 'space-between' }}>
                <span>{algo}</span>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  onClick={() => navigator.clipboard.writeText(hash)}
                >
                  <Copy size={11} />
                </button>
              </div>
              <div className="tool-result" style={{ fontSize: 11, wordBreak: 'break-all', color: hash.startsWith('Error') ? 'var(--error)' : 'var(--success)' }}>
                {hash}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
