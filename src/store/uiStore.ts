// ============================================================
// Editron — UI State Store
// ============================================================

import { create } from 'zustand';

export type ToolType = 'base64' | 'jwt' | 'hash' | 'url' | 'json' | 'xml' | 'yaml' | 'regex' | 'timestamp' | 'unicode' | 'color' | null;
export type PanelSide = 'left' | 'right';
export type ThemeName = 'obsidian-dark' | 'frost-light';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface UIState {
  // Panels
  sidebarVisible: boolean;
  toolsPanelVisible: boolean;
  activeTool: ToolType;

  // View
  theme: ThemeName;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  zenMode: boolean;
  markdownPreview: boolean;

  // Dialogs
  showSettings: boolean;
  showCommandPalette: boolean;
  showFindReplace: boolean;
  showEmojiPicker: boolean;

  // Toasts
  toasts: Toast[];

  // Recent files
  recentFiles: string[];

  // Actions
  toggleSidebar: () => void;
  toggleToolsPanel: () => void;
  setActiveTool: (tool: ToolType) => void;
  setTheme: (theme: ThemeName) => void;
  toggleWordWrap: () => void;
  toggleMinimap: () => void;
  toggleLineNumbers: () => void;
  toggleZenMode: () => void;
  toggleMarkdownPreview: () => void;
  setShowSettings: (show: boolean) => void;
  setShowCommandPalette: (show: boolean) => void;
  setShowFindReplace: (show: boolean) => void;
  setShowEmojiPicker: (show: boolean) => void;
  addToast: (message: string, type?: Toast['type'], duration?: number) => void;
  removeToast: (id: string) => void;
  addRecentFile: (filepath: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  sidebarVisible: false,
  toolsPanelVisible: false,
  activeTool: null,
  theme: 'obsidian-dark',
  wordWrap: false,
  minimap: false,
  lineNumbers: true,
  zenMode: false,
  markdownPreview: false,
  showSettings: false,
  showCommandPalette: false,
  showFindReplace: false,
  showEmojiPicker: false,
  toasts: [],
  recentFiles: [],

  // Actions
  toggleSidebar: () => set((s) => ({ sidebarVisible: !s.sidebarVisible })),
  toggleToolsPanel: () => set((s) => ({ toolsPanelVisible: !s.toolsPanelVisible })),
  
  setActiveTool: (tool) => set((s) => ({ 
    activeTool: tool, 
    toolsPanelVisible: tool !== null ? true : s.toolsPanelVisible 
  })),
  
  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },
  
  toggleWordWrap: () => set((s) => ({ wordWrap: !s.wordWrap })),
  toggleMinimap: () => set((s) => ({ minimap: !s.minimap })),
  toggleLineNumbers: () => set((s) => ({ lineNumbers: !s.lineNumbers })),
  
  toggleZenMode: () => set((s) => {
    const entering = !s.zenMode;
    return {
      zenMode: entering,
      sidebarVisible: entering ? false : s.sidebarVisible,
      toolsPanelVisible: entering ? false : s.toolsPanelVisible,
    };
  }),
  
  toggleMarkdownPreview: () => set((s) => ({ markdownPreview: !s.markdownPreview })),
  setShowSettings: (show) => set({ showSettings: show }),
  setShowCommandPalette: (show) => set({ showCommandPalette: show }),
  setShowFindReplace: (show) => set({ showFindReplace: show }),
  setShowEmojiPicker: (show) => set({ showEmojiPicker: show }),
  
  addToast: (message, type = 'info', duration = 3000) => {
    const id = `toast-${Date.now()}`;
    set((s) => ({ toasts: [...s.toasts, { id, message, type, duration }] }));
    if (duration > 0) {
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      }, duration);
    }
  },
  
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  
  addRecentFile: (filepath) => {
    set((s) => {
      const filtered = s.recentFiles.filter((f) => f !== filepath);
      return { recentFiles: [filepath, ...filtered].slice(0, 25) };
    });
  },
}));
