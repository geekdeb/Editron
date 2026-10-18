// ============================================================
// Editron — Menu Bar Component
// ============================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Zap } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useUIStore } from '../../store/uiStore';

interface MenuItem {
  label: string;
  shortcut?: string;
  action?: () => void;
  separator?: boolean;
  disabled?: boolean;
  submenu?: MenuItem[];
}

export const MenuBar: React.FC = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const addTab = useEditorStore((s) => s.addTab);
  const { 
    setShowSettings, setShowCommandPalette, setShowFindReplace,
    toggleSidebar, toggleToolsPanel, toggleWordWrap, toggleZenMode,
    toggleMarkdownPreview, setActiveTool, setTheme, theme,
    toggleLineNumbers, toggleMinimap
  } = useUIStore();
  const activeTab = useEditorStore((s) => s.getActiveTab());

  const handleClose = useCallback(() => setOpenMenu(null), []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    if (openMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenu, handleClose]);

  const menus: Record<string, MenuItem[]> = {
    File: [
      { label: 'New File', shortcut: 'Ctrl+N', action: () => addTab({ filename: 'Untitled' }) },
      { label: 'Open File', shortcut: 'Ctrl+O', action: () => handleOpenFile() },
      { separator: true, label: '' },
      { label: 'Save', shortcut: 'Ctrl+S', action: () => handleSave(), disabled: !activeTab },
      { label: 'Save As...', shortcut: 'Ctrl+Shift+S', disabled: !activeTab },
      { separator: true, label: '' },
      { label: 'Preferences', shortcut: 'Ctrl+,', action: () => setShowSettings(true) },
    ],
    Edit: [
      { label: 'Undo', shortcut: 'Ctrl+Z' },
      { label: 'Redo', shortcut: 'Ctrl+Y' },
      { separator: true, label: '' },
      { label: 'Cut', shortcut: 'Ctrl+X' },
      { label: 'Copy', shortcut: 'Ctrl+C' },
      { label: 'Paste', shortcut: 'Ctrl+V' },
      { label: 'Select All', shortcut: 'Ctrl+A' },
      { separator: true, label: '' },
      { label: 'Find', shortcut: 'Ctrl+F', action: () => setShowFindReplace(true) },
      { label: 'Replace', shortcut: 'Ctrl+H', action: () => setShowFindReplace(true) },
    ],
    View: [
      { label: theme === 'obsidian-dark' ? '☀ Light Theme' : '🌙 Dark Theme', action: () => setTheme(theme === 'obsidian-dark' ? 'frost-light' : 'obsidian-dark') },
      { separator: true, label: '' },
      { label: 'Word Wrap', shortcut: 'Alt+Z', action: () => toggleWordWrap() },
      { label: 'Line Numbers', action: () => toggleLineNumbers() },
      { label: 'Minimap', action: () => toggleMinimap() },
      { separator: true, label: '' },
      { label: 'File Explorer', shortcut: 'Ctrl+B', action: () => toggleSidebar() },
      { label: 'Tools Panel', shortcut: 'Ctrl+Shift+T', action: () => toggleToolsPanel() },
      { separator: true, label: '' },
      { label: 'Zen Mode', shortcut: 'Ctrl+K Z', action: () => toggleZenMode() },
      { label: 'Command Palette', shortcut: 'Ctrl+Shift+P', action: () => setShowCommandPalette(true) },
    ],
    Tools: [
      { label: '📝 Markdown Preview', shortcut: 'Ctrl+Shift+V', action: () => toggleMarkdownPreview() },
      { separator: true, label: '' },
      { label: '🔤 Base64 Encode/Decode', action: () => setActiveTool('base64') },
      { label: '🔗 URL Encode/Decode', action: () => setActiveTool('url') },
      { label: '🎫 JWT Decode', action: () => setActiveTool('jwt') },
      { label: '#️⃣ Hash Generator', action: () => setActiveTool('hash') },
      { separator: true, label: '' },
      { label: '🔍 Regex Tester', action: () => setActiveTool('regex') },
      { label: '⏰ Timestamp Converter', action: () => setActiveTool('timestamp') },
      { label: '🔣 Unicode Inspector', action: () => setActiveTool('unicode') },
    ],
    Format: [
      { label: '{ } JSON Format', action: () => setActiveTool('json') },
      { label: '< > XML Format', action: () => setActiveTool('xml') },
      { label: '📋 YAML Format', action: () => setActiveTool('yaml') },
      { separator: true, label: '' },
      { label: 'UPPERCASE', action: () => transformText('upper') },
      { label: 'lowercase', action: () => transformText('lower') },
      { label: 'Title Case', action: () => transformText('title') },
    ],
  };

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

  const handleSave = () => {
    if (!activeTab) return;
    const blob = new Blob([activeTab.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeTab.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const transformText = (_type: string) => {
    // Text transforms are handled via CodeMirror dispatch
  };

  return (
    <div className="menubar" ref={menuRef}>
      <div className="menubar-logo">
        <Zap size={15} />
        <span>Editron</span>
      </div>

      {Object.entries(menus).map(([name, items]) => (
        <div key={name} style={{ position: 'relative' }}>
          <button
            className={`menu-item ${openMenu === name ? 'active' : ''}`}
            onClick={() => setOpenMenu(openMenu === name ? null : name)}
            onMouseEnter={() => openMenu && setOpenMenu(name)}
          >
            {name}
          </button>

          {openMenu === name && (
            <div className="menu-dropdown">
              {items.map((item, i) =>
                item.separator ? (
                  <div key={i} className="menu-separator" />
                ) : (
                  <button
                    key={i}
                    className={`menu-dropdown-item ${item.disabled ? 'disabled' : ''}`}
                    onClick={() => {
                      item.action?.();
                      handleClose();
                    }}
                  >
                    <span>{item.label}</span>
                    {item.shortcut && <span className="shortcut">{item.shortcut}</span>}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      ))}

      {/* Spacer for window drag */}
      <div style={{ flex: 1 }} />
    </div>
  );
};
