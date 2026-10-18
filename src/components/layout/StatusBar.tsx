// ============================================================
// Editron — Status Bar Component
// ============================================================

import React from 'react';
import { useEditorStore } from '../../store/editorStore';
import { useUIStore } from '../../store/uiStore';
import { getTextStats } from '../../services/encoderService';

export const StatusBar: React.FC = () => {
  const activeTab = useEditorStore((s) => s.getActiveTab());
  const updateTab = useEditorStore((s) => s.updateTab);
  const { wordWrap, toggleWordWrap, theme, setTheme, addToast } = useUIStore();
  
  const stats = activeTab ? getTextStats(activeTab.content) : null;

  const handleToggleTheme = () => {
    const nextTheme = theme === 'obsidian-dark' ? 'frost-light' : 'obsidian-dark';
    setTheme(nextTheme);
    addToast(
      `Theme: ${nextTheme === 'obsidian-dark' ? 'Cyber Dark' : 'Frost Light'}`,
      'info',
      2000
    );
  };

  const handleToggleLineEnding = () => {
    if (!activeTab) return;
    const next = activeTab.lineEnding === 'lf' ? 'crlf' : 'lf';
    updateTab(activeTab.id, { lineEnding: next, isDirty: true });
    addToast(`Line ending set to ${next.toUpperCase()}`, 'info', 2000);
  };

  return (
    <div className="statusbar">
      <div className="statusbar-left">
        {activeTab ? (
          <>
            <span className="status-item" title="Encoding">
              {activeTab.encoding}
            </span>
            <span className="status-divider" />
            <button
              className="status-item clickable"
              title="Click to toggle LF / CRLF"
              onClick={handleToggleLineEnding}
            >
              {activeTab.lineEnding === 'lf' ? 'LF' : 'CRLF'}
            </button>
            <span className="status-divider" />
            <span className="status-item" title="Language">
              {activeTab.language}
            </span>
            <span className="status-divider" />
            <button
              className="status-item clickable"
              title="Click to toggle word wrap"
              onClick={toggleWordWrap}
            >
              {wordWrap ? 'Wrap: On' : 'Wrap: Off'}
            </button>
          </>
        ) : (
          <span className="status-item">Ready</span>
        )}
      </div>

      <div className="statusbar-right">
        {activeTab && stats && (
          <>
            <span className="status-item" title="Cursor Position">
              Ln {activeTab.cursorLine}, Col {activeTab.cursorCol}
            </span>
            <span className="status-divider" />
            <span className="status-item" title="Lines">
              {stats.lines} lines
            </span>
            <span className="status-divider" />
            <span className="status-item" title="Characters">
              {stats.chars} chars
            </span>
            <span className="status-divider" />
            <span className="status-item" title="Words">
              {stats.words} words
            </span>
            <span className="status-divider" />
            <span className="status-item" title="File Size">
              {formatBytes(stats.bytes)}
            </span>
          </>
        )}
        <span className="status-divider" />
        <button
          className="status-item clickable status-theme-toggle"
          title={`Theme: ${theme === 'obsidian-dark' ? 'Cyber Dark' : 'Frost Light'} (Click to switch)`}
          onClick={handleToggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'obsidian-dark' ? '🌙' : '☀️'}
        </button>
      </div>
    </div>
  );
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
