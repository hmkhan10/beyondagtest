import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
        The BeyondAgtest dashboard provides an interactive, browser-based view of your scan results.
      </p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Launching the dashboard</h2>
        <pre>
          <code>{`beyondagtest dashboard`}</code>
        </pre>
        <p className="text-zinc-400 mt-3 text-sm">
          Opens <code>http://localhost:4200</code> by default. Use <code>--port</code> to change
          the port.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Loading a specific report</h2>
        <pre>
          <code>{`beyondagtest dashboard --report .beyondagtest/reports/2024-01-15.json`}</code>
        </pre>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Dashboard sections</h2>
        <div className="space-y-4 text-zinc-400 text-sm">
          <div>
            <h3 className="text-white font-medium mb-1">Overview</h3>
            <p>Summary cards showing total issues, severity breakdown, and trend sparklines.</p>
          </div>
          <div>
            <h3 className="text-white font-medium mb-1">Security</h3>
            <p>Detailed list of security findings with file locations, severity, and fix suggestions.</p>
          </div>
          <div>
            <h3 className="text-white font-medium mb-1">Code Quality</h3>
            <p>Linting issues, complexity scores, and code duplication reports.</p>
          </div>
          <div>
            <h3 className="text-white font-medium mb-1">Performance</h3>
            <p>Startup time analysis, memory profiling, and rendering performance metrics.</p>
          </div>
          <div>
            <h3 className="text-white font-medium mb-1">Accessibility</h3>
            <p>WCAG violations with element selectors and recommended ARIA attributes.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Exporting results</h2>
        <pre>
          <code>{`beyondagtest scan --output json > results.json\nbeyondagtest scan --output markdown > REPORT.md`}</code>
        </pre>
      </section>
    </article>
  );
}
