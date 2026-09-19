import { randomUUID } from 'crypto';
import type { AppConfig, TestPlan, TestStep, ScreenInfo } from '../types/index.js';

export function generateTestPlan(config: AppConfig): TestPlan {
  const steps: TestStep[] = [];

  steps.push({ id: randomUUID(), type: 'wait', timeout: 3000 });

  for (const screen of config.screens) {
    steps.push({ id: randomUUID(), type: 'navigate', target: screen.name });
    steps.push({ id: randomUUID(), type: 'wait', timeout: 2000 });
    steps.push({ id: randomUUID(), type: 'screenshot', target: screen.name });
    steps.push({ id: randomUUID(), type: 'log', target: screen.name });

    if (screen.hasAuth) {
      steps.push({ id: randomUUID(), type: 'tap', target: 'login-button' });
      steps.push({ id: randomUUID(), type: 'wait', timeout: 1000 });
      steps.push({ id: randomUUID(), type: 'screenshot', target: `${screen.name}-auth` });
    }

    if (screen.hasPayment) {
      steps.push({ id: randomUUID(), type: 'tap', target: 'paywall-trigger' });
      steps.push({ id: randomUUID(), type: 'wait', timeout: 2000 });
      steps.push({ id: randomUUID(), type: 'screenshot', target: `${screen.name}-paywall` });
      steps.push({ id: randomUUID(), type: 'log', target: `${screen.name}-paywall` });
    }
  }

  return {
    id: randomUUID(),
    appConfig: config,
    steps,
    skills: [],
    plugins: [],
    createdAt: new Date(),
  };
}

export function discoverScreens(appPath: string, stack: string): ScreenInfo[] {
  const screens: ScreenInfo[] = [];

  if (stack === 'react-native') {
    screens.push(
      { name: 'Login', path: 'app/login.tsx', type: 'screen', hasAuth: true },
      { name: 'Home', path: 'app/(tabs)/index.tsx', type: 'screen' },
      { name: 'Profile', path: 'app/(tabs)/profile.tsx', type: 'screen' },
      { name: 'Settings', path: 'app/settings.tsx', type: 'screen' },
    );
  } else if (stack === 'flutter') {
    screens.push(
      { name: 'Login', path: 'lib/features/auth/login_screen.dart', type: 'screen', hasAuth: true },
      { name: 'Home', path: 'lib/features/home/home_screen.dart', type: 'screen' },
      { name: 'Profile', path: 'lib/features/profile/profile_screen.dart', type: 'screen' },
    );
  } else if (stack === 'kotlin' || stack === 'java') {
    screens.push(
      { name: 'Main', path: 'app/src/main/java/MainActivity.kt', type: 'screen' },
      { name: 'Home', path: 'app/src/main/java/HomeFragment.kt', type: 'screen' },
    );
  } else if (stack === 'swiftui') {
    screens.push(
      { name: 'Home', path: 'Sources/HomeView.swift', type: 'screen' },
      { name: 'Settings', path: 'Sources/SettingsView.swift', type: 'screen' },
    );
  }

  return screens;
}
