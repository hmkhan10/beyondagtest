import Link from "next/link";

export default function DocsPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold mb-6">Documentation</h1>
      <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
        BeyondAgtest is an open-source agentic testing framework for mobile apps. It combines
        security scanning, code analysis, performance profiling, and accessibility checks into a
        single CLI-driven workflow.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            href: "/docs/install",
            title: "Installation",
            desc: "Install via npm, curl, or platform-specific packages.",
          },
          {
            href: "/docs/quickstart",
            title: "Quickstart",
            desc: "Run your first scan in under two minutes.",
          },
          {
            href: "/docs/cli",
            title: "CLI Reference",
            desc: "All available commands and flags.",
          },
          {
            href: "/docs/dashboard",
            title: "Dashboard",
            desc: "View results in the local web dashboard.",
          },
          {
            href: "/docs/agents",
            title: "Custom Agents",
            desc: "Define domain-specific test agents.",
          },
          {
            href: "/docs/scheduling",
            title: "14-Day Scheduler",
            desc: "Schedule recurring test cycles with trend reports.",
          },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="block p-5 rounded-xl bg-[#0A0A0A] border border-white/5 hover:border-red-500/30 transition-all group"
          >
            <h3 className="font-semibold mb-1 group-hover:text-red-400 transition-colors">
              {card.title}
            </h3>
            <p className="text-sm text-zinc-500">{card.desc}</p>
          </Link>
        ))}
      </div>
    </article>
  );
}
