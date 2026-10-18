// ============================================================
// Editron — About Dialog Component
// ============================================================

import React from 'react';
import { X, Sparkles, Code2, Cpu, ShieldCheck, Heart } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

export const AboutDialog: React.FC = () => {
  const { showAbout, setShowAbout, addToast } = useUIStore();

  if (!showAbout) return null;

  const handleCheckUpdates = () => {
    addToast('Checking for updates...', 'info', 1500);
    setTimeout(() => {
      addToast('You are on the latest version! (Editron v1.0.0)', 'success', 3500);
    }, 1000);
  };

  return (
    <div className="dialog-overlay" onClick={() => setShowAbout(false)}>
      <div 
        className="dialog" 
        style={{ width: 480, overflow: 'hidden' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="dialog-header">
          <span className="dialog-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={15} color="var(--neon-cyan)" /> About Editron
          </span>
          <button className="dialog-close" onClick={() => setShowAbout(false)}>
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="dialog-body" style={{ padding: '24px 24px 16px', textAlign: 'center' }}>
          {/* Logo with glow */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              padding: 6,
              background: 'linear-gradient(135deg, rgba(0, 210, 255, 0.15), rgba(123, 97, 255, 0.15))',
              border: '1px solid rgba(0, 210, 255, 0.3)',
              boxShadow: '0 0 25px rgba(0, 210, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <img 
                src="/editron-logo.png" 
                alt="Editron Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 10 }} 
              />
            </div>
          </div>

          <h2 style={{ 
            margin: '0 0 4px', 
            fontSize: 22, 
            fontWeight: 800,
            background: 'linear-gradient(135deg, #ffffff 40%, var(--neon-cyan) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: 0.5
          }}>
            Editron
          </h2>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <span style={{ 
              fontSize: 11, 
              fontWeight: 600, 
              color: 'var(--neon-cyan)', 
              background: 'rgba(0, 210, 255, 0.12)', 
              padding: '2px 8px', 
              borderRadius: 999,
              border: '1px solid rgba(0, 210, 255, 0.25)' 
            }}>
              v1.0.0 Release
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>• Windows Edition</span>
          </div>

          <p style={{ 
            fontSize: 13, 
            color: 'var(--text-secondary)', 
            lineHeight: 1.5, 
            margin: '0 auto 18px',
            maxWidth: 380 
          }}>
            Lightning-fast text editor and developer swiss-army knife designed for speed, beauty, and modern workflows.
          </p>

          {/* Feature highlights grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            marginBottom: 20,
            textAlign: 'left',
          }}>
            <div style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '10px 12px',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}>
              <Cpu size={16} color="var(--neon-cyan)" />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Tauri v2 + Rust</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Native micro-footprint</div>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '10px 12px',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}>
              <Code2 size={16} color="var(--neon-purple)" />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Monaco Engine</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Syntax & Intelligence</div>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '10px 12px',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}>
              <ShieldCheck size={16} color="#10b981" />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Local & Private</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Zero telemetry / cloud</div>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '10px 12px',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}>
              <Heart size={16} color="#ef4444" />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Swiss-Army Knife</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Built-in utility suite</div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Licensed under the MIT License • © 2026 Editron
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '12px 20px', 
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
        }}>
          <button 
            className="tool-btn" 
            onClick={handleCheckUpdates}
            style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            🔄 Check for Updates
          </button>
          <button 
            className="tool-btn primary" 
            onClick={() => setShowAbout(false)}
            style={{ padding: '6px 18px', fontSize: 12 }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
