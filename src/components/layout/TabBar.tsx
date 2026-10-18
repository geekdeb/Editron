// ============================================================
// Editron — Tab Bar Component
// ============================================================

import React from 'react';
import { X, Plus, FileText, FileCode, FileJson, FileType } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';

const langIcons: Record<string, React.ReactNode> = {
  javascript: <FileCode size={14} />,
  typescript: <FileCode size={14} />,
  json: <FileJson size={14} />,
  markdown: <FileType size={14} />,
};

export const TabBar: React.FC = () => {
  const { tabs, activeTabId, setActiveTab, removeTab, addTab } = useEditorStore();

  const handleMiddleClick = (e: React.MouseEvent, id: string) => {
    if (e.button === 1) {
      e.preventDefault();
      removeTab(id);
    }
  };

  return (
    <div className="tabbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab ${tab.id === activeTabId ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
          onMouseDown={(e) => handleMiddleClick(e, tab.id)}
          title={tab.filepath || tab.filename}
        >
          <span className="tab-icon">
            {langIcons[tab.language] || <FileText size={14} />}
          </span>
          <span className="tab-label">{tab.filename}</span>
          {tab.isDirty && <span className="tab-dirty" />}
          <button
            className="tab-close"
            onClick={(e) => {
              e.stopPropagation();
              removeTab(tab.id);
            }}
            title="Close"
          >
            <X size={12} />
          </button>
        </button>
      ))}
      
      <button
        className="tab-new"
        onClick={() => addTab({ filename: 'Untitled' })}
        title="New Tab (Ctrl+N)"
      >
        <Plus size={14} />
      </button>
    </div>
  );
};
