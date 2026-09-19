import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import { randomUUID } from 'crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { Agent, generateTestPlan, discoverScreens, exportAll, detectStack } from '@beyondagtest/core';
import type { AppConfig, AgentConfig, TestResult, Platform, Stack, TestScope, AnalysisMode, ExportOptions } from '@beyondagtest/core';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = parseInt(process.env.PORT || '3000');
const DATA_DIR = process.env.DATA_DIR || './data';
const RESULTS_DIR = join(DATA_DIR, 'results');
const AGENTS_DIR = join(DATA_DIR, 'agents');
const PROVIDERS_DIR = join(DATA_DIR, 'providers');
const SCHEDULES_DIR = join(DATA_DIR, 'schedules');

for (const dir of [DATA_DIR, RESULTS_DIR, AGENTS_DIR, PROVIDERS_DIR, SCHEDULES_DIR]) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, '../web/dist')));

const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
});

function broadcast(type: string, data: unknown) {
  const message = JSON.stringify({ type, data });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

function loadJson<T>(dir: string, id: string): T | null {
  const path = join(dir, `${id}.json`);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function saveJson(dir: string, id: string, data: unknown): void {
  writeFileSync(join(dir, `${id}.json`), JSON.stringify(data, null, 2));
}

function listDir(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''));
}

// Results API
app.get('/api/results', (_req, res) => {
  const ids = listDir(RESULTS_DIR);
  const results = ids.map((id) => loadJson<TestResult>(RESULTS_DIR, id)).filter(Boolean);
  res.json(results);
});

app.get('/api/results/:id', (req, res) => {
  const result = loadJson<TestResult>(RESULTS_DIR, req.params.id);
  if (!result) return res.status(404).json({ error: 'Not found' });
  res.json(result);
});

// Agents API
app.get('/api/agents', (_req, res) => {
  const ids = listDir(AGENTS_DIR);
  const agents = ids.map((id) => loadJson<AgentConfig>(AGENTS_DIR, id)).filter(Boolean);
  res.json(agents);
});

app.get('/api/agents/:id', (req, res) => {
  const agent = loadJson<AgentConfig>(AGENTS_DIR, req.params.id);
  if (!agent) return res.status(404).json({ error: 'Not found' });
  res.json(agent);
});

app.post('/api/agents', (req, res) => {
  const id = randomUUID();
  const agent: AgentConfig = {
    id,
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  saveJson(AGENTS_DIR, id, agent);
  res.json(agent);
});

app.put('/api/agents/:id', (req, res) => {
  const existing = loadJson<AgentConfig>(AGENTS_DIR, req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const updated = { ...existing, ...req.body, updatedAt: new Date() };
  saveJson(AGENTS_DIR, req.params.id, updated);
  res.json(updated);
});

app.delete('/api/agents/:id', (req, res) => {
  const filePath = join(AGENTS_DIR, `${req.params.id}.json`);
  if (!existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
  unlinkSync(filePath);
  res.json({ ok: true });
});

// Providers API
app.get('/api/providers', (_req, res) => {
  const ids = listDir(PROVIDERS_DIR);
  const providers = ids.map((id) => loadJson(PROVIDERS_DIR, id)).filter(Boolean);
  res.json(providers);
});

app.post('/api/providers', (req, res) => {
  const id = randomUUID();
  saveJson(PROVIDERS_DIR, id, { id, ...req.body });
  res.json({ id, ...req.body });
});

app.delete('/api/providers/:id', (req, res) => {
  const filePath = join(PROVIDERS_DIR, `${req.params.id}.json`);
  if (!existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
  unlinkSync(filePath);
  res.json({ ok: true });
});

// Analysis API
app.post('/api/analyze', async (req, res) => {
  const { appPath, platform, scope, mode } = req.body;

  try {
    const stack = detectStack(appPath);
    const screens = discoverScreens(appPath, stack);

    const config: AppConfig = {
      path: appPath,
      name: appPath.split('/').pop() || 'unknown',
      stack,
      platform: platform as Platform,
      mode: (mode || 'build') as AnalysisMode,
      scope: (scope || 'full') as TestScope,
      screens,
      dependencies: {},
      config: {},
    };

    const plan = generateTestPlan(config);
    const agent = new Agent();

    agent.on('test:step', (step, index, total) => {
      broadcast('test:step', { step, index, total });
    });

    agent.on('test:screenshot', (screenshot) => {
      broadcast('test:screenshot', screenshot);
    });

    agent.on('test:log', (log) => {
      broadcast('test:log', log);
    });

    agent.on('test:issue', (issue) => {
      broadcast('test:issue', issue);
    });

    const result = await agent.run(plan);

    const exportOptions: ExportOptions = {
      format: 'all',
      outputDir: join(RESULTS_DIR, result.id),
      includeScreenshots: true,
      includeLogs: true,
      includePerformance: true,
    };
    exportAll(result, exportOptions);

    saveJson(RESULTS_DIR, result.id, result);
    broadcast('test:complete', result);

    res.json(result);
  } catch (error) {
    broadcast('test:error', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ error: error instanceof Error ? error.message : 'Analysis failed' });
  }
});

// Download API
app.get('/api/download/:id/:format', (req, res) => {
  const resultDir = join(RESULTS_DIR, req.params.id);
  const format = req.params.format;

  const fileMap: Record<string, string> = {
    json: 'report.json',
    markdown: 'report.md',
    html: 'report.html',
  };

  const fileName = fileMap[format];
  if (!fileName) return res.status(400).json({ error: 'Invalid format' });

  const filePath = join(resultDir, fileName);
  if (!existsSync(filePath)) return res.status(404).json({ error: 'Report not found' });

  res.download(filePath);
});

// Schedules API
app.get('/api/schedules', (_req, res) => {
  const ids = listDir(SCHEDULES_DIR);
  const schedules = ids.map((id) => loadJson(SCHEDULES_DIR, id)).filter(Boolean);
  res.json(schedules);
});

app.post('/api/schedules', (req, res) => {
  const id = randomUUID();
  saveJson(SCHEDULES_DIR, id, { id, ...req.body });
  res.json({ id, ...req.body });
});

app.get('*', (_req, res) => {
  const indexPath = join(__dirname, '../web/dist/index.html');
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'Dashboard not built. Run: cd packages/dashboard/web && npm run build' });
  }
});

server.listen(PORT, () => {
  console.log(`BeyondAgtest Dashboard running at http://localhost:${PORT}`);
});
