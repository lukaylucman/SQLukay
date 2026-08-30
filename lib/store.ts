import { create } from 'zustand';
import { ConnectionConfig, QueryResult } from '../types';

export interface Tab {
  id: string;
  type: 'dashboard' | 'query' | 'table' | 'terminal' | 'history' | 'settings' | 'reference';
  title: string;
  props?: any;
}

interface AppState {
  authToken: string | null;
  setAuthToken: (token: string | null) => void;
  // Connection State
  connections: ConnectionConfig[];
  activeConnectionId: string | null;
  connectionToken: string | null;
  isDemoMode: boolean;
  activeDatabase: string | null;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  errorMessage: string | null;
  
  // Workspace State
  tabs: Tab[];
  activeTabId: string | null;
  sidebarOpen: boolean;

  // Actions
  setConnections: (connections: ConnectionConfig[]) => void;
  setActiveConnection: (id: string | null, token: string | null, isDemo?: boolean) => void;
  setStatus: (status: AppState['status'], errorMessage?: string | null) => void;
  setActiveDatabase: (db: string | null) => void;
  
  // Tab Actions
  addTab: (tab: Tab) => void;
  removeTab: (id: string) => void;
  setActiveTabId: (id: string) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  authToken: null,
  setAuthToken: (token) => set({ authToken: token }),
  connections: [],
  activeConnectionId: null,
  connectionToken: null,
  isDemoMode: false,
  activeDatabase: null,
  status: 'disconnected',
  errorMessage: null,
  
  tabs: [{ id: 'dashboard', type: 'dashboard', title: 'Dashboard' }],
  activeTabId: 'dashboard',
  sidebarOpen: true,

  setConnections: (connections) => set({ connections }),
  setActiveConnection: (id, token, isDemo = false) => set({ 
    activeConnectionId: id, 
    connectionToken: token,
    isDemoMode: isDemo,
    status: token || isDemo ? 'connected' : 'disconnected',
    errorMessage: null
  }),
  setStatus: (status, errorMessage = null) => set({ status, errorMessage }),
  setActiveDatabase: (db) => set({ activeDatabase: db }),

  addTab: (tab) => set((state) => {
    const existing = state.tabs.find(t => t.id === tab.id);
    if (existing) {
      return { activeTabId: tab.id };
    }
    return { tabs: [...state.tabs, tab], activeTabId: tab.id };
  }),
  removeTab: (id) => set((state) => {
    const newTabs = state.tabs.filter(t => t.id !== id);
    let nextActiveId = state.activeTabId;
    if (state.activeTabId === id) {
      nextActiveId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
    }
    return { tabs: newTabs, activeTabId: nextActiveId };
  }),
  setActiveTabId: (id) => set({ activeTabId: id }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
