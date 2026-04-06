# HIVEHUB — Collaborative Coding Platform

Real-time collaborative coding hub with isolated environments, cloud versioning, and integrated team chat.

## Stack
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** with custom `hive.*` color tokens
- **JetBrains Mono** + **Syne** typefaces
- **lucide-react** icons
- **zustand** for state (ready to wire up)

## Getting Started

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173)

## Architecture

```
src/
├── components/
│   ├── Navbar.tsx        # Top bar: logo, nav, search, live avatars
│   ├── Layout.tsx        # 3-panel shell
│   ├── SidebarLeft.tsx   # Local workspace file tree
│   ├── SidebarRight.tsx  # Cloud projects / teams
│   ├── FileTree.tsx      # Recursive file tree component
│   ├── TeamTree.tsx      # Teams → Projects → Versions tree
│   └── EditorPanel.tsx   # Welcome view + code editor + chat
├── context/
│   └── AppContext.tsx    # Global state: tabs, chat, view mode
├── data/
│   ├── fileSystem.ts     # Mock local file system
│   └── teams.ts          # Mock cloud teams / projects / versions
└── types/
    └── index.ts          # All TypeScript interfaces
```

## Features
- **Welcome screen** with hex-grid background, animated logo, and stats
- **File explorer** with syntax-colored extension dots, active highlighting, modification timestamps
- **Cloud projects** panel with expandable teams, projects, version history, Fork/View hover actions
- **Code editor** with syntax highlighting (keywords, types, strings, JSX tags, numbers)
- **Live collaborator cursors** — colored line backgrounds + name labels
- **Team chat** panel with collapsible sidebar and real-time feel
- **Status bar** with branch, cursor position, language, and live collaborator count
