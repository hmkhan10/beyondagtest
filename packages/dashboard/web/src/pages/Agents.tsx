import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Agent {
  id: string;
  name: string;
  description: string;
  focus: string;
  platform: string;
  customInstructions: string;
  createdAt: string;
}

const FOCUS_OPTIONS = ['security', 'ui', 'performance', 'payments', 'accessibility', 'all'] as const;
const PLATFORM_OPTIONS = ['android', 'ios', 'both'] as const;

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    focus: 'all',
    platform: 'both',
    customInstructions: '',
  });

  useEffect(() => {
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
        setForm({ name: '', description: '', focus: 'all', platform: 'both', customInstructions: '' });
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
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Link to="/" className="text-sm text-zinc-400 hover:text-white transition-colors mb-8 inline-block">
          &larr; Back to home
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Agents</h1>
            <p className="text-zinc-400 mt-1">Manage your custom testing agents</p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="bg-white text-zinc-950 px-4 py-2 rounded-lg font-medium hover:bg-zinc-200 transition-colors"
          >
            {showCreate ? 'Cancel' : 'New Agent'}
          </button>
        </div>

        {showCreate && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Create Agent</h2>
            <form onSubmit={createAgent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    placeholder="e.g. Security Scanner"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Focus</label>
                  <select
                    value={form.focus}
                    onChange={(e) => setForm({ ...form, focus: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                  >
                    {FOCUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                  placeholder="Brief description of what this agent does"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Platform</label>
                <select
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                >
                  {PLATFORM_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Custom Instructions</label>
                <textarea
                  value={form.customInstructions}
                  onChange={(e) => setForm({ ...form, customInstructions: e.target.value })}
                  rows={4}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
                  placeholder="Optional instructions to guide the agent's behavior..."
                />
              </div>

              <button
                type="submit"
                className="bg-white text-zinc-950 px-4 py-2 rounded-lg font-medium hover:bg-zinc-200 transition-colors"
              >
                Create Agent
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center text-zinc-400 py-12">Loading agents...</div>
        ) : agents.length === 0 ? (
          <div className="text-center text-zinc-400 py-12 bg-zinc-900 border border-zinc-800 rounded-xl">
            No agents yet. Create one to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-start justify-between"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg">{agent.name}</h3>
                  <p className="text-zinc-400 text-sm mt-1">{agent.description}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded">
                      {agent.focus}
                    </span>
                    <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded">
                      {agent.platform}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {new Date(agent.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {agent.customInstructions && (
                    <p className="text-zinc-500 text-xs mt-3 line-clamp-2">{agent.customInstructions}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteAgent(agent.id)}
                  className="ml-4 text-zinc-500 hover:text-red-400 transition-colors text-sm shrink-0"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
