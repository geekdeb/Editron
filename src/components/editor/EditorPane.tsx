// ============================================================
// Editron — Editor Pane (CodeMirror 6 Wrapper)
// ============================================================

import React, { useEffect, useRef, useCallback } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, rectangularSelection, crosshairCursor, highlightSpecialChars, dropCursor } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { foldGutter, indentOnInput, bracketMatching, foldKeymap, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { lintKeymap } from '@codemirror/lint';

// Language imports
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';
import { markdown } from '@codemirror/lang-markdown';
import { sql } from '@codemirror/lang-sql';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { rust } from '@codemirror/lang-rust';
import { yaml } from '@codemirror/lang-yaml';

import { useEditorStore } from '../../store/editorStore';
import { useUIStore } from '../../store/uiStore';

// ── Editron Dark Theme for CodeMirror ─────────────────────────
import { HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';

const editronHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: '#bb9af7' },
  { tag: tags.operator, color: '#89ddff' },
  { tag: tags.special(tags.variableName), color: '#c0caf5' },
  { tag: tags.typeName, color: '#2ac3de' },
  { tag: tags.atom, color: '#ff9e64' },
  { tag: tags.number, color: '#ff9e64' },
  { tag: tags.definition(tags.variableName), color: '#7dcfff' },
  { tag: tags.string, color: '#9ece6a' },
  { tag: tags.special(tags.string), color: '#9ece6a' },
  { tag: tags.comment, color: '#565f89', fontStyle: 'italic' },
  { tag: tags.variableName, color: '#c0caf5' },
  { tag: tags.tagName, color: '#f7768e' },
  { tag: tags.bracket, color: '#a9b1d6' },
  { tag: tags.meta, color: '#7aa2f7' },
  { tag: tags.link, color: '#7aa2f7', textDecoration: 'underline' },
  { tag: tags.heading, color: '#7aa2f7', fontWeight: 'bold' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strong, fontWeight: 'bold' },
  { tag: tags.strikethrough, textDecoration: 'line-through' },
  { tag: tags.bool, color: '#ff9e64' },
  { tag: tags.attributeName, color: '#7dcfff' },
  { tag: tags.attributeValue, color: '#9ece6a' },
  { tag: tags.propertyName, color: '#7aa2f7' },
  { tag: tags.function(tags.variableName), color: '#7aa2f7' },
  { tag: tags.className, color: '#2ac3de' },
  { tag: tags.regexp, color: '#f7768e' },
  { tag: tags.self, color: '#f7768e' },
  { tag: tags.null, color: '#ff9e64' },
]);

const editronTheme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--editor-bg)',
    color: 'var(--text-primary)',
  },
  '.cm-content': {
    caretColor: 'var(--editor-cursor)',
    fontFamily: 'var(--font-mono)',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--editor-cursor)',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: 'var(--editor-selection)',
  },
  '.cm-activeLine': {
    backgroundColor: 'var(--editor-line-active)',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--editor-gutter)',
    color: 'var(--line-number)',
    border: 'none',
    borderRight: '1px solid var(--border)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'var(--editor-line-active)',
    color: 'var(--line-number-active)',
  },
  '.cm-foldPlaceholder': {
    backgroundColor: 'var(--accent-muted)',
    color: 'var(--accent)',
    border: 'none',
    padding: '0 6px',
    borderRadius: '3px',
  },
  '.cm-tooltip': {
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
  },
  '.cm-tooltip-autocomplete': {
    '& > ul > li': {
      padding: '4px 8px',
    },
    '& > ul > li[aria-selected]': {
      backgroundColor: 'var(--bg-hover)',
      color: 'var(--text-bright)',
    },
  },
  '.cm-searchMatch': {
    backgroundColor: 'var(--warning-muted)',
    outline: '1px solid var(--warning)',
    borderRadius: '2px',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: 'var(--accent-muted)',
    outline: '1px solid var(--accent)',
  },
  '.cm-matchingBracket': {
    backgroundColor: 'var(--accent-muted)',
    outline: '1px solid var(--accent)',
  },
});

// ── Language support mapping ──────────────────────────────────
function getLanguageExtension(lang: string) {
  switch (lang) {
    case 'javascript':
    case 'typescript':
      return javascript({ jsx: true, typescript: lang === 'typescript' });
    case 'python': return python();
    case 'html': return html();
    case 'css': return css();
    case 'json': return json();
    case 'xml': return xml();
    case 'markdown': return markdown();
    case 'sql': return sql();
    case 'java': return java();
    case 'c':
    case 'cpp': return cpp();
    case 'rust': return rust();
    case 'yaml': return yaml();
    default: return [];
  }
}

interface EditorPaneProps {
  tabId: string;
}

export const EditorPane: React.FC<EditorPaneProps> = ({ tabId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const isInternalUpdate = useRef(false);

  const tab = useEditorStore((s) => s.tabs.find((t) => t.id === tabId));
  const updateTab = useEditorStore((s) => s.updateTab);
  const { wordWrap, lineNumbers: showLineNumbers } = useUIStore();

  const handleUpdate = useCallback(
    (update: { state: EditorState; docChanged: boolean }) => {
      if (isInternalUpdate.current) return;

      const pos = update.state.selection.main.head;
      const line = update.state.doc.lineAt(pos);

      updateTab(tabId, {
        cursorLine: line.number,
        cursorCol: pos - line.from + 1,
      });

      if (update.docChanged) {
        updateTab(tabId, {
          content: update.state.doc.toString(),
          isDirty: true,
        });
      }
    },
    [tabId, updateTab]
  );

  // Create editor
  useEffect(() => {
    if (!containerRef.current || !tab) return;

    const extensions = [
      // Core
      editronTheme,
      syntaxHighlighting(editronHighlight),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      history(),
      drawSelection(),
      dropCursor(),
      rectangularSelection(),
      crosshairCursor(),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      highlightSelectionMatches(),
      highlightSpecialChars(),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      foldGutter(),

      // Keymaps
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap,
        ...lintKeymap,
        indentWithTab,
      ]),

      // Update listener
      EditorView.updateListener.of((update) => {
        handleUpdate(update);
      }),

      // Line numbers
      ...(showLineNumbers ? [lineNumbers()] : []),

      // Word wrap
      ...(wordWrap ? [EditorView.lineWrapping] : []),

      // Language
      getLanguageExtension(tab.language),
    ];

    const state = EditorState.create({
      doc: tab.content,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Only recreate when tab ID or settings change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabId, tab?.language, wordWrap, showLineNumbers]);

  // Sync external content changes (e.g., from formatters)
  useEffect(() => {
    const view = viewRef.current;
    if (!view || !tab) return;

    const currentContent = view.state.doc.toString();
    if (currentContent !== tab.content) {
      isInternalUpdate.current = true;
      view.dispatch({
        changes: {
          from: 0,
          to: currentContent.length,
          insert: tab.content,
        },
      });
      isInternalUpdate.current = false;
    }
  }, [tab?.content]);

  if (!tab) return null;

  return (
    <div
      ref={containerRef}
      style={{ flex: 1, overflow: 'hidden' }}
    />
  );
};
