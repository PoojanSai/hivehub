from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db.database import engine, Base, SessionLocal
from .db.models import User, Team, TeamMember, Project, File, Version
from .routes import (
    user_routes,
    team_routes,
    project_routes,
    file_routes,
    version_routes,
    chat_routes,
    ws_routes,
)


def _seed(db):
    """Seed database with initial data if empty."""
    if db.query(User).first():
        return

    # Users
    u1 = User(name="Aisha K.", email="aisha@hivehub.dev")
    u2 = User(name="Rajan M.", email="rajan@hivehub.dev")
    u3 = User(name="Mei L.", email="mei@hivehub.dev")
    u4 = User(name="You", email="you@hivehub.dev")
    db.add_all([u1, u2, u3, u4])
    db.flush()

    # Teams
    t1 = Team(name="Alpha Squad", color="#2dd4bf", owner_id=u1.id)
    t2 = Team(name="Beta Builders", color="#8b5cf6", owner_id=u2.id)
    t3 = Team(name="Cloud Crafters", color="#34d399", owner_id=u3.id)
    db.add_all([t1, t2, t3])
    db.flush()

    # Members
    for t, users in [(t1, [u1, u2, u3, u4]), (t2, [u2, u3, u4]), (t3, [u3, u1, u4])]:
        for u in users:
            db.add(TeamMember(team_id=t.id, user_id=u.id))
    db.flush()

    # --- Alpha Squad projects ---
    p1 = Project(name="hive-core", lang="TypeScript", stars=142, team_id=t1.id)
    p2 = Project(name="hive-ui", lang="React", stars=89, team_id=t1.id)
    db.add_all([p1, p2])
    db.flush()

    f1 = File(name="useCollab.ts", content=SAMPLE_CODE, project_id=p1.id)
    f2 = File(name="App.tsx", content=SAMPLE_CODE_2, project_id=p2.id)
    db.add_all([f1, f2])
    db.flush()

    db.add(Version(tag="v3.2.1", label="Latest stable", stable=True, content=SAMPLE_CODE, file_id=f1.id, created_by=u1.id))
    db.add(Version(tag="v3.1.0", label="Previous", stable=True, content="// v3.1.0 snapshot\n" + SAMPLE_CODE, file_id=f1.id, created_by=u2.id))
    db.add(Version(tag="v3.3.0-beta", label="Beta", stable=False, content="// v3.3.0-beta snapshot\n" + SAMPLE_CODE, file_id=f1.id, created_by=u3.id))
    db.add(Version(tag="v2.0.4", label="Latest stable", stable=True, content=SAMPLE_CODE_2, file_id=f2.id, created_by=u1.id))
    db.add(Version(tag="v2.1.0-rc", label="Release candidate", stable=False, content="// v2.1.0-rc\n" + SAMPLE_CODE_2, file_id=f2.id, created_by=u2.id))

    # --- Beta Builders projects ---
    p3 = Project(name="realtime-sync", lang="Go", stars=231, team_id=t2.id)
    p4 = Project(name="auth-service", lang="Python", stars=67, team_id=t2.id)
    db.add_all([p3, p4])
    db.flush()

    f3 = File(name="sync.go", content=SAMPLE_GO, project_id=p3.id)
    f4 = File(name="auth.py", content=SAMPLE_PY, project_id=p4.id)
    db.add_all([f3, f4])
    db.flush()

    db.add(Version(tag="v1.8.0", label="Latest stable", stable=True, content=SAMPLE_GO, file_id=f3.id, created_by=u2.id))
    db.add(Version(tag="v1.7.3", label="LTS", stable=True, content="// v1.7.3 LTS\n" + SAMPLE_GO, file_id=f3.id, created_by=u2.id))
    db.add(Version(tag="v1.9.0-dev", label="Dev build", stable=False, content="// v1.9.0-dev\n" + SAMPLE_GO, file_id=f3.id, created_by=u3.id))
    db.add(Version(tag="v0.9.2", label="Latest stable", stable=True, content=SAMPLE_PY, file_id=f4.id, created_by=u2.id))

    # --- Cloud Crafters projects ---
    p5 = Project(name="infra-deploy", lang="Terraform", stars=178, team_id=t3.id)
    p6 = Project(name="monitor-agent", lang="Rust", stars=94, team_id=t3.id)
    db.add_all([p5, p6])
    db.flush()

    f5 = File(name="main.tf", content=SAMPLE_TF, project_id=p5.id)
    f6 = File(name="agent.rs", content=SAMPLE_RS, project_id=p6.id)
    db.add_all([f5, f6])
    db.flush()

    db.add(Version(tag="v4.0.1", label="Latest stable", stable=True, content=SAMPLE_TF, file_id=f5.id, created_by=u3.id))
    db.add(Version(tag="v4.0.0", label="Previous", stable=True, content="# v4.0.0\n" + SAMPLE_TF, file_id=f5.id, created_by=u3.id))
    db.add(Version(tag="v4.1.0-alpha", label="Alpha", stable=False, content="# v4.1.0-alpha\n" + SAMPLE_TF, file_id=f5.id, created_by=u1.id))
    db.add(Version(tag="v1.2.4", label="Latest stable", stable=True, content=SAMPLE_RS, file_id=f6.id, created_by=u3.id))
    db.add(Version(tag="v1.3.0-beta", label="Beta", stable=False, content="// v1.3.0-beta\n" + SAMPLE_RS, file_id=f6.id, created_by=u1.id))

    db.commit()


