// ============================================================
// Editron — Command Palette
// ============================================================

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FileText, Settings, Search, Eye, Zap, Code2,
  Hash, Link, Key, FileJson, FileCode, RefreshCw,
  Clock, Globe, Smile, AlignLeft, AlignJustify,
  SortAsc, Sun, Moon, Columns, X
} from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useEditorStore } from '../../store/editorStore';

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

  const {
    setShowCommandPalette, setShowSettings, setShowFindReplace,
    toggleSidebar, toggleToolsPanel, toggleWordWrap, toggleZenMode,
    toggleMarkdownPreview, setActiveTool, setTheme, theme, toggleLineNumbers, toggleMinimap,
  } = useUIStore();
  const addTab = useEditorStore((s) => s.addTab);

  const commands: Command[] = useMemo(() => [
    // File
    { id: 'new-file', label: 'New File', shortcut: 'Ctrl+N', icon: <FileText size={16} />, category: 'File', action: () => addTab({ filename: 'Untitled' }) },
    { id: 'open-file', label: 'Open File', shortcut: 'Ctrl+O', icon: <FileText size={16} />, category: 'File', action: () => document.getElementById('file-input-trigger')?.click() },
    { id: 'settings', label: 'Open Settings', shortcut: 'Ctrl+,', icon: <Settings size={16} />, category: 'File', action: () => setShowSettings(true) },

    // View
    { id: 'toggle-sidebar', label: 'Toggle File Explorer', shortcut: 'Ctrl+B', icon: <Columns size={16} />, category: 'View', action: toggleSidebar },
    { id: 'toggle-tools', label: 'Toggle Tools Panel', shortcut: 'Ctrl+Shift+T', icon: <Zap size={16} />, category: 'View', action: toggleToolsPanel },
    { id: 'toggle-wordwrap', label: 'Toggle Word Wrap', shortcut: 'Alt+Z', icon: <AlignJustify size={16} />, category: 'View', action: toggleWordWrap },
    { id: 'toggle-linenumbers', label: 'Toggle Line Numbers', icon: <AlignLeft size={16} />, category: 'View', action: toggleLineNumbers },
    { id: 'toggle-minimap', label: 'Toggle Minimap', icon: <AlignLeft size={16} />, category: 'View', action: toggleMinimap },
    { id: 'toggle-zen', label: 'Toggle Zen Mode', shortcut: 'Ctrl+K Z', icon: <Eye size={16} />, category: 'View', action: toggleZenMode },
    { id: 'md-preview', label: 'Toggle Markdown Preview', shortcut: 'Ctrl+Shift+V', icon: <Eye size={16} />, category: 'View', action: toggleMarkdownPreview },
    { id: 'theme-dark', label: 'Theme: Obsidian Dark', icon: <Moon size={16} />, category: 'View', action: () => setTheme('obsidian-dark') },
    { id: 'theme-light', label: 'Theme: Frost Light', icon: <Sun size={16} />, category: 'View', action: () => setTheme('frost-light') },

    // Search
    { id: 'find', label: 'Find', shortcut: 'Ctrl+F', icon: <Search size={16} />, category: 'Edit', action: () => setShowFindReplace(true) },

    // Tools
    { id: 'base64', label: 'Base64 Encode / Decode', icon: <Code2 size={16} />, category: 'Tools', action: () => setActiveTool('base64') },
    { id: 'url', label: 'URL Encode / Decode', icon: <Link size={16} />, category: 'Tools', action: () => setActiveTool('url') },
    { id: 'jwt', label: 'JWT Decode', icon: <Key size={16} />, category: 'Tools', action: () => setActiveTool('jwt') },
    { id: 'hash', label: 'Hash Generator', icon: <Hash size={16} />, category: 'Tools', action: () => setActiveTool('hash') },
    { id: 'regex', label: 'Regex Tester', icon: <Search size={16} />, category: 'Tools', action: () => setActiveTool('regex') },
    { id: 'timestamp', label: 'Timestamp Converter', icon: <Clock size={16} />, category: 'Tools', action: () => setActiveTool('timestamp') },
    { id: 'unicode', label: 'Unicode Inspector', icon: <Globe size={16} />, category: 'Tools', action: () => setActiveTool('unicode') },
    { id: 'emoji', label: 'Emoji Picker', icon: <Smile size={16} />, category: 'Tools', action: () => setActiveTool('unicode') },

    // Format
    { id: 'json-fmt', label: 'JSON Formatter', icon: <FileJson size={16} />, category: 'Format', action: () => setActiveTool('json') },
    { id: 'xml-fmt', label: 'XML Formatter', icon: <FileCode size={16} />, category: 'Format', action: () => setActiveTool('xml') },
    { id: 'yaml-fmt', label: 'YAML Formatter', icon: <FileCode size={16} />, category: 'Format', action: () => setActiveTool('yaml') },
    { id: 'sort-asc', label: 'Sort Lines Ascending', icon: <SortAsc size={16} />, category: 'Format', action: () => {} },
    { id: 'sort-desc', label: 'Sort Lines Descending', icon: <SortAsc size={16} />, category: 'Format', action: () => {} },
    { id: 'upper', label: 'Transform to UPPERCASE', icon: <RefreshCw size={16} />, category: 'Format', action: () => {} },
    { id: 'lower', label: 'Transform to lowercase', icon: <RefreshCw size={16} />, category: 'Format', action: () => {} },
  ], [addTab, setShowSettings, setShowFindReplace, toggleSidebar, toggleToolsPanel, toggleWordWrap, toggleZenMode, toggleMarkdownPreview, setActiveTool, setTheme, toggleLineNumbers, toggleMinimap, theme]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
    );
  }, [query, commands]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = filtered[selectedIndex];
      if (cmd) {
        cmd.action();
        setShowCommandPalette(false);
      }
    } else if (e.key === 'Escape') {
      setShowCommandPalette(false);
    }
  };

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    filtered.forEach((cmd) => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filtered]);

  let globalIndex = 0;

  return (
    <div className="command-palette-overlay" onClick={() => setShowCommandPalette(false)}>
      <div className="command-palette" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
          <Search size={16} style={{ margin: '0 12px', color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            className="command-palette-input"
            style={{ borderBottom: 'none', paddingLeft: 0 }}
            placeholder="Search commands, tools, settings..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            style={{ background: 'none', border: 'none', padding: '0 12px', cursor: 'pointer', color: 'var(--text-muted)' }}
            onClick={() => setShowCommandPalette(false)}
          >
            <X size={14} />
          </button>
        </div>

        <div className="command-palette-results">
          {filtered.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No commands found for "{query}"
            </div>
          ) : (
            Object.entries(groupedByCategory).map(([category, cmds]) => (
              <div key={category}>
                <div style={{
                  padding: '6px 12px 3px',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                }}>
                  {category}
                </div>
                {cmds.map((cmd) => {
                  const idx = globalIndex++;
                  return (
                    <button
                      key={cmd.id}
                      className={`command-palette-item ${idx === selectedIndex ? 'selected' : ''}`}
                      style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
                      onClick={() => { cmd.action(); setShowCommandPalette(false); }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                    >
                      <span className="icon" style={{ color: 'var(--accent)' }}>{cmd.icon}</span>
                      <span style={{ flex: 1 }}>{cmd.label}</span>
                      {cmd.shortcut && (
                        <span className="shortcut">{cmd.shortcut}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div style={{
          padding: '6px 12px',
          borderTop: '1px solid var(--border)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          display: 'flex',
          gap: '16px',
        }}>
          <span>↑↓ Navigate</span>
          <span>↵ Execute</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
};
