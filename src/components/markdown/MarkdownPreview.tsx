// ============================================================
// Editron — Markdown Preview Component
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import { useEditorStore } from '../../store/editorStore';
import { Download, Eye } from 'lucide-react';

// Initialize markdown-it with syntax highlighting
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
        return `<pre class="hljs"><code class="language-${lang}">${highlighted}</code></pre>`;
      } catch {}
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  },
});

// Enable task lists
md.core.ruler.push('task_list', (state) => {
  state.tokens.forEach((blockToken) => {
    if (blockToken.type !== 'inline') return;
    blockToken.children?.forEach((token, idx, arr) => {
      if (token.type !== 'text') return;
      const match = token.content.match(/^\[( |x|X)\] /);
      if (match) {
        const checked = match[1].toLowerCase() === 'x';
        token.content = token.content.slice(match[0].length);
        arr.splice(idx, 0, Object.assign(new state.Token('html_inline', '', 0), {
          content: `<input type="checkbox" disabled${checked ? ' checked' : ''} style="margin-right:6px">`,
        }));
      }
    });
  });
});

interface MarkdownPreviewProps {
  style?: React.CSSProperties;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ style }) => {
  const activeTab = useEditorStore((s) => s.getActiveTab());
  const [html, setHtml] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab?.language === 'markdown' || activeTab?.filename.endsWith('.md')) {
      try {
        setHtml(md.render(activeTab.content || ''));
      } catch {
        setHtml('<p style="color:var(--error)">Error rendering markdown</p>');
      }
    } else {
      setHtml(`<div style="padding:24px;color:var(--text-muted);text-align:center;font-size:14px">
        <div style="font-size:48px;margin-bottom:12px">📝</div>
        <div>Open or switch to a <strong>.md</strong> file for Markdown preview</div>
      </div>`);
    }
  }, [activeTab?.content, activeTab?.language, activeTab?.filename]);

  const exportHtml = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${activeTab?.filename || 'Export'}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.7; color: #1f2937; }
    code { background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-family: 'Fira Code', monospace; }
    pre { background: #1e1e2e; color: #cdd6f4; padding: 16px; border-radius: 8px; overflow-x: auto; }
    blockquote { border-left: 4px solid #3b82f6; padding: 4px 16px; background: #eff6ff; margin: 1em 0; }
    table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #e5e7eb; padding: 8px 12px; }
    th { background: #f9fafb; }
  </style>
</head>
<body>${html}</body>
</html>`;
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (activeTab?.filename?.replace('.md', '') || 'export') + '.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, borderLeft: '1px solid var(--border)', ...style }}>
      {/* Preview header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 34, padding: '0 12px',
        background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)',
        fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.6px', flexShrink: 0,
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Eye size={12} /> Preview
        </span>
        <button
          onClick={exportHtml}
          title="Export as HTML"
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'none', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '2px 8px',
            fontSize: 11, color: 'var(--text-secondary)', cursor: 'pointer',
          }}
        >
          <Download size={11} /> Export HTML
        </button>
      </div>

      {/* Rendered preview */}
      <div
        ref={previewRef}
        className="markdown-preview"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};
