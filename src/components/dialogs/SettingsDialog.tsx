// ============================================================
// Editron — Settings Dialog
// ============================================================

import React from 'react';
import { X, Monitor, Type, Eye, Keyboard, Palette } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

interface SettingRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

const SettingRow: React.FC<SettingRowProps> = ({ label, description, children }) => (
  <div className="setting-row">
    <div className="setting-info">
      <span className="setting-label">{label}</span>
      {description && <span className="setting-desc">{description}</span>}
    </div>
    <div className="setting-control">{children}</div>
  </div>
);

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  id: string;
}

const Toggle: React.FC<ToggleProps> = ({ checked, onChange, id }) => (
  <label className="toggle" htmlFor={id}>
    <input type="checkbox" id={id} checked={checked} onChange={onChange} />
    <span className="toggle-track">
      <span className="toggle-thumb" />
    </span>
  </label>
);

export const SettingsDialog: React.FC = () => {
  const {
    setShowSettings, theme, setTheme,
    wordWrap, toggleWordWrap,
    lineNumbers, toggleLineNumbers,
    minimap, toggleMinimap,
    zenMode, toggleZenMode,
  } = useUIStore();

  const close = () => setShowSettings(false);

  return (
    <div className="dialog-overlay" onClick={close}>
      <div className="settings-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="settings-header">
          <h2 className="settings-title">Settings</h2>
          <button className="settings-close" onClick={close}>
            <X size={18} />
          </button>
        </div>

        <div className="settings-body">
          {/* Appearance */}
          <section className="settings-section">
            <div className="settings-section-header">
              <Palette size={16} />
              <h3>Appearance</h3>
            </div>

            <SettingRow label="Theme" description="Choose editor color scheme">
              <div className="theme-selector">
                <button
                  className={`theme-btn ${theme === 'obsidian-dark' ? 'active' : ''}`}
                  onClick={() => setTheme('obsidian-dark')}
                >
                  🌙 Obsidian Dark
                </button>
                <button
                  className={`theme-btn ${theme === 'frost-light' ? 'active' : ''}`}
                  onClick={() => setTheme('frost-light')}
                >
                  ☀️ Frost Light
                </button>
              </div>
            </SettingRow>
          </section>

          {/* Editor */}
          <section className="settings-section">
            <div className="settings-section-header">
              <Type size={16} />
              <h3>Editor</h3>
            </div>

            <SettingRow
              label="Word Wrap"
              description="Wrap long lines at the editor boundary"
            >
              <Toggle
                id="setting-wordwrap"
                checked={wordWrap}
                onChange={toggleWordWrap}
              />
            </SettingRow>

            <SettingRow
              label="Line Numbers"
              description="Show line numbers in the gutter"
            >
              <Toggle
                id="setting-linenumbers"
                checked={lineNumbers}
                onChange={toggleLineNumbers}
              />
            </SettingRow>

            <SettingRow
              label="Minimap"
              description="Show code overview minimap (visual indicator)"
            >
              <Toggle
                id="setting-minimap"
                checked={minimap}
                onChange={toggleMinimap}
              />
            </SettingRow>
          </section>

          {/* View */}
          <section className="settings-section">
            <div className="settings-section-header">
              <Eye size={16} />
              <h3>View</h3>
            </div>

            <SettingRow
              label="Zen Mode"
              description="Hide UI chrome for distraction-free editing"
            >
              <Toggle
                id="setting-zen"
                checked={zenMode}
                onChange={toggleZenMode}
              />
            </SettingRow>
          </section>

          {/* Keyboard Shortcuts Reference */}
          <section className="settings-section">
            <div className="settings-section-header">
              <Keyboard size={16} />
              <h3>Keyboard Shortcuts</h3>
            </div>

            <div className="shortcuts-grid">
              {[
                ['New File', 'Ctrl+N'],
                ['Open File', 'Ctrl+O'],
                ['Save File', 'Ctrl+S'],
                ['Command Palette', 'Ctrl+Shift+P'],
                ['Toggle Sidebar', 'Ctrl+B'],
                ['Toggle Tools', 'Ctrl+Shift+T'],
                ['Word Wrap', 'Alt+Z'],
                ['Zen Mode', 'Ctrl+Shift+Z'],
                ['Close Tab', 'Ctrl+W'],
                ['Settings', 'Ctrl+,'],
              ].map(([label, shortcut]) => (
                <div key={label} className="shortcut-row">
                  <span className="shortcut-label">{label}</span>
                  <kbd className="shortcut-key">{shortcut}</kbd>
                </div>
              ))}
            </div>
          </section>

          {/* About */}
          <section className="settings-section">
            <div className="settings-section-header">
              <Monitor size={16} />
              <h3>About Editron</h3>
            </div>
            <div className="about-info">
              <p>⚡ Editron v1.0.0</p>
              <p>A lightning-fast, feature-rich text editor for developers.</p>
              <p>Built with React, CodeMirror 6, Tauri, and Zustand.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
