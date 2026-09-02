"use client";
import React from 'react';
import { useAppStore } from '../../lib/store';
import { Database, Menu, LogOut, Code2 } from 'lucide-react';
import { clsx } from 'clsx';

export default function Topbar() {
  const { 
    activeConnectionId, connections, isDemoMode, status, 
    sidebarOpen, setSidebarOpen, setActiveConnection, activeDatabase
  } = useAppStore();

  const conn = connections.find(c => c.id === activeConnectionId);
  const name = isDemoMode ? 'Demo Server' : (conn?.name || 'Unknown');

  return (
    <div className="h-12 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-2 sm:px-4 shrink-0 select-none shadow-sm z-10 font-sans">
      <div className="flex items-center space-x-2 sm:space-x-4">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors">
          <Menu size={18} />
        </button>
        <div className="flex items-center space-x-1 sm:space-x-2">
          <img src="/logo-sqlukay.png" alt="SQLukay" className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
          <span className="font-extrabold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent tracking-wide hidden sm:inline">SQLukay</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 sm:space-x-6 text-xs sm:text-sm">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <span className="text-slate-500 hidden sm:inline">Connection:</span>
          <span className="font-medium px-2 py-1 bg-slate-800 border border-slate-700 rounded-md text-slate-200 flex items-center space-x-1 sm:space-x-2 shadow-sm truncate max-w-[100px] sm:max-w-xs">
            <Database size={12} className={isDemoMode ? 'text-amber-400' : 'text-cyan-400 shrink-0'} />
            <span className="truncate">{name}</span>
          </span>
        </div>
        
        {activeDatabase && (
          <div className="flex items-center space-x-1 sm:space-x-2">
            <span className="text-slate-500 hidden sm:inline">DB:</span>
            <span className="font-medium px-2 py-1 bg-slate-800 border border-slate-700 rounded-md text-slate-200 shadow-sm truncate max-w-[80px] sm:max-w-xs">{activeDatabase}</span>
          </div>
        )}

        <div className="flex items-center space-x-1 sm:space-x-2">
          <span className={clsx(
            "w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shadow-sm shrink-0",
            status === 'connected' ? 'bg-emerald-500 shadow-emerald-500/50' : 
            status === 'connecting' ? 'bg-amber-500 animate-pulse shadow-amber-500/50' : 'bg-rose-500 shadow-rose-500/50'
          )}></span>
          <span className="capitalize text-slate-300 font-medium hidden sm:inline">
            {isDemoMode ? 'Demo Mode' : status}
          </span>
        </div>
      </div>

      <div className="flex items-center">
        <button 
          onClick={async () => {
            if (!isDemoMode) {
              const state = useAppStore.getState();
              if (state.connectionToken) {
                try {
                  await fetch('/api/db/connect', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'disconnect', connectionId: state.connectionToken })
                  });
                } catch (e) {
                  console.error('Failed to disconnect from server:', e);
                }
              }
            }
            setActiveConnection(null, null, false);
          }}
          className="flex items-center space-x-1 sm:space-x-2 text-slate-400 hover:text-white px-2 sm:px-3 py-1.5 hover:bg-rose-500/10 hover:text-rose-400 rounded-md transition-colors"
          title="Disconnect"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline text-sm">Disconnect</span>
        </button>
      </div>
    </div>
  );
}
