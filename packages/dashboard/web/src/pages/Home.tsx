import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

interface TestResult {
  id: string;
  appConfig: { name: string; platform: string; stack: string };
  status: string;
  startedAt: string;
  issues: { severity: string }[];
  duration?: number;
}

const stackIcons: Record<string, string> = {
  'react-native': '⚛️',
  flutter: '🦋',
  kotlin: '🟣',
  java: '☕',
  swiftui: '🍎',
};

const platformIcons: Record<string, string> = {
  android: '🤖',
  ios: '📱',
};

export default function Home() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [appPath, setAppPath] = useState('');
  const [platform, setPlatform] = useState('android');
  const [scope, setScope] = useState('full');
  const [analyzing, setAnalyzing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    fetch('/api/results')
      .then((r) => r.json())
      .then(setResults)
      .catch(() => {});
  }, []);

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const firstFile = files[0];
      const relativePath = firstFile.webkitRelativePath;
      const folderName = relativePath.split('/')[0];
      setAppPath(`~/projects/${folderName}`);
    }
  };

  const startAnalysis = async () => {
    if (!appPath) return;
    setAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appPath, platform, scope, mode: 'build' }),
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-white/[0.01]" />
        <div className="relative max-w-6xl mx-auto px-6 pt-12 pb-8">
          <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                <span className="text-lg">🧪</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                <span className="gradient-text">BeyondAgtest</span>
              </h1>
            </div>
            <p className="text-zinc-400 text-base max-w-md">
              Agentic mobile app testing. Point at your app, get a full report.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-12">
        {/* New Analysis Card */}
        <div className={`card p-6 mb-8 transition-all duration-500 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
              <span className="text-sm">▶</span>
            </div>
            <h2 className="text-lg font-semibold">New Analysis</h2>
          </div>

          <div className="space-y-4">
            {/* App Path with Browse */}
            <div className="space-y-2">
              <label className="label text-zinc-400">App Path</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={appPath}
                    onChange={(e) => setAppPath(e.target.value)}
                    placeholder="/path/to/your/app or click Browse"
                    className="input pl-10 pr-4"
                  />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  /* @ts-ignore */
                  webkitdirectory=""
                  directory=""
                  multiple
                  onChange={handleFolderSelect}
                  className="hidden"
                />
                <button
                  onClick={handleBrowse}
                  className="btn-outline h-10 px-4 gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    <line x1="12" y1="11" x2="12" y2="17" />
                    <line x1="9" y1="14" x2="15" y2="14" />
                  </svg>
                  Browse
                </button>
              </div>
            </div>

            {/* Platform + Scope + Analyze */}
            <div className="flex gap-3 items-end">
              <div className="space-y-2">
                <label className="label text-zinc-400">Platform</label>
                <div className="flex gap-1 p-1 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                  <button
                    onClick={() => setPlatform('android')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                      platform === 'android'
                        ? 'bg-white text-zinc-950 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>🤖</span> Android
                  </button>
                  <button
                    onClick={() => setPlatform('ios')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                      platform === 'ios'
                        ? 'bg-white text-zinc-950 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>📱</span> iOS
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="label text-zinc-400">Scope</label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  className="select w-36"
                >
                  <option value="quick">Quick scan</option>
                  <option value="full">Full analysis</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <button
                onClick={startAnalysis}
                disabled={analyzing || !appPath}
                className="btn-primary h-10 px-6 gap-2 relative overflow-hidden group"
              >
                {analyzing ? (
                  <>
                    <svg className="animate-spin-slow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Analyze
                    <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-200" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-6 mt-5 pt-5 border-t border-zinc-800/50">
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {results.length} analyses completed
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              5 stacks supported
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {results.reduce((acc, r) => acc + r.issues.length, 0)} issues found
            </div>
          </div>
        </div>

        {/* Recent Analyses */}
        <div className={`transition-all duration-500 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Analyses</h2>
            {results.length > 0 && (
              <span className="text-xs text-zinc-500">{results.length} total</span>
            )}
          </div>

          {results.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-4 animate-bounce-subtle">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-500">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <p className="text-zinc-400 text-sm mb-1">No analyses yet</p>
              <p className="text-zinc-600 text-xs">Connect an app folder above to get started</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {results.map((r, i) => (
                <Link
                  key={r.id}
                  to={`/report/${r.id}`}
                  className={`card p-4 hover-lift group transition-all duration-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ animationDelay: `${i * 50 + 200}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center text-lg border border-zinc-700/50 group-hover:border-zinc-600 transition-colors">
                        {stackIcons[r.appConfig.stack] || '📱'}
                      </div>
                      <div>
                        <div className="font-medium text-sm group-hover:text-white transition-colors">
                          {r.appConfig.name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                          <span>{platformIcons[r.appConfig.platform] || '📱'} {r.appConfig.platform}</span>
                          <span className="text-zinc-700">·</span>
                          <span className="capitalize">{r.appConfig.stack.replace('-', ' ')}</span>
                          {r.duration && (
                            <>
                              <span className="text-zinc-700">·</span>
                              <span>{(r.duration / 1000).toFixed(1)}s</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          r.issues.some((i) => i.severity === 'critical')
                            ? 'text-red-400'
                            : r.issues.length > 0
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}>
                          {r.issues.length} issue{r.issues.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-zinc-600 mt-0.5">
                          {new Date(r.startedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all duration-200"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
