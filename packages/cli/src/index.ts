#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { Agent, generateTestPlan, discoverScreens, exportAll } from '@beyondagtest/core';
import type { AppConfig, Platform, Stack, TestScope, AnalysisMode, ExportOptions } from '@beyondagtest/core';

const program = new Command();

program
  .name('beyondagtest')
  .description('Agentic mobile app testing tool')
  .version('0.1.0');

program
  .command('analyze')
  .description('Analyze a mobile app')
  .requiredOption('-a, --app <path>', 'Path to app directory')
  .option('-p, --platform <platform>', 'Target platform (android|ios)', 'android')
  .option('-s, --scope <scope>', 'Test scope (quick|full|custom)', 'full')
  .option('-m, --mode <mode>', 'Analysis mode (dev|build|expo-go)', 'build')
  .option('--export <format>', 'Export format (html|json|markdown|all)', 'all')
  .option('-o, --output <dir>', 'Output directory', './beyondagtest-results')
  .action(async (opts) => {
    const spinner = ora('Starting analysis...').start();

    try {
      const appPath = opts.app as string;
      const platform = opts.platform as Platform;
      const scope = opts.scope as TestScope;
      const mode = opts.mode as AnalysisMode;

      spinner.text = 'Detecting app stack...';
      const stack = detectStack(appPath);
      spinner.succeed(`Detected stack: ${stack}`);

      spinner.start('Discovering screens...');
      const screens = discoverScreens(appPath, stack);
      spinner.succeed(`Found ${screens.length} screens`);

      const config: AppConfig = {
        path: appPath,
        name: appPath.split('/').pop() || 'unknown',
        stack,
        platform,
        mode,
        scope,
        screens,
        dependencies: {},
        config: {},
      };

      spinner.start('Generating test plan...');
      const plan = generateTestPlan(config);
      spinner.succeed(`Generated ${plan.steps.length} test steps`);

      spinner.start('Running analysis...');
      const agent = new Agent();
      const result = await agent.run(plan);

      spinner.succeed(`Analysis complete: ${result.issues.length} issues found`);

      spinner.start('Exporting reports...');
      const exportOptions: ExportOptions = {
        format: opts.export as 'html' | 'json' | 'markdown' | 'all',
        outputDir: opts.output,
        includeScreenshots: true,
        includeLogs: true,
        includePerformance: true,
      };
      const paths = exportAll(result, exportOptions);
      spinner.succeed('Reports exported');

      console.log('');
      console.log(chalk.green.bold('Analysis complete!'));
      console.log('');
      console.log(chalk.white('Issues found:'), result.issues.length);
      console.log(chalk.red('Critical:'), result.issues.filter((i) => i.severity === 'critical').length);
      console.log(chalk.yellow('Warning:'), result.issues.filter((i) => i.severity === 'high' || i.severity === 'medium').length);
      console.log('');
      console.log(chalk.white('Reports:'));
      for (const [format, path] of Object.entries(paths)) {
        console.log(chalk.gray(`  ${format}: ${path}`));
      }
    } catch (error) {
      spinner.fail(error instanceof Error ? error.message : 'Analysis failed');
      process.exitCode = 1;
    }
  });

program
  .command('doctor')
  .description('Check environment for required tools')
  .action(() => {
    console.log(chalk.blue.bold('\nBeyondAgtest Environment Doctor\n'));

    const checks = [
      { name: 'Node.js', cmd: 'node --version' },
      { name: 'npm', cmd: 'npm --version' },
      { name: 'ADB', cmd: 'adb version' },
      { name: 'Flutter', cmd: 'flutter --version' },
      { name: 'Java', cmd: 'java -version 2>&1' },
      { name: 'Gradle', cmd: 'gradle --version' },
    ];

    for (const check of checks) {
      try {
        const { execSync } = await import('child_process');
        const version = execSync(check.cmd, { stdio: 'pipe', timeout: 10000 }).toString().trim().split('\n')[0];
        console.log(chalk.green(`  ✔ ${check.name}: ${version}`));
      } catch {
        console.log(chalk.red(`  ✖ ${check.name}: not found`));
      }
    }
    console.log('');
  });

program
  .command('export')
  .description('Export test results')
  .requiredOption('-r, --results <path>', 'Path to results JSON file')
  .option('-f, --format <format>', 'Export format (html|json|markdown|all)', 'all')
  .option('-o, --output <dir>', 'Output directory', './beyondagtest-reports')
  .action(async (opts) => {
    const { readFileSync } = await import('fs');
    const result = JSON.parse(readFileSync(opts.results, 'utf-8'));
    const paths = exportAll(result, {
      format: opts.format,
      outputDir: opts.output,
      includeScreenshots: true,
      includeLogs: true,
      includePerformance: true,
    });
    console.log(chalk.green('Reports exported:'));
    for (const [format, path] of Object.entries(paths)) {
      console.log(chalk.gray(`  ${format}: ${path}`));
    }
  });

function detectStack(appPath: string): Stack {
  const { existsSync } = require('fs');
  const { join } = require('path');

  if (existsSync(join(appPath, 'pubspec.yaml'))) return 'flutter';
  if (existsSync(join(appPath, 'Package.swift'))) return 'swiftui';
  if (existsSync(join(appPath, 'build.gradle.kts'))) return 'kotlin';
  if (existsSync(join(appPath, 'build.gradle'))) return 'java';
  if (existsSync(join(appPath, 'app.json')) || existsSync(join(appPath, 'package.json'))) return 'react-native';

  return 'react-native';
}

program.parse(process.argv);
