const BASE = '/api';

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
}

/* ── Teams ── */
export interface TeamDTO {
  id: number;
  name: string;
  color: string;
  members: number;
  projects: ProjectDTO[];
}

export interface ProjectDTO {
  id: number;
  name: string;
  lang: string;
  stars: number;
  team_id: number;
  versions: VersionDTO[];
}

export interface VersionDTO {
  id: number;
  tag: string;
  label: string;
  stable: boolean;
  content: string;
  file_id: number;
  created_by: number | null;
  created_at: string;
}

export interface FileDTO {
  id: number;
  name: string;
  content: string;
  project_id: number;
  versions: VersionDTO[];
}

export interface UserDTO {
  id: number;
  name: string;
  email: string;
}

export interface ChatMessageDTO {
  id: number;
  project_id: number;
  user_id: number;
  user_name: string;
  text: string;
  created_at: string;
}

/* ── API calls ── */

export const api = {
  // Teams
  getTeams: () => request<TeamDTO[]>('/teams'),
  createTeam: (data: { name: string; color?: string; owner_id: number }) =>
    request<TeamDTO>('/teams', { method: 'POST', body: JSON.stringify(data) }),

  // Projects
  getProjects: (teamId: number) => request<ProjectDTO[]>(`/projects/${teamId}`),
  createProject: (data: { name: string; lang?: string; team_id: number }) =>
    request<ProjectDTO>('/projects', { method: 'POST', body: JSON.stringify(data) }),

  // Files
  getFiles: (projectId: number) => request<FileDTO[]>(`/files/${projectId}`),
  createFile: (data: { name: string; project_id: number; content?: string }) =>
    request<FileDTO>('/files', { method: 'POST', body: JSON.stringify(data) }),

  // Versions
  getVersions: (fileId: number) => request<VersionDTO[]>(`/versions/${fileId}`),
  getVersion: (versionId: number) => request<VersionDTO>(`/versions/detail/${versionId}`),
  createVersion: (data: {
    file_id: number;
    content: string;
    tag: string;
    label?: string;
    stable?: boolean;
    created_by?: number;
  }) => request<VersionDTO>('/versions', { method: 'POST', body: JSON.stringify(data) }),

  // Users
  getUsers: () => request<UserDTO[]>('/users'),
  createUser: (data: { name: string; email: string }) =>
    request<UserDTO>('/users', { method: 'POST', body: JSON.stringify(data) }),

  // Chat
  getMessages: (projectId: number) => request<ChatMessageDTO[]>(`/chat/${projectId}`),
  sendMessage: (data: { project_id: number; user_id: number; text: string }) =>
    request<ChatMessageDTO>('/chat', { method: 'POST', body: JSON.stringify(data) }),

  // Health
  health: () => request<{ status: string }>('/health'),
};
