"use client";
import React, { useState, useEffect } from 'react';
import { signOut, auth, db } from '../../lib/firebase';
import { collection, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { useAppStore } from '../../lib/store';
import { Database, Plus, Trash2, Edit2, Zap, AlertCircle, Activity, Server, Shield, Wifi, Info, LogOut } from 'lucide-react';
import { ConnectionConfig } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import Footer from '../layout/Footer';
import { motion } from 'motion/react';

export default function ConnectionVault() {
  const { connections, setConnections, setActiveConnection, setStatus } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState<Partial<ConnectionConfig>>({
    name: 'Localhost', host: 'localhost', port: 3306, user: 'root', password: '', database: '', ssl: false
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);

  const loadConnections = async () => {
    if (!auth.currentUser) return;
    try {
      const snapshot = await getDocs(collection(db, 'users', auth.currentUser.uid, 'connections'));
      const loaded = snapshot.docs.map(doc => doc.data() as ConnectionConfig);
      setConnections(loaded);
    } catch (e) {
      console.error("Failed to fetch connections", e);
    }
  };

  useEffect(() => {
    loadConnections();
  }, []);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    setError(null);
    setDiagnostics(null);
    setTestSuccess(null);
    try {
      const configToSave: ConnectionConfig = {
        ...form as ConnectionConfig,
        id: editingId || uuidv4(),
      };
      
      await setDoc(doc(db, 'users', auth.currentUser.uid, 'connections', configToSave.id), configToSave);
      await loadConnections();
      setShowForm(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setError(null);
    setDiagnostics(null);
    setTestSuccess(null);
    try {
      const res = await fetch('/api/db/test-connection', {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({ config: form })
      });
      const data = await res.json();
      
      if (!data.success) {
        setError(data.error);
        setDiagnostics(data.diagnostics);
      } else {
        setTestSuccess(`Connection successful! (MySQL ${data.version}, Latency: ${data.latency}ms)`);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setTesting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!auth.currentUser) return;
    if (!confirm('Are you sure you want to delete this connection?')) return;
    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'connections', id));
      await loadConnections();
    } catch (e) {
      console.error(e);
    }
  };

  const handleConnect = async (config: ConnectionConfig | null, isDemo = false) => {
    setLoading(true);
    setError(null);
    setDiagnostics(null);
    setStatus('connecting');
    
    try {
      if (isDemo) {
        await new Promise(r => setTimeout(r, 500));
        setActiveConnection('demo', null, true);
        return;
      }

      if (!config) return;

      const res = await fetch('/api/db/connect', {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({ config })
      });
      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setActiveConnection(config.id, data.token, false);
      
    } catch (e: any) {
      setError(e.message);
      setStatus('error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#050a14] flex flex-col min-h-screen text-slate-300 relative overflow-y-auto overflow-x-hidden font-sans">
      
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f14_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f14_1px,transparent_1px)] bg-[size:32px_32px] z-0 pointer-events-none" />
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 w-[800px] h-[400px] bg-cyan-900/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0" />

      <div className="flex-1 flex flex-col items-center justify-start w-full p-4 sm:p-6 z-10">

      {/* Top Right Actions */}
      <div className="absolute top-6 right-6 z-20">
        <button 
          onClick={() => signOut(auth)}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#0a101e]/80 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 transition-all duration-200 shadow-sm text-[13px] font-medium backdrop-blur-md"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
      
      <div className="w-full max-w-[1000px] z-10 py-8 sm:py-12">
        
        {/* Header Hero */}
        <div className="text-center mb-16 relative">
          
          {/* Left Hero Character */}
          <div className="hidden lg:flex absolute left-[2%] xl:left-[8%] top-1/2 -translate-y-[60%] items-center justify-center pointer-events-none z-0">
            <motion.img
              src="/hero1.png"
              alt=""
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: [0, -10, 0] }}
              transition={{ 
                opacity: { duration: 1, ease: "easeOut" },
                y: { repeat: Infinity, duration: 5, ease: "easeInOut" }
              }}
              className="w-[120px] xl:w-[140px] object-contain drop-shadow-[0_0_20px_rgba(6,182,212,0.25)]"
            />
          </div>

          {/* Right Hero Character */}
          <div className="hidden lg:flex absolute right-[2%] xl:right-[8%] top-1/2 -translate-y-[60%] items-center justify-center pointer-events-none z-0">
            <motion.img
              src="/hero2.png"
              alt=""
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: [0, -10, 0] }}
              transition={{ 
                opacity: { duration: 1, ease: "easeOut" },
                y: { repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.5 }
              }}
              className="w-[120px] xl:w-[140px] object-contain drop-shadow-[0_0_20px_rgba(6,182,212,0.25)]"
            />
          </div>

          <div className="inline-flex items-center justify-center p-3.5 bg-[#0b1221]/80 backdrop-blur-md rounded-2xl mb-6 border border-slate-700/50 shadow-lg shadow-cyan-900/10 relative group z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-2xl pointer-events-none" />
            <img src="/logo-sqlukay.png" alt="SQLukay" className="w-14 h-14 object-contain relative z-10" />
          </div>
          <h1 className="text-[32px] font-extrabold tracking-tight mb-3 text-slate-100 relative z-10">SQLukay</h1>
          <p className="text-slate-400 text-[15px] max-w-md mx-auto leading-relaxed relative z-10">
            Connect your workspace to a remote SQL server. <br/>
            SQLukay provides a sophisticated client, but does not run the database itself.
          </p>
        </div>

        {testSuccess && (
          <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 flex items-start space-x-3 backdrop-blur-md shadow-lg shadow-emerald-900/5 max-w-2xl mx-auto">
            <Shield size={20} className="shrink-0 mt-0.5 text-emerald-500" />
            <div>
              <h3 className="font-semibold text-emerald-300 mb-1 text-[15px]">Connection Established</h3>
              <p className="text-[13px] text-emerald-400/80">{testSuccess}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 flex items-start space-x-4 backdrop-blur-md shadow-lg shadow-rose-900/5 max-w-2xl mx-auto">
            <AlertCircle size={22} className="shrink-0 mt-0.5 text-rose-500" />
            <div className="w-full">
              <h3 className="font-semibold text-rose-300 mb-1 text-[15px]">Connection Refused</h3>
              <p className="text-[13px] text-rose-400/80 mb-3">{error}</p>
              
              {diagnostics && (
                <div className="mt-4 bg-[#050a14]/60 border border-rose-900/30 rounded-xl p-4 text-[12px] font-mono overflow-auto">
                  <h4 className="text-slate-300 mb-3 font-sans font-medium flex items-center space-x-2">
                    <Activity size={14} className="text-rose-500" /> <span>Diagnostics</span>
                  </h4>
                  <ul className="space-y-2.5 mb-4">
                    <li className="flex items-center justify-between"><span className="text-slate-500">Target Host:</span> <span className="text-slate-300">{diagnostics.host}</span></li>
                    <li className="flex items-center justify-between"><span className="text-slate-500">Target Port:</span> <span className="text-slate-300">{diagnostics.port}</span></li>
                    {diagnostics.code && <li className="flex items-center justify-between"><span className="text-slate-500">Error Code:</span> <span className="text-rose-400">{diagnostics.code}</span></li>}
                    {diagnostics.errno && <li className="flex items-center justify-between"><span className="text-slate-500">System Errno:</span> <span className="text-slate-300">{diagnostics.errno}</span></li>}
                    {diagnostics.sqlState && <li className="flex items-center justify-between"><span className="text-slate-500">SQL State:</span> <span className="text-slate-300">{diagnostics.sqlState}</span></li>}
                  </ul>
                  <div className="pt-3 border-t border-rose-900/20 text-slate-400 font-sans">
                    <span className="text-slate-300 font-medium text-[13px]">Recommended actions:</span>
                    <ul className="list-disc pl-5 mt-2 space-y-1.5 text-slate-400 text-[13px]">
                      <li>Verify the hostname is publicly accessible</li>
                      <li>Check your cloud provider&apos;s firewall or security groups</li>
                      <li>Ensure port {diagnostics.port} is open</li>
                      <li>Verify credentials and SSL configuration</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Connection List Panel */}
          <div className="md:col-span-5 space-y-5">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[13px] font-semibold text-slate-400 tracking-wider uppercase">Your Workspaces</h2>
              <button 
                onClick={() => { setForm({ name: 'New Connection', host: 'localhost', port: 3306, user: 'root', password: '', database: '', ssl: false }); setEditingId(null); setShowForm(true); setError(null); setDiagnostics(null); setTestSuccess(null); }}
                className="flex items-center space-x-1.5 text-[13px] font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-all px-3 py-1.5 rounded-lg shadow-sm active:scale-95"
              >
                <Plus size={14} strokeWidth={2.5} />
                <span>Add New</span>
              </button>
            </div>
            
            {connections.length === 0 ? (
              <div className="p-8 bg-[#0a101e]/60 border border-slate-800/80 rounded-[20px] text-center text-slate-500 backdrop-blur-md flex flex-col items-center justify-center min-h-[160px]">
                <Server size={28} className="text-slate-600/50 mb-3" />
                <p className="text-[14px]">No saved workspaces. <br/> Create one to begin your session.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {connections.map(conn => (
                  <div key={conn.id} className="bg-[#0a101e]/80 backdrop-blur-xl border border-slate-800 rounded-[20px] p-5 hover:border-slate-700 hover:bg-[#0c1322] transition-all duration-300 shadow-lg shadow-black/20 group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3.5">
                        <div className="p-2.5 bg-[#101828] border border-slate-800 rounded-xl group-hover:bg-cyan-500/10 group-hover:border-cyan-500/20 transition-colors">
                          <Server size={18} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
                        </div>
                        <h3 className="font-semibold text-slate-200 text-[16px]">{conn.name}</h3>
                      </div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setForm(conn); setEditingId(conn.id); setShowForm(true); setError(null); setDiagnostics(null); setTestSuccess(null); }} className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800 transition-colors" title="Edit">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => handleDelete(conn.id)} className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-[13px] text-slate-400 mb-5 font-mono truncate flex items-center space-x-2.5 pl-2.5 bg-[#050a14]/60 p-2.5 rounded-xl border border-slate-800/50">
                      <Wifi size={14} className="text-slate-500 shrink-0" />
                      <span className="truncate">{conn.user}@{conn.host}:{conn.port} {conn.database ? `/${conn.database}` : ''}</span>
                    </div>
                    
                    <button 
                      onClick={() => handleConnect(conn)}
                      disabled={loading}
                      className="w-full flex items-center justify-center space-x-2 bg-[#050a14] hover:bg-cyan-500/10 text-cyan-500 py-3 rounded-xl text-[14px] font-semibold border border-slate-800 hover:border-cyan-500/30 transition-all duration-200 disabled:opacity-50 active:scale-[0.98]"
                    >
                      <Zap size={16} className={loading ? "animate-pulse" : ""} />
                      <span>{loading ? 'Connecting...' : 'Connect Workspace'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-8 pt-6 border-t border-slate-800/60 relative">
              <button 
                onClick={() => handleConnect(null, true)}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2.5 bg-amber-500/5 hover:bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:border-amber-500/30 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 font-semibold text-[14px] active:scale-[0.98]"
              >
                <Database size={16} />
                <span>Launch Demo Environment</span>
              </button>
              <p className="text-[12px] text-center text-slate-500 mt-3 font-medium">Explore the interface using local simulated data.</p>
            </div>
          </div>

          {/* Form Panel */}
          <div className="md:col-span-7">
          {showForm ? (
            <div className="bg-[#0a101e]/90 backdrop-blur-2xl border border-slate-800/80 rounded-[24px] p-6 sm:p-8 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-900/40 to-transparent" />
              <h2 className="text-[18px] font-semibold text-slate-100 mb-6 flex items-center space-x-2">
                <span>{editingId ? 'Configure Connection' : 'New Workspace Connection'}</span>
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-[12px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">Connection Alias</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-[#050a14] border border-slate-800 rounded-xl px-4 py-3.5 text-[14px] text-slate-200 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner placeholder-slate-600" placeholder="e.g. Production DB" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-[12px] font-semibold text-slate-400 mb-2 uppercase tracking-wider flex justify-between">
                      <span>Host</span>
                      <span className="text-slate-500 flex items-center text-[10px] normal-case tracking-normal"><Info size={12} className="mr-1 shrink-0" /> Not your local machine</span>
                    </label>
                    <input type="text" value={form.host} onChange={e => setForm({...form, host: e.target.value})} className="w-full bg-[#050a14] border border-slate-800 rounded-xl px-4 py-3.5 text-slate-200 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono text-[14px] shadow-inner placeholder-slate-600" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">Port</label>
                    <input type="number" value={form.port} onChange={e => setForm({...form, port: Number(e.target.value)})} className="w-full bg-[#050a14] border border-slate-800 rounded-xl px-4 py-3.5 text-slate-200 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono text-[14px] shadow-inner placeholder-slate-600" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">Username</label>
                    <input type="text" value={form.user} onChange={e => setForm({...form, user: e.target.value})} className="w-full bg-[#050a14] border border-slate-800 rounded-xl px-4 py-3.5 text-slate-200 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono text-[14px] shadow-inner placeholder-slate-600" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">Password</label>
                    <input type="password" placeholder={editingId && form.password === '********' ? '********' : '••••••••'} value={form.password === '********' ? '' : form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full bg-[#050a14] border border-slate-800 rounded-xl px-4 py-3.5 text-slate-200 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono text-[14px] shadow-inner placeholder-slate-600" />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">Default Database <span className="text-slate-500 normal-case tracking-normal font-medium">(Optional)</span></label>
                  <input type="text" value={form.database} onChange={e => setForm({...form, database: e.target.value})} className="w-full bg-[#050a14] border border-slate-800 rounded-xl px-4 py-3.5 text-slate-200 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono text-[14px] shadow-inner placeholder-slate-600" />
                </div>
                <div className="flex items-center space-x-3 pt-3 pb-2">
                  <label htmlFor="ssl" className="relative flex items-center cursor-pointer">
                    <input type="checkbox" id="ssl" checked={form.ssl} onChange={e => setForm({...form, ssl: e.target.checked})} className="peer sr-only" />
                    <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-gray-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600 border border-slate-700 peer-checked:border-cyan-500"></div>
                  </label>
                  <label htmlFor="ssl" className="text-[13px] font-medium text-slate-300 cursor-pointer select-none">Require SSL Encryption</label>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center pt-6 mt-6 border-t border-slate-800/60 justify-between gap-4">
                  <button onClick={handleTest} disabled={testing} className="w-full sm:w-auto justify-center px-5 py-2.5 bg-[#050a14] hover:bg-slate-800 text-slate-300 text-[13px] font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center border border-slate-700 shadow-sm active:scale-95">
                    <Shield size={16} className="mr-2 text-cyan-500" />
                    {testing ? 'Testing Connection...' : 'Test Connection'}
                  </button>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={() => setShowForm(false)} className="w-full sm:w-auto px-5 py-2.5 text-[13px] font-semibold text-slate-400 hover:text-white transition-colors border border-transparent sm:border-none rounded-xl hover:bg-slate-800 sm:hover:bg-transparent">Cancel</button>
                    <button onClick={handleSave} disabled={loading} className="w-full sm:w-auto justify-center px-6 py-2.5 bg-white hover:bg-slate-100 text-slate-900 text-[13px] font-bold rounded-xl transition-all duration-200 disabled:opacity-70 flex active:scale-95 border border-slate-200">
                      {loading ? 'Saving...' : 'Save Configuration'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[440px] flex flex-col items-center justify-center border border-slate-800/80 rounded-[24px] bg-[#0a101e]/40 text-slate-500 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f0a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f0a_1px,transparent_1px)] bg-[size:24px_24px] z-0 pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 bg-[#0b1221] rounded-2xl flex items-center justify-center mb-6 border border-slate-800/80 shadow-lg shadow-black/20">
                  <Database size={24} className="text-cyan-500/40" />
                </div>
                <h3 className="text-[16px] font-semibold text-slate-300 mb-2">No Workspace Selected</h3>
                <p className="text-[14px] font-medium text-slate-500 max-w-[240px] leading-relaxed">
                  Select a saved workspace from the left panel or create a new configuration.
                </p>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
      </div>
      
      <Footer />
    </div>
  );
}

