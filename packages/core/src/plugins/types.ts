import type { AppConfig, Issue } from '../types/index.js';

export interface BeyondAgtestPlugin {
  name: string;
  version: string;
  description: string;
  setup(config: PluginConfig): Promise<void>;
  analyze(appConfig: AppConfig): Promise<PluginResult>;
}

export interface PluginConfig {
  apiKey?: string;
  endpoint?: string;
  options: Record<string, unknown>;
}

export interface PluginResult {
  pluginName: string;
  issues: Issue[];
  metadata: Record<string, unknown>;
  duration: number;
}

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  entry: string;
  capabilities: string[];
}
