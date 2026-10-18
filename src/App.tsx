// ============================================================
// Editron — Root Application Component
// ============================================================

import React, { useEffect, useCallback } from 'react';
import { MenuBar } from './components/layout/MenuBar';
import { TabBar } from './components/layout/TabBar';
import { StatusBar } from './components/layout/StatusBar';
import { EditorPane } from './components/editor/EditorPane';
import { CommandPalette } from './components/layout/CommandPalette';
import { FindReplace } from './components/layout/FindReplace';
import { Sidebar } from './components/layout/Sidebar';
import { WelcomeScreen } from './components/editor/WelcomeScreen';
import { MarkdownPreview } from './components/markdown/MarkdownPreview';
import { ToolsPanel } from './components/tools/ToolsPanel';
import { SettingsDialog } from './components/settings/SettingsDialog';
import { useEditorStore } from './store/editorStore';
import { useUIStore } from './store/uiStore';
import { openFiles, saveFile } from './services/fileService';

// Toast component
const Toasts: React.FC = () => {
  const toasts = useUIStore((s) => s.toasts);
  const removeToast = useUIStore((s) => s.removeToast);

  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast ${t.type}`}
          onClick={() => removeToast(t.id)}
          style={{ cursor: 'pointer' }}
        >
          <span>
            {t.type === 'success' && '✓ '}
            {t.type === 'error' && '✗ '}
            {t.type === 'warning' && '⚠ '}
            {t.type === 'info' && 'ℹ '}
            {t.message}
          </span>
        </div>
      ))}
    </div>
  );
};

export const App: React.FC = () => {
  const { tabs, activeTabId, addTab } = useEditorStore();
  const {
    sidebarVisible, toolsPanelVisible, showCommandPalette,
    showFindReplace, showSettings, zenMode, markdownPreview,
    setShowCommandPalette, setShowFindReplace, setShowSettings,
    toggleSidebar, toggleToolsPanel, toggleWordWrap, toggleZenMode,
    toggleMarkdownPreview, addRecentFile, addToast,
  } = useUIStore();

  // ── Global keyboard shortcuts ─────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const alt = e.altKey;

      if (ctrl && !shift && !alt && e.key === 'n') {
        e.preventDefault();
        addTab({ filename: 'Untitled' });
      } else if (ctrl && !shift && !alt && e.key === 'o') {
        e.preventDefault();
        handleOpen();
      } else if (ctrl && !shift && !alt && e.key === 's') {
        e.preventDefault();
        handleSave();
      } else if (ctrl && !shift && !alt && e.key === 'f') {
        e.preventDefault();
        setShowFindReplace(true);
      } else if (ctrl && !shift && !alt && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      } else if (ctrl && !shift && !alt && e.key === ',') {
        e.preventDefault();
        setShowSettings(true);
      } else if (ctrl && shift && !alt && e.key === 'P') {
        e.preventDefault();
        setShowCommandPalette(true);
      } else if (ctrl && shift && !alt && e.key === 'T') {
        e.preventDefault();
        toggleToolsPanel();
      } else if (ctrl && shift && !alt && e.key === 'V') {
        e.preventDefault();
        toggleMarkdownPreview();
      } else if (!ctrl && alt && !shift && e.key === 'z') {
        e.preventDefault();
        toggleWordWrap();
      } else if (e.key === 'F11' || (ctrl && shift && !alt && e.key === 'Z')) {
        e.preventDefault();
        toggleZenMode();
      } else if (e.key === 'Escape') {
        if (showCommandPalette) setShowCommandPalette(false);
        if (showFindReplace) setShowFindReplace(false);
        if (showSettings) setShowSettings(false);
      }
    },
    [addTab, setShowFindReplace, toggleSidebar, setShowSettings, setShowCommandPalette,
      toggleToolsPanel, toggleMarkdownPreview, toggleWordWrap, toggleZenMode, showCommandPalette,
      showFindReplace, showSettings]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ── File drop on window ───────────────────────────────────
  useEffect(() => {
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer?.files || []);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          addTab({ filename: file.name, content: ev.target?.result as string || '', filepath: file.name });
          addRecentFile(file.name);
        };
        reader.readAsText(file);
      });
    };
    const handleDragOver = (e: DragEvent) => e.preventDefault();

    window.addEventListener('drop', handleDrop);
    window.addEventListener('dragover', handleDragOver);
    return () => {
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('dragover', handleDragOver);
    };
  }, [addTab, addRecentFile]);

  const handleOpen = async () => {
    const files = await openFiles();
    files.forEach((file) => {
      addTab({ filename: file.filename, content: file.content, filepath: file.filepath });
      addRecentFile(file.filepath || file.filename);
      addToast(`Opened: ${file.filename}`, 'success');
    });
  };

  const handleSave = async () => {
    const tab = useEditorStore.getState().getActiveTab();
    if (!tab) return;
    const res = await saveFile(tab.filepath, tab.filename, tab.content);
    if (res.success) {
      useEditorStore.getState().updateTab(tab.id, {
        isDirty: false,
        filepath: res.filepath || tab.filepath,
      });
      addToast(`Saved: ${tab.filename}`, 'success');
    } else if (res.error) {
      addToast(`Save error: ${res.error}`, 'error');
    }
  };

  // ── Hidden file input fallback ─────────────────────────────
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        addTab({ filename: file.name, content: ev.target?.result as string || '', filepath: file.name });
        addRecentFile(file.name);
      };
      reader.readAsText(file);
    });
    e.target.value = '';
  };

  const showEditor = tabs.length > 0 && activeTabId;

  return (
    <div className="app">
      {/* Hidden file input */}
      <input
        id="file-input-trigger"
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileInput}
      />

      {/* Menu Bar */}
      {!zenMode && <MenuBar />}

      {/* Tab Bar */}
      {!zenMode && <TabBar />}

      {/* Main Body */}
      <div className="app-body">
        {/* Left Sidebar */}
        {sidebarVisible && !zenMode && <Sidebar />}

        {/* Editor Area */}
        <div className="editor-area">
          {/* Find & Replace */}
          {showFindReplace && <FindReplace />}

          {/* Editor + Preview */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Editor */}
            <div style={{
              flex: markdownPreview ? '0 0 50%' : 1,
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden', minWidth: 0,
            }}>
              {showEditor ? (
                <EditorPane key={activeTabId} tabId={activeTabId} />
              ) : (
                <WelcomeScreen />
              )}
            </div>

            {/* Markdown Preview */}
            {markdownPreview && (
              <MarkdownPreview style={{ flex: '0 0 50%' }} />
            )}
          </div>
        </div>

        {/* Right: Tools Panel */}
        {toolsPanelVisible && !zenMode && <ToolsPanel />}
      </div>

      {/* Status Bar */}
      {!zenMode && <StatusBar />}

      {/* Overlays */}
      {showCommandPalette && <CommandPalette />}
      {showSettings && <SettingsDialog />}

      {/* Toasts */}
      <Toasts />
    </div>
  );
};
