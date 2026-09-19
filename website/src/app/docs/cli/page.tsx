import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CLI Reference",
};

const commands = [
  {
    cmd: "beyondagtest init",
    desc: "Initialize a new project with default configuration.",
    flags: [],
  },
  {
    cmd: "beyondagtest scan",
    desc: "Run a full scan of the current project.",
    flags: [
      { flag: "--type <security|code|perf|a11y|all>", desc: "Limit scan type (default: all)" },
      { flag: "--output <format>", desc: "Output format: json, table, or markdown (default: table)" },
      { flag: "--ci", desc: "CI mode: non-zero exit on critical findings" },
    ],
  },
  {
    cmd: "beyondagtest test",
    desc: "Run the complete test suite with all agents.",
    flags: [
      { flag: "--all", desc: "Run all test categories" },
      { flag: "--parallel", desc: "Run agents in parallel (default: true)" },
      { flag: "--ci", desc: "CI mode with exit code enforcement" },
    ],
  },
  {
    cmd: "beyondagtest dashboard",
    desc: "Open the local web dashboard for viewing results.",
    flags: [
      { flag: "--port <number>", desc: "Server port (default: 4200)" },
      { flag: "--report <path>", desc: "Load a specific report file" },
    ],
  },
  {
    cmd: "beyondagtest agent run <name>",
    desc: "Run a specific custom agent.",
    flags: [
      { flag: "--config <path>", desc: "Path to agent config file" },
      { flag: "--dry-run", desc: "Validate without executing" },
    ],
  },
  {
    cmd: "beyondagtest schedule",
    desc: "Manage the 14-day recurring schedule.",
    flags: [
      { flag: "enable", desc: "Enable the schedule" },
      { flag: "disable", desc: "Disable the schedule" },
      { flag: "status", desc: "Show schedule status and next run" },
      { flag: "history", desc: "Show past schedule runs" },
    ],
  },
  {
    cmd: "beyondagtest onboard",
    desc: "Interactive wizard for first-time setup.",
    flags: [],
  },
  {
    cmd: "beyondagtest --version",
    desc: "Print the installed version.",
    flags: [],
  },
  {
    cmd: "beyondagtest --help",
    desc: "Show help for all commands.",
    flags: [],
  },
];

export default function CLIPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold mb-6">CLI Reference</h1>
      <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
        Complete reference for the <code>beyondagtest</code> CLI.
      </p>

      <div className="space-y-10">
        {commands.map((c) => (
          <section key={c.cmd}>
            <pre className="mb-2">
              <code>{c.cmd}</code>
            </pre>
            <p className="text-zinc-400 text-sm mb-3">{c.desc}</p>
            {c.flags.length > 0 && (
              <div className="ml-4 space-y-2">
                {c.flags.map((f) => (
                  <div key={f.flag} className="flex gap-4 text-sm">
                    <code className="text-red-400 whitespace-nowrap">{f.flag}</code>
                    <span className="text-zinc-500">{f.desc}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}