SAMPLE_CODE = """import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import type { Collaborator, Tab } from '@/types';

// Real-time collaboration hook
export function useCollab(roomId: string) {
  const { collaborators } = useApp();
  const [connected, setConnected] = useState(false);
  const [cursors, setCursors] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    const ws = new WebSocket(`wss://api.hivehub.dev/rooms/${roomId}`);
    ws.onopen  = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (e) => {
      const { userId, line } = JSON.parse(e.data);
      setCursors(prev => new Map(prev).set(userId, line));
    };
    return () => ws.close();
  }, [roomId]);

  function broadcast(line: number) {
    // Emit cursor position to all collaborators
    console.log('cursor at line', line);
  }

  return { connected, cursors, broadcast };
}""".strip()

SAMPLE_CODE_2 = """import React from 'react';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';

export default function App() {
  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  );
}""".strip()

SAMPLE_GO = """package sync

import (
    "context"
    "log"
    "net/http"
    "github.com/gorilla/websocket"
)

type Hub struct {
    clients    map[*Client]bool
    broadcast  chan []byte
    register   chan *Client
    unregister chan *Client
}

func NewHub() *Hub {
    return &Hub{
        broadcast:  make(chan []byte),
        register:   make(chan *Client),
        unregister: make(chan *Client),
        clients:    make(map[*Client]bool),
    }
}

func (h *Hub) Run() {
    for {
        select {
        case client := <-h.register:
            h.clients[client] = true
            log.Println("client connected")
        case client := <-h.unregister:
            if _, ok := h.clients[client]; ok {
                delete(h.clients, client)
                close(client.send)
            }
        case message := <-h.broadcast:
            for client := range h.clients {
                select {
                case client.send <- message:
                default:
                    close(client.send)
                    delete(h.clients, client)
                }
            }
        }
    }
}""".strip()

SAMPLE_PY = """from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
pwd_context = CryptContext(schemes=["bcrypt"])

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401)
    except JWTError:
        raise HTTPException(status_code=401)
    return username

@app.post("/token")
async def login(username: str, password: str):
    # Validate credentials
    access_token = jwt.encode({"sub": username}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": access_token, "token_type": "bearer"}""".strip()

SAMPLE_TF = """provider "aws" {
  region = "us-west-2"
}

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "hivehub-vpc"
    Environment = "production"
  }
}

resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(aws_vpc.main.cidr_block, 8, count.index)
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "hivehub-public-${count.index}"
  }
}

resource "aws_ecs_cluster" "app" {
  name = "hivehub-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}""".strip()

SAMPLE_RS = """use tokio::net::TcpListener;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

type Metrics = Arc<RwLock<HashMap<String, f64>>>;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let metrics: Metrics = Arc::new(RwLock::new(HashMap::new()));
    let listener = TcpListener::bind("0.0.0.0:9090").await?;

    println!("Monitor agent listening on :9090");

    loop {
        let (mut socket, addr) = listener.accept().await?;
        let metrics = metrics.clone();

        tokio::spawn(async move {
            let mut buf = [0; 1024];
            match socket.read(&mut buf).await {
                Ok(n) if n > 0 => {
                    let data = String::from_utf8_lossy(&buf[..n]);
                    if let Some((key, val)) = parse_metric(&data) {
                        let mut m = metrics.write().await;
                        m.insert(key, val);
                    }
                    socket.write_all(b"OK").await.ok();
                }
                _ => {}
            }
        });
    }
}

fn parse_metric(data: &str) -> Option<(String, f64)> {
    let parts: Vec<&str> = data.splitn(2, ':').collect();
    if parts.len() == 2 {
        let val: f64 = parts[1].trim().parse().ok()?;
        Some((parts[0].trim().to_string(), val))
    } else {
        None
    }
}""".strip()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        _seed(db)
    finally:
        db.close()
    yield


app = FastAPI(title="HiveHub API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_routes.router, prefix="/api")
app.include_router(team_routes.router, prefix="/api")
app.include_router(project_routes.router, prefix="/api")
app.include_router(file_routes.router, prefix="/api")
app.include_router(version_routes.router, prefix="/api")
app.include_router(chat_routes.router, prefix="/api")
app.include_router(ws_routes.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
