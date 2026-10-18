// ============================================================
// Editron — Welcome Screen Component
// ============================================================

import React from 'react';
import {
  FilePlus, FolderOpen, FileCode, FileJson,
  FileType, Terminal, Command
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useUIStore } from '../../store/uiStore';
import { openFiles } from '../../services/fileService';

interface StarterTemplate {
  label: string;
  ext: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  desc: string;
}

const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    label: 'JavaScript',
    ext: 'script.js',
    badge: 'JS',
    badgeColor: '#f7df1e',
    icon: <FileCode size={16} />,
    desc: 'ES6+ script with function demo',
  },
  {
    label: 'TypeScript',
    ext: 'types.ts',
    badge: 'TS',
    badgeColor: '#3178c6',
    icon: <FileCode size={16} />,
    desc: 'Type-safe interfaces & objects',
  },
  {
    label: 'Python',
    ext: 'main.py',
    badge: 'PY',
    badgeColor: '#3776ab',
    icon: <Terminal size={16} />,
    desc: 'Python starter with main entry',
  },
  {
    label: 'Markdown',
    ext: 'README.md',
    badge: 'MD',
    badgeColor: '#00d2ff',
    icon: <FileType size={16} />,
    desc: 'Formatted document with live preview',
  },
  {
    label: 'JSON',
    ext: 'data.json',
    badge: 'JSON',
    badgeColor: '#ff9e64',
    icon: <FileJson size={16} />,
    desc: 'Standard key-value data structure',
  },
];

const STARTER_CONTENT: Record<string, string> = {
  'script.js': `// Welcome to Editron
// A lightning-fast, modern text editor

function greet(name = 'Developer') {
  return \`Welcome to Editron, \${name}! Ready to code.\`;
}

console.log(greet());
`,
  'types.ts': `// TypeScript Starter in Editron
interface EditorConfig {
  name: string;
  version: string;
  fast: boolean;
  theme: 'obsidian-dark' | 'frost-light';
}

const config: EditorConfig = {
  name: 'Editron',
  version: '1.0.0',
  fast: true,
  theme: 'obsidian-dark',
};

console.log('Editron Initialized:', config);
`,
  'main.py': `# Python Starter in Editron
def main():
    editor = "Editron"
    version = "1.0.0"
    print(f"Welcome to {editor} v{version}!")

if __name__ == "__main__":
    main()
`,
  'README.md': `# Welcome to Editron

> **A next-generation, lightweight text editor for Windows.**

## Key Features

- ⚡ **Blazing Fast** — Built with CodeMirror 6 & Tauri v2
- 🎨 **Sleek Themes** — Obsidian Dark & Frost Light
- 🛠️ **Developer Tools** — Base64, JWT, Hash, Regex, Formats & Unicode
- 📝 **Live Markdown** — Split-pane live rendered preview

## Useful Shortcuts

| Shortcut | Description |
| :--- | :--- |
| **Ctrl + N** | New File |
| **Ctrl + O** | Open File |
| **Ctrl + S** | Save Document |
| **Ctrl + Shift + P** | Command Palette |
| **Ctrl + Shift + T** | Tools Panel |
| **Ctrl + Shift + V** | Markdown Preview |
`,
  'data.json': `{
  "app": "Editron",
  "version": "1.0.0",
  "engine": "CodeMirror 6",
  "settings": {
    "theme": "obsidian-dark",
    "tabSize": 4,
    "wordWrap": false
  }
}
`,
};

