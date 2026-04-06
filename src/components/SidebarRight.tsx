import { Upload, Cloud, Loader2 } from 'lucide-react';
import TeamTree from './TeamTree';
import { useApp } from '@/context/AppContext';

export default function SidebarRight() {
  const { teams, teamsLoading } = useApp();

  const totalProjects = teams.reduce((a, t) => a + t.projects.length, 0);
  const totalVersions = teams.reduce((a, t) => a + t.projects.reduce((b, p) => b + p.versions.length, 0), 0);

  return (
    <aside className="sidebar sidebar-right">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-title">
          <Cloud size={12}/>
          <span>Cloud Projects</span>
        </div>
        <button className="upload-btn">
          <Upload size={11}/>
          <span>Upload</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="cloud-stats">
        <div className="cloud-stat">
          <span className="stat-num">{teams.length}</span>
          <span className="stat-label">Teams</span>
        </div>
        <div className="cloud-stat">
          <span className="stat-num">{totalProjects}</span>
          <span className="stat-label">Projects</span>
        </div>
        <div className="cloud-stat">
          <span className="stat-num">{totalVersions}</span>
          <span className="stat-label">Versions</span>
        </div>
      </div>

      {/* Tree */}
      <div className="sidebar-scroll">
        {teamsLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0', opacity: 0.5 }}>
            <Loader2 size={18} className="spin"/>
          </div>
        ) : (
          <TeamTree teams={teams}/>
        )}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="storage-bar">
          <div className="storage-label">
            <span>Storage</span>
            <span>2.4 GB / 10 GB</span>
          </div>
          <div className="storage-track">
            <div className="storage-fill" style={{ width: '24%' }}/>
          </div>
        </div>
      </div>
    </aside>
  );
}
