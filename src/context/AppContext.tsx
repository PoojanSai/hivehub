import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { Tab, ChatMessage, ViewMode, Collaborator, Team } from '@/types';
import { api } from '@/api/client';

const COLLABORATORS: Collaborator[] = [
  { id: 'c1', name: 'Aisha K.',  color: '#a78bfa', avatar: 'AK', line: 9  },
  { id: 'c2', name: 'Rajan M.', color: '#34d399', avatar: 'RM', line: 17 },
  { id: 'c3', name: 'Mei L.',   color: '#fb923c', avatar: 'ML', line: 24 },
];

const USER_COLORS: Record<string, string> = {
  '1': '#a78bfa',
  '2': '#34d399',
  '3': '#fb923c',
  '4': '#2dd4bf',
};

interface AppState {
  viewMode: ViewMode;
  tabs: Tab[];
  activeTabId: string | null;
  chatOpen: boolean;
  messages: ChatMessage[];
  collaborators: Collaborator[];
  teams: Team[];
  teamsLoading: boolean;
  editorContent: string;
  currentProjectId: number | null;
  openFile: (tab: Tab) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  toggleChat: () => void;
  sendMessage: (text: string) => void;
  setViewMode: (m: ViewMode) => void;
  loadVersion: (versionId: number) => void;
  saveVersion: (tag: string, label?: string) => void;
  setEditorContent: (content: string) => void;
  refreshTeams: () => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('welcome');
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { userId: 'c1', userName: 'Aisha K.',  color: '#a78bfa', text: 'I pushed the nav fix \u{1f527}', timestamp: Date.now() - 180000 },
    { userId: 'c2', userName: 'Rajan M.', color: '#34d399', text: 'Nice! Reviewing now\u2026',     timestamp: Date.now() - 60000  },
    { userId: 'c3', userName: 'Mei L.',   color: '#fb923c', text: 'Can someone check line 24?', timestamp: Date.now() - 20000 },
  ]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [editorContent, setEditorContent] = useState<string>('');
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);

  // WebSocket ref for real-time
  const wsRef = useRef<WebSocket | null>(null);

  // Load teams from API on mount
  const refreshTeams = useCallback(() => {
    setTeamsLoading(true);
    api.getTeams()
      .then(data => {
        const mapped: Team[] = data.map(t => ({
          id: t.id,
          name: t.name,
          color: t.color,
          members: t.members,
          projects: t.projects.map(p => ({
            id: p.id,
            name: p.name,
            lang: p.lang,
            stars: p.stars,
            team_id: p.team_id,
            versions: p.versions.map(v => ({
              id: v.id,
              tag: v.tag,
              label: v.label,
              stable: v.stable,
              content: v.content,
              file_id: v.file_id,
              created_by: v.created_by,
              created_at: v.created_at,
            })),
          })),
        }));
        setTeams(mapped);
      })
      .catch(err => console.error('Failed to load teams:', err))
      .finally(() => setTeamsLoading(false));
  }, []);

  useEffect(() => { refreshTeams(); }, [refreshTeams]);

  // WebSocket connection per project
  useEffect(() => {
    if (!currentProjectId) return;
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${proto}//${window.location.host}/ws/${currentProjectId}`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.type === 'chat') {
          setMessages(prev => [...prev, {
            userId: String(payload.user_id),
            userName: payload.user_name,
            color: USER_COLORS[String(payload.user_id)] ?? '#2dd4bf',
            text: payload.text,
            timestamp: Date.now(),
          }]);
        } else if (payload.type === 'version_saved') {
          refreshTeams();
        }
      } catch { /* ignore */ }
    };

    return () => { ws.close(); wsRef.current = null; };
  }, [currentProjectId, refreshTeams]);

  const openFile = useCallback((tab: Tab) => {
    setTabs(prev => prev.find(t => t.id === tab.id) ? prev : [...prev, tab]);
    setActiveTabId(tab.id);
    setViewMode('editor');
    if (tab.content !== undefined) {
      setEditorContent(tab.content);
    }
  }, []);

  const closeTab = useCallback((id: string) => {
    setTabs(prev => {
      const next = prev.filter(t => t.id !== id);
      if (activeTabId === id) setActiveTabId(next.length ? next[next.length - 1].id : null);
      if (next.length === 0) {
        setViewMode('welcome');
        setEditorContent('');
      }
      return next;
    });
  }, [activeTabId]);

  const loadVersion = useCallback((versionId: number) => {
    api.getVersion(versionId).then(v => {
      const ext = v.tag.includes('beta') || v.tag.includes('alpha') || v.tag.includes('rc') || v.tag.includes('dev') ? 'ts' : 'ts';
      const tab: Tab = {
        id: `version-${v.id}`,
        name: `${v.tag}`,
        ext,
        content: v.content,
        fileId: v.file_id,
        versionId: v.id,
      };
      setTabs(prev => {
        const existing = prev.find(t => t.id === tab.id);
        if (existing) return prev;
        return [...prev, tab];
      });
      setActiveTabId(tab.id);
      setEditorContent(v.content);
      setViewMode('editor');
    }).catch(err => console.error('Failed to load version:', err));
  }, []);

  const saveVersion = useCallback((tag: string, label?: string) => {
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (!activeTab?.fileId) return;

    api.createVersion({
      file_id: activeTab.fileId,
      content: editorContent,
      tag,
      label: label ?? '',
      stable: false,
      created_by: 4, // "You" user
    }).then(() => {
      // Mark tab as not dirty
      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, isDirty: false } : t));
      refreshTeams();
      // Broadcast via WS
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'version_saved' }));
      }
    }).catch(err => console.error('Failed to save version:', err));
  }, [tabs, activeTabId, editorContent, refreshTeams]);

  const sendMessage = useCallback((text: string) => {
    const msg: ChatMessage = {
      userId: 'me', userName: 'You', color: '#2dd4bf', text, timestamp: Date.now(),
    };
    setMessages(prev => [...prev, msg]);

    // Send via REST
    if (currentProjectId) {
      api.sendMessage({ project_id: currentProjectId, user_id: 4, text }).catch(() => {});
    }
    // Broadcast via WS
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'chat', user_id: 4, user_name: 'You', text }));
    }
  }, [currentProjectId]);

  // When active tab changes, update editor content
  useEffect(() => {
    if (!activeTabId) return;
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab?.content !== undefined) {
      setEditorContent(tab.content);
    }
  }, [activeTabId, tabs]);

  return (
    <Ctx.Provider value={{
      viewMode, tabs, activeTabId, chatOpen, messages, collaborators: COLLABORATORS,
      teams, teamsLoading, editorContent, currentProjectId,
      openFile, closeTab, setActiveTab: setActiveTabId, toggleChat: () => setChatOpen(v => !v),
      sendMessage, setViewMode, loadVersion, saveVersion, setEditorContent, refreshTeams,
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
