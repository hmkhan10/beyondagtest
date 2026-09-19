import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import type { TestResult, ExportOptions } from '../types/index.js';

export function exportJson(result: TestResult, outputDir: string): string {
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
  const path = join(outputDir, 'report.json');
  writeFileSync(path, JSON.stringify(result, null, 2));
  return path;
}

export function exportMarkdown(result: TestResult, outputDir: string): string {
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

  const critical = result.issues.filter((i) => i.severity === 'critical');
  const high = result.issues.filter((i) => i.severity === 'high');
  const medium = result.issues.filter((i) => i.severity === 'medium');
  const low = result.issues.filter((i) => i.severity === 'low');

  let md = `# BeyondAgtest Report — ${result.appConfig.name}\n\n`;
  md += `**Date:** ${result.startedAt.toISOString()} | **Platform:** ${result.appConfig.platform} | **Stack:** ${result.appConfig.stack}\n\n`;
  md += `**Duration:** ${result.duration ? (result.duration / 1000).toFixed(1) + 's' : 'N/A'} | **Status:** ${result.status}\n\n`;
  md += `---\n\n`;

  md += `## Summary\n\n`;
  md += `| Metric | Value |\n|--------|-------|\n`;
  md += `| Screenshots | ${result.screenshots.length} |\n`;
  md += `| Issues Found | ${result.issues.length} |\n`;
  md += `| Critical | ${critical.length} |\n`;
  md += `| High | ${high.length} |\n`;
  md += `| Medium | ${medium.length} |\n`;
  md += `| Low | ${low.length} |\n\n`;

  if (critical.length > 0) {
    md += `## Critical Issues\n\n`;
    for (const issue of critical) {
      md += `### ${issue.title}\n\n`;
      md += `- **Category:** ${issue.category}\n`;
      if (issue.file) md += `- **File:** \`${issue.file}:${issue.line || ''}\`\n`;
      if (issue.description) md += `- **Description:** ${issue.description}\n`;
      if (issue.fix) md += `- **Fix:** ${issue.fix}\n`;
      md += `\n`;
    }
  }

  if (high.length > 0) {
    md += `## High Severity Issues\n\n`;
    for (const issue of high) {
      md += `### ${issue.title}\n\n`;
      md += `- **Category:** ${issue.category}\n`;
      if (issue.file) md += `- **File:** \`${issue.file}:${issue.line || ''}\`\n`;
      if (issue.description) md += `- **Description:** ${issue.description}\n`;
      if (issue.fix) md += `- **Fix:** ${issue.fix}\n`;
      md += `\n`;
    }
  }

  if (medium.length > 0) {
    md += `## Medium Severity Issues\n\n`;
    for (const issue of medium) {
      md += `- **${issue.title}** — ${issue.description}\n`;
    }
    md += `\n`;
  }

  if (result.screenshots.length > 0) {
    md += `## Screenshots\n\n`;
    md += `| Screen | Path |\n|--------|------|\n`;
    for (const s of result.screenshots) {
      md += `| ${s.screenName} | ${s.path} |\n`;
    }
    md += `\n`;
  }

  if (result.agentLog.length > 0) {
    md += `## Agent Log\n\n`;
    md += '```\n';
    for (const entry of result.agentLog) {
      md += `${entry.timestamp.toISOString()} ${entry.action} — ${entry.details}\n`;
    }
    md += '```\n';
  }

  const path = join(outputDir, 'report.md');
  writeFileSync(path, md);
  return path;
}

