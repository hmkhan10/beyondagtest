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

const severityConfig: Record<string, { color: string; bg: string; border: string }> = {
  critical: { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-l-red-500' },
  high: { color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-l-orange-500' },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-l-yellow-500' },
  low: { color: 'text-zinc-400', bg: 'bg-zinc-500/20', border: 'border-l-zinc-500' },
};

export default function Report() {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<TestResult | null>(null);
  const [filter, setFilter] = useState('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (id) {
      fetch(`/api/results/${id}`)
        .then((r) => r.json())
        .then(setResult)
        .catch(() => {});
    }
  }, [id]);

  if (!result) {
    return (
      <div className="min-h-screen p-6 max-w-6xl mx-auto">
        <div className="card p-12 text-center">
          <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-zinc-400 text-sm mt-4">Loading report...</p>
        </div>
      </div>
    );
  }

  const filteredIssues = filter === 'all' ? result.issues : result.issues.filter((i) => i.severity === filter);
  const critical = result.issues.filter((i) => i.severity === 'critical').length;
  const high = result.issues.filter((i) => i.severity === 'high').length;
  const medium = result.issues.filter((i) => i.severity === 'medium').length;

  const downloadReport = (format: string) => {
    window.open(`/api/download/${id}/${format}`, '_blank');
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                <span className="gradient-text">{result.appConfig.name}</span>
              </h1>
              <p className="text-zinc-400 text-sm mt-1">
                {result.appConfig.platform} · {result.appConfig.stack} · {new Date(result.startedAt).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => downloadReport('markdown')} className="btn-outline btn-sm gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                MD
              </button>
              <button onClick={() => downloadReport('json')} className="btn-outline btn-sm gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                JSON
              </button>
              <button onClick={() => downloadReport('html')} className="btn-primary btn-sm gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                HTML
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Issues', value: result.issues.length, color: 'text-white' },
              { label: 'Critical', value: critical, color: 'text-red-400' },
              { label: 'High', value: high, color: 'text-orange-400' },
              { label: 'Medium', value: medium, color: 'text-yellow-400' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`card p-4 text-center hover-lift transition-all duration-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-zinc-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Issues */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Issues ({filteredIssues.length})</h2>
            </div>
            <div className="flex gap-1 p-1 bg-zinc-800/50 rounded-lg border border-zinc-700/50 w-fit mb-4">
              {['all', 'critical', 'high', 'medium', 'low'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 capitalize ${
                    filter === f
                      ? 'bg-white text-zinc-950 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredIssues.map((issue, i) => {
                const config = severityConfig[issue.severity] || severityConfig.low;
                return (
                  <div
                    key={issue.id}
                    className={`card p-4 border-l-4 ${config.border} hover-lift transition-all duration-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ animationDelay: `${i * 30 + 200}ms` }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${config.bg} ${config.color}`}>
                        {issue.severity}
                      </span>
                      <span className="text-xs text-zinc-500">{issue.category}</span>
                    </div>
                    <h3 className="font-medium text-sm">{issue.title}</h3>
                    <p className="text-sm text-zinc-400 mt-1">{issue.description}</p>
                    {issue.file && (
                      <code className="text-xs text-zinc-500 mt-2 block font-mono bg-zinc-800/50 px-2 py-1 rounded">
                        {issue.file}:{issue.line || ''}
                      </code>
                    )}
                    {issue.fix && (
                      <p className="text-sm text-emerald-400 mt-2 flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m9 12 2 2 4-4" />
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                        {issue.fix}
                      </p>
                    )}
                  </div>
                );
              })}
              {filteredIssues.length === 0 && (
                <div className="card p-8 text-center">
                  <p className="text-zinc-400 text-sm">No issues found with this filter.</p>
                </div>
              )}
            </div>
          </div>

          {/* Screenshots */}
          {result.screenshots.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Screenshots ({result.screenshots.length})</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {result.screenshots.map((s, i) => (
                  <div
                    key={s.id}
                    className={`card p-3 hover-lift transition-all duration-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ animationDelay: `${i * 50 + 300}ms` }}
                  >
                    <div className="text-xs font-medium mb-2 text-zinc-400">{s.screenName}</div>
                    <div className="aspect-[9/16] bg-zinc-800/50 rounded-lg flex items-center justify-center border border-zinc-700/30">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-600">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
