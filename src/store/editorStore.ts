// ============================================================
// Editron — Editor State Store (Zustand)
// ============================================================

import { create } from 'zustand';

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
  filename: overrides.filename,
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

export const useEditorStore = create<EditorState>((set, get) => ({
  tabs: [],
  activeTabId: null,

  addTab: (tabData) => {
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
}));
