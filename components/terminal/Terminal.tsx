"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../lib/store';
import { Minus, Square, X } from 'lucide-react';

export default function Terminal() {
  const [history, setHistory] = useState<{ type: 'input' | 'output' | 'error', text: string }[]>([
    { type: 'output', text: 'Microsoft Windows [Version 10.0.10240]' },
    { type: 'output', text: '(c) 2015 Microsoft Corporation. All rights reserved.\n' }
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { connectionToken, isDemoMode, activeDatabase, setActiveDatabase } = useAppStore();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, input]);

  // Make it look exactly like the screenshot
  const promptText = `C:\\Users\\SQLukay>`;

  const handleExecute = async (cmd: string) => {
    if (!cmd.trim()) {
      setHistory(prev => [...prev, { type: 'input', text: promptText }]);
      return;
    }
    
    setHistory(prev => [...prev, { type: 'input', text: `${promptText}${cmd}` }]);
    
    // Handle local terminal commands
    const normalized = cmd.trim().toLowerCase();
    if (normalized === 'clear' || normalized === 'cls') {
      setHistory([]);
      return;
    }
    
    if (normalized.startsWith('use ')) {
      const db = normalized.split(' ')[1].replace(';', '').trim();
      setActiveDatabase(db);
      setHistory(prev => [...prev, { type: 'output', text: `Database changed\n` }]);
      return;
    }

    try {
      // Small delay to simulate command execution
      const res = await fetch('https://sqlukay.vercel.app//api/db/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: connectionToken,
          isDemo: isDemoMode,
          database: activeDatabase,
          query: cmd
        })
      });
      const data = await res.json();
      
      if (data.error) {
        setHistory(prev => [...prev, { type: 'error', text: `${data.error}\n` }]);
      } else {
        if (data.data && data.data.length > 0) {
          // Format output as text table (simplified)
          const str = JSON.stringify(data.data, null, 2);
          setHistory(prev => [...prev, { type: 'output', text: `${str}\n` }]);
        }
        if (data.rowsAffected !== undefined) {
          setHistory(prev => [...prev, { type: 'output', text: `Query OK, ${data.rowsAffected} rows affected (${data.executionTime} ms)\n` }]);
        } else if (!data.data || data.data.length === 0) {
           setHistory(prev => [...prev, { type: 'output', text: `Query OK, 0 rows affected (${data.executionTime} ms)\n` }]);
        }
      }
    } catch (e: any) {
      setHistory(prev => [...prev, { type: 'error', text: `${e.message}\n` }]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white p-1">
      {/* Fake Windows Title Bar */}
      <div className="flex items-center justify-between bg-white px-2 h-8 select-none shrink-0 border-b border-gray-200">
        <div className="flex items-center space-x-2 text-black text-xs font-sans">
          <div className="w-4 h-4 bg-black text-white flex items-center justify-center font-bold text-[10px] cursor-default">C:\\</div>
          <span>Command Prompt</span>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 cursor-pointer text-gray-600"><Minus size={14} /></div>
          <div className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 cursor-pointer text-gray-600"><Square size={12} /></div>
          <div className="w-8 h-8 flex items-center justify-center hover:bg-red-500 hover:text-white cursor-pointer text-gray-600"><X size={14} /></div>
        </div>
      </div>
      
      {/* Terminal Content */}
      <div 
        className="flex flex-col flex-1 bg-[#0c0c0c] font-mono text-[14px] text-[#cccccc] overflow-y-auto px-1 py-1 cursor-text leading-tight"
        style={{ fontFamily: "'Consolas', 'Lucida Console', monospace" }}
        onClick={() => inputRef.current?.focus()}
      >
        <div>
          {history.map((line, i) => (
            <div key={i} className={
              line.type === 'error' ? 'text-red-400 whitespace-pre-wrap' : 'whitespace-pre-wrap'
            }>
              {line.text}
            </div>
          ))}
          
          <div className="flex items-start">
            <span className="shrink-0">{promptText}</span>
            <textarea 
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (e.shiftKey) return; 
                  
                  const openParens = (input.match(/\(/g) || []).length;
                  const closeParens = (input.match(/\)/g) || []).length;
                  const openCurly = (input.match(/\{/g) || []).length;
                  const closeCurly = (input.match(/\}/g) || []).length;
                  const trimmed = input.trim();
                  
                  if (openParens > closeParens || openCurly > closeCurly || trimmed.endsWith(',') || trimmed.endsWith('(') || trimmed.endsWith('{')) {
                    e.preventDefault();
                    const target = e.currentTarget;
                    const cursorPosition = target.selectionStart;
                    const indent = '    ';
                    const newInput = input.substring(0, cursorPosition) + '\n' + indent + input.substring(cursorPosition);
                    setInput(newInput);
                    
                    setTimeout(() => {
                      target.selectionStart = cursorPosition + 1 + indent.length;
                      target.selectionEnd = cursorPosition + 1 + indent.length;
                    }, 0);
                    return;
                  }

                  e.preventDefault();
                  handleExecute(input);
                  setInput('');
                }
              }}
              className="flex-1 bg-transparent border-none outline-none text-[#cccccc] resize-none block w-full ml-1"
              spellCheck="false"
              autoComplete="off"
              rows={Math.max(1, input.split('\n').length)}
              autoFocus
              style={{ fontFamily: "'Consolas', 'Lucida Console', monospace" }}
            />
          </div>
          <div ref={bottomRef} className="h-8" />
        </div>
      </div>
    </div>
  );
}
