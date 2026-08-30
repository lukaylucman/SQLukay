"use client";
import React, { useState } from 'react';
import { signInWithPopup, googleProvider, auth } from '../../lib/firebase';
import { Database, Zap, ShieldCheck, HardDrive, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import Footer from '../layout/Footer';

export default function LoginView() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050a14] flex flex-col relative overflow-hidden font-sans text-slate-300">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f14_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f14_1px,transparent_1px)] bg-[size:32px_32px] z-0" />
      
      {/* Background Gradients for Depth */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-[#050a14] to-transparent z-0 pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 w-full relative z-10">

        {/* Left Hero Character */}
        <div className="hidden lg:flex absolute left-[2%] xl:left-[8%] top-0 bottom-[15%] items-center justify-center pointer-events-none z-0">
          <motion.img
            src="/hero1.png"
            alt=""
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: [0, -20, 0] }}
            transition={{ 
              opacity: { duration: 1, ease: "easeOut" },
              y: { repeat: Infinity, duration: 6, ease: "easeInOut" }
            }}
            className="w-[200px] xl:w-[260px] object-contain drop-shadow-[0_0_35px_rgba(6,182,212,0.4)]"
          />
        </div>

        {/* Right Hero Character */}
        <div className="hidden lg:flex absolute right-[2%] xl:right-[8%] top-0 bottom-[15%] items-center justify-center pointer-events-none z-0">
          <motion.img
            src="/hero2.png"
            alt=""
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: [0, -20, 0] }}
            transition={{ 
              opacity: { duration: 1, ease: "easeOut" },
              y: { repeat: Infinity, duration: 7, ease: "easeInOut", delay: 0.5 }
            }}
            className="w-[200px] xl:w-[260px] object-contain drop-shadow-[0_0_35px_rgba(6,182,212,0.4)]"
          />
        </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[420px] w-full relative z-10 text-center flex flex-col items-center mt-8"
      >
        {/* Logo Container */}
        <div className="inline-flex items-center justify-center p-4 bg-[#0b1221]/80 backdrop-blur-md rounded-2xl mb-7 border border-slate-700/50 shadow-lg shadow-cyan-900/10 relative group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-2xl pointer-events-none" />
          <img src="/logo-sqlukay.png" alt="SQLukay" className="w-16 h-16 object-contain relative z-10" />
        </div>
        
        {/* Title */}
        <h1 className="text-[32px] font-extrabold tracking-tight mb-3 text-slate-100">
          SQLukay
        </h1>
        
        {/* Description */}
        <p className="text-slate-400 text-[15px] mb-8 leading-relaxed max-w-sm px-4">
          Your premium web-based MySQL workspace. Connect securely and execute queries with a professional-grade interface.
        </p>

        {/* Login Card */}
        <div className="w-full bg-[#0a101e]/90 backdrop-blur-2xl border border-slate-800/80 rounded-[24px] p-8 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] text-left relative overflow-hidden">
          {/* Subtle top edge glow on card */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-900/40 to-transparent" />
          
          <h2 className="text-[17px] font-semibold text-slate-200 mb-6 text-center">
            Sign in to your workspace
          </h2>
          
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center">
              <span className="flex-1">{error}</span>
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-slate-50 text-slate-900 py-3.5 px-4 rounded-xl text-[15px] font-semibold transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm active:scale-[0.98] border border-slate-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>{loading ? 'Authenticating...' : 'Continue with Google'}</span>
          </button>
          
          <div className="mt-6 flex items-center justify-center space-x-2 text-slate-500">
            <Lock size={13} className="opacity-70" />
            <p className="text-[13px] leading-tight">
              Connection details are end-to-end encrypted.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-[850px] w-full mt-16 relative z-10 px-4"
      >
        <div className="bg-[#0b111e]/60 border border-slate-800/50 p-5 rounded-2xl backdrop-blur-md text-left flex flex-col justify-start hover:bg-[#0c1322]/80 transition-colors">
          <HardDrive className="text-cyan-500/80 mb-3" size={20} strokeWidth={2} />
          <h3 className="text-[14px] font-semibold text-slate-200 mb-1.5">Persistent Workspaces</h3>
          <p className="text-[13px] text-slate-500 leading-relaxed">Your connection configs are securely synced and instantly available across devices.</p>
        </div>
        <div className="bg-[#0b111e]/60 border border-slate-800/50 p-5 rounded-2xl backdrop-blur-md text-left flex flex-col justify-start hover:bg-[#0c1322]/80 transition-colors">
          <Zap className="text-blue-400/80 mb-3" size={20} strokeWidth={2} />
          <h3 className="text-[14px] font-semibold text-slate-200 mb-1.5">Blazing Fast Client</h3>
          <p className="text-[13px] text-slate-500 leading-relaxed">Execute complex queries with real-time streaming feedback and rich syntax highlighting.</p>
        </div>
        <div className="bg-[#0b111e]/60 border border-slate-800/50 p-5 rounded-2xl backdrop-blur-md text-left flex flex-col justify-start hover:bg-[#0c1322]/80 transition-colors">
          <ShieldCheck className="text-indigo-400/80 mb-3" size={20} strokeWidth={2} />
          <h3 className="text-[14px] font-semibold text-slate-200 mb-1.5">Secure Architecture</h3>
          <p className="text-[13px] text-slate-500 leading-relaxed">Direct database credentials never touch your browser&apos;s local storage.</p>
        </div>
      </motion.div>
      </div>

      <Footer />
    </div>
  );
}
