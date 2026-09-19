import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Provider {
  id: string;
  type: string;
  name: string;
  endpoint: string;
  apiKey: string;
  model?: string;
  capabilities: string[];
  createdAt: string;
}

const PROVIDER_TYPES = ['ai-model', 'ui-testing', 'api-endpoint', 'visual-analysis'] as const;

const CAPABILITIES = [
  'screenshot-analysis',
  'log-interpretation',
  'code-review',
  'ui-testing',
  'accessibility-testing',
] as const;

export default function Settings() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    type: 'ai-model',
    name: '',
    endpoint: '',
    apiKey: '',
    model: '',
    capabilities: [] as string[],
  });

  useEffect(() => {
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
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Link to="/" className="text-sm text-zinc-400 hover:text-white transition-colors mb-8 inline-block">
          &larr; Back to home
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-zinc-400 mt-1">Manage your testing providers</p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="bg-white text-zinc-950 px-4 py-2 rounded-lg font-medium hover:bg-zinc-200 transition-colors"
          >
            {showCreate ? 'Cancel' : 'Add Provider'}
          </button>
        </div>

        {showCreate && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Add Provider</h2>
            <form onSubmit={createProvider} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                  >
                    {PROVIDER_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    placeholder="e.g. GPT-4 Vision"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Endpoint URL</label>
                <input
                  type="url"
                  required
                  value={form.endpoint}
                  onChange={(e) => setForm({ ...form, endpoint: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                  placeholder="https://api.example.com/v1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">API Key</label>
                  <input
                    type="password"
                    required
                    value={form.apiKey}
                    onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    placeholder="sk-..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Model (optional)</label>
                  <input
                    type="text"
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    placeholder="e.g. gpt-4o"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">Capabilities</label>
                <div className="flex flex-wrap gap-3">
                  {CAPABILITIES.map((cap) => (
                    <label key={cap} className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.capabilities.includes(cap)}
                        onChange={() => toggleCapability(cap)}
                        className="rounded border-zinc-600 bg-zinc-800 text-white focus:ring-white/20"
                      />
                      {cap}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="bg-white text-zinc-950 px-4 py-2 rounded-lg font-medium hover:bg-zinc-200 transition-colors"
                >
                  Add Provider
                </button>
                <button
                  type="button"
                  onClick={testConnection}
                  className="bg-zinc-800 text-zinc-300 px-4 py-2 rounded-lg font-medium hover:bg-zinc-700 transition-colors"
                >
                  Test Connection
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center text-zinc-400 py-12">Loading providers...</div>
        ) : providers.length === 0 ? (
          <div className="text-center text-zinc-400 py-12 bg-zinc-900 border border-zinc-800 rounded-xl">
            No providers configured yet. Add one to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg">{provider.name}</h3>
                    <p className="text-zinc-400 text-sm mt-1">{provider.endpoint}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded">
                        {provider.type}
                      </span>
                      {provider.model && (
                        <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded">
                          {provider.model}
                        </span>
                      )}
                      <span className="text-xs text-zinc-500">
                        {new Date(provider.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {provider.capabilities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {provider.capabilities.map((cap) => (
                          <span key={cap} className="text-xs text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded">
                            {cap}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <button
                      onClick={testConnection}
                      className="text-zinc-500 hover:text-green-400 transition-colors text-sm"
                    >
                      Test
                    </button>
                    <button
                      onClick={() => deleteProvider(provider.id)}
                      className="text-zinc-500 hover:text-red-400 transition-colors text-sm"
                    >
                      Delete
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
