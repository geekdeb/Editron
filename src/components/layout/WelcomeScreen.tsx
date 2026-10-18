// ============================================================
// Editron — Welcome Screen
// ============================================================

import React from 'react';
import { Zap, FileText, FolderOpen, Settings, Command } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useUIStore } from '../../store/uiStore';

export const WelcomeScreen: React.FC = () => {
  const addTab = useEditorStore((s) => s.addTab);
  const { setShowSettings, setShowCommandPalette } = useUIStore();

  const handleOpenFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        Array.from(files).forEach((file) => {
          const reader = new FileReader();
          reader.onload = (ev) => {
            addTab({ filename: file.name, content: ev.target?.result as string || '', filepath: file.name });
          };
          reader.readAsText(file);
        });
      }
    };
    input.click();
  };

  return (
    <div className="welcome">
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 24px var(--accent-muted)',
        }}>
          <Zap size={28} color="white" />
        </div>
        <div>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-bright)', letterSpacing: '-0.5px' }}>
            Editron
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Next-Generation Text Editor
          </div>
        </div>
      </div>

      <div style={{ height: 1, width: 300, background: 'var(--border)', margin: '8px 0 20px' }} />

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: 320 }}>
        {[
          { icon: <FileText size={18} />, label: 'New File', desc: 'Start from scratch', shortcut: 'Ctrl+N', action: () => addTab({ filename: 'Untitled' }) },
          { icon: <FolderOpen size={18} />, label: 'Open File', desc: 'Browse your files', shortcut: 'Ctrl+O', action: handleOpenFile },
          { icon: <Command size={18} />, label: 'Command Palette', desc: 'Search all actions', shortcut: 'Ctrl+Shift+P', action: () => setShowCommandPalette(true) },
          { icon: <Settings size={18} />, label: 'Settings', desc: 'Customize Editron', shortcut: 'Ctrl+,', action: () => setShowSettings(true) },
        ].map((item) => (
          <button
            key={item.label}
            onClick={item.action}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4,
              padding: '12px 14px', background: 'var(--bg-secondary)',
              border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer',
              transition: 'all var(--transition-fast)', textAlign: 'left',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.background = 'var(--accent-muted)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--bg-secondary)';
            }}
          >
            <span style={{ color: 'var(--accent)' }}>{item.icon}</span>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.desc}</div>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '1px 6px', borderRadius: 4, marginTop: 2 }}>
              {item.shortcut}
            </div>
          </button>
        ))}
      </div>

      {/* Features */}
      <div style={{ marginTop: 28, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 2 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 400 }}>
          {['Markdown Preview', 'JSON/XML/YAML Format', 'Base64 & JWT', 'Regex Tester', 'Hash Generator', 'Unicode Inspector', '50+ Languages', 'Dark & Light Themes'].map((f) => (
            <span key={f} style={{ padding: '2px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', fontSize: 11 }}>
              {f}
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 11, color: 'var(--text-muted)' }}>
        Drag and drop files here to open them
      </div>
    </div>
  );
};
