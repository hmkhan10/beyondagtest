import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quickstart",
};

export default function QuickstartPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold mb-6">Quickstart</h1>
      <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
        Get up and running in under two minutes. This guide walks you through initializing a
        project, running your first scan, and viewing results.
      </p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">1. Initialize your project</h2>
        <pre>
          <code>{`cd my-mobile-app\nbeyondagtest init`}</code>
        </pre>
        <p className="text-zinc-400 mt-3 text-sm">
          This creates a <code>.beyondagtest/config.yaml</code> file with sensible defaults. Commit
          it to version control.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">2. Run your first scan</h2>
        <pre>
          <code>{`beyondagtest scan`}</code>
        </pre>
        <p className="text-zinc-400 mt-3 text-sm">
          The scanner analyses your source tree for security issues, code quality problems, and
          performance anti-patterns. Results stream to stdout and are saved to{" "}
          <code>.beyondagtest/reports/</code>.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">3. View the dashboard</h2>
        <pre>
          <code>{`beyondagtest dashboard`}</code>
        </pre>
        <p className="text-zinc-400 mt-3 text-sm">
          Opens a local web server (default <code>http://localhost:4200</code>) with an interactive
          view of your latest scan results.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">4. Run the full test suite</h2>
        <pre>
          <code>{`beyondagtest test --all`}</code>
        </pre>
        <p className="text-zinc-400 mt-3 text-sm">
          Executes security scanning, code analysis, performance profiling, and accessibility checks
          in parallel. Produces a combined summary report.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">5. CI integration</h2>
        <p className="text-zinc-400 mb-4">
          Add a single step to your GitHub Actions, GitLab CI, or CircleCI pipeline:
        </p>
        <pre>
          <code>{`# .github/workflows/test.yml\n- name: BeyondAgtest\n  run: |\n    npm install -g beyondagtest\n    beyondagtest test --all --ci`}</code>
        </pre>
        <p className="text-zinc-400 mt-3 text-sm">
          The <code>--ci</code> flag exits with a non-zero code if any critical finding is detected,
          failing the build as expected.
        </p>
      </section>
    </article>
  );
}
