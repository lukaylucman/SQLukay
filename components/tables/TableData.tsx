"use client";
import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../lib/store';
import { TableColumn } from '../../types';
import DataGrid from '../editor/DataGrid';
import { LayoutTemplate, Table2, Key, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';

export default function TableData({ database, table }: { database: string, table: string }) {
  const [activeTab, setActiveTab] = useState<'data' | 'structure'>('data');
  const [dataResult, setDataResult] = useState<any>(null);
  const [structure, setStructure] = useState<TableColumn[]>([]);
  const [loading, setLoading] = useState(false);
  const { connectionToken, isDemoMode } = useAppStore();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/db/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: connectionToken,
          isDemo: isDemoMode,
          query: `SELECT * FROM \`${database}\`.\`${table}\` LIMIT 100`
        })
      });
      const data = await res.json();
      setDataResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadStructure = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/db/explore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: connectionToken,
          isDemo: isDemoMode,
          action: 'getTableStructure',
          database,
          table
        })
      });
      const data = await res.json();
      if (data.success) {
        setStructure(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'data') loadData();
    else if (activeTab === 'structure') loadStructure();
  }, [activeTab, database, table]);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      <div className="flex items-center justify-between p-2 bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => setActiveTab('data')}
            className={clsx("px-3 py-1.5 rounded text-sm flex items-center space-x-2", activeTab === 'data' ? "bg-[#37373d] text-white" : "text-gray-400 hover:text-white")}
          >
            <Table2 size={16} />
            <span>Data</span>
          </button>
          <button 
            onClick={() => setActiveTab('structure')}
            className={clsx("px-3 py-1.5 rounded text-sm flex items-center space-x-2", activeTab === 'structure' ? "bg-[#37373d] text-white" : "text-gray-400 hover:text-white")}
          >
            <LayoutTemplate size={16} />
            <span>Structure</span>
          </button>
        </div>
        <button onClick={activeTab === 'data' ? loadData : loadStructure} className="p-1.5 text-gray-400 hover:text-white hover:bg-[#333] rounded">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
      
      <div className="flex-1 overflow-hidden relative">
        {loading && !dataResult && !structure.length && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e] bg-opacity-50 z-10">
            <span className="text-gray-400">Loading...</span>
          </div>
        )}
        
        {activeTab === 'data' && dataResult && (
           dataResult.error ? (
             <div className="p-4 text-red-400">{dataResult.error}</div>
           ) : (
             <DataGrid result={dataResult} />
           )
        )}

        {activeTab === 'structure' && (
          <div className="w-full h-full overflow-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-gray-400 bg-[#252526] sticky top-0 border-b border-[#3c3c3c]">
                <tr>
                  <th className="px-4 py-2 font-medium border-r border-[#3c3c3c]">Field</th>
                  <th className="px-4 py-2 font-medium border-r border-[#3c3c3c]">Type</th>
                  <th className="px-4 py-2 font-medium border-r border-[#3c3c3c]">Null</th>
                  <th className="px-4 py-2 font-medium border-r border-[#3c3c3c]">Key</th>
                  <th className="px-4 py-2 font-medium border-r border-[#3c3c3c]">Default</th>
                  <th className="px-4 py-2 font-medium border-r border-[#3c3c3c]">Extra</th>
                </tr>
              </thead>
              <tbody>
                {structure.map((col, i) => (
                  <tr key={i} className="border-b border-[#2d2d2d] hover:bg-[#2a2d2e] text-gray-300">
                    <td className="px-4 py-2 border-r border-[#3c3c3c] font-medium flex items-center space-x-2">
                      {col.Key === 'PRI' && <Key size={14} className="text-yellow-500" />}
                      <span>{col.Field}</span>
                    </td>
                    <td className="px-4 py-2 border-r border-[#3c3c3c] text-blue-300">{col.Type}</td>
                    <td className="px-4 py-2 border-r border-[#3c3c3c]">{col.Null}</td>
                    <td className="px-4 py-2 border-r border-[#3c3c3c]">{col.Key}</td>
                    <td className="px-4 py-2 border-r border-[#3c3c3c]">{col.Default || 'NULL'}</td>
                    <td className="px-4 py-2 border-r border-[#3c3c3c] text-gray-500">{col.Extra}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
