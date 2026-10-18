// ============================================================
// Editron — Sidebar (File Explorer with State Persistence)
// ============================================================

import React, { useState, useCallback, useEffect } from 'react';
import {
  FolderOpen, FileText, FileCode, FileJson, FileType,
  ChevronRight, ChevronDown, Plus, RefreshCw, X, FolderX
} from 'lucide-react';
import { useEditorStore, detectLanguage, isSameFile } from '../../store/editorStore';
import { useUIStore } from '../../store/uiStore';
import {
  readDirectoryTree,
  readFileFromDisk,
  pickDirectory,
  isTauriEnv,
  getFilenameFromPath,
  BackendFileEntry
} from '../../services/fileService';

interface FileNode {
  name: string;
  path?: string;
  type: 'file' | 'dir';
  children?: FileNode[];
  handle?: FileSystemFileHandle;
}

const getFileIcon = (name: string) => {
  const lang = detectLanguage(name);
  if (lang === 'json') return <FileJson size={14} />;
  if (['javascript', 'typescript', 'python', 'rust', 'java', 'cpp', 'c', 'toml'].includes(lang)) return <FileCode size={14} />;
  if (lang === 'markdown') return <FileType size={14} />;
  return <FileText size={14} />;
};

const FileItem: React.FC<{
  node: FileNode;
  depth: number;
  onOpenFile: (node: FileNode) => void;
}> = ({ node, depth, onOpenFile }) => {
  const [expanded, setExpanded] = useState(true);

  if (node.type === 'dir') {
    return (
      <div>
        <button
          className="sidebar-file-item sidebar-dir-item"
          style={{ paddingLeft: `${8 + depth * 14}px` }}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          <FolderOpen size={14} className="sidebar-folder-icon" />
          <span className="sidebar-filename">{node.name}</span>
        </button>
        {expanded && node.children?.map((child) => (
          <FileItem key={child.path || child.name} node={child} depth={depth + 1} onOpenFile={onOpenFile} />
        ))}
      </div>
    );
  }

  return (
    <button
      className="sidebar-file-item"
      style={{ paddingLeft: `${8 + depth * 14}px` }}
      onClick={() => onOpenFile(node)}
      title={node.path || node.name}
    >
      <span className="sidebar-file-icon">{getFileIcon(node.name)}</span>
      <span className="sidebar-filename">{node.name}</span>
    </button>
  );
};

function convertBackendEntries(entries: BackendFileEntry[]): FileNode[] {
  return entries.map((entry) => ({
    name: entry.name,
    path: entry.path,
    type: entry.is_dir ? 'dir' : 'file',
    children: entry.children ? convertBackendEntries(entry.children) : undefined,
  }));
}

