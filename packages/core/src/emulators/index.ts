import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import type { Platform, Screenshot, LogEntry } from '../types/index.js';

export interface EmulatorConfig {
  platform: Platform;
  device?: string;
  headless?: boolean;
}

export interface EmulatorStatus {
  running: boolean;
  deviceId: string | null;
  platform: Platform;
}

function run(command: string, timeout = 30000): { stdout: string; ok: boolean } {
  try {
    const stdout = execSync(command, { stdio: 'pipe', timeout }).toString().trim();
    return { stdout, ok: true };
  } catch {
    return { stdout: '', ok: false };
  }
}

export class AndroidEmulator {
  private deviceId: string | null = null;
  private outputDir: string;

  constructor(outputDir: string) {
    this.outputDir = outputDir;
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
  }

  getStatus(): EmulatorStatus {
    const { stdout } = run('adb devices');
    const lines = stdout.split('\n').filter((l) => l.includes('device') && !l.includes('devices'));
    this.deviceId = lines.length > 0 ? lines[0].split('\t')[0] : null;
    return { running: !!this.deviceId, deviceId: this.deviceId, platform: 'android' };
  }

  launch(device?: string, headless = true): boolean {
    const avd = device || 'Pixel_7_API_34';
    const flags = headless ? '-no-window -no-audio -gpu swiftshader_indirect' : '';
    const { ok } = run(`emulator -avd ${avd} ${flags} &`, 5000);
    if (ok) {
      run('adb wait-for-device', 60000);
      run('adb shell input keyevent 82');
    }
    return ok;
  }

  install(apkPath: string): boolean {
    if (!this.deviceId) return false;
    const { ok } = run(`adb install ${apkPath}`);
    return ok;
  }

  launchApp(packageName: string, activity: string): boolean {
    const { ok } = run(`adb shell am start -n ${packageName}/${activity}`);
    return ok;
  }

  tap(x: number, y: number): boolean {
    const { ok } = run(`adb shell input tap ${x} ${y}`);
    return ok;
  }

  swipe(x1: number, y1: number, x2: number, y2: number): boolean {
    const { ok } = run(`adb shell input swipe ${x1} ${y1} ${x2} ${y2} 300`);
    return ok;
  }

  typeText(text: string): boolean {
    const escaped = text.replace(/ /g, '%s').replace(/'/g, "\\'");
    const { ok } = run(`adb shell input text "${escaped}"`);
    return ok;
  }

  screenshot(screenName: string): Screenshot | null {
    const path = join(this.outputDir, `${screenName}.png`);
    const remotePath = '/sdcard/beyondagtest_screen.png';
    run(`adb shell screencap -p ${remotePath}`);
    const { ok } = run(`adb pull ${remotePath} ${path}`);
    if (!ok) return null;
    return {
      id: randomUUID(),
      screenName,
      path,
      timestamp: new Date(),
    };
  }

  getUiHierarchy(): string | null {
    const remotePath = '/sdcard/beyondagtest_ui.xml';
    run(`adb shell uiautomator dump ${remotePath}`);
    const localPath = join(this.outputDir, 'ui_hierarchy.xml');
    const { ok } = run(`adb pull ${remotePath} ${localPath}`);
    if (!ok) return null;
    return readFileSync(localPath, 'utf-8');
  }

  captureLogs(tag?: string): LogEntry[] {
    const tagFilter = tag ? `-s ${tag}:*` : '';
    const { stdout } = run(`adb logcat -d -v time ${tagFilter} 2>&1 | tail -100`);
    return stdout.split('\n').filter(Boolean).map((line) => ({
      id: randomUUID(),
      level: line.includes('E/') ? 'error' : line.includes('W/') ? 'warn' : 'info',
      tag: 'logcat',
      message: line,
      timestamp: new Date(),
    }));
  }

  getPerformance(): { fps: number; memory: number } {
    const { stdout: fpsOut } = run('adb shell dumpsys gfxinfo com.myapp framestats');
    const fpsMatch = fpsOut.match(/Total frames rendered:\s*(\d+)/);
    const fps = fpsMatch ? parseInt(fpsMatch[1]) : 0;

    const { stdout: memOut } = run('adb shell dumpsys meminfo com.myapp');
    const memMatch = memOut.match(/TOTAL\s+(\d+)/);
    const memory = memMatch ? parseInt(memMatch[1]) : 0;

    return { fps, memory };
  }

  kill(): void {
    run('adb emu kill');
    this.deviceId = null;
  }
}

export class IosSimulator {
  private deviceId: string | null = null;
  private outputDir: string;