export function exportHtml(result: TestResult, outputDir: string): string {
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

  const critical = result.issues.filter((i) => i.severity === 'critical');
  const high = result.issues.filter((i) => i.severity === 'high');
  const medium = result.issues.filter((i) => i.severity === 'medium');
  const low = result.issues.filter((i) => i.severity === 'low');

  const issueCards = result.issues.map((i) => `
    <div class="issue-card ${i.severity}">
      <div class="issue-header">
        <span class="severity-badge ${i.severity}">${i.severity.toUpperCase()}</span>
        <span class="category">${i.category}</span>
      </div>
      <h3>${i.title}</h3>
      <p>${i.description}</p>
      ${i.file ? `<code>${i.file}:${i.line || ''}</code>` : ''}
      ${i.fix ? `<p class="fix"><strong>Fix:</strong> ${i.fix}</p>` : ''}
    </div>
  `).join('\n');

  const screenshotCards = result.screenshots.map((s) => `
    <div class="screenshot-card">
      <h4>${s.screenName}</h4>
      <img src="${s.path}" alt="${s.screenName}" />
    </div>
  `).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BeyondAgtest Report — ${result.appConfig.name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #09090b; color: #fafafa; padding: 2rem; }
  h1 { font-size: 2rem; margin-bottom: 0.5rem; }
  h2 { font-size: 1.5rem; margin: 2rem 0 1rem; border-bottom: 1px solid #27272a; padding-bottom: 0.5rem; }
  .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin: 1.5rem 0; }
  .stat { background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 1.5rem; text-align: center; }
  .stat-value { font-size: 2rem; font-weight: 700; }
  .stat-label { font-size: 0.875rem; color: #a1a1aa; margin-top: 0.25rem; }
  .stat.critical .stat-value { color: #ef4444; }
  .stat.warning .stat-value { color: #f59e0b; }
  .stat.info .stat-value { color: #3b82f6; }
  .stat.passed .stat-value { color: #22c55e; }
  .issue-card { background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; }
  .issue-card.critical { border-left: 4px solid #ef4444; }
  .issue-card.high { border-left: 4px solid #f97316; }
  .issue-card.medium { border-left: 4px solid #f59e0b; }
  .issue-card.low { border-left: 4px solid #6b7280; }
  .issue-header { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
  .severity-badge { font-size: 0.75rem; font-weight: 600; padding: 0.125rem 0.5rem; border-radius: 4px; }
  .severity-badge.critical { background: #ef444420; color: #ef4444; }
  .severity-badge.high { background: #f9731620; color: #f97316; }
  .severity-badge.medium { background: #f59e0b20; color: #f59e0b; }
  .severity-badge.low { background: #6b728020; color: #6b7280; }
  .category { font-size: 0.75rem; color: #71717a; }
  .issue-card h3 { font-size: 1rem; margin-bottom: 0.25rem; }
  .issue-card p { font-size: 0.875rem; color: #a1a1aa; }
  .issue-card code { font-size: 0.8rem; color: #71717a; background: #27272a; padding: 0.125rem 0.375rem; border-radius: 4px; }
  .fix { color: #22c55e !important; margin-top: 0.5rem; }
  .screenshots { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
  .screenshot-card { background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 1rem; }
  .screenshot-card h4 { font-size: 0.875rem; margin-bottom: 0.5rem; }
  .screenshot-card img { width: 100%; border-radius: 8px; }
  .meta { color: #71717a; font-size: 0.875rem; }
</style>
</head>
<body>
<h1>BeyondAgtest Report</h1>
<p class="meta">${result.appConfig.name} | ${result.appConfig.platform} | ${result.appConfig.stack}</p>
<p class="meta">${result.startedAt.toISOString()} | Duration: ${result.duration ? (result.duration / 1000).toFixed(1) + 's' : 'N/A'}</p>

<div class="summary">
  <div class="stat"><div class="stat-value">${result.screenshots.length}</div><div class="stat-label">Screenshots</div></div>
  <div class="stat critical"><div class="stat-value">${critical.length}</div><div class="stat-label">Critical</div></div>
  <div class="stat warning"><div class="stat-value">${high.length + medium.length}</div><div class="stat-label">Warnings</div></div>
  <div class="stat passed"><div class="stat-value">${result.issues.length === 0 ? 'Yes' : 'No'}</div><div class="stat-label">Passed</div></div>
</div>

<h2>Issues (${result.issues.length})</h2>
${issueCards || '<p>No issues found.</p>'}

<h2>Screenshots (${result.screenshots.length})</h2>
<div class="screenshots">${screenshotCards || '<p>No screenshots.</p>'}</div>
</body>
</html>`;

  const path = join(outputDir, 'report.html');
  writeFileSync(path, html);
  return path;
}

export function exportAll(result: TestResult, options: ExportOptions): Record<string, string> {
  const paths: Record<string, string> = {};

  if (options.format === 'json' || options.format === 'all') {
    paths.json = exportJson(result, options.outputDir);
  }
  if (options.format === 'markdown' || options.format === 'all') {
    paths.markdown = exportMarkdown(result, options.outputDir);
  }
  if (options.format === 'html' || options.format === 'all') {
    paths.html = exportHtml(result, options.outputDir);
  }

  return paths;
}
