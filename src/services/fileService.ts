// ============================================================
// Editron — File Service (Tauri IPC + Browser Fallbacks)
// ============================================================

import { invoke } from '@tauri-apps/api/core';
import { open as openDialog, save as saveDialog } from '@tauri-apps/plugin-dialog';

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

/** Save a file to disk (either to existing filepath or prompts Save As) */
export async function saveFile(
  filepath: string | null,
  filename: string,
  content: string
): Promise<{ success: boolean; filepath?: string; error?: string }> {
  if (isTauriEnv()) {
    try {
      let targetPath = filepath;

      if (!targetPath) {
        const chosen = await saveDialog({
          defaultPath: filename,
          filters: [
            { name: 'All Files', extensions: ['*'] },
            { name: 'Text', extensions: ['txt', 'md', 'json', 'js', 'ts'] },
          ],
        });
        if (!chosen) return { success: false };
        targetPath = chosen;
      }

      await invoke('write_file', { path: targetPath, content });
      return { success: true, filepath: targetPath };
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
    return { success: true, filepath: filename };
  } catch (err) {
    return { success: false, error: (err as Error).message || String(err) };
  }
}

/** Explicit Save As dialog */
export async function saveFileAs(
  defaultName: string,
  content: string
): Promise<{ success: boolean; filepath?: string; error?: string }> {
  return saveFile(null, defaultName, content);
}
