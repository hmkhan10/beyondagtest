import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';
import type { AppConfig, TestPlan, TestResult, TestStep, Screenshot, LogEntry, ProviderConfig } from '../types/index.js';

export class Agent extends EventEmitter {
  private result: TestResult | null = null;
  private isRunning = false;
  private providers: ProviderConfig[] = [];

  setProviders(providers: ProviderConfig[]): void {
    this.providers = providers;
  }

  async run(plan: TestPlan): Promise<TestResult> {
    if (this.isRunning) throw new Error('Agent is already running');
    this.isRunning = true;

    this.result = {
      id: randomUUID(),
      planId: plan.id,
      appConfig: plan.appConfig,
      status: 'running',
      startedAt: new Date(),
      issues: [],
      screenshots: [],
      logs: [],
      performance: { fps: [], memory: [], screenLoadTimes: {}, crashes: [] },
      agentLog: [],
    };

    this.emit('test:start', this.result);
    this.log('Agent started', `Testing ${plan.appConfig.name} on ${plan.appConfig.platform}`);

    try {
      for (let i = 0; i < plan.steps.length; i++) {
        if (!this.isRunning) break;
        const step = plan.steps[i];
        this.emit('test:step', step, i, plan.steps.length);
        this.log(`Step ${i + 1}: ${step.type}`, step.target || '');
        await this.executeStep(step, plan.appConfig);
        await this.sleep(100);
      }

      this.result.status = 'passed';
      this.result.completedAt = new Date();
      this.result.duration = this.result.completedAt.getTime() - this.result.startedAt.getTime();
      this.log('Test complete', `Found ${this.result.issues.length} issues`);
      this.emit('test:complete', this.result);
    } catch (error) {
      if (this.result) {
        this.result.status = 'error';
        this.result.completedAt = new Date();
        this.result.duration = this.result.completedAt.getTime() - this.result.startedAt.getTime();
      }
      this.log('Test failed', error instanceof Error ? error.message : 'Unknown error');
      this.emit('test:error', error instanceof Error ? error : new Error(String(error)));
    } finally {
      this.isRunning = false;
    }

    return this.result;
  }

  stop(): void {
    this.isRunning = false;
    if (this.result) {
      this.result.status = 'error';
      this.result.completedAt = new Date();
    }
  }

  private async executeStep(step: TestStep, config: AppConfig): Promise<void> {
    switch (step.type) {
      case 'screenshot': await this.takeScreenshot(step); break;
      case 'log': await this.captureLogs(step); break;
      case 'tap': await this.tap(step); break;
      case 'swipe': await this.swipe(step); break;
      case 'type': await this.typeText(step); break;
      case 'wait': await this.wait(step); break;
      case 'navigate': await this.navigate(step); break;
      case 'assert': break;
    }
  }

  private async takeScreenshot(step: TestStep): Promise<void> {
    const screenshot: Screenshot = {
      id: randomUUID(),
      screenName: step.target || 'unknown',
      path: `/tmp/beyondagtest/screenshots/${step.target || 'unknown'}.png`,
      timestamp: new Date(),
    };
    this.result?.screenshots.push(screenshot);
    this.emit('test:screenshot', screenshot);
    this.log('Screenshot captured', screenshot.screenName);
  }

  private async captureLogs(_step: TestStep): Promise<void> {
    const log: LogEntry = {
      id: randomUUID(),
      level: 'info',
      tag: 'agent',
      message: 'Log capture placeholder',
      timestamp: new Date(),
    };
    this.result?.logs.push(log);
    this.emit('test:log', log);
  }

  private async tap(step: TestStep): Promise<void> {
    this.log('Tap', step.target || `(${step.coordinates?.x}, ${step.coordinates?.y})`);
  }

  private async swipe(step: TestStep): Promise<void> {
    this.log('Swipe', step.target || 'gesture');
  }

  private async typeText(step: TestStep): Promise<void> {
    this.log('Type', step.text || '');
  }

  private async wait(step: TestStep): Promise<void> {
    await this.sleep(step.timeout || 1000);
  }

  private async navigate(step: TestStep): Promise<void> {
    this.log('Navigate', step.target || '');
  }

  private log(action: string, details: string): void {
    if (this.result) {
      this.result.agentLog.push({
        timestamp: new Date(),
        action,
        details,
        status: 'success',
      });
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
