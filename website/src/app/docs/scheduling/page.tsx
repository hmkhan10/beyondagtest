import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "14-Day Scheduler",
};

export default function SchedulingPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold mb-6">14-Day Scheduler</h1>
      <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
        The 14-day scheduler runs your test suite automatically on a rolling two-week cycle. Each
        run produces a trend report so you can track regressions and improvements over time.
      </p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Enable the scheduler</h2>
        <pre>
          <code>{`beyondagtest schedule enable`}</code>
        </pre>
        <p className="text-zinc-400 mt-3 text-sm">
          By default, this runs the full test suite every 14 days at midnight UTC. Reports are
          saved to <code>.beyondagtest/schedule/</code>.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Check status</h2>
        <pre>
          <code>{`beyondagtest schedule status`}</code>
        </pre>
        <pre>
          <code>{`Schedule:    enabled\nFrequency:   every 14 days\nLast run:    2024-01-08 00:00:00 UTC\nNext run:    2024-01-22 00:00:00 UTC\nTotal runs:  6`}</code>
        </pre>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">View history</h2>
        <pre>
          <code>{`beyondagtest schedule history`}</code>
        </pre>
        <pre>
          <code>{`Date          Status    Issues   Delta\n2024-01-08    passed    12       -3\n2023-12-25    passed    15       +1\n2023-12-11    failed    14       -2\n2023-11-27    passed    16       0\n2023-11-13    passed    16       +4\n2023-10-30    passed    12       -1`}</code>
        </pre>
        <p className="text-zinc-400 mt-3 text-sm">
          The <code>Delta</code> column shows the change in total issues from the previous run.
          Negative values mean fewer issues (improvement).
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Trend reports</h2>
        <p className="text-zinc-400 mb-4 text-sm">
          Each scheduled run generates a trend report at{" "}
          <code>.beyondagtest/schedule/trend-latest.json</code> containing:
        </p>
        <ul className="text-zinc-400 text-sm space-y-2 list-disc list-inside">
          <li>Historical issue counts per run</li>
          <li>Category-level breakdown (security, code, perf, a11y)</li>
          <li>Most frequently recurring findings</li>
          <li>Newly introduced issues since last run</li>
          <li>Resolution rate percentage</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Custom schedule</h2>
        <p className="text-zinc-400 mb-4 text-sm">
          Override the default 14-day interval by editing{" "}
          <code>.beyondagtest/config.yaml</code>:
        </p>
        <pre>
          <code>{`schedule:\n  enabled: true\n  interval_days: 7\n  cron: "0 0 */14 * *"\n  notify:\n    email: team@example.com\n    slack: "#ci-alerts"`}</code>
        </pre>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Disable the scheduler</h2>
        <pre>
          <code>{`beyondagtest schedule disable`}</code>
        </pre>
      </section>
    </article>
  );
}
