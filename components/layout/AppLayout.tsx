"use client";

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../lib/store';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MainArea from './MainArea';
import ConnectionVault from '../database/ConnectionVault';
import LoginView from '../auth/LoginView';
import { auth, onAuthStateChanged } from '../../lib/firebase';
import { User } from 'firebase/auth';

export default function AppLayout() {
  const { status, setAuthToken } = useAppStore();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const token = await currentUser.getIdToken();
        setAuthToken(token);
        
        // Load connections
        import('../../lib/firebase').then(({ db }) => {
          import('firebase/firestore').then(({ collection, getDocs }) => {
            getDocs(collection(db, 'users', currentUser.uid, 'connections'))
              .then(snapshot => {
                const loaded = snapshot.docs.map(doc => doc.data());
                useAppStore.getState().setConnections(loaded as any);
              })
              .catch(e => console.error("Error fetching connections:", e));
          });
        });
      } else {
        setAuthToken(null);
      }
      setAuthLoading(false);
    });
    
    return () => unsubscribe();
  }, [setAuthToken]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  if (status === 'disconnected' || status === 'error' || status === 'connecting') {
    return <ConnectionVault />;
  }

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-gray-300 font-sans overflow-hidden">
      <Topbar />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <MainArea />
      </div>
    </div>
  );
}
