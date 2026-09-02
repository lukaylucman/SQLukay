"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../lib/store';

function formatAsciiTable(data: any[], timeMs: number = 0) {
  if (!data || data.length === 0) return 'Empty set (0.00 sec)';

  const headers = Object.keys(data[0]);
  
  const colWidths: Record<string, number> = {};
  headers.forEach(h => {
    let max = h.length;
    data.forEach(row => {
      const val = row[h] === null ? 'NULL' : String(row[h]);
      if (val.length > max) max = val.length;
    });
    colWidths[h] = max;
  });

  const separator = '+' + headers.map(h => '-'.repeat(colWidths[h] + 2)).join('+') + '+';

  let output = separator + '\n';
  
  output += '|' + headers.map(h => ' ' + h.padEnd(colWidths[h], ' ') + ' ').join('|') + '|\n';
  output += separator + '\n';

  data.forEach(row => {
    output += '|' + headers.map(h => {
      const val = row[h] === null ? 'NULL' : String(row[h]);
      return ' ' + val.padEnd(colWidths[h], ' ') + ' ';
    }).join('|') + '|\n';
  });

  output += separator + '\n';
  const timeSec = (timeMs / 1000).toFixed(2);
  output += `${data.length} rows in set (${timeSec} sec)`;
  return output;
}

export default function Terminal() {
  const [history, setHistory] = useState<{ type: 'input' | 'output' | 'error', text: string }[]>([
    { type: 'output', text: 'Microsoft Windows [Version 10.0.10240]' },
    { type: 'output', text: '(c) 2015 Microsoft Corporation. All rights reserved.' }
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { connectionToken, isDemoMode } = useAppStore();

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleCommand = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const cmd = input.trim();
      if (!cmd) return;
      
      setHistory(prev => [...prev, { type: 'input', text: `C:\\Users\\SQLukay>${cmd}` }]);
      setInput('');

      if (cmd.toLowerCase() === 'clear' || cmd.toLowerCase() === 'cls') {
        setHistory([]);
        return;
      }

      try {
        const res = await fetch('https://sqlukay.vercel.app/api/db/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: connectionToken, isDemo: isDemoMode, query: cmd })
        });
        
        const data = await res.json();
        
        if (data.error) {
          setHistory(prev => [...prev, { type: 'error', text: data.error }]);
        } else {
          let formattedText = '';
          if (Array.isArray(data.data)) {
            formattedText = formatAsciiTable(data.data, data.time || 0);
          } else {
            formattedText = `Query OK, ${data.data?.affectedRows || 0} rows affected`;
          }
          setHistory(prev => [...prev, { type: 'output', text: formattedText }]);
        }
      } catch (err: any) {
        setHistory(prev => [...prev, { type: 'error', text: err.message || 'Failed to fetch' }]);
      }
    }
  };

  return (
    <div 
      className="flex flex-col h-full bg-[#0c0c0c] text-[#cccccc] font-mono text-sm p-4 overflow-auto cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {history.map((line, i) => (
        <div key={i} className={`whitespace-pre-wrap ${line.type === 'error' ? 'text-red-400' : ''}`}>
          {line.text}
        </div>
      ))}
      <div className="flex items-center mt-1">
        <span className="mr-2">C:\Users\SQLukay&gt;</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleCommand}
          className="flex-1 bg-transparent outline-none border-none focus:ring-0 text-[#cccccc]"
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
      </div>
      <div ref={endRef} />
    </div>
  );
}