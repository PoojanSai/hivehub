import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Tab, ChatMessage, ViewMode, Collaborator } from '@/types';

const COLLABORATORS: Collaborator[] = [
  { id: 'c1', name: 'Aisha K.',  color: '#a78bfa', avatar: 'AK', line: 9  },
  { id: 'c2', name: 'Rajan M.', color: '#34d399', avatar: 'RM', line: 17 },
  { id: 'c3', name: 'Mei L.',   color: '#fb923c', avatar: 'ML', line: 24 },
];

interface AppState {
  viewMode: ViewMode;
  tabs: Tab[];
  activeTabId: string | null;
  chatOpen: boolean;
  messages: ChatMessage[];
  collaborators: Collaborator[];
  openFile: (tab: Tab) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  toggleChat: () => void;
  sendMessage: (text: string) => void;
  setViewMode: (m: ViewMode) => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('welcome');
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { userId: 'c1', userName: 'Aisha K.',  color: '#a78bfa', text: 'I pushed the nav fix 🔧', timestamp: Date.now() - 180000 },
    { userId: 'c2', userName: 'Rajan M.', color: '#34d399', text: 'Nice! Reviewing now…',     timestamp: Date.now() - 60000  },
    { userId: 'c3', userName: 'Mei L.',   color: '#fb923c', text: 'Can someone check line 24?', timestamp: Date.now() - 20000 },
  ]);

  const openFile = useCallback((tab: Tab) => {
    setTabs(prev => prev.find(t => t.id === tab.id) ? prev : [...prev, tab]);
    setActiveTabId(tab.id);
    setViewMode('editor');
  }, []);

  const closeTab = useCallback((id: string) => {
    setTabs(prev => {
      const next = prev.filter(t => t.id !== id);
      if (activeTabId === id) setActiveTabId(next.length ? next[next.length - 1].id : null);
      if (next.length === 0) setViewMode('welcome');
      return next;
    });
  }, [activeTabId]);

  const sendMessage = useCallback((text: string) => {
    setMessages(prev => [...prev, {
      userId: 'me', userName: 'You', color: '#2dd4bf', text, timestamp: Date.now(),
    }]);
  }, []);

  return (
    <Ctx.Provider value={{
      viewMode, tabs, activeTabId, chatOpen, messages, collaborators: COLLABORATORS,
      openFile, closeTab, setActiveTab: setActiveTabId, toggleChat: () => setChatOpen(v => !v),
      sendMessage, setViewMode,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
