import { useState } from 'react';
import { ChevronRight, ChevronDown, Users, Folder, Star, GitFork, Eye, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { Team, Project, Version } from '@/types';
import { useApp } from '@/context/AppContext';

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

interface VersionRowProps { version: Version; }
function VersionRow({ version }: VersionRowProps) {
  const [hovered, setHovered] = useState(false);
  const { loadVersion } = useApp();
  const displayDate = version.created_at ? timeAgo(version.created_at) : version.date ?? '';

  return (
    <div
      className={`version-row ${hovered ? 'hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="ver-icon">
        {version.stable
          ? <CheckCircle2 size={11} color="#34d399"/>
          : <AlertTriangle size={11} color="#fbbf24"/>}
      </span>
      <span className="ver-tag">{version.tag}</span>
      <span className="ver-label">{version.label}</span>
      {displayDate && <span className="ver-date">{displayDate}</span>}
      {hovered && (
        <div className="ver-actions">
          <button className="ver-btn" onClick={() => loadVersion(version.id)}><Eye size={10}/> View</button>
          <button className="ver-btn fork"><GitFork size={10}/> Fork</button>
        </div>
      )}
    </div>
  );
}

interface ProjectRowProps { project: Project; }
function ProjectRow({ project }: ProjectRowProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="project-block">
      <button className="project-row" onClick={() => setOpen(v => !v)}>
        <span className="proj-chevron">
          {open ? <ChevronDown size={11}/> : <ChevronRight size={11}/>}
        </span>
        <Folder size={12} color="#60a5fa" className="proj-icon"/>
        <span className="proj-name">{project.name}</span>
        <span className="lang-badge">{project.lang}</span>
        <span className="star-count"><Star size={9}/>{project.stars}</span>
      </button>
      {open && (
        <div className="versions-list">
          {project.versions.map(v => <VersionRow key={v.id} version={v}/>)}
        </div>
      )}
    </div>
  );
}

interface TeamRowProps { team: Team; }
function TeamRow({ team }: TeamRowProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="team-block">
      <button className="team-row" onClick={() => setOpen(v => !v)}>
        <span className="team-chevron">
          {open ? <ChevronDown size={12}/> : <ChevronRight size={12}/>}
        </span>
        <div className="team-icon" style={{ background: team.color + '22', border: `1px solid ${team.color}44` }}>
          <Users size={11} color={team.color}/>
        </div>
        <span className="team-name">{team.name}</span>
        <span className="member-badge" style={{ color: team.color }}>{team.members}</span>
      </button>
      {open && (
        <div className="projects-list">
          {team.projects.map(p => <ProjectRow key={p.id} project={p}/>)}
        </div>
      )}
    </div>
  );
}

interface TeamTreeProps { teams: Team[]; }
export default function TeamTree({ teams }: TeamTreeProps) {
  return (
    <div className="team-tree">
      {teams.map(t => <TeamRow key={t.id} team={t}/>)}
    </div>
  );
}
