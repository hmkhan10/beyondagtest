import { useState, useEffect, useRef } from 'react';

interface StepInfo {
  step: { type: string; target?: string };
  index: number;
  total: number;
}

const stepIcons: Record<string, string> = {
  navigate: '🧭',
  tap: '👆',
  swipe: '👋',
  type: '⌨️',
  screenshot: '📸',
  log: '📋',
  wait: '⏳',
  assert: '✅',
};

export default function TestRun() {
  const [steps, setSteps] = useState<StepInfo[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState('connecting');
  const [mounted, setMounted] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const stepsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'test:step') {
        setSteps((prev) => [...prev, msg.data]);
      } else if (msg.type === 'test:log') {
        setLogs((prev) => [...prev, `${msg.data.timestamp} ${msg.data.action} — ${msg.data.details}`]);
      } else if (msg.type === 'test:complete') {
        setStatus('complete');
      } else if (msg.type === 'test:error') {
        setStatus('error');
      }
    };

    ws.onopen = () => setStatus('connected');
    ws.onclose = () => setStatus('disconnected');

    return () => ws.close();
  }, []);

  useEffect(() => {
    stepsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [steps]);

  const progress = steps.length > 0 ? (steps[steps.length - 1].index + 1) / steps[steps.length - 1].total : 0;

  const statusColors: Record<string, { dot: string; text: string }> = {
    connecting: { dot: 'bg-yellow-500 animate-pulse', text: 'text-yellow-400' },
    connected: { dot: 'bg-emerald-500 animate-pulse', text: 'text-emerald-400' },
    complete: { dot: 'bg-emerald-500', text: 'text-emerald-400' },
    error: { dot: 'bg-red-500', text: 'text-red-400' },
    disconnected: { dot: 'bg-zinc-500', text: 'text-zinc-400' },
  };

  const currentStatus = statusColors[status] || statusColors.disconnected;

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="text-2xl font-bold tracking-tight mb-6">
            <span className="gradient-text">Live Test Run</span>
          </h1>

          {/* Status Card */}
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${currentStatus.dot}`} />
                <span className={`text-sm font-medium capitalize ${currentStatus.text}`}>{status}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-zinc-400">
                <span>Steps: {steps.length}</span>
                <span>Logs: {logs.length}</span>
              </div>
            </div>
            <div className="w-full bg-zinc-800/50 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-white/60 to-white/80 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            {progress > 0 && (
              <div className="text-right text-xs text-zinc-500 mt-1.5">
                {Math.round(progress * 100)}% complete
              </div>
            )}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Steps */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-zinc-800/50 flex items-center justify-center">
                  <span className="text-sm">📝</span>
                </div>
                <h2 className="font-semibold">Steps</h2>
              </div>
              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-2">
                {steps.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm py-1.5 px-2 rounded-md hover:bg-zinc-800/30 transition-colors"
                  >
                    <span className="text-zinc-600 text-xs w-8 text-right font-mono">
                      {s.index + 1}/{s.total}
                    </span>
                    <span className="text-base">{stepIcons[s.step.type] || '▸'}</span>
                    <span className="text-zinc-300 capitalize">{s.step.type}</span>
                    {s.step.target && (
                      <span className="text-zinc-500 text-xs truncate">({s.step.target})</span>
                    )}
                  </div>
                ))}
                {steps.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-3 animate-bounce-subtle">
                      <span className="text-xl">⏳</span>
                    </div>
                    <p className="text-zinc-500 text-sm">Waiting for test to start...</p>
                  </div>
                )}
                <div ref={stepsEndRef} />
              </div>
            </div>

            {/* Agent Log */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-zinc-800/50 flex items-center justify-center">
                  <span className="text-sm">📋</span>
                </div>
                <h2 className="font-semibold">Agent Log</h2>
              </div>
              <div className="space-y-1 max-h-96 overflow-y-auto pr-2 font-mono text-xs">
                {logs.map((log, i) => (
                  <div key={i} className="text-zinc-400 py-1 px-2 rounded hover:bg-zinc-800/30 transition-colors">
                    {log}
                  </div>
                ))}
                {logs.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl">📋</span>
                    </div>
                    <p className="text-zinc-500 text-sm">No logs yet...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
