// ============================================================
// Editron — Editor State Store (Zustand)
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EditorTab {
  id: string;
  filename: string;
  filepath: string | null; // null = unsaved
  content: string;
  language: string;
  isDirty: boolean;
  encoding: string;
  lineEnding: 'lf' | 'crlf';
  cursorLine: number;
  cursorCol: number;
  scrollTop: number;
}

interface EditorState {
  tabs: EditorTab[];
  activeTabId: string | null;
  
  // Actions
  addTab: (tab: Partial<EditorTab> & { filename: string }) => string;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<EditorTab>) => void;
  getActiveTab: () => EditorTab | undefined;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (id: string) => void;
}

let tabCounter = 0;

const createDefaultTab = (overrides: Partial<EditorTab> & { filename: string }): EditorTab => ({
  id: `tab-${++tabCounter}-${Date.now()}`,
  filepath: null,
  content: '',
  language: detectLanguage(overrides.filename),
  isDirty: false,
  encoding: 'UTF-8',
  lineEnding: 'lf',
  cursorLine: 1,
  cursorCol: 1,
  scrollTop: 0,
  ...overrides,
});

export function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    'js': 'javascript', 'jsx': 'javascript', 'mjs': 'javascript',
    'ts': 'typescript', 'tsx': 'typescript',
    'py': 'python', 'pyw': 'python',
    'rs': 'rust',
    'go': 'go',
    'java': 'java',
    'c': 'c', 'h': 'c',
    'cpp': 'cpp', 'cc': 'cpp', 'cxx': 'cpp', 'hpp': 'cpp',
    'html': 'html', 'htm': 'html',
    'css': 'css', 'scss': 'css', 'less': 'css',
    'json': 'json', 'jsonc': 'json',
    'xml': 'xml', 'svg': 'xml', 'xsl': 'xml',
    'yaml': 'yaml', 'yml': 'yaml',
    'md': 'markdown', 'mdx': 'markdown',
    'sql': 'sql',
    'sh': 'shell', 'bash': 'shell', 'zsh': 'shell',
    'ps1': 'powershell',
    'bat': 'batch', 'cmd': 'batch',
    'toml': 'toml',
    'ini': 'ini', 'cfg': 'ini',
    'env': 'dotenv',
    'log': 'plaintext',
    'txt': 'plaintext',
    'csv': 'plaintext',
  };
  return map[ext] || 'plaintext';
}

export function normalizePath(p?: string | null): string {
  if (!p) return '';
  return p.trim().replace(/\\/g, '/').toLowerCase();
}

export function isSameFile(
  tabA: { filename: string; filepath?: string | null },
  tabB: { filename: string; filepath?: string | null }
): boolean {
  if (!tabA.filepath && !tabB.filepath) {
    return false; // Untitled / unsaved buffers are kept separate
  }

  const pA = normalizePath(tabA.filepath || tabA.filename);
  const pB = normalizePath(tabB.filepath || tabB.filename);

  if (pA === pB) return true;

  // Check if one is a suffix of the other (e.g. 'abc.txt' vs 'c:/folder/abc.txt')
  if (pA.endsWith('/' + pB) || pB.endsWith('/' + pA)) {
    return true;
  }

  // Filename match when at least one path has no directory separators
  const nameA = (tabA.filename || pA.split('/').pop() || '').toLowerCase();
  const nameB = (tabB.filename || pB.split('/').pop() || '').toLowerCase();
  if (nameA === nameB && nameA.length > 0 && nameA !== 'untitled') {
    if (!pA.includes('/') || !pB.includes('/')) {
      return true;
    }
  }

  return false;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTabId: null,

      addTab: (tabData) => {
    const isNewUntitled = !tabData.filepath && tabData.filename === 'Untitled' && (!tabData.content || tabData.content === '');

    if (!isNewUntitled) {
      const state = get();
      // Check if file is already open in an existing tab
      const existing = state.tabs.find((t) => isSameFile(t, tabData));
      if (existing) {
        // Switch to the existing tab
        if (!existing.isDirty && tabData.content !== undefined && tabData.content !== existing.content) {
          set((s) => ({
            activeTabId: existing.id,
            tabs: s.tabs.map((t) =>
              t.id === existing.id
                ? {
                    ...t,
                    content: tabData.content!,
                    filepath: tabData.filepath || t.filepath,
                  }
                : t
            ),
          }));
        } else {
          set({ activeTabId: existing.id });
        }
        return existing.id;
      }

      // If the only open tab is an untouched blank "Untitled" buffer, replace it with this opened file
      const isOnlyBlankUntitled =
        state.tabs.length === 1 &&
        !state.tabs[0].isDirty &&
        !state.tabs[0].filepath &&
        state.tabs[0].filename === 'Untitled' &&
        state.tabs[0].content === '';

      if (isOnlyBlankUntitled) {
        const tab = createDefaultTab({ ...tabData, id: state.tabs[0].id });
        set({
          tabs: [tab],
          activeTabId: tab.id,
        });
        return tab.id;
      }
    }

    const tab = createDefaultTab(tabData);
    set((state) => ({
      tabs: [...state.tabs, tab],
      activeTabId: tab.id,
    }));
    return tab.id;
  },

  removeTab: (id) => {
    set((state) => {
      const idx = state.tabs.findIndex((t) => t.id === id);
      const newTabs = state.tabs.filter((t) => t.id !== id);
      let newActiveId = state.activeTabId;
      
      if (state.activeTabId === id) {
        if (newTabs.length > 0) {
          const newIdx = Math.min(idx, newTabs.length - 1);
          newActiveId = newTabs[newIdx].id;
        } else {
          newActiveId = null;
        }
      }
      
      return { tabs: newTabs, activeTabId: newActiveId };
    });
  },

  setActiveTab: (id) => set({ activeTabId: id }),

  updateTab: (id, updates) => {
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  },

  getActiveTab: () => {
    const state = get();
    return state.tabs.find((t) => t.id === state.activeTabId);
  },

  reorderTabs: (fromIndex, toIndex) => {
    set((state) => {
      const newTabs = [...state.tabs];
      const [moved] = newTabs.splice(fromIndex, 1);
      newTabs.splice(toIndex, 0, moved);
      return { tabs: newTabs };
    });
  },

  closeAllTabs: () => set({ tabs: [], activeTabId: null }),

  closeOtherTabs: (id) => {
    set((state) => ({
      tabs: state.tabs.filter((t) => t.id === id),
      activeTabId: id,
    }));
  },
}),
    {
      name: 'editron_open_tabs_state',
      partialize: (state) => ({
        tabs: state.tabs,
        activeTabId: state.activeTabId,
      }),
    }
  )
);
