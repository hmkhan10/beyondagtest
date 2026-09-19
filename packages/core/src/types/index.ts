export type Platform = 'android' | 'ios';
export type Stack = 'react-native' | 'flutter' | 'kotlin' | 'java' | 'swiftui';
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type TestScope = 'quick' | 'full' | 'custom';
export type AnalysisMode = 'dev' | 'build' | 'expo-go';

export interface AppConfig {
  path: string;
  name: string;
  stack: Stack;
  platform: Platform;
  mode: AnalysisMode;
  scope: TestScope;
  screens: ScreenInfo[];
  dependencies: Record<string, string>;
  config: Record<string, unknown>;
}

export interface ScreenInfo {
  name: string;
  path: string;
  type: 'screen' | 'component' | 'modal';
  hasAuth?: boolean;
  hasPayment?: boolean;
}

export interface TestPlan {
  id: string;
  appConfig: AppConfig;
  steps: TestStep[];
  skills: string[];
  plugins: string[];
  createdAt: Date;
}

export interface TestStep {
  id: string;
  type: 'navigate' | 'tap' | 'swipe' | 'type' | 'screenshot' | 'log' | 'wait' | 'assert';
  target?: string;
  coordinates?: { x: number; y: number };
  text?: string;
  screenshot?: string;
  assertion?: string;
  timeout?: number;
}

export interface TestResult {
  id: string;
  planId: string;
  appConfig: AppConfig;
  status: 'running' | 'passed' | 'failed' | 'error';
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  issues: Issue[];
  screenshots: Screenshot[];
  logs: LogEntry[];
  performance: PerformanceData;
  agentLog: AgentLogEntry[];
}

export interface Issue {
  id: string;
  severity: Severity;
  category: 'code' | 'ui' | 'performance' | 'security' | 'accessibility' | 'crash';
  title: string;
  description: string;
  file?: string;
  line?: number;
  code?: string;
  fix?: string;
  screenshot?: string;
  stack?: string;
  timestamp: Date;
}

export interface Screenshot {
  id: string;
  screenName: string;
  path: string;
  base64?: string;
  timestamp: Date;
  uiHierarchy?: string;
}

export interface LogEntry {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  tag: string;
  message: string;
  timestamp: Date;
  stack?: string;
}

export interface PerformanceData {
  fps: number[];
  memory: number[];
  startupTime?: number;
  screenLoadTimes: Record<string, number>;
  crashes: CrashInfo[];
}

export interface CrashInfo {
  timestamp: Date;
  error: string;
  stack: string;
  screen?: string;
}

export interface AgentLogEntry {
  timestamp: Date;
  action: string;
  details: string;
  status: 'success' | 'failure' | 'warning';
}

export interface ProviderConfig {
  id: string;
  type: 'ai-model' | 'ui-testing' | 'api-endpoint' | 'visual-analysis';
  name: string;
  endpoint: string;
  apiKey?: string;
  model?: string;
  capabilities: string[];
  config: Record<string, unknown>;
}

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  focus: string;
  platform: Platform | 'both';
  scope: TestScope;
  instructions: string;
  providers: string[];
  skills: string[];
  schedule?: ScheduleConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleConfig {
  enabled: boolean;
  interval: 'daily' | 'twice-daily' | 'every-3-days' | 'weekly';
  startDate: Date;
  endDate: Date;
  email: string;
  notifyOnCritical: boolean;
  notifyDailySummary: boolean;
  notifyOnComplete: boolean;
}

export interface ExportOptions {
  format: 'html' | 'json' | 'markdown' | 'all';
  outputDir: string;
  includeScreenshots: boolean;
  includeLogs: boolean;
  includePerformance: boolean;
}
