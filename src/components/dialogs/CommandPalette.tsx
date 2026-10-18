// ============================================================
// Editron — Command Palette
// ============================================================

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, FileText, Settings, Zap, FileCode, Binary, Shield, Hash, Clock, Braces } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useUIStore } from '../../store/uiStore';

interface Command {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
}

export const CommandPalette: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const {
    setShowCommandPalette, setShowSettings, setActiveTool,
    toggleSidebar, toggleToolsPanel, toggleWordWrap, toggleZenMode,
    toggleLineNumbers, setTheme, theme,
  } = useUIStore();
  const { addTab, tabs } = useEditorStore();

  const close = useCallback(() => setShowCommandPalette(false), [setShowCommandPalette]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const allCommands = useMemo<Command[]>(() => [
    // File commands
    { id: 'new-file', label: 'New File', description: 'Create a new empty tab', shortcut: 'Ctrl+N', icon: <FileText size={16} />, action: () => addTab({ filename: 'Untitled' }), category: 'File' },
    { id: 'open-file', label: 'Open File...', description: 'Open a file from disk', shortcut: 'Ctrl+O', icon: <FileText size={16} />, action: () => { const i = document.createElement('input'); i.type = 'file'; i.onchange = (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => addTab({ filename: f.name, content: ev.target?.result as string || '' }); r.readAsText(f); } }; i.click(); }, category: 'File' },
    { id: 'settings', label: 'Open Settings', description: 'Configure editor preferences', shortcut: 'Ctrl+,', icon: <Settings size={16} />, action: () => setShowSettings(true), category: 'Preferences' },

    // View commands
    { id: 'toggle-sidebar', label: 'Toggle Sidebar', description: 'Show/hide file explorer', shortcut: 'Ctrl+B', icon: <FileCode size={16} />, action: toggleSidebar, category: 'View' },
    { id: 'toggle-tools', label: 'Toggle Tools Panel', description: 'Show/hide developer tools', shortcut: 'Ctrl+Shift+T', icon: <Zap size={16} />, action: toggleToolsPanel, category: 'View' },
    { id: 'toggle-wordwrap', label: 'Toggle Word Wrap', description: 'Enable/disable line wrapping', shortcut: 'Alt+Z', icon: <FileText size={16} />, action: toggleWordWrap, category: 'View' },
    { id: 'toggle-linenumbers', label: 'Toggle Line Numbers', description: 'Show/hide line numbers', icon: <FileText size={16} />, action: toggleLineNumbers, category: 'View' },
    { id: 'toggle-zen', label: 'Toggle Zen Mode', description: 'Distraction-free editing', shortcut: 'Ctrl+Shift+Z', icon: <Zap size={16} />, action: toggleZenMode, category: 'View' },
    { id: 'theme-dark', label: 'Obsidian Dark Theme', description: 'Switch to dark theme', icon: <Zap size={16} />, action: () => setTheme('obsidian-dark'), category: 'Theme' },
    { id: 'theme-light', label: 'Frost Light Theme', description: 'Switch to light theme', icon: <Zap size={16} />, action: () => setTheme('frost-light'), category: 'Theme' },

    // Tools
    { id: 'tool-base64', label: 'Base64 Encoder/Decoder', description: 'Open Base64 tool', icon: <Binary size={16} />, action: () => setActiveTool('base64'), category: 'Tools' },
    { id: 'tool-url', label: 'URL Encoder/Decoder', description: 'Open URL tool', icon: <Binary size={16} />, action: () => setActiveTool('url'), category: 'Tools' },
    { id: 'tool-jwt', label: 'JWT Decoder', description: 'Decode & inspect JWT tokens', icon: <Shield size={16} />, action: () => setActiveTool('jwt'), category: 'Tools' },
    { id: 'tool-hash', label: 'Hash Generator', description: 'MD5, SHA-1, SHA-256...', icon: <Hash size={16} />, action: () => setActiveTool('hash'), category: 'Tools' },
    { id: 'tool-regex', label: 'Regex Tester', description: 'Test regular expressions', icon: <Binary size={16} />, action: () => setActiveTool('regex'), category: 'Tools' },
    { id: 'tool-timestamp', label: 'Timestamp Converter', description: 'Convert dates and timestamps', icon: <Clock size={16} />, action: () => setActiveTool('timestamp'), category: 'Tools' },
    { id: 'tool-unicode', label: 'Unicode Inspector', description: 'Inspect Unicode characters', icon: <Binary size={16} />, action: () => setActiveTool('unicode'), category: 'Tools' },
    { id: 'tool-json', label: 'JSON Formatter', description: 'Format and validate JSON', icon: <Braces size={16} />, action: () => setActiveTool('json'), category: 'Tools' },

    // Tab commands (dynamic)
    ...tabs.map((tab) => ({
      id: `tab-${tab.id}`,
      label: `Switch to: ${tab.filename}`,
      description: tab.filepath || 'Unsaved',
      icon: <FileText size={16} />,
      action: () => useEditorStore.getState().setActiveTab(tab.id),
      category: 'Tabs',
    })),
  ], [addTab, setShowSettings, toggleSidebar, toggleToolsPanel, toggleWordWrap, toggleZenMode, toggleLineNumbers, setTheme, setActiveTool, tabs]);

  const filtered = useMemo(() => {
    if (!query.trim()) return allCommands;
    const q = query.toLowerCase();
    return allCommands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }, [query, allCommands]);

  // Reset selection when filter changes
  useEffect(() => setSelectedIndex(0), [filtered]);

  const execute = useCallback((command: Command) => {
    command.action();
    close();
  }, [close]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) execute(filtered[selectedIndex]);
    }
  };

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, Command[]>();
    filtered.forEach((c) => {
      if (!map.has(c.category)) map.set(c.category, []);
      map.get(c.category)!.push(c);
    });
    return map;
  }, [filtered]);

  return (
    <div className="palette-overlay" onClick={close}>
      <div className="palette-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Search */}
        <div className="palette-search-row">
          <Search size={16} className="palette-search-icon" />
          <input
            ref={inputRef}
            className="palette-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="palette-esc-hint">ESC</kbd>
        </div>

        {/* Results */}
        <div className="palette-results" ref={listRef}>
          {filtered.length === 0 ? (
            <div className="palette-empty">No commands found for "{query}"</div>
          ) : (
            Array.from(grouped.entries()).map(([category, commands]) => {
              const globalOffset = [...grouped.entries()]
                .slice(0, [...grouped.keys()].indexOf(category))
                .reduce((acc, [, cmds]) => acc + cmds.length, 0);

              return (
                <div key={category}>
                  <div className="palette-category">{category}</div>
                  {commands.map((cmd, localIdx) => {
                    const globalIdx = globalOffset + localIdx;
                    return (
                      <button
                        key={cmd.id}
                        className={`palette-item ${globalIdx === selectedIndex ? 'selected' : ''}`}
                        onClick={() => execute(cmd)}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                      >
                        <span className="palette-item-icon">{cmd.icon}</span>
                        <div className="palette-item-text">
                          <span className="palette-item-label">{cmd.label}</span>
                          {cmd.description && (
                            <span className="palette-item-desc">{cmd.description}</span>
                          )}
                        </div>
                        {cmd.shortcut && (
                          <kbd className="palette-shortcut">{cmd.shortcut}</kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="palette-footer">
          <span>↑↓ navigate</span>
          <span>↵ execute</span>
          <span>ESC close</span>
        </div>
      </div>
    </div>
  );
};
