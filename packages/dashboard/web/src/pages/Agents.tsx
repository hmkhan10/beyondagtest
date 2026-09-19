import { useState, useEffect } from 'react';

interface Agent {
  id: string;
  name: string;
  description: string;
  focus: string;
  platform: string;
  instructions: string;
  createdAt: string;
}

const FOCUS_OPTIONS = ['security', 'ui', 'performance', 'payments', 'accessibility', 'all'] as const;
const PLATFORM_OPTIONS = ['android', 'ios', 'both'] as const;

const focusColors: Record<string, string> = {
  security: 'badge-destructive',
  ui: 'badge-info',
  performance: 'badge-warning',
  payments: 'badge-success',
  accessibility: 'badge-secondary',
  all: 'badge-default',
};

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    focus: 'all',
    platform: 'both',
    instructions: '',
  });

  useEffect(() => {
    setMounted(true);
    fetchAgents();
  }, []);

  async function fetchAgents() {
    try {
      const res = await fetch('/api/agents');
      const data = await res.json();
      setAgents(data);
    } catch (err) {
      console.error('Failed to fetch agents:', err);
    } finally {
      setLoading(false);
    }
  }

  async function createAgent(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const newAgent = await res.json();
        setAgents([...agents, newAgent]);
        setForm({ name: '', description: '', focus: 'all', platform: 'both', instructions: '' });
        setShowCreate(false);
      }
    } catch (err) {
      console.error('Failed to create agent:', err);
    }
  }

  async function deleteAgent(id: string) {
    try {
      const res = await fetch(`/api/agents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAgents(agents.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete agent:', err);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                <span className="gradient-text">Agents</span>
              </h1>
              <p className="text-zinc-400 mt-1">Manage your custom testing agents</p>
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
                  New Agent
                </>
              )}
            </button>
          </div>
        </div>

        {showCreate && (
          <div className="card p-6 mb-8 animate-fade-in-up">
            <h2 className="text-lg font-semibold mb-4">Create Agent</h2>
            <form onSubmit={createAgent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="label text-zinc-400">Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input"
                    placeholder="e.g. Security Scanner"
                  />
                </div>
                <div className="space-y-2">
                  <label className="label text-zinc-400">Focus</label>
                  <select
                    value={form.focus}
                    onChange={(e) => setForm({ ...form, focus: e.target.value })}
                    className="select"
                  >
                    {FOCUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="label text-zinc-400">Description</label>
                <input
                  type="text"
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input"
                  placeholder="Brief description of what this agent does"
                />
              </div>

              <div className="space-y-2">
                <label className="label text-zinc-400">Platform</label>
                <div className="flex gap-1 p-1 bg-zinc-800/50 rounded-lg border border-zinc-700/50 w-fit">
                  {PLATFORM_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setForm({ ...form, platform: opt })}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                        form.platform === opt
                          ? 'bg-white text-zinc-950 shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="label text-zinc-400">Custom Instructions</label>
                <textarea
                  value={form.instructions}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  rows={4}
                  className="input resize-none"
                  placeholder="Optional instructions to guide the agent's behavior..."
                />
              </div>

              <button type="submit" className="btn-primary gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14" /><path d="M5 12h14" />
                </svg>
                Create Agent
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="card p-12 text-center">
            <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin mx-auto" />
            <p className="text-zinc-400 text-sm mt-4">Loading agents...</p>
          </div>
        ) : agents.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-500">
                <path d="M12 8V4H8" />
                <rect width="16" height="12" x="4" y="8" rx="2" />
                <path d="M2 14h2" /><path d="M20 14h2" />
                <path d="M15 13v2" /><path d="M9 13v2" />
              </svg>
            </div>
            <p className="text-zinc-400 text-sm mb-1">No agents yet</p>
            <p className="text-zinc-600 text-xs">Create one to customize your testing</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {agents.map((agent, i) => (
              <div
                key={agent.id}
                className={`card p-5 hover-lift transition-all duration-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center border border-zinc-700/50 shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-400">
                        <path d="M12 8V4H8" />
                        <rect width="16" height="12" x="4" y="8" rx="2" />
                        <path d="M2 14h2" /><path d="M20 14h2" />
                        <path d="M15 13v2" /><path d="M9 13v2" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{agent.name}</h3>
                      <p className="text-zinc-400 text-sm mt-0.5">{agent.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={focusColors[agent.focus] || 'badge-secondary'}>
                          {agent.focus}
                        </span>
                        <span className="badge-outline">{agent.platform}</span>
                        <span className="text-xs text-zinc-600">
                          {new Date(agent.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {agent.instructions && (
                        <p className="text-zinc-500 text-xs mt-2 line-clamp-2">{agent.instructions}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteAgent(agent.id)}
                    className="btn-ghost btn-icon text-zinc-500 hover:text-red-400 shrink-0 ml-4"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
