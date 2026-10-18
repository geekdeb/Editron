// ============================================================
// Editron — Status Bar Component
// ============================================================

import React from 'react';
import { useEditorStore } from '../../store/editorStore';
import { useUIStore } from '../../store/uiStore';
import { getTextStats } from '../../services/encoderService';

export const StatusBar: React.FC = () => {
  const activeTab = useEditorStore((s) => s.getActiveTab());
  const { wordWrap, theme } = useUIStore();
  
  const stats = activeTab ? getTextStats(activeTab.content) : null;

  return (
    <div className="statusbar">
      <div className="statusbar-left">
        {activeTab ? (
          <>
            <span className="status-item clickable" title="Encoding">
              {activeTab.encoding}
            </span>
            <span className="status-divider" />
            <span className="status-item clickable" title="Line Ending">
              {activeTab.lineEnding === 'lf' ? 'LF' : 'CRLF'}
            </span>
            <span className="status-divider" />
            <span className="status-item clickable" title="Language">
              {activeTab.language}
            </span>
            <span className="status-divider" />
            <span className="status-item" title="Word Wrap">
              {wordWrap ? 'Wrap: On' : 'Wrap: Off'}
            </span>
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
        <span className="status-item" title="Theme" style={{ textTransform: 'capitalize' }}>
          {theme === 'obsidian-dark' ? '🌙' : '☀️'}
        </span>
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
