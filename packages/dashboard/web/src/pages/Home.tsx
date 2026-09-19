import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface TestResult {
  id: string;
  appConfig: { name: string; platform: string; stack: string };
  status: string;
  startedAt: string;
  issues: { severity: string }[];
}

export default function Home() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [appPath, setAppPath] = useState('');
  const [platform, setPlatform] = useState('android');
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetch('/api/results')
      .then((r) => r.json())
      .then(setResults)
      .catch(() => {});
  }, []);

  const startAnalysis = async () => {
    if (!appPath) return;
    setAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appPath, platform, scope: 'full', mode: 'build' }),
      });
      const result = await res.json();
      setResults((prev) => [result, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">BeyondAgtest Dashboard</h1>
          <p className="text-zinc-400 text-sm mt-1">Agentic mobile app testing</p>
        </div>
        <div className="flex gap-3">
          <Link to="/agents" className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm hover:bg-zinc-700 transition-colors">Agents</Link>
          <Link to="/settings" className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm hover:bg-zinc-700 transition-colors">Settings</Link>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">New Analysis</h2>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm text-zinc-400 mb-1">App Path</label>
            <input
              type="text"
              value={appPath}
              onChange={(e) => setAppPath(e.target.value)}
              placeholder="/path/to/your/app"
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm focus:outline-none focus:border-zinc-500"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm focus:outline-none"
            >
              <option value="android">Android</option>
              <option value="ios">iOS</option>
            </select>
          </div>
          <button
            onClick={startAnalysis}
            disabled={analyzing || !appPath}
            className="px-6 py-2 rounded-lg bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {analyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Analyses</h2>
        {results.length === 0 ? (
          <p className="text-zinc-500 text-sm">No analyses yet. Connect an app above to get started.</p>
        ) : (
          <div className="space-y-3">
            {results.map((r) => (
              <Link
                key={r.id}
                to={`/report/${r.id}`}
                className="block bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{r.appConfig.name}</div>
                    <div className="text-sm text-zinc-400">{r.appConfig.platform} · {r.appConfig.stack}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${r.issues.some((i) => i.severity === 'critical') ? 'text-red-400' : 'text-green-400'}`}>
                      {r.issues.length} issues
                    </div>
                    <div className="text-xs text-zinc-500">{new Date(r.startedAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
