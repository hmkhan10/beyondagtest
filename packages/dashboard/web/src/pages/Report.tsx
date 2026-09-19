import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

interface Issue {
  id: string;
  severity: string;
  category: string;
  title: string;
  description: string;
  file?: string;
  line?: number;
  fix?: string;
}

interface Screenshot {
  id: string;
  screenName: string;
  path: string;
}

interface TestResult {
  id: string;
  appConfig: { name: string; platform: string; stack: string };
  status: string;
  startedAt: string;
  duration?: number;
  issues: Issue[];
  screenshots: Screenshot[];
}

export default function Report() {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<TestResult | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (id) {
      fetch(`/api/results/${id}`)
        .then((r) => r.json())
        .then(setResult)
        .catch(() => {});
    }
  }, [id]);

  if (!result) return <div className="min-h-screen p-6 max-w-6xl mx-auto"><p className="text-zinc-500">Loading...</p></div>;

  const filteredIssues = filter === 'all' ? result.issues : result.issues.filter((i) => i.severity === filter);
  const critical = result.issues.filter((i) => i.severity === 'critical').length;
  const high = result.issues.filter((i) => i.severity === 'high').length;
  const medium = result.issues.filter((i) => i.severity === 'medium').length;

  const downloadReport = (format: string) => {
    window.open(`/api/download/${id}/${format}`, '_blank');
  };

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto">
      <Link to="/" className="text-sm text-zinc-500 hover:text-zinc-300 mb-4 inline-block">← Back to Dashboard</Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{result.appConfig.name}</h1>
          <p className="text-zinc-400 text-sm">{result.appConfig.platform} · {result.appConfig.stack} · {new Date(result.startedAt).toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => downloadReport('markdown')} className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm hover:bg-zinc-700">Download MD</button>
          <button onClick={() => downloadReport('json')} className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm hover:bg-zinc-700">Download JSON</button>
          <button onClick={() => downloadReport('html')} className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm hover:bg-zinc-700">Download HTML</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold">{result.issues.length}</div>
          <div className="text-sm text-zinc-400">Total Issues</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{critical}</div>
          <div className="text-sm text-zinc-400">Critical</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">{high}</div>
          <div className="text-sm text-zinc-400">High</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{medium}</div>
          <div className="text-sm text-zinc-400">Medium</div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Issues ({filteredIssues.length})</h2>
        <div className="flex gap-2 mb-4">
          {['all', 'critical', 'high', 'medium', 'low'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-sm ${filter === f ? 'bg-white text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {filteredIssues.map((issue) => (
            <div key={issue.id} className={`bg-zinc-900 border border-zinc-800 rounded-xl p-4 border-l-4 ${
              issue.severity === 'critical' ? 'border-l-red-500' :
              issue.severity === 'high' ? 'border-l-orange-500' :
              issue.severity === 'medium' ? 'border-l-yellow-500' : 'border-l-zinc-600'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  issue.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                  issue.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>{issue.severity.toUpperCase()}</span>
                <span className="text-xs text-zinc-500">{issue.category}</span>
              </div>
              <h3 className="font-medium">{issue.title}</h3>
              <p className="text-sm text-zinc-400 mt-1">{issue.description}</p>
              {issue.file && <code className="text-xs text-zinc-500 mt-2 block">{issue.file}:{issue.line || ''}</code>}
              {issue.fix && <p className="text-sm text-green-400 mt-2">Fix: {issue.fix}</p>}
            </div>
          ))}
          {filteredIssues.length === 0 && <p className="text-zinc-500 text-sm">No issues found.</p>}
        </div>
      </div>

      {result.screenshots.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Screenshots ({result.screenshots.length})</h2>
          <div className="grid grid-cols-4 gap-4">
            {result.screenshots.map((s) => (
              <div key={s.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                <div className="text-sm font-medium mb-2">{s.screenName}</div>
                <div className="aspect-[9/16] bg-zinc-800 rounded-lg flex items-center justify-center text-xs text-zinc-500">Screenshot</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
