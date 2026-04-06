/* ─── FILE SYSTEM ─── */
export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  ext?: string;
  sz?: string;
  m?: string;
  open?: boolean;
  children?: FileNode[];
}

/* ─── CLOUD / TEAMS ─── */
export interface Version {
  id: string;
  tag: string;
  label: string;
  stable: boolean;
  date?: string;
}

export interface Project {
  id: string;
  name: string;
  lang: string;
  stars: number;
  versions: Version[];
}

export interface Team {
  id: string;
  name: string;
  color: string;
  members: number;
  projects: Project[];
}

/* ─── EDITOR ─── */
export interface Tab {
  id: string;
  name: string;
  ext: string;
  sz?: string;
  m?: string;
  isDirty?: boolean;
}

export interface Collaborator {
  id: string;
  name: string;
  color: string;
  avatar: string;
  line: number;
}

export interface ChatMessage {
  userId: string;
  userName: string;
  color: string;
  text: string;
  timestamp: number;
}

/* ─── APP STATE ─── */
export type ViewMode = 'welcome' | 'editor';
