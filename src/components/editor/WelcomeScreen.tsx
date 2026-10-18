// ============================================================
// Editron — Welcome Screen
// ============================================================

import React from 'react';
import { Zap, FilePlus, FolderOpen, FileCode, FileJson, FileType } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useUIStore } from '../../store/uiStore';

const starterFiles = [
  { label: 'New JavaScript File', ext: 'script.js', icon: <FileCode size={16} /> },
  { label: 'New TypeScript File', ext: 'types.ts', icon: <FileCode size={16} /> },
  { label: 'New JSON File', ext: 'data.json', icon: <FileJson size={16} /> },
  { label: 'New Markdown File', ext: 'README.md', icon: <FileType size={16} /> },
  { label: 'New Python File', ext: 'main.py', icon: <FileCode size={16} /> },
];

const starterContent: Record<string, string> = {
  'script.js': `// Welcome to Editron\n// A lightning-fast, feature-rich text editor\n\nfunction greet(name) {\n  return \`Hello, \${name}!\`;\n}\n\nconsole.log(greet('World'));\n`,
  'types.ts': `// TypeScript starter\ninterface User {\n  id: number;\n  name: string;\n  email: string;\n}\n\nconst user: User = {\n  id: 1,\n  name: 'Alice',\n  email: 'alice@example.com',\n};\n\nconsole.log(user);\n`,
  'data.json': `{\n  "name": "Editron",\n  "version": "1.0.0",\n  "description": "Lightning-fast text editor",\n  "features": [\n    "Syntax highlighting",\n    "Multi-tab editing",\n    "Developer tools",\n    "Dark & light themes"\n  ]\n}\n`,
  'README.md': `# Welcome to Editron\n\nA **lightning-fast**, feature-rich text editor for developers.\n\n## Features\n\n- 🚀 **Fast** — Powered by CodeMirror 6\n- 🎨 **Beautiful** — Obsidian Dark & Frost Light themes\n- 🛠️ **Tools** — Base64, JWT, Hash, Regex, and more\n- 📁 **Multi-tab** — Work on multiple files simultaneously\n\n## Keyboard Shortcuts\n\n| Shortcut | Action |\n|----------|--------|\n| Ctrl+N | New Tab |\n| Ctrl+O | Open File |\n| Ctrl+S | Save File |\n| Ctrl+Shift+P | Command Palette |\n| Ctrl+B | Toggle Sidebar |\n`,
  'main.py': `# Welcome to Editron\n# Python starter file\n\ndef greet(name: str) -> str:\n    return f"Hello, {name}!"\n\nif __name__ == "__main__":\n    print(greet("World"))\n`,
};

export const WelcomeScreen: React.FC = () => {
  const { addTab } = useEditorStore();
  const { toggleSidebar } = useUIStore();

  const handleOpen = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        Array.from(files).forEach((file) => {
          const reader = new FileReader();
          reader.onload = (ev) => {
            addTab({
              filename: file.name,
              content: ev.target?.result as string || '',
              filepath: file.name,
            });
          };
          reader.readAsText(file);
        });
      }
    };
    input.click();
  };

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        {/* Logo */}
        <div className="welcome-logo">
          <div className="welcome-logo-icon">
            <Zap size={48} />
          </div>
          <h1 className="welcome-title">Editron</h1>
          <p className="welcome-subtitle">Lightning-fast text editor for developers</p>
        </div>

        {/* Actions */}
        <div className="welcome-actions">
          <div className="welcome-section">
            <h3 className="welcome-section-title">Start</h3>
            <div className="welcome-action-list">
              <button
                className="welcome-action"
                onClick={() => addTab({ filename: 'Untitled' })}
              >
                <FilePlus size={18} />
                <span>New File</span>
                <span className="welcome-shortcut">Ctrl+N</span>
              </button>
              <button className="welcome-action" onClick={handleOpen}>
                <FolderOpen size={18} />
                <span>Open File</span>
                <span className="welcome-shortcut">Ctrl+O</span>
              </button>
              <button className="welcome-action" onClick={toggleSidebar}>
                <FolderOpen size={18} />
                <span>File Explorer</span>
                <span className="welcome-shortcut">Ctrl+B</span>
              </button>
            </div>
          </div>

          <div className="welcome-section">
            <h3 className="welcome-section-title">Quick Start</h3>
            <div className="welcome-action-list">
              {starterFiles.map((f) => (
                <button
                  key={f.ext}
                  className="welcome-action"
                  onClick={() =>
                    addTab({
                      filename: f.ext,
                      content: starterContent[f.ext] || '',
                    })
                  }
                >
                  {f.icon}
                  <span>{f.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="welcome-tips">
          <span>💡 Drag & drop files here to open them</span>
          <span>·</span>
          <span>Ctrl+Shift+P for Command Palette</span>
        </div>
      </div>
    </div>
  );
};
