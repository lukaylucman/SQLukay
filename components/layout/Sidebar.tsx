"use client";
import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Database, Server, Terminal, Settings, DatabaseBackup, LogOut, ChevronDown, ChevronRight, Table2, LayoutTemplate, Zap, RefreshCw, BookOpen, Download } from 'lucide-react';
import { clsx } from 'clsx';
import { v4 as uuidv4 } from 'uuid';

export default function Sidebar() {
  const { sidebarOpen, addTab, connectionToken, isDemoMode } = useAppStore();
  const [databases, setDatabases] = useState<string[]>([]);
  const [expandedDbs, setExpandedDbs] = useState<Record<string, boolean>>({});
  const [dbTables, setDbTables] = useState<Record<string, string[]>>({});
  const [downloadingDb, setDownloadingDb] = useState<string | null>(null);
  
  const loadDatabases = async () => {
    try {
      const res = await fetch('https://sqlukay.vercel.app/api/db/explore', {
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
        const res = await fetch('https://sqlukay.vercel.app/api/db/explore', {
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

  const downloadDatabase = async (e: React.MouseEvent, db: string) => {
    e.stopPropagation();
    setDownloadingDb(db);
    try {
      const resTables = await fetch('https://sqlukay.vercel.app/api/db/explore', {
        method: 'POST',
        body: JSON.stringify({ token: connectionToken, isDemo: isDemoMode, action: 'listTables', database: db })
      });
      const dataTables = await resTables.json();
      
      if (!dataTables.success) throw new Error(dataTables.error || "Failed to fetch tables");
      const tables = dataTables.data;
      
      let sqlDump = `-- SQLukay Database Dump\n-- Database: ${db}\n\n`;
      
      for (const table of tables) {
        const resData = await fetch('https://sqlukay.vercel.app/api/db/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: connectionToken, isDemo: isDemoMode, query: `SELECT * FROM \`${db}\`.\`${table}\`` })
        });
        const rowData = await resData.json();
        
        if (rowData.success && rowData.data && rowData.data.length > 0) {
          const rows = rowData.data;
          const headers = Object.keys(rows[0]);
          
          sqlDump += `-- Table structure and data for \`${table}\`\n`;
          
          rows.forEach((row: any) => {
            const values = headers.map(header => {
              const val = row[header];
              if (val === null || val === undefined) return 'NULL';
              if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
              if (typeof val === 'number' || typeof val === 'boolean') return val;
              return `'${String(val).replace(/'/g, "''")}'`;
            });
            sqlDump += `INSERT INTO \`${table}\` (${headers.map(h => `\`${h}\``).join(', ')}) VALUES (${values.join(', ')});\n`;
          });
          sqlDump += '\n';
        }
      }
      
      const blob = new Blob([sqlDump], { type: 'text/sql;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${db}_backup.sql`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Failed to download database backup.");
    } finally {
      setDownloadingDb(null);
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
                className="flex items-center justify-between px-1 py-1 hover:bg-[#37373d] rounded cursor-pointer group"
                onClick={() => toggleDb(db)}
              >
                <div className="flex items-center space-x-1 overflow-hidden">
                  {expandedDbs[db] ? <ChevronDown size={14} className="shrink-0" /> : <ChevronRight size={14} className="shrink-0" />}
                  <Database size={14} className="text-orange-400 shrink-0" />
                  <span className="truncate">{db}</span>
                </div>
                <button onClick={(e) => downloadDatabase(e, db)} className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" title="Download DB Backup">
                  <Download size={14} className={downloadingDb === db ? "animate-bounce text-blue-400" : ""} />
                </button>
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