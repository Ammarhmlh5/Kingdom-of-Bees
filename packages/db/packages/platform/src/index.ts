const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
import type { SyncEvent } from './types';
import { supabase } from './supabaseClient';

dotenv.config();

const app = express();
app.use(bodyParser.json());

function findRepoRoot(startDir: string): string {
  let dir = startDir;
  for (let i = 0; i < 10; i++) {
    const cand = path.join(dir, 'infra');
    if (fs.existsSync(cand)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

const repoRoot = findRepoRoot(__dirname);
const DATA_DIR = path.join(repoRoot, 'infra', 'postgres', 'project2');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const INGEST_FILE = path.join(DATA_DIR, 'ingest_events.jsonl');
const AUTH_FILE = path.join(DATA_DIR, 'auth_signups.jsonl');

function appendJsonLine(file: string, obj: any) {
  try {
    fs.appendFileSync(file, JSON.stringify(obj) + "\n");
  } catch (e) {
    console.error("appendJsonLine error", e);
  }
}


function logServer(msg:any) {
  try {
    const logFile = path.join(DATA_DIR, 'server.log');
    const line = (new Date()).toISOString() + ' ' + (typeof msg === 'string' ? msg : JSON.stringify(msg)) + '\
';
    fs.appendFileSync(logFile, line);
  } catch (e) { console.error('logServer failed', e); }
}

// Ensure Prisma uses the platform-local sqlite dev DB when not set
if (!process.env.DATABASE_URL_PLATFORM) {
  const platformDir = path.resolve(__dirname, '..');
  const dbPath = path.join(platformDir, 'dev.db');
  process.env.DATABASE_URL_PLATFORM = 'file:' + dbPath;
  console.log('Set DATABASE_URL_PLATFORM=', process.env.DATABASE_URL_PLATFORM);
}
let prisma: any = null;
try {
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
  console.log('✅ Prisma client available');
} catch (e: any) {
  console.warn('⚠️  Prisma client not available, falling back to JSONL storage');
}

// Supabase client is always available
console.log('✅ Supabase client initialized');

app.get('/health', (req: any, res: any) => res.json({ ok: true, time: new Date().toISOString() }));

app.post('/auth/signup', async (req: any, res: any) => {
  const { email, phone, countryCode, username } = req.body || {};
  if (!email && !phone) return res.status(400).json({ ok: false, error: 'email or phone required' });
  const user = { id: 'local-' + Date.now(), email, phone, countryCode, username, createdAt: new Date().toISOString() };
  appendJsonLine(AUTH_FILE, user);
  
  // Write to Prisma (local DB)
  if (prisma) {
    try {
      await prisma.userProfile.create({ data: { id: user.id, email: user.email, phone: user.phone, username: user.username || user.id } });
    } catch (e:any) { console.error('Prisma signup write failed', e); try { logServer({ event: 'Prisma signup write failed', error: String(e) }); } catch(e){} }
  }
  
  // Write to Supabase (cloud DB)
  try {
    const { error } = await supabase
      .from('user_profile')
      .insert([{ 
        email: user.email, 
        phone: user.phone, 
        username: user.username || user.id 
      }]);
    if (error) {
      console.error('Supabase signup write failed:', error.message);
      logServer({ event: 'Supabase signup write failed', error: error.message });
    } else {
      console.log('✅ User saved to Supabase');
    }
  } catch (e: any) {
    console.error('Supabase signup exception:', e);
  }
  
  res.status(201).json({ ok: true, userId: user.id, message: 'signup-stub-saved' });
});

app.post('/auth/login', (req: any, res: any) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ ok: false, error: 'email and password required' });
  res.json({ ok: true, accessToken: 'fake-token-' + Date.now(), userId: 'local-' + Date.now() });
});

