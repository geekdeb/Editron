// ============================================================
// Editron — Tools Panel (Right Sidebar)
// ============================================================

import React from 'react';
import {
  Code2, Key, Hash, Link, FileJson, FileCode, Search,
  Clock, Globe, X, ChevronRight
} from 'lucide-react';
import { useUIStore, type ToolType } from '../../store/uiStore';
import { Base64Tool } from './Base64Tool';
import { JwtTool } from './JwtTool';
import { HashTool } from './HashTool';
import { UrlTool } from './UrlTool';
import { JsonFormatter, XmlFormatter, YamlFormatter } from './Formatters';
import { RegexTester } from './RegexTester';
import { TimestampTool, UnicodeTool } from './UtilityTools';

const TOOLS: Array<{ id: ToolType; label: string; icon: React.ReactNode; description: string }> = [
  { id: 'base64',    label: 'Base64',     icon: <Code2 size={14} />,   description: 'Encode / Decode' },
  { id: 'url',       label: 'URL / Text', icon: <Link size={14} />,    description: 'Encode / Decode' },
  { id: 'jwt',       label: 'JWT',        icon: <Key size={14} />,     description: 'Decode & Inspect' },
  { id: 'hash',      label: 'Hash',       icon: <Hash size={14} />,    description: 'MD5 / SHA' },
  { id: 'json',      label: 'JSON',       icon: <FileJson size={14} />,description: 'Format / Validate' },
  { id: 'xml',       label: 'XML',        icon: <FileCode size={14} />,description: 'Format / Validate' },
  { id: 'yaml',      label: 'YAML',       icon: <FileCode size={14} />,description: 'Format / Validate' },
  { id: 'regex',     label: 'Regex',      icon: <Search size={14} />,  description: 'Test Patterns' },
  { id: 'timestamp', label: 'Timestamp',  icon: <Clock size={14} />,   description: 'Unix to DateTime' },
  { id: 'unicode',   label: 'Unicode',    icon: <Globe size={14} />,   description: 'Inspect Chars' },
];

export const ToolsPanel: React.FC = () => {
  const { activeTool, setActiveTool, toggleToolsPanel } = useUIStore();

  const renderTool = () => {
    switch (activeTool) {
      case 'base64':    return <Base64Tool />;
      case 'url':       return <UrlTool />;
      case 'jwt':       return <JwtTool />;
      case 'hash':      return <HashTool />;
      case 'json':      return <JsonFormatter />;
      case 'xml':       return <XmlFormatter />;
      case 'yaml':      return <YamlFormatter />;
      case 'regex':     return <RegexTester />;
      case 'timestamp': return <TimestampTool />;
      case 'unicode':   return <UnicodeTool />;
      default:          return null;
    }
  };

  return (
    <div className="tools-panel">
      <div className="tools-panel-header">
        <span>Tools</span>
        <button
          onClick={toggleToolsPanel}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
        >
          <X size={14} />
        </button>
      </div>

      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 4, padding: '8px 10px',
        borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
            title={tool.description}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 8px', fontSize: 11, fontWeight: 500,
              fontFamily: 'inherit', cursor: 'pointer',
              borderRadius: 'var(--radius-sm)',
              background: activeTool === tool.id ? 'var(--accent)' : 'var(--bg-tertiary)',
              color: activeTool === tool.id ? 'white' : 'var(--text-secondary)',
              border: `1px solid ${activeTool === tool.id ? 'var(--accent)' : 'var(--border)'}`,
              transition: 'all var(--transition-fast)',
            }}
          >
            {tool.icon}
            {tool.label}
          </button>
        ))}
      </div>

      <div className="tools-panel-content">
        {activeTool ? (
          renderTool()
        ) : (
          <div style={{ padding: '20px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔧</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>Select a Tool</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Choose from Base64, JWT, Hash,<br />
              Formatters, Regex, and more
            </div>
            <div style={{ marginTop: 20, textAlign: 'left' }}>
              {TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '8px 10px', background: 'none', border: 'none',
                    borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                    color: 'var(--text-primary)', fontFamily: 'inherit',
                    transition: 'background var(--transition-fast)',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <span style={{ color: 'var(--accent)' }}>{tool.icon}</span>
                  <span>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{tool.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tool.description}</div>
                  </span>
                  <ChevronRight size={12} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
