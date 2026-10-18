// ============================================================
// Editron — Help & Documentation Dialog
// ============================================================

import React, { useState } from 'react';
import { X, HelpCircle, Keyboard, Wrench, Settings, BookOpen } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

export const HelpDialog: React.FC = () => {
  const { showHelp, setShowHelp, setShowSettings } = useUIStore();
  const [activeTab, setActiveTab] = useState<'shortcuts' | 'tools' | 'about'>('shortcuts');

  if (!showHelp) return null;

  const shortcutsList = [
    { cat: 'File & Buffers', items: [
      { key: 'Ctrl + N', desc: 'Create a new untitled buffer' },
      { key: 'Ctrl + O', desc: 'Open one or more files from disk' },
      { key: 'Ctrl + S', desc: 'Save active file (defaults to datafiles folder)' },
      { key: 'Ctrl + Shift + S', desc: 'Save As with new filename or location' },
      { key: 'Ctrl + W', desc: 'Close active tab' },
    ]},
    { cat: 'View & Navigation', items: [
      { key: 'Ctrl + B', desc: 'Toggle File Explorer sidebar' },
      { key: 'Ctrl + Shift + T', desc: 'Toggle Developer Tools panel' },
      { key: 'Ctrl + Shift + V', desc: 'Toggle live Markdown split-preview' },
      { key: 'Ctrl + Shift + P', desc: 'Open Command Palette' },
      { key: 'Alt + Z', desc: 'Toggle Word Wrap on/off' },
      { key: 'Ctrl + K Z / F11', desc: 'Toggle Zen distraction-free mode' },
    ]},
    { cat: 'Editing & Search', items: [
      { key: 'Ctrl + F', desc: 'Find in current document' },
      { key: 'Ctrl + H', desc: 'Find & Replace in current document' },
      { key: 'Ctrl + /', desc: 'Toggle line comment' },
      { key: 'Ctrl + Shift + D', desc: 'Duplicate current line' },
      { key: 'Ctrl + ,', desc: 'Open Settings & Preferences' },
      { key: 'F1', desc: 'Open Help & Shortcuts' },
    ]},
  ];

  const toolsList = [
    { name: 'JSON / XML / YAML Formatters', desc: 'Prettify, validate, or minify structured data in one click with customizable indentation.' },
    { name: 'Base64 & URL Encoder/Decoder', desc: 'Easily encode or decode ASCII, UTF-8 strings, and URL query strings.' },
    { name: 'JWT Token Inspector', desc: 'Inspect header and payload claims, check expiration status, and analyze tokens offline.' },
    { name: 'Cryptographic Hashes', desc: 'Calculate MD5, SHA-1, SHA-256, and SHA-512 hashes instantly.' },
    { name: 'RegEx Tester', desc: 'Test regular expressions in real-time with capture groups and interactive match highlights.' },
    { name: 'Timestamp Converter', desc: 'Convert UNIX timestamps to human dates and ISO-8601 strings in both directions.' },
    { name: 'Unicode Inspector', desc: 'Inspect codepoints, byte counts, and character categories.' },
  ];

  return (
    <div className="dialog-overlay" onClick={() => setShowHelp(false)}>
      <div 
        className="dialog" 
        style={{ width: 680, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="dialog-header">
          <span className="dialog-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <HelpCircle size={16} color="var(--neon-cyan)" /> Editron Help & Quick Guide
          </span>
          <button className="dialog-close" onClick={() => setShowHelp(false)}>
            <X size={16} />
          </button>
        </div>

        {/* Tabs Bar */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
          padding: '0 16px',
          gap: 16,
        }}>
          <button
            onClick={() => setActiveTab('shortcuts')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 4px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'shortcuts' ? '2px solid var(--neon-cyan)' : '2px solid transparent',
              color: activeTab === 'shortcuts' ? 'var(--text-bright)' : 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: activeTab === 'shortcuts' ? 600 : 400,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <Keyboard size={14} /> Keyboard Shortcuts
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 4px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'tools' ? '2px solid var(--neon-cyan)' : '2px solid transparent',
              color: activeTab === 'tools' ? 'var(--text-bright)' : 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: activeTab === 'tools' ? 600 : 400,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <Wrench size={14} /> Developer Tools
          </button>

          <button
            onClick={() => setActiveTab('about')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 4px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'about' ? '2px solid var(--neon-cyan)' : '2px solid transparent',
              color: activeTab === 'about' ? 'var(--text-bright)' : 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: activeTab === 'about' ? 600 : 400,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <BookOpen size={14} /> File Storage & Tips
          </button>
        </div>

        {/* Body */}
        <div className="dialog-body" style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {activeTab === 'shortcuts' && (
            <div>
              {shortcutsList.map((category) => (
                <div key={category.cat} style={{ marginBottom: 18 }}>
                  <div style={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                    fontWeight: 700,
                    color: 'var(--neon-cyan)',
                    marginBottom: 8,
                  }}>
                    {category.cat}
                  </div>
                  <div style={{
                    background: 'var(--bg-tertiary)',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                  }}>
                    {category.items.map((item, idx) => (
                      <div
                        key={item.key}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '7px 12px',
                          borderBottom: idx === category.items.length - 1 ? 'none' : '1px solid var(--border-subtle)',
                          fontSize: 12,
                        }}
                      >
                        <span style={{ color: 'var(--text-secondary)' }}>{item.desc}</span>
                        <kbd style={{
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border)',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontFamily: 'var(--font-mono)',
                          fontSize: 11,
                          color: 'var(--text-primary)',
                          fontWeight: 500,
                        }}>
                          {item.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tools' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {toolsList.map((tool) => (
                <div
                  key={tool.name}
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    padding: '12px 14px',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--neon-cyan)', marginBottom: 4 }}>
                    {tool.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {tool.desc}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'about' && (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <div style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '14px 16px',
                marginBottom: 16,
              }}>
                <h4 style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontSize: 14 }}>
                  📁 Default Save Location
                </h4>
                <p style={{ margin: 0 }}>
                  By default, all newly created files and buffers are saved directly into the <strong style={{ color: 'var(--neon-cyan)' }}>datafiles</strong> folder inside your user's <strong style={{ color: 'var(--neon-cyan)' }}>Editron</strong> directory (<code>Documents\Editron\datafiles</code>).
                </p>
                <p style={{ marginTop: 8, marginBottom: 0 }}>
                  You can change this anytime from <strong>Settings → Files → Default Save Folder</strong> or click the <strong>Browse</strong> button to pick any directory on your computer.
                </p>
              </div>

              <div style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '14px 16px',
              }}>
                <h4 style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontSize: 14 }}>
                  ⚡ Quick Productivity Tips
                </h4>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  <li>Drag and drop any file or folder directly into the Editron window to open it.</li>
                  <li>Press <strong>Ctrl+Shift+P</strong> to access the Command Palette and run any command or tool instantly.</li>
                  <li>Editron stores your settings and recent files locally so your preferences are always preserved.</li>
                </ul>
              </div>
            </div>
          )}
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
            onClick={() => {
              setShowHelp(false);
              setShowSettings(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
          >
            <Settings size={13} /> Open Settings
          </button>
          <button
            className="tool-btn primary"
            onClick={() => setShowHelp(false)}
            style={{ padding: '6px 18px', fontSize: 12 }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
