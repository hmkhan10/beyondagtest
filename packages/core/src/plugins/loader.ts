import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import type { BeyondAgtestPlugin, PluginManifest } from './types.js';

export class PluginLoader {
  private plugins: Map<string, BeyondAgtestPlugin> = new Map();
  private pluginDirs: string[];

  constructor(pluginDirs: string[] = []) {
    this.pluginDirs = pluginDirs;
  }

  async loadAll(): Promise<BeyondAgtestPlugin[]> {
    const loaded: BeyondAgtestPlugin[] = [];

    for (const dir of this.pluginDirs) {
      if (!existsSync(dir)) continue;

      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const pluginPath = join(dir, entry.name);
        const plugin = await this.loadPlugin(pluginPath);
        if (plugin) {
          loaded.push(plugin);
        }
      }
    }

    return loaded;
  }

  async loadPlugin(pluginPath: string): Promise<BeyondAgtestPlugin | null> {
    try {
      const manifestPath = join(pluginPath, 'manifest.json');
      if (!existsSync(manifestPath)) return null;

      const manifest: PluginManifest = JSON.parse(
        require('fs').readFileSync(manifestPath, 'utf-8')
      );

      const entryPath = join(pluginPath, manifest.entry);
      const module = await import(entryPath);
      const PluginClass = module.default || module[manifest.name];

      if (!PluginClass) return null;

      const plugin: BeyondAgtestPlugin = new PluginClass();
      this.plugins.set(manifest.name, plugin);

      return plugin;
    } catch (error) {
      console.error(`Failed to load plugin at ${pluginPath}:`, error);
      return null;
    }
  }

  getPlugin(name: string): BeyondAgtestPlugin | undefined {
    return this.plugins.get(name);
  }

  getLoadedPlugins(): string[] {
    return Array.from(this.plugins.keys());
  }
}