app.post('/sync/push', async (req: any, res: any) => {
  const body = req.body || {};
  const deviceId = body.deviceId || null;
  const batchId = body.batchId || null;
  const events = Array.isArray(body.events) ? body.events : (body.events ? [body.events] : []);
  const serverTime = new Date().toISOString();
  const saved: any[] = [];
  
  for (const e of events) {
    const ev = Object.assign({ serverReceivedAt: serverTime, deviceId, batchId }, e);
    appendJsonLine(INGEST_FILE, ev);
    
    // Write to Prisma (local DB)
    if (prisma) {
      try {
        await prisma.syncEvent.create({ data: {
          clientId: ev.clientId || null,
          deviceId: ev.deviceId || null,
          batchId: ev.batchId || null,
          entity: ev.entity || null,
          operation: ev.operation || null,
          payload: ev.payload || {},
          clientCreatedAt: ev.clientCreatedAt ? new Date(ev.clientCreatedAt) : null,
          serverReceivedAt: new Date(ev.serverReceivedAt),
          processed: false,
          userId: ev.userId || null
        } });
      } catch (err:any) { console.error('prisma.syncEvent.create failed', err); try { logServer({ event: 'prisma.syncEvent.create failed', error: String(err) }); } catch(e){} }
    }
    
    // Write to Supabase (cloud DB)
    try {
      const { error } = await supabase
        .from('sync_event')
        .insert([{
          client_id: ev.clientId || null,
          device_id: ev.deviceId || null,
          batch_id: ev.batchId || null,
          entity: ev.entity || null,
          operation: ev.operation || null,
          payload: ev.payload || {},
          client_created_at: ev.clientCreatedAt || null,
          server_received_at: ev.serverReceivedAt,
          processed: false,
          user_id: ev.userId || null
        }]);
      
      if (error) {
        console.error('Supabase sync write failed:', error.message);
        logServer({ event: 'Supabase sync write failed', error: error.message, clientId: ev.clientId });
      }
    } catch (err: any) {
      console.error('Supabase sync exception:', err);
    }
    
    saved.push({ clientId: e.clientId || null, status: 'ok' });
  }
  res.json({ ok: true, serverTime, applied: saved });
});

app.post('/sync/pull', (req: any, res: any) => {
  const since = req.body && req.body.since ? new Date(req.body.since) : null;
  const max = (req.body && req.body.max) ? parseInt(req.body.max) : 200;
  const out: any[] = [];
  if (fs.existsSync(INGEST_FILE)) {
    const lines = fs.readFileSync(INGEST_FILE, 'utf8').split('\n').filter(Boolean);
    for (let i = lines.length - 1; i >= 0 && out.length < max; i--) {
      try {
        const obj = JSON.parse(lines[i] as string);
        const t = obj.serverReceivedAt ? new Date(obj.serverReceivedAt) : null;
        if (!since || (t && t > since)) out.push(obj);
      } catch (e) { }
    }
    out.reverse();
  }
  res.json({ ok: true, serverTime: new Date().toISOString(), events: out });
});

app.get('/internal/ingest/recent', (req: any, res: any) => {
  const out: any[] = [];
  if (fs.existsSync(INGEST_FILE)) {
    const lines = fs.readFileSync(INGEST_FILE, 'utf8').split('\n').filter(Boolean);
    const tail = lines.slice(-50);
    tail.forEach((l: string) => { try { out.push(JSON.parse(l as string)); } catch (e) { } });
  }
  res.json({ ok: true, count: out.length, events: out });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('TS Server listening', port));

// DB status endpoint: tries a lightweight query via Prisma if available
app.get('/internal/db/status', async (req:any, res:any) => {
  if (!prisma) return res.json({ ok:true, prisma:false, message: 'Prisma client not loaded' });
  try {
    // simple raw query to check connectivity
    await prisma.$queryRawUnsafe('SELECT 1');
    return res.json({ ok:true, prisma:true, connected:true });
  } catch (e:any) {
    return res.json({ ok:true, prisma:true, connected:false, error: e.message });
  }
});












\n// OAuth consent redirect handler\napp.get('/oauth/consent', (req:any, res:any) => {\n  const { code, state, error } = req.query || {};\n  try {\n    logServer({ event: 'oauth_consent', code: code || null, state: state || null, error: error || null, ip: req.ip });\n  } catch (e) { console.error('logServer failed for oauth_consent', e); }\n  res.setHeader('Content-Type', 'text/html');\n  res.send(\<html><body><h2>OAuth consent received</h2><p>code: \</p><p>state: \</p><p>error: \</p><p>Return to the app.</p></body></html>\);\n});\n
