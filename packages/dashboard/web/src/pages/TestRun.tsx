import { useState, useEffect, useRef } from 'react';

interface StepInfo {
  step: { type: string; target?: string };
  index: number;
  total: number;
}

export default function TestRun() {
  const [steps, setSteps] = useState<StepInfo[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState('connecting');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
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

  const progress = steps.length > 0 ? (steps[steps.length - 1].index + 1) / steps[steps.length - 1].total : 0;

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Live Test Run</h1>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-zinc-400">Status: <span className={`font-medium ${status === 'connected' ? 'text-green-400' : 'text-zinc-500'}`}>{status}</span></span>
          <span className="text-sm text-zinc-400">Steps: {steps.length}</span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-2">
          <div className="bg-white h-2 rounded-full transition-all" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Steps</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {steps.map((s, i) => (
              <div key={i} className="text-sm flex gap-2">
                <span className="text-zinc-500">{s.index + 1}/{s.total}</span>
                <span className="text-zinc-300">{s.step.type}</span>
                {s.step.target && <span className="text-zinc-500">({s.step.target})</span>}
              </div>
            ))}
            {steps.length === 0 && <p className="text-zinc-500 text-sm">Waiting for test to start...</p>}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Agent Log</h2>
          <div className="space-y-1 max-h-96 overflow-y-auto font-mono text-xs">
            {logs.map((log, i) => (
              <div key={i} className="text-zinc-400">{log}</div>
            ))}
            {logs.length === 0 && <p className="text-zinc-500">No logs yet...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