export const WelcomeScreen: React.FC = () => {
  const { addTab } = useEditorStore();
  const { toggleSidebar, setShowCommandPalette, addRecentFile, addToast } = useUIStore();

  const handleOpen = async () => {
    const files = await openFiles();
    files.forEach((file) => {
      addTab({
        filename: file.filename,
        content: file.content,
        filepath: file.filepath,
      });
      addRecentFile(file.filepath || file.filename);
      addToast(`Opened ${file.filename}`, 'success');
    });
  };

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        {/* Hero Section */}
        <div className="welcome-hero">
          <img
            src="/editron-logo.png"
            alt="Editron Logo"
            className="welcome-hero-logo-img"
          />
          <div className="welcome-hero-text">
            <div className="welcome-hero-title-row">
              <h1 className="welcome-title">Editron</h1>
              <span className="welcome-version-badge">v1.0.0</span>
            </div>
            <p className="welcome-subtitle">
              Lightning-fast text editor & developer swiss-army knife
            </p>
          </div>
        </div>

        {/* Action Columns */}
        <div className="welcome-grid">
          {/* Column 1: Start Actions */}
          <div className="welcome-card">
            <div className="welcome-card-header">
              <span className="welcome-card-title">Start</span>
            </div>
            <div className="welcome-action-group">
              <button
                className="welcome-action-item"
                onClick={() => addTab({ filename: 'Untitled' })}
              >
                <div className="welcome-action-icon-box accent">
                  <FilePlus size={16} />
                </div>
                <div className="welcome-action-info">
                  <span className="welcome-action-name">New File</span>
                  <span className="welcome-action-desc">Create blank buffer</span>
                </div>
                <kbd className="welcome-action-kbd">Ctrl+N</kbd>
              </button>

              <button className="welcome-action-item" onClick={handleOpen}>
                <div className="welcome-action-icon-box">
                  <FolderOpen size={16} />
                </div>
                <div className="welcome-action-info">
                  <span className="welcome-action-name">Open File...</span>
                  <span className="welcome-action-desc">Open from filesystem</span>
                </div>
                <kbd className="welcome-action-kbd">Ctrl+O</kbd>
              </button>

              <button className="welcome-action-item" onClick={toggleSidebar}>
                <div className="welcome-action-icon-box">
                  <FolderOpen size={16} />
                </div>
                <div className="welcome-action-info">
                  <span className="welcome-action-name">File Explorer</span>
                  <span className="welcome-action-desc">Browse workspace directory</span>
                </div>
                <kbd className="welcome-action-kbd">Ctrl+B</kbd>
              </button>

              <button
                className="welcome-action-item"
                onClick={() => setShowCommandPalette(true)}
              >
                <div className="welcome-action-icon-box purple">
                  <Command size={16} />
                </div>
                <div className="welcome-action-info">
                  <span className="welcome-action-name">Command Palette</span>
                  <span className="welcome-action-desc">Search all commands & tools</span>
                </div>
                <kbd className="welcome-action-kbd">Ctrl+Shift+P</kbd>
              </button>
            </div>
          </div>

          {/* Column 2: Template Starters */}
          <div className="welcome-card">
            <div className="welcome-card-header">
              <span className="welcome-card-title">Quick Templates</span>
            </div>
            <div className="welcome-action-group">
              {STARTER_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.ext}
                  className="welcome-action-item"
                  onClick={() =>
                    addTab({
                      filename: tmpl.ext,
                      content: STARTER_CONTENT[tmpl.ext] || '',
                    })
                  }
                >
                  <span
                    className="welcome-lang-tag"
                    style={{ borderColor: `${tmpl.badgeColor}40`, color: tmpl.badgeColor }}
                  >
                    {tmpl.badge}
                  </span>
                  <div className="welcome-action-info">
                    <span className="welcome-action-name">{tmpl.label}</span>
                    <span className="welcome-action-desc">{tmpl.desc}</span>
                  </div>
                  <span className="welcome-template-ext">{tmpl.ext}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Hints */}
        <div className="welcome-footer">
          <div className="welcome-footer-chip">
            <span className="chip-bullet">📁</span>
            <span>Drag & drop files anywhere to open</span>
          </div>
          <div className="welcome-footer-chip">
            <span className="chip-bullet">⚡</span>
            <span>Press <kbd>Ctrl+Shift+T</kbd> for Dev Tools</span>
          </div>
          <div className="welcome-footer-chip">
            <span className="chip-bullet">📝</span>
            <span>Press <kbd>Ctrl+Shift+V</kbd> for Markdown Preview</span>
          </div>
        </div>
      </div>
    </div>
  );
};
