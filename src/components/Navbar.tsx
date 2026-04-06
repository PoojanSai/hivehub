import { useState } from 'react';
import { Bell, Settings, Search, Command, GitBranch, Zap } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function Navbar() {
  const { collaborators } = useApp();
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="navbar">
      {/* Logo */}
      <div className="navbar-logo">
        <div className="logo-hex">
          <svg viewBox="0 0 40 46" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="28">
            <path d="M20 1L38 11.5V34.5L20 45L2 34.5V11.5L20 1Z"
              fill="url(#hexGrad)" stroke="#2dd4bf" strokeWidth="1.5"/>
            <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle"
              fill="white" fontSize="14" fontWeight="700" fontFamily="JetBrains Mono">H</text>
            <defs>
              <linearGradient id="hexGrad" x1="2" y1="1" x2="38" y2="45" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0f2027"/>
                <stop offset="1" stopColor="#1a1f2e"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <span className="logo-text">HIVEHUB</span>
        <div className="logo-badge">BETA</div>
      </div>

      {/* Nav links */}
      <nav className="navbar-nav">
        {['Dashboard', 'Projects', 'Teams', 'Activity'].map(item => (
          <a key={item} href="#" className="nav-link">{item}</a>
        ))}
      </nav>

      {/* Search */}
      <div className={`navbar-search ${searchFocused ? 'focused' : ''}`}>
        <Search size={13} className="search-icon" />
        <input
          placeholder="Search files, projects, teams…"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        <div className="search-kbd">
          <Command size={10}/><span>K</span>
        </div>
      </div>

      {/* Right actions */}
      <div className="navbar-actions">
        {/* Live collaborators */}
        <div className="collab-avatars">
          {collaborators.map(c => (
            <div key={c.id} className="collab-avatar" style={{ borderColor: c.color, background: c.color + '33' }} title={c.name}>
              <span style={{ color: c.color }}>{c.avatar}</span>
              <span className="live-dot" style={{ background: c.color }}/>
            </div>
          ))}
        </div>

        <div className="nav-sep"/>

        <button className="icon-btn" title="Branch">
          <GitBranch size={15}/>
          <span className="branch-label">main</span>
        </button>
        <button className="icon-btn" title="Activity">
          <Zap size={15}/>
        </button>
        <button className="icon-btn notif" title="Notifications">
          <Bell size={15}/>
          <span className="notif-dot"/>
        </button>
        <button className="icon-btn" title="Settings">
          <Settings size={15}/>
        </button>

        <div className="user-avatar">
          <span>EK</span>
        </div>
      </div>
    </header>
  );
}
