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
  id: number;
  tag: string;
  label: string;
  stable: boolean;
  content: string;
  file_id: number;
  created_by: number | null;
  created_at: string;
  date?: string;
}

export interface Project {
  id: number;
  name: string;
  lang: string;
  stars: number;
  team_id: number;
  versions: Version[];
}

export interface Team {
  id: number;
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
  content?: string;
  fileId?: number;
  versionId?: number;
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
