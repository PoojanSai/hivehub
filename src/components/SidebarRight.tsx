import { Upload, Cloud } from 'lucide-react';
import TeamTree from './TeamTree';
import { TEAMS } from '@/data/teams';

export default function SidebarRight() {
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
          <span className="stat-num">{TEAMS.length}</span>
          <span className="stat-label">Teams</span>
        </div>
        <div className="cloud-stat">
          <span className="stat-num">{TEAMS.reduce((a, t) => a + t.projects.length, 0)}</span>
          <span className="stat-label">Projects</span>
        </div>
        <div className="cloud-stat">
          <span className="stat-num">{TEAMS.reduce((a, t) => a + t.projects.reduce((b, p) => b + p.versions.length, 0), 0)}</span>
          <span className="stat-label">Versions</span>
        </div>
      </div>

      {/* Tree */}
      <div className="sidebar-scroll">
        <TeamTree teams={TEAMS}/>
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