  constructor(outputDir: string) {
    this.outputDir = outputDir;
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
  }

  getStatus(): EmulatorStatus {
    const { stdout } = run('xcrun simctl list devices booted');
    const match = stdout.match(/(\w+)\s+\(([\w-]+)\)\s+/);
    this.deviceId = match ? match[2] : null;
    return { running: !!this.deviceId, deviceId: this.deviceId, platform: 'ios' };
  }

  boot(device?: string): boolean {
    const deviceName = device || 'iPhone 15';
    run(`xcrun simctl boot "${deviceName}"`);
    run('open -a Simulator');
    const status = this.getStatus();
    this.deviceId = status.deviceId;
    return status.running;
  }

  install(appPath: string): boolean {
    if (!this.deviceId) return false;
    const { ok } = run(`xcrun simctl install ${this.deviceId} ${appPath}`);
    return ok;
  }

  launchApp(bundleId: string): boolean {
    if (!this.deviceId) return false;
    const { ok } = run(`xcrun simctl launch ${this.deviceId} ${bundleId}`);
    return ok;
  }

  tap(x: number, y: number): boolean {
    if (!this.deviceId) return false;
    const { ok } = run(`xcrun simctl tap ${this.deviceId} ${x} ${y}`);
    return ok;
  }

  swipe(x1: number, y1: number, x2: number, y2: number): boolean {
    if (!this.deviceId) return false;
    const { ok } = run(`xcrun simctl swipe ${this.deviceId} ${x1} ${y1} ${x2} ${y2}`);
    return ok;
  }

  screenshot(screenName: string): Screenshot | null {
    const path = join(this.outputDir, `${screenName}.png`);
    if (!this.deviceId) return null;
    const { ok } = run(`xcrun simctl io ${this.deviceId} screenshot ${path}`);
    if (!ok) return null;
    return {
      id: randomUUID(),
      screenName,
      path,
      timestamp: new Date(),
    };
  }

  captureLogs(process?: string): LogEntry[] {
    const processFilter = process ? `--process ${process}` : '';
    const { stdout } = run(`log stream --style compact ${processFilter} 2>&1 | head -100`);
    return stdout.split('\n').filter(Boolean).map((line) => ({
      id: randomUUID(),
      level: line.includes('Error') ? 'error' : line.includes('Fault') ? 'warn' : 'info',
      tag: 'log-stream',
      message: line,
      timestamp: new Date(),
    }));
  }

  kill(): void {
    if (this.deviceId) {
      run(`xcrun simctl shutdown ${this.deviceId}`);
    }
    this.deviceId = null;
  }
}

export class EmulatorManager {
  private android: AndroidEmulator;
  private ios: IosSimulator;
  private outputDir: string;

  constructor(outputDir: string) {
    this.outputDir = outputDir;
    this.android = new AndroidEmulator(join(outputDir, 'android'));
    this.ios = new IosSimulator(join(outputDir, 'ios'));
  }

  getEmulator(platform: Platform) {
    return platform === 'android' ? this.android : this.ios;
  }

  getStatus(platform: Platform): EmulatorStatus {
    return this.getEmulator(platform).getStatus();
  }

  kill(platform: Platform): void {
    this.getEmulator(platform).kill();
  }

  killAll(): void {
    this.android.kill();
    this.ios.kill();
  }
}
