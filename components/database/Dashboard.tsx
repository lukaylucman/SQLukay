"use client";
import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Database, Server, Clock, Table2, Play, Plus, Activity } from 'lucide-react';

export default function Dashboard() {
  const { connectionToken, isDemoMode, activeConnectionId, connections } = useAppStore();
  const [stats, setStats] = useState<any>(null);
  
  const conn = connections.find(c => c.id === activeConnectionId);

  useEffect(() => {
    // In a real app, we would fetch actual stats from the server
    // For now, we simulate this with a simple query if connected
    if (connectionToken || isDemoMode) {
      setStats({
        version: isDemoMode ? 'Demo 1.0' : '8.0.32',
        uptime: '2 days 4 hours',
        databases: isDemoMode ? 1 : 4,
        tables: isDemoMode ? 5 : 42,
      });
    }
  }, [connectionToken, isDemoMode]);

  return (
    <div className="p-6 h-full overflow-y-auto">
      <h1 className="text-2xl font-light text-white mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#252526] p-4 rounded-lg border border-[#3c3c3c]">
          <div className="flex items-center space-x-3 mb-2 text-blue-400">
            <Server size={20} />
            <h3 className="font-semibold">Version</h3>
          </div>
          <div className="text-2xl text-white">{stats?.version || '-'}</div>
        </div>
        <div className="bg-[#252526] p-4 rounded-lg border border-[#3c3c3c]">
          <div className="flex items-center space-x-3 mb-2 text-green-400">
            <Clock size={20} />
            <h3 className="font-semibold">Uptime</h3>
          </div>
          <div className="text-2xl text-white">{stats?.uptime || '-'}</div>
        </div>
        <div className="bg-[#252526] p-4 rounded-lg border border-[#3c3c3c]">
          <div className="flex items-center space-x-3 mb-2 text-orange-400">
            <Database size={20} />
            <h3 className="font-semibold">Databases</h3>
          </div>
          <div className="text-2xl text-white">{stats?.databases || '-'}</div>
        </div>
        <div className="bg-[#252526] p-4 rounded-lg border border-[#3c3c3c]">
          <div className="flex items-center space-x-3 mb-2 text-purple-400">
            <Table2 size={20} />
            <h3 className="font-semibold">Tables</h3>
          </div>
          <div className="text-2xl text-white">{stats?.tables || '-'}</div>
        </div>
      </div>

      <div className="bg-[#252526] border border-[#3c3c3c] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Activity size={18} />
          <span>Connection Details</span>
        </h2>
        {isDemoMode ? (
          <div className="text-gray-400 space-y-2">
            <p>Running in <strong>Demo Mode</strong>. No real MySQL server is connected.</p>
            <p>Database schema and queries are simulated locally.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-gray-400">Host</div>
            <div className="text-white">{conn?.host}</div>
            <div className="text-gray-400">Port</div>
            <div className="text-white">{conn?.port}</div>
            <div className="text-gray-400">User</div>
            <div className="text-white">{conn?.user}</div>
            <div className="text-gray-400">SSL</div>
            <div className="text-white">{conn?.ssl ? 'Enabled' : 'Disabled'}</div>
          </div>
        )}
      </div>
    </div>
  );
}