export const Sidebar: React.FC = () => {
  const { addTab } = useEditorStore();
  const { 
    toggleSidebar, addToast, openedFolderPath, 
    openedFolderRootName, setOpenedFolder 
  } = useUIStore();
  const [tree, setTree] = useState<FileNode[]>([]);
  const [rootName, setRootName] = useState<string>(openedFolderRootName || '');
  const [loading, setLoading] = useState(false);

  // Load a folder tree by filesystem path (native Tauri)
  const loadFolderByPath = useCallback(async (folderPath: string, customRootName?: string) => {
    setLoading(true);
    try {
      const entries = await readDirectoryTree(folderPath);
      const converted = convertBackendEntries(entries);
      const name = customRootName || getFilenameFromPath(folderPath) || folderPath;
      setTree(converted);
      setRootName(name);
      setOpenedFolder(folderPath, name);
    } catch (err) {
      console.warn('Failed to load folder tree:', err);
      addToast('Could not load folder contents', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast, setOpenedFolder]);

  // Restore folder state on mount
  useEffect(() => {
    if (openedFolderPath) {
      loadFolderByPath(openedFolderPath, openedFolderRootName || undefined);
    }
  }, [openedFolderPath, openedFolderRootName, loadFolderByPath]);

  // Open a folder (Tauri native dialog or browser fallback)
  const handleOpenFolder = async () => {
    if (isTauriEnv()) {
      try {
        const selected = await pickDirectory(openedFolderPath || undefined);
        if (selected) {
          await loadFolderByPath(selected);
          addToast(`Opened folder "${getFilenameFromPath(selected)}"`, 'success');
        }
      } catch (err) {
        console.warn('Native folder selection failed:', err);
      }
      return;
    }

    // Browser Fallback (File System Access API)
    try {
      // @ts-ignore
      const dirHandle = await window.showDirectoryPicker?.();
      if (!dirHandle) {
        addToast('File System Access API not supported in this browser', 'warning');
        return;
      }
      setLoading(true);
      setRootName(dirHandle.name);
      setOpenedFolder(dirHandle.name, dirHandle.name);

      const buildTree = async (handle: FileSystemDirectoryHandle, depth = 0): Promise<FileNode[]> => {
        if (depth > 5) return [];
        const entries: FileNode[] = [];
        // @ts-ignore
        for await (const [name, entry] of handle.entries()) {
          if (name.startsWith('.') || name === 'node_modules' || name === '__pycache__') continue;
          if (entry.kind === 'directory') {
            const children = await buildTree(entry as FileSystemDirectoryHandle, depth + 1);
            entries.push({ name, type: 'dir', children });
          } else {
            entries.push({ name, type: 'file', handle: entry as FileSystemFileHandle });
          }
        }
        return entries.sort((a, b) => {
          if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
      };

      const nodes = await buildTree(dirHandle);
      setTree(nodes);
      setLoading(false);
    } catch (err: unknown) {
      setLoading(false);
      if ((err as Error).name !== 'AbortError') {
        addToast('Could not open folder', 'error');
      }
    }
  };

  const handleCloseFolder = () => {
    setTree([]);
    setRootName('');
    setOpenedFolder(null, null);
    addToast('Closed folder', 'info', 1500);
  };

  const handleRefreshFolder = () => {
    if (openedFolderPath) {
      loadFolderByPath(openedFolderPath, rootName);
      addToast('Refreshed file tree', 'info', 1500);
    } else {
      handleOpenFolder();
    }
  };

  const handleOpenFile = useCallback(async (node: FileNode) => {
    try {
      let content = '';
      const filepath = node.path || node.name;
      const filename = node.name;

      if (node.path) {
        content = await readFileFromDisk(node.path);
      } else if (node.handle) {
        const file = await node.handle.getFile();
        content = await file.text();
      }

      const alreadyOpen = useEditorStore.getState().tabs.some((t) => isSameFile(t, { filename, filepath }));
      addTab({ filename, content, filepath });
      if (alreadyOpen) {
        addToast(`Switched to "${filename}"`, 'info', 1800);
      } else {
        addToast(`Opened "${filename}"`, 'success', 1800);
      }
    } catch {
      addToast(`Failed to open "${node.name}"`, 'error');
    }
  }, [addTab, addToast]);

  const handleDropFiles = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        addTab({
          filename: file.name,
          content: ev.target?.result as string || '',
          filepath: file.name,
        });
        addToast(`Opened "${file.name}"`, 'success');
      };
      reader.readAsText(file);
    });
  }, [addTab, addToast]);

  return (
    <div
      className="sidebar"
      onDrop={handleDropFiles}
      onDragOver={(e) => e.preventDefault()}
    >
      {/* Header */}
      <div className="sidebar-header">
        <span className="sidebar-title">EXPLORER</span>
        <div className="sidebar-actions">
          <button
            className="sidebar-action-btn"
            onClick={() => addTab({ filename: 'Untitled' })}
            title="New File"
          >
            <Plus size={14} />
          </button>
          <button
            className="sidebar-action-btn"
            onClick={handleRefreshFolder}
            title={openedFolderPath ? "Refresh Folder" : "Open Folder"}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
          {tree.length > 0 && (
            <button
              className="sidebar-action-btn"
              onClick={handleCloseFolder}
              title="Close Folder"
            >
              <FolderX size={14} />
            </button>
          )}
          <button
            className="sidebar-action-btn"
            onClick={toggleSidebar}
            title="Close Explorer"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* File Tree */}
      <div className="sidebar-tree">
        {tree.length === 0 ? (
          <div className="sidebar-empty">
            <FolderOpen size={32} className="sidebar-empty-icon" />
            <p>No folder opened</p>
            <button className="sidebar-open-btn" onClick={handleOpenFolder}>
              Open Folder
            </button>
            <p className="sidebar-hint">
              Or drag & drop files here
            </p>
          </div>
        ) : (
          <>
            <div className="sidebar-root-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FolderOpen size={14} />
                <span>{rootName.toUpperCase()}</span>
              </div>
              <button 
                className="tool-btn" 
                onClick={handleOpenFolder}
                style={{ padding: '1px 6px', fontSize: 10, height: 18 }}
                title="Change Folder"
              >
                Change
              </button>
            </div>
            {loading ? (
              <div className="sidebar-loading">Loading...</div>
            ) : (
              tree.map((node) => (
                <FileItem key={node.path || node.name} node={node} depth={0} onOpenFile={handleOpenFile} />
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};
