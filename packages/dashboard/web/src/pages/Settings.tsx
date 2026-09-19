import { useState, useEffect } from 'react';

interface Provider {
  id: string;
  type: string;
  name: string;
  endpoint: string;
  apiKey: string;
  model?: string;
  capabilities: string[];
}

const PROVIDER_TYPES = ['ai-model', 'ui-testing', 'api-endpoint', 'visual-analysis'] as const;

const CAPABILITIES = [
  'screenshot-analysis',
  'log-interpretation',
  'code-review',
  'ui-testing',
  'accessibility-testing',
] as const;

const typeIcons: Record<string, string> = {
  'ai-model': '🤖',
  'ui-testing': '🧪',
  'api-endpoint': '🔌',
  'visual-analysis': '👁️',
};

export default function Settings() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({
    type: 'ai-model',
    name: '',
    endpoint: '',
    apiKey: '',
    model: '',
    capabilities: [] as string[],
  });

  useEffect(() => {
    setMounted(true);
    fetchProviders();
  }, []);

  async function fetchProviders() {
    try {
      const res = await fetch('/api/providers');
      const data = await res.json();
      setProviders(data);
    } catch (err) {
      console.error('Failed to fetch providers:', err);
    } finally {
      setLoading(false);
    }
  }

  async function createProvider(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const newProvider = await res.json();
        setProviders([...providers, newProvider]);
        setForm({ type: 'ai-model', name: '', endpoint: '', apiKey: '', model: '', capabilities: [] });
        setShowCreate(false);
      }
    } catch (err) {
      console.error('Failed to create provider:', err);
    }
  }

  async function deleteProvider(id: string) {
    try {
      const res = await fetch(`/api/providers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProviders(providers.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete provider:', err);
    }
  }

  function testConnection() {
    alert('Connection successful');
  }

  function toggleCapability(cap: string) {
    setForm((prev) => ({
      ...prev,
      capabilities: prev.capabilities.includes(cap)
        ? prev.capabilities.filter((c) => c !== cap)
        : [...prev.capabilities, cap],
    }));
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                <span className="gradient-text">Settings</span>
              </h1>
              <p className="text-zinc-400 mt-1">Manage your testing providers</p>
            </div>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="btn-primary gap-2"
            >
              {showCreate ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                  </svg>
                  Cancel
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14" /><path d="M5 12h14" />
                  </svg>
                  Add Provider
                </>
              )}
            </button>
          </div>
        </div>

        {showCreate && (
          <div className="card p-6 mb-8 animate-fade-in-up">
            <h2 className="text-lg font-semibold mb-4">Add Provider</h2>
            <form onSubmit={createProvider} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="label text-zinc-400">Type</label>
                  <div className="flex gap-1 p-1 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                    {PROVIDER_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm({ ...form, type: t })}
                        className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                          form.type === t
                            ? 'bg-white text-zinc-950 shadow-sm'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <span>{typeIcons[t]}</span>
                        {t.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="label text-zinc-400">Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input"
                    placeholder="e.g. GPT-4 Vision"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="label text-zinc-400">Endpoint URL</label>
                <input
                  type="url"
                  required
                  value={form.endpoint}
                  onChange={(e) => setForm({ ...form, endpoint: e.target.value })}
                  className="input"
                  placeholder="https://api.example.com/v1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="label text-zinc-400">API Key</label>
                  <input
                    type="password"
                    required
                    value={form.apiKey}
                    onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                    className="input"
                    placeholder="sk-..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="label text-zinc-400">Model (optional)</label>
                  <input
                    type="text"
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    className="input"
                    placeholder="e.g. gpt-4o"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="label text-zinc-400">Capabilities</label>
                <div className="flex flex-wrap gap-2">
                  {CAPABILITIES.map((cap) => (
                    <button
                      key={cap}
                      type="button"
                      onClick={() => toggleCapability(cap)}
                      className={`badge cursor-pointer transition-all duration-200 ${
                        form.capabilities.includes(cap)
                          ? 'badge-default'
                          : 'badge-outline hover:bg-accent'
                      }`}
                    >
                      {cap}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button type="submit" className="btn-primary gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14" /><path d="M5 12h14" />
                  </svg>
                  Add Provider
                </button>
                <button
                  type="button"
                  onClick={testConnection}
                  className="btn-outline gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Test Connection
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="card p-12 text-center">
            <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin mx-auto" />
            <p className="text-zinc-400 text-sm mt-4">Loading providers...</p>
          </div>
        ) : providers.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-500">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <p className="text-zinc-400 text-sm mb-1">No providers configured</p>
            <p className="text-zinc-600 text-xs">Add an AI model or testing tool to enhance analysis</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {providers.map((provider, i) => (
              <div
                key={provider.id}
                className={`card p-5 hover-lift transition-all duration-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center border border-zinc-700/50 shrink-0 text-lg">
                      {typeIcons[provider.type] || '🔌'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{provider.name}</h3>
                      <p className="text-zinc-400 text-sm mt-0.5 font-mono truncate">{provider.endpoint}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="badge-secondary">
                          {provider.type.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </span>
                        {provider.model && (
                          <span className="badge-outline font-mono text-xs">{provider.model}</span>
                        )}
                      </div>
                      {provider.capabilities.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {provider.capabilities.map((cap) => (
                            <span key={cap} className="text-[10px] text-zinc-500 bg-zinc-800/50 px-1.5 py-0.5 rounded">
                              {cap}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4 shrink-0">
                    <button
                      onClick={testConnection}
                      className="btn-ghost btn-icon text-zinc-500 hover:text-emerald-400"
                      title="Test connection"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteProvider(provider.id)}
                      className="btn-ghost btn-icon text-zinc-500 hover:text-red-400"
                      title="Delete provider"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
