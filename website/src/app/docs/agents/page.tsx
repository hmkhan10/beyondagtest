import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custom Agents",
};

export default function AgentsPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold mb-6">Custom Agents</h1>
      <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
        Custom agents let you define domain-specific testing workflows tailored to your app. An
        agent is a YAML configuration that tells BeyondAgtest what to check and how to report it.
      </p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Agent configuration</h2>
        <p className="text-zinc-400 mb-4 text-sm">
          Create a file at <code>.beyondagtest/agents/my-agent.yaml</code>:
        </p>
        <pre>
          <code>{`name: payment-flow-test
description: Validates the payment flow end-to-end
version: "1.0"

targets:
  - pattern: "src/screens/Payment*.tsx"
  - pattern: "src/services/payment.*"

checks:
  - type: security
    rules:
      - no-hardcoded-secrets
      - validate-input-santization
  - type: code-quality
    rules:
      - no-console-log
      - error-boundary-required
  - type: performance
    rules:
      - no-inline-styles-in-lists
      - memo-expensive-components

threshold:
  critical: 0
  high: 3
  medium: 10

output:
  format: json
  path: .beyondagtest/reports/agent-payment.json`}</code>
        </pre>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Running a custom agent</h2>
        <pre>
          <code>{`beyondagtest agent run payment-flow-test`}</code>
        </pre>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Dry run (validate only)</h2>
        <pre>
          <code>{`beyondagtest agent run payment-flow-test --dry-run`}</code>
        </pre>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Built-in rules</h2>
        <div className="text-zinc-400 text-sm space-y-2">
          <p><code>no-hardcoded-secrets</code> — Detects API keys, tokens, and passwords in source.</p>
          <p><code>no-console-log</code> — Flags console.log statements in production code.</p>
          <p><code>error-boundary-required</code> — Ensures React error boundaries wrap risky components.</p>
          <p><code>validate-input-sanitization</code> — Checks that user inputs are sanitized.</p>
          <p><code>memo-expensive-components</code> — Suggests React.memo for heavy renders.</p>
          <p><code>no-inline-styles-in-lists</code> — Warns against inline styles in virtualized lists.</p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Listing available agents</h2>
        <pre>
          <code>{`beyondagtest agent list`}</code>
        </pre>
        <p className="text-zinc-400 mt-3 text-sm">
          Shows all discovered agents, both built-in and custom.
        </p>
      </section>
    </article>
  );
}
