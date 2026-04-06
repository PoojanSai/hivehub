import { useState } from 'react';
import { Search, FilePlus, FolderPlus, HardDrive, RefreshCw } from 'lucide-react';
import FileTree from './FileTree';
import { FILE_SYSTEM } from '@/data/fileSystem';

export default function SidebarLeft() {
  const [filter, setFilter] = useState('');

  return (
    <aside className="sidebar sidebar-left">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-title">
          <HardDrive size={12}/>
          <span>Local Workspace</span>
        </div>
        <div className="sidebar-actions">
          <button className="icon-btn-sm" title="New File"><FilePlus size={13}/></button>
          <button className="icon-btn-sm" title="New Folder"><FolderPlus size={13}/></button>
          <button className="icon-btn-sm" title="Refresh"><RefreshCw size={12}/></button>
        </div>
      </div>

      {/* Search */}
      <div className="sidebar-search">
        <Search size={11}/>
        <input
          placeholder="Filter files…"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>

      {/* Tree */}
      <div className="sidebar-scroll">
        <div className="workspace-root">
          <span className="root-name">{FILE_SYSTEM.name}</span>
        </div>
        <FileTree root={FILE_SYSTEM}/>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <span>12 files · 3 folders</span>
        <div className="sync-status">
          <span className="sync-dot"/>
          <span>Synced</span>
        </div>
      </div>
    </aside>
  );
}
