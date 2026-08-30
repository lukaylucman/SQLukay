"use client";
import React from 'react';
import { useAppStore } from '../../lib/store';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import Dashboard from '../database/Dashboard';
import Editor from '../editor/Editor';
import Terminal from '../terminal/Terminal';
import TableData from '../tables/TableData';
import SqlReference from '../reference/SqlReference';

export default function MainArea() {
  const { tabs, activeTabId, setActiveTabId, removeTab } = useAppStore();

  if (tabs.length === 0) {
    return (
      <div className="flex-1 bg-[#1e1e1e] flex items-center justify-center text-gray-500 flex-col">
        <div className="flex items-center space-x-3 mb-4 opacity-50">
          <img src="/logo-sqlukay.png" alt="SQLukay" className="w-12 h-12 grayscale object-contain" />
          <div className="text-3xl font-extrabold tracking-tight">SQLukay</div>
        </div>
        <p>Select a database object or open a new query to begin.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#1e1e1e] flex flex-col min-w-0">
      <div className="flex bg-[#252526] overflow-x-auto overflow-y-hidden border-b border-[#3c3c3c] no-scrollbar shrink-0">
        {tabs.map(tab => (
          <div 
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={clsx(
              "flex items-center h-9 px-4 border-r border-[#3c3c3c] cursor-pointer max-w-[200px] group transition-colors",
              activeTabId === tab.id ? "bg-[#1e1e1e] text-white border-t-2 border-t-blue-500" : "bg-[#2d2d2d] text-gray-400 hover:bg-[#333]"
            )}
          >
            <span className="truncate text-sm mr-2">{tab.title}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); removeTab(tab.id); }}
              className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[#444] rounded"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      
      <div className="flex-1 relative overflow-hidden">
        {tabs.map(tab => (
          <div 
            key={tab.id} 
            className={clsx(
              "absolute inset-0 bg-[#1e1e1e]",
              activeTabId === tab.id ? "z-10 block" : "z-0 hidden"
            )}
          >
            {tab.type === 'dashboard' && <Dashboard />}
            {tab.type === 'query' && <Editor tabId={tab.id} />}
            {tab.type === 'terminal' && <Terminal />}
            {tab.type === 'reference' && <SqlReference />}
            {tab.type === 'table' && <TableData database={tab.props.database} table={tab.props.table} />}
          </div>
        ))}
      </div>
    </div>
  );
}
