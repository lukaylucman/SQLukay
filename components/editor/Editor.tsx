"use client";
import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Play, Save, AlignLeft, Download } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { QueryResult } from '../../types';
import DataGrid from './DataGrid';

export default function SQLEditor({ tabId }: { tabId: string }) {
  const [code, setCode] = useState('SELECT * FROM mahasiswa LIMIT 100;');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { connectionToken, isDemoMode, activeDatabase } = useAppStore();

  const handleRun = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/db/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: connectionToken,
          isDemo: isDemoMode,
          database: activeDatabase,
          query: code
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setResult({ error: e.message, data: [], fields: [], executionTime: 0 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      <div className="flex items-center space-x-2 p-2 bg-[#252526] border-b border-[#3c3c3c]">
        <button 
          onClick={handleRun}
          disabled={loading}
          className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm disabled:opacity-50"
        >
          <Play size={14} />
          <span>{loading ? 'Running...' : 'Run Query'}</span>
        </button>
        <button className="p-1.5 text-gray-400 hover:text-white hover:bg-[#333] rounded">
          <Save size={16} />
        </button>
        <button className="p-1.5 text-gray-400 hover:text-white hover:bg-[#333] rounded">
          <AlignLeft size={16} />
        </button>
      </div>
      
      <div className="flex-1 min-h-[200px] border-b border-[#3c3c3c]">
        <Editor
          height="100%"
          defaultLanguage="sql"
          theme="vs-dark"
          value={code}
          onChange={(val) => setCode(val || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
          }}
        />
      </div>

      <div className="h-[40%] bg-[#1e1e1e] flex flex-col overflow-hidden">
        {result ? (
          <div className="flex flex-col h-full">
            <div className="bg-[#252526] p-1.5 flex justify-between items-center text-xs text-gray-400 border-b border-[#3c3c3c]">
              <div className="flex space-x-4 px-2">
                {result.error ? (
                  <span className="text-red-400 font-medium">Error</span>
                ) : (
                  <>
                    <span className="text-green-400 font-medium">Success</span>
                    <span>{result.data?.length || 0} rows</span>
                    {result.rowsAffected !== undefined && <span>{result.rowsAffected} rows affected</span>}
                    <span>{result.executionTime} ms</span>
                  </>
                )}
              </div>
              {!result.error && result.data?.length > 0 && (
                <button className="flex items-center space-x-1 hover:text-white px-2 py-0.5 rounded hover:bg-[#333]">
                  <Download size={12} />
                  <span>Export</span>
                </button>
              )}
            </div>
            <div className="flex-1 overflow-auto">
              {result.error ? (
                <div className="p-4 text-red-400 font-mono text-sm whitespace-pre-wrap">{result.error}</div>
              ) : (
                <DataGrid result={result} />
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-600 text-sm">
            Results will appear here
          </div>
        )}
      </div>
    </div>
  );
}
