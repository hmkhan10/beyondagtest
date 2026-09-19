import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import type { Stack } from '../types/index.js';

export function exec(command: string, timeout = 30000): { stdout: string; ok: boolean } {
  try {
    const stdout = execSync(command, { stdio: 'pipe', timeout }).toString().trim();
    return { stdout, ok: true };
  } catch {
    return { stdout: '', ok: false };
  }
}

export function detectStack(appPath: string): Stack {
  if (existsSync(join(appPath, 'pubspec.yaml'))) return 'flutter';
  if (existsSync(join(appPath, 'Package.swift'))) return 'swiftui';
  if (existsSync(join(appPath, 'build.gradle.kts'))) return 'kotlin';
  if (existsSync(join(appPath, 'build.gradle'))) return 'java';
  return 'react-native';
}

export function readJson(filePath: string): Record<string, unknown> | null {
  try {
    if (!existsSync(filePath)) return null;
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
