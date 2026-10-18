// ============================================================
// Editron — Sidebar (File Explorer)
// ============================================================

import React, { useState, useCallback } from 'react';
import {
  FolderOpen, FileText, FileCode, FileJson, FileType,
  ChevronRight, ChevronDown, Plus, RefreshCw, X
} from 'lucide-react';
import { useEditorStore, detectLanguage } from '../../store/editorStore';
import { useUIStore } from '../../store/uiStore';

interface FileNode {
  name: string;
  type: 'file' | 'dir';
  children?: FileNode[];
  handle?: FileSystemFileHandle;
}

const getFileIcon = (name: string) => {
  const lang = detectLanguage(name);
  if (lang === 'json') return <FileJson size={14} />;
  if (['javascript', 'typescript', 'python', 'rust', 'java', 'cpp', 'c'].includes(lang)) return <FileCode size={14} />;
  if (lang === 'markdown') return <FileType size={14} />;
  return <FileText size={14} />;
};

const FileItem: React.FC<{
  node: FileNode;
  depth: number;
  onOpenFile: (handle: FileSystemFileHandle, name: string) => void;
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
          <FileItem key={child.name} node={child} depth={depth + 1} onOpenFile={onOpenFile} />
        ))}
      </div>
    );
  }

  return (
    <button
      className="sidebar-file-item"
      style={{ paddingLeft: `${8 + depth * 14}px` }}
      onClick={() => node.handle && onOpenFile(node.handle, node.name)}
      title={node.name}
    >
      <span className="sidebar-file-icon">{getFileIcon(node.name)}</span>
      <span className="sidebar-filename">{node.name}</span>
    </button>
  );
};

export const Sidebar: React.FC = () => {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [rootName, setRootName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { addTab } = useEditorStore();
  const { toggleSidebar, addToast } = useUIStore();

  const handleOpenFolder = async () => {
    try {
      // @ts-ignore — File System Access API
      const dirHandle = await window.showDirectoryPicker?.();
      if (!dirHandle) {
        addToast('File System Access API not supported in this browser', 'warning');
        return;
      }
      setLoading(true);
      setRootName(dirHandle.name);

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

  const handleOpenFile = useCallback(async (handle: FileSystemFileHandle, name: string) => {
    try {
      const file = await handle.getFile();
      const content = await file.text();
      addTab({ filename: name, content, filepath: name });
      addToast(`Opened "${name}"`, 'success');
    } catch {
      addToast(`Failed to open "${name}"`, 'error');
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
            onClick={handleOpenFolder}
            title="Open Folder"
          >
            <RefreshCw size={14} />
          </button>
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
            <div className="sidebar-root-label">
              <FolderOpen size={14} />
              <span>{rootName.toUpperCase()}</span>
            </div>
            {loading ? (
              <div className="sidebar-loading">Loading...</div>
            ) : (
              tree.map((node) => (
                <FileItem key={node.name} node={node} depth={0} onOpenFile={handleOpenFile} />
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};
