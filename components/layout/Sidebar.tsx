"use client";
import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Database, Server, Terminal, Settings, DatabaseBackup, LogOut, ChevronDown, ChevronRight, Table2, LayoutTemplate, Zap, RefreshCw, BookOpen } from 'lucide-react';
import { clsx } from 'clsx';
import { v4 as uuidv4 } from 'uuid';

export default function Sidebar() {
  const { sidebarOpen, addTab, connectionToken, isDemoMode } = useAppStore();
  const [databases, setDatabases] = useState<string[]>([]);
  const [expandedDbs, setExpandedDbs] = useState<Record<string, boolean>>({});
  const [dbTables, setDbTables] = useState<Record<string, string[]>>({});
  
  const loadDatabases = async () => {
    try {
      const res = await fetch('https://sqlukay.vercel.app//api/db/explore', {
        method: 'POST',
        body: JSON.stringify({ token: connectionToken, isDemo: isDemoMode, action: 'listDatabases' })
      });
      const data = await res.json();
      if (data.success) {
        setDatabases(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleDb = async (db: string) => {
    const isExpanded = !!expandedDbs[db];
    setExpandedDbs(prev => ({ ...prev, [db]: !isExpanded }));
    
    if (!isExpanded && !dbTables[db]) {
      try {
        const res = await fetch('https://sqlukay.vercel.app//api/db/explore', {
          method: 'POST',
          body: JSON.stringify({ token: connectionToken, isDemo: isDemoMode, action: 'listTables', database: db })
        });
        const data = await res.json();
        if (data.success) {
          setDbTables(prev => ({ ...prev, [db]: data.data }));
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  React.useEffect(() => {
    if (sidebarOpen) {
      loadDatabases();
    }
  }, [sidebarOpen, connectionToken, isDemoMode]);

  if (!sidebarOpen) return null;

  return (
    <div className="absolute inset-y-0 left-0 z-40 sm:relative w-64 bg-[#252526] border-r border-[#3c3c3c] flex flex-col h-full overflow-hidden shrink-0 select-none shadow-2xl sm:shadow-none">
      <div className="p-2 border-b border-[#3c3c3c] text-xs font-semibold uppercase tracking-wider text-gray-500 flex justify-between items-center">
        <span>Explorer</span>
        <button onClick={loadDatabases} className="hover:text-gray-300"><RefreshCw size={12} /></button>
      </div>
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 text-sm">
        <ul className="space-y-1">
           <li>
            <button onClick={() => addTab({ id: 'dashboard', type: 'dashboard', title: 'Dashboard' })} className="w-full flex items-center space-x-2 px-2 py-1 hover:bg-[#37373d] rounded text-left">
              <LayoutTemplate size={16} className="text-blue-400" />
              <span>Dashboard</span>
            </button>
          </li>
          <li>
            <button onClick={() => addTab({ id: `query-${uuidv4()}`, type: 'query', title: 'New Query' })} className="w-full flex items-center space-x-2 px-2 py-1 hover:bg-[#37373d] rounded text-left">
              <Zap size={16} className="text-yellow-400" />
              <span>New Query</span>
            </button>
          </li>
          <li>
            <button onClick={() => addTab({ id: 'terminal', type: 'terminal', title: 'Terminal' })} className="w-full flex items-center space-x-2 px-2 py-1 hover:bg-[#37373d] rounded text-left">
              <Terminal size={16} className="text-green-400" />
              <span>Terminal</span>
            </button>
          </li>
          <li>
            <button onClick={() => addTab({ id: 'reference', type: 'reference', title: 'Panduan SQL' })} className="w-full flex items-center space-x-2 px-2 py-1 hover:bg-[#37373d] rounded text-left">
              <BookOpen size={16} className="text-cyan-400" />
              <span>Modul SQL</span>
            </button>
          </li>
        </ul>

        <div className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 px-2">Databases</div>
        <ul className="space-y-1">
          {databases.map(db => (
            <li key={db}>
              <div 
                className="flex items-center space-x-1 px-1 py-1 hover:bg-[#37373d] rounded cursor-pointer"
                onClick={() => toggleDb(db)}
              >
                {expandedDbs[db] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <Database size={14} className="text-orange-400" />
                <span className="truncate">{db}</span>
              </div>
              {expandedDbs[db] && dbTables[db] && (
                <ul className="pl-6 space-y-1 mt-1">
                  {dbTables[db].map(table => (
                    <li key={table}>
                      <button 
                        onClick={() => {
                          useAppStore.getState().setActiveDatabase(db);
                          addTab({ id: `table-${db}-${table}`, type: 'table', title: table, props: { database: db, table } })
                        }}
                        className="w-full flex items-center space-x-2 px-2 py-1 hover:bg-[#37373d] rounded text-left"
                      >
                        <Table2 size={14} className="text-blue-300" />
                        <span className="truncate">{table}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
