import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import type { Issue, Stack } from '../types/index.js';

const SECRET_PATTERNS = [
  { pattern: /sk_live_[a-zA-Z0-9]+/, type: 'Stripe Live Key', severity: 'critical' as const },
  { pattern: /sk_test_[a-zA-Z0-9]+/, type: 'Stripe Test Key', severity: 'info' as const },
  { pattern: /whsec_[a-zA-Z0-9]+/, type: 'Webhook Secret', severity: 'critical' as const },
  { pattern: /pk_live_[a-zA-Z0-9]+/, type: 'Stripe Publishable Live Key', severity: 'high' as const },
  { pattern: /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+/, type: 'JWT Token', severity: 'high' as const },
  { pattern: /ghp_[a-zA-Z0-9]+/, type: 'GitHub Personal Access Token', severity: 'critical' as const },
  { pattern: /AKIA[0-9A-Z]{16}/, type: 'AWS Access Key', severity: 'critical' as const },
];

const SECURITY_PATTERNS = [
  { pattern: /http:\/\//g, type: 'Insecure HTTP', severity: 'medium' as const },
  { pattern: /eval\(/g, type: 'eval() Usage', severity: 'high' as const },
  { pattern: /dangerouslySetInnerHTML/g, type: 'XSS Risk', severity: 'high' as const },
];

export function analyzeCode(appPath: string, stack: Stack): Issue[] {
  const issues: Issue[] = [];

  scanSecrets(appPath, issues);
  scanSecurity(appPath, issues);

  if (stack === 'react-native' || stack === 'flutter') {
    runLint(appPath, stack, issues);
  }

  checkDependencies(appPath, stack, issues);

  return issues;
}

function scanSecrets(dir: string, issues: Issue[]): void {
  const files = getSourceFiles(dir);
  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8');
      for (const { pattern, type, severity } of SECRET_PATTERNS) {
        const match = content.match(pattern);
        if (match) {
          issues.push({
            id: randomUUID(),
            severity,
            category: 'security',
            title: `${type} found in source code`,
            description: `Found ${type} in ${file}`,
            file: file.replace(dir + '/', ''),
            code: match[0].substring(0, 20) + '...',
            fix: `Remove ${type} from source code and use environment variables`,
            timestamp: new Date(),
          });
        }
      }
    } catch {}
  }
}

function scanSecurity(dir: string, issues: Issue[]): void {
  const files = getSourceFiles(dir);
  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      for (const { pattern, type, severity } of SECURITY_PATTERNS) {
        for (let i = 0; i < lines.length; i++) {
          if (pattern.test(lines[i])) {
            issues.push({
              id: randomUUID(),
              severity,
              category: 'security',
              title: type,
              description: `${type} detected in ${file}:${i + 1}`,
              file: file.replace(dir + '/', ''),
              line: i + 1,
              fix: `Review and fix: ${type}`,
              timestamp: new Date(),
            });
          }
          pattern.lastIndex = 0;
        }
      }
    } catch {}
  }
}

function runLint(dir: string, stack: Stack, issues: Issue[]): void {
  const cmd = stack === 'react-native'
    ? `cd ${dir} && npx tsc --noEmit 2>&1 | head -50`
    : `cd ${dir} && flutter analyze 2>&1 | head -50`;

  const { stdout, ok } = execSafe(cmd);
  if (!ok || !stdout) return;

  const lines = stdout.split('\n').filter((l) => l.includes('error') || l.includes('warning'));
  for (const line of lines.slice(0, 20)) {
    const severity = line.includes('error') ? 'high' : 'medium';
    issues.push({
      id: randomUUID(),
      severity: severity as 'high' | 'medium',
      category: 'code',
      title: 'Lint issue',
      description: line.trim(),
      fix: 'Fix the lint issue',
      timestamp: new Date(),
    });
  }
}

function checkDependencies(dir: string, stack: Stack, issues: Issue[]): void {
  if (stack === 'react-native') {
    const pkgPath = join(dir, 'package.json');
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        const depCount = Object.keys(deps).length;
        if (depCount > 100) {
          issues.push({
            id: randomUUID(),
            severity: 'medium',
            category: 'code',
            title: 'High dependency count',
            description: `Project has ${depCount} dependencies`,
            fix: 'Review and remove unused dependencies',
            timestamp: new Date(),
          });
        }
      } catch {}
    }
  }

  const auditCmd = stack === 'react-native'
    ? `cd ${dir} && npm audit --json 2>&1 | head -100`
    : '';

  if (auditCmd) {
    const { stdout } = execSafe(auditCmd);
    if (stdout.includes('"vulnerabilities"')) {
      try {
        const audit = JSON.parse(stdout);
        const vulnCount = audit.vulnerabilities ? Object.keys(audit.vulnerabilities).length : 0;
        if (vulnCount > 0) {
          issues.push({
            id: randomUUID(),
            severity: 'high',
            category: 'security',
            title: `${vulnCount} dependency vulnerabilities found`,
            description: 'npm audit found vulnerabilities in dependencies',
            fix: 'Run npm audit fix to resolve vulnerabilities',
            timestamp: new Date(),
          });
        }
      } catch {}
    }
  }
}

function getSourceFiles(dir: string): string[] {
  const { stdout } = execSafe(
    `find ${dir} -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.dart" -o -name "*.kt" -o -name "*.java" -o -name "*.swift" 2>/dev/null | grep -v node_modules | grep -v build | grep -v .gradle | head -200`
  );
  return stdout.split('\n').filter(Boolean);
}

function execSafe(cmd: string): { stdout: string; ok: boolean } {
  try {
    const stdout = execSync(cmd, { stdio: 'pipe', timeout: 30000 }).toString().trim();
    return { stdout, ok: true };
  } catch {
    return { stdout: '', ok: false };
  }
}
