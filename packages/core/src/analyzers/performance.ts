import { readFileSync, existsSync } from 'fs';
import { randomUUID } from 'crypto';
import type { Issue } from '../types/index.js';

export function analyzePerformance(data: {
  fps: number[];
  memory: number[];
  startupTime?: number;
  screenLoadTimes: Record<string, number>;
}): Issue[] {
  const issues: Issue[] = [];

  if (data.fps.length > 0) {
    const avgFps = data.fps.reduce((a, b) => a + b, 0) / data.fps.length;
    if (avgFps < 30) {
      issues.push({
        id: randomUUID(),
        severity: 'high',
        category: 'performance',
        title: 'Low FPS detected',
        description: `Average FPS is ${avgFps.toFixed(1)} (threshold: 30)`,
        fix: 'Optimize render cycles, reduce heavy computations in render',
        timestamp: new Date(),
      });
    } else if (avgFps < 55) {
      issues.push({
        id: randomUUID(),
        severity: 'medium',
        category: 'performance',
        title: 'Below target FPS',
        description: `Average FPS is ${avgFps.toFixed(1)} (target: 60)`,
        fix: 'Review animations and heavy render logic',
        timestamp: new Date(),
      });
    }
  }

  if (data.memory.length > 0) {
    const avgMemory = data.memory.reduce((a, b) => a + b, 0) / data.memory.length;
    if (avgMemory > 300) {
      issues.push({
        id: randomUUID(),
        severity: 'high',
        category: 'performance',
        title: 'High memory usage',
        description: `Average memory: ${avgMemory.toFixed(0)}MB (threshold: 300MB)`,
        fix: 'Check for memory leaks, optimize image caching',
        timestamp: new Date(),
      });
    }
  }

  if (data.startupTime && data.startupTime > 3000) {
    issues.push({
      id: randomUUID(),
      severity: 'medium',
      category: 'performance',
      title: 'Slow startup time',
      description: `App startup takes ${(data.startupTime / 1000).toFixed(1)}s (threshold: 3s)`,
      fix: 'Defer non-critical initialization, lazy load modules',
      timestamp: new Date(),
    });
  }

  for (const [screen, time] of Object.entries(data.screenLoadTimes)) {
    if (time > 2000) {
      issues.push({
        id: randomUUID(),
        severity: 'medium',
        category: 'performance',
        title: `Slow screen load: ${screen}`,
        description: `${screen} takes ${(time / 1000).toFixed(1)}s to load (threshold: 2s)`,
        fix: `Optimize ${screen} component rendering`,
        timestamp: new Date(),
      });
    }
  }

  return issues;
}
