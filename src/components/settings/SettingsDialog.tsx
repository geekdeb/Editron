// ============================================================
// Editron — Settings Dialog
// ============================================================

import React, { useState } from 'react';
import { X, Palette, Type, FileText, Keyboard, Save } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

type SettingsTab = 'appearance' | 'editor' | 'files' | 'keybindings';

export const SettingsDialog: React.FC = () => {
  const { setShowSettings, theme, setTheme, wordWrap, toggleWordWrap, lineNumbers, toggleLineNumbers } = useUIStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [fontSize, setFontSize] = useState(14);
  const [tabSize, setTabSize] = useState(4);
  const [fontFamily, setFontFamily] = useState('JetBrains Mono');
  const [autoSave, setAutoSave] = useState(true);
  const [defaultFolder, setDefaultFolder] = useState('');

  const tabs: Array<{ id: SettingsTab; label: string; icon: React.ReactNode }> = [
    { id: 'appearance', label: 'Appearance', icon: <Palette size={14} /> },
    { id: 'editor', label: 'Editor', icon: <Type size={14} /> },
    { id: 'files', label: 'Files', icon: <FileText size={14} /> },
    { id: 'keybindings', label: 'Keybindings', icon: <Keyboard size={14} /> },
  ];

  const Toggle: React.FC<{ value: boolean; onChange: () => void }> = ({ value, onChange }) => (
    <button className={`toggle ${value ? 'active' : ''}`} onClick={onChange} />
  );

  const Row: React.FC<{ label: string; description?: string; children: React.ReactNode }> = ({ label, description, children }) => (
    <div className="settings-row">
      <div>
        <div className="settings-label">{label}</div>
        {description && <div className="settings-description">{description}</div>}
      </div>
      {children}
    </div>
  );

  const shortcuts = [
    { action: 'New File', key: 'Ctrl+N' },
    { action: 'Open File', key: 'Ctrl+O' },
    { action: 'Save', key: 'Ctrl+S' },
    { action: 'Find', key: 'Ctrl+F' },
    { action: 'Replace', key: 'Ctrl+H' },
    { action: 'Command Palette', key: 'Ctrl+Shift+P' },
    { action: 'Toggle Sidebar', key: 'Ctrl+B' },
    { action: 'Toggle Tools', key: 'Ctrl+Shift+T' },
    { action: 'Markdown Preview', key: 'Ctrl+Shift+V' },
    { action: 'Zen Mode', key: 'Ctrl+K Z' },
    { action: 'Word Wrap', key: 'Alt+Z' },
    { action: 'Duplicate Line', key: 'Ctrl+Shift+D' },
    { action: 'Toggle Comment', key: 'Ctrl+/' },
    { action: 'Close Tab', key: 'Ctrl+W' },
    { action: 'Next Tab', key: 'Ctrl+Tab' },
  ];

  return (
    <div className="dialog-overlay" onClick={() => setShowSettings(false)}>
      <div className="dialog" style={{ width: 680 }} onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <span className="dialog-title">⚙ Settings</span>
          <button className="dialog-close" onClick={() => setShowSettings(false)}><X size={16} /></button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Tab nav */}
          <div style={{
            width: 160, padding: '12px 8px', borderRight: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0,
          }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                  background: activeTab === t.id ? 'var(--accent-muted)' : 'none',
                  color: activeTab === t.id ? 'var(--accent)' : 'var(--text-secondary)',
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: 13, textAlign: 'left', fontWeight: activeTab === t.id ? 500 : 400,
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => { if (activeTab !== t.id) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={(e) => { if (activeTab !== t.id) e.currentTarget.style.background = 'none'; }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="dialog-body" style={{ flex: 1 }}>
            {activeTab === 'appearance' && (
              <div>
                <div className="settings-group">
                  <div className="settings-group-title">Theme</div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {(['obsidian-dark', 'frost-light'] as const).map((t) => (
                      <div
                        key={t}
                        onClick={() => setTheme(t)}
                        style={{
                          width: 120, padding: 12, borderRadius: 8,
                          border: `2px solid ${theme === t ? 'var(--accent)' : 'var(--border)'}`,
                          cursor: 'pointer', textAlign: 'center', transition: 'all 200ms',
                          background: t === 'obsidian-dark' ? '#0c121e' : '#ffffff',
                        }}
                      >
                        <div style={{ height: 40, borderRadius: 4, marginBottom: 8, background: t === 'obsidian-dark' ? 'linear-gradient(135deg,#162034,#0c121e)' : 'linear-gradient(135deg,#f5f6f8,#ffffff)', border: `1px solid ${t === 'obsidian-dark' ? '#1b273c' : '#e2e8f0'}` }} />
                        <span style={{ fontSize: 12, color: t === 'obsidian-dark' ? '#e2e8f0' : '#1f2937' }}>
                          {t === 'obsidian-dark' ? '🌙 Cyber Dark' : '☀️ Frost Light'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'editor' && (
              <div>
                <div className="settings-group">
                  <div className="settings-group-title">Typography</div>
                  <Row label="Font Family">
                    <select className="tool-select" style={{ width: 180 }} value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
                      <option>JetBrains Mono</option>
                      <option>Cascadia Code</option>
                      <option>Fira Code</option>
                      <option>Consolas</option>
                      <option>Courier New</option>
                    </select>
                  </Row>
                  <Row label="Font Size">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="range" min={10} max={24} value={fontSize} onChange={(e) => setFontSize(+e.target.value)} style={{ width: 80, accentColor: 'var(--accent)' }} />
                      <span style={{ fontSize: 12, minWidth: 30 }}>{fontSize}px</span>
                    </div>
                  </Row>
                  <Row label="Tab Size">
                    <select className="tool-select" style={{ width: 80 }} value={tabSize} onChange={(e) => setTabSize(+e.target.value)}>
                      <option value={2}>2</option>
                      <option value={4}>4</option>
                      <option value={8}>8</option>
                    </select>
                  </Row>
                </div>
                <div className="settings-group">
                  <div className="settings-group-title">Display</div>
                  <Row label="Word Wrap" description="Wrap long lines to fit the viewport">
                    <Toggle value={wordWrap} onChange={toggleWordWrap} />
                  </Row>
                  <Row label="Line Numbers">
                    <Toggle value={lineNumbers} onChange={toggleLineNumbers} />
                  </Row>
                </div>
              </div>
            )}

            {activeTab === 'files' && (
              <div>
                <div className="settings-group">
                  <div className="settings-group-title">Saving</div>
                  <Row label="Auto Save" description="Automatically save open files">
                    <Toggle value={autoSave} onChange={() => setAutoSave(!autoSave)} />
                  </Row>
                  <Row label="Default Save Folder">
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input
                        className="tool-input"
                        style={{ width: 180 }}
                        placeholder="%UserProfile%\Documents"
                        value={defaultFolder}
                        onChange={(e) => setDefaultFolder(e.target.value)}
                      />
                    </div>
                  </Row>
                </div>
                <div className="settings-group">
                  <div className="settings-group-title">Encoding</div>
                  <Row label="Default Encoding">
                    <select className="tool-select" style={{ width: 140 }}>
                      <option>UTF-8</option>
                      <option>UTF-8 BOM</option>
                      <option>UTF-16 LE</option>
                      <option>Windows-1252</option>
                    </select>
                  </Row>
                  <Row label="Default Line Ending">
                    <select className="tool-select" style={{ width: 100 }}>
                      <option>LF (Unix)</option>
                      <option>CRLF (Windows)</option>
                    </select>
                  </Row>
                </div>
              </div>
            )}

            {activeTab === 'keybindings' && (
              <div>
                <div className="settings-group-title" style={{ marginBottom: 12 }}>Keyboard Shortcuts</div>
                <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11 }}>Action</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11 }}>Shortcut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shortcuts.map((s) => (
                      <tr key={s.action} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '6px 8px', color: 'var(--text-primary)' }}>{s.action}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                          <kbd style={{ fontFamily: 'var(--font-mono)', fontSize: 11, background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px', color: 'var(--text-primary)' }}>
                            {s.key}
                          </kbd>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
          <button className="tool-btn" onClick={() => setShowSettings(false)}>Cancel</button>
          <button className="tool-btn primary" onClick={() => setShowSettings(false)}>
            <Save size={13} /> Save
          </button>
        </div>
      </div>
    </div>
  );
};
