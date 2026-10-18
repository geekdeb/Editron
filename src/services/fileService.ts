// ============================================================
// Editron — File Service (Tauri IPC + Browser Fallbacks)
// ============================================================

import { invoke } from '@tauri-apps/api/core';
import { open as openDialog, save as saveDialog } from '@tauri-apps/plugin-dialog';
import { useUIStore } from '../store/uiStore';

export interface OpenedFileResult {
  filepath: string | null;
  filename: string;
  content: string;
}

/** Check if running inside the Tauri native desktop wrapper */
export function isTauriEnv(): boolean {
  return typeof window !== 'undefined' && Boolean((window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);
}

/** Extract filename from a path (handles Windows and POSIX paths) */
export function getFilenameFromPath(path: string): string {
  const parts = path.split(/[/\\]/);
  return parts.pop() || path;
}

/** Open one or more files using native dialog or browser input fallback */
export async function openFiles(): Promise<OpenedFileResult[]> {
  if (isTauriEnv()) {
    try {
      const selected = await openDialog({
        multiple: true,
        filters: [
          { name: 'All Files', extensions: ['*'] },
          { name: 'Text & Code', extensions: ['txt', 'md', 'js', 'ts', 'jsx', 'tsx', 'py', 'json', 'yaml', 'yml', 'xml', 'html', 'css', 'rust', 'rs', 'c', 'cpp', 'h', 'sql', 'toml', 'env', 'log'] },
          { name: 'Markdown', extensions: ['md', 'markdown'] },
          { name: 'JSON', extensions: ['json'] },
        ],
      });

      if (!selected) return [];

      const paths = Array.isArray(selected) ? selected : [selected];
      const results: OpenedFileResult[] = [];

      for (const p of paths) {
        try {
          const content = await invoke<string>('read_file', { path: p });
          results.push({
            filepath: p,
            filename: getFilenameFromPath(p),
            content,
          });
        } catch (err) {
          console.error(`Failed to read file ${p}:`, err);
        }
      }

      return results;
    } catch (err) {
      console.warn('Native openDialog failed, falling back to browser picker', err);
    }
  }

  // Browser Fallback via hidden input or File System Access API
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = async () => {
      const files = Array.from(input.files || []);
      const results: OpenedFileResult[] = [];
      for (const f of files) {
        const text = await f.text();
        results.push({
          filepath: null,
          filename: f.name,
          content: text,
        });
      }
      resolve(results);
    };
    input.oncancel = () => resolve([]);
    input.click();
  });
}

/** Get the default save folder ("datafiles" inside Editron folder) */
export async function getDefaultSaveFolder(): Promise<string> {
  if (isTauriEnv()) {
    try {
      const folder = await invoke<string>('get_default_save_folder');
      if (folder) return folder;
    } catch (err) {
      console.warn('Failed to get default save folder from backend:', err);
    }
  }
  return '%UserProfile%\\Documents\\Editron\\datafiles';
}

/** Open a native folder picker dialog */
export async function pickDirectory(defaultPath?: string): Promise<string | null> {
  if (isTauriEnv()) {
    try {
      const selected = await openDialog({
        directory: true,
        multiple: false,
        title: 'Select Default Save Folder',
        defaultPath: defaultPath || undefined,
      });
      if (selected && typeof selected === 'string') {
        return selected;
      }
    } catch (err) {
      console.warn('Native open folder dialog failed:', err);
    }
  }
  return null;
}

/** Save a file to disk (either to existing filepath or prompts Save As) */
export async function saveFile(
  filepath: string | null,
  filename: string,
  content: string
): Promise<{ success: boolean; filepath?: string; filename?: string; error?: string }> {
  if (isTauriEnv()) {
    try {
      let targetPath = filepath;

      if (!targetPath) {
        // Construct default path using configured default save folder if available
        let saveAsDefault = filename;
        const defaultDir = useUIStore.getState().defaultSaveFolder;
        if (defaultDir) {
          const sep = defaultDir.includes('/') ? '/' : '\\';
          const trimmedDir = defaultDir.replace(/[/\\]+$/, '');
          saveAsDefault = `${trimmedDir}${sep}${filename}`;
        }

        const chosen = await saveDialog({
          defaultPath: saveAsDefault,
          filters: [
            { name: 'All Files', extensions: ['*'] },
            { name: 'Text & Code', extensions: ['txt', 'md', 'json', 'js', 'ts', 'jsx', 'tsx', 'py', 'yaml', 'yml', 'xml', 'html', 'css', 'sql', 'toml'] },
          ],
        });
        if (!chosen) return { success: false };
        targetPath = chosen;
      }

      await invoke('write_file', { path: targetPath, content });
      const finalFilename = getFilenameFromPath(targetPath);
      return { success: true, filepath: targetPath, filename: finalFilename };
    } catch (err) {
      return { success: false, error: (err as Error).message || String(err) };
    }
  }

  // Browser Fallback (Blob download)
  try {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return { success: true, filepath: filename, filename };
  } catch (err) {
    return { success: false, error: (err as Error).message || String(err) };
  }
}

/** Explicit Save As dialog */
export async function saveFileAs(
  defaultName: string,
  content: string
): Promise<{ success: boolean; filepath?: string; filename?: string; error?: string }> {
  return saveFile(null, defaultName, content);
}

export interface BackendFileEntry {
  name: string;
  path: string;
  is_dir: boolean;
  children?: BackendFileEntry[];
}

/** Read directory structure recursively from disk */
export async function readDirectoryTree(dirPath: string): Promise<BackendFileEntry[]> {
  if (isTauriEnv()) {
    try {
      const tree = await invoke<BackendFileEntry[]>('read_directory', { path: dirPath });
      return tree || [];
    } catch (err) {
      console.warn('Failed to read directory tree via Tauri:', err);
    }
  }
  return [];
}

/** Read a single file's content directly from disk */
export async function readFileFromDisk(filePath: string): Promise<string> {
  if (isTauriEnv()) {
    try {
      return await invoke<string>('read_file', { path: filePath });
    } catch (err) {
      console.warn('Failed to read file from disk:', err);
    }
  }
  return '';
}
