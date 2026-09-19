# BeyondAgtest

**Open-source agentic mobile app testing tool.** Point it at your React Native, Flutter, SwiftUI, Kotlin, or Java Android app and let AI agents find bugs, security issues, performance problems, and accessibility violations — automatically.

BeyondAgtest runs your app through a plan → act → observe → analyze loop. It takes screenshots, captures logs, checks your code, and generates a full report you can download as HTML, JSON, or Markdown.

---

## What It Does

| Capability | What It Finds |
|---|---|
| **Security scanning** | Hardcoded API keys (Stripe, AWS, GitHub), JWT tokens in source, insecure HTTP URLs, `eval()` usage, XSS risks |
| **Code analysis** | TypeScript/Flutter lint errors, dependency vulnerabilities (`npm audit`), high dependency counts |
| **Performance** | FPS drops below 30/55, memory usage above 300MB, startup time over 3s, slow screen loads |
| **Accessibility** | Missing content descriptions, small touch targets (< 44px), poor heading hierarchy |
| **UI analysis** | Layout issues, missing labels on interactive elements |
| **Navigation testing** | Screen transitions, auth flows, deep linking, error states |
| **Payment testing** | Paywall display, purchase flow, restore purchases (RevenueCat) |

**Supported stacks:** React Native, Flutter, SwiftUI, Kotlin (Jetpack Compose), Java Android

---

## How It Works

```
Your App
   │
   ▼
┌─────────────────────────────────┐
│  1. DETECT                      │
│  Auto-detect stack from files   │
│  (pubspec.yaml → Flutter, etc.) │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  2. PLAN                        │
│  Discover screens               │
│  Generate test steps            │
│  Navigate → Screenshot → Log    │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  3. ACT                         │
│  ADB (Android) / simctl (iOS)   │
│  Tap, swipe, type, screenshot   │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  4. ANALYZE                     │
│  Code scanner + Lint + Audit    │
│  Performance + Accessibility    │
│  + AI provider (optional)       │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  5. REPORT                      │
│  Issues ranked by severity      │
│  Export HTML / JSON / Markdown  │
└─────────────────────────────────┘
```

---

## Quick Start

### Option 1: Docker (Easiest)

```bash
git clone https://github.com/hmkhan10/beyondagtest.git
cd beyondagtest
docker-compose up -d
```

Open **http://localhost:3000** in your browser.

The Docker image includes Node.js, Android SDK, and all tools needed to analyze Android apps.

### Option 2: npm

**Prerequisites:**
- Node.js 18+
- npm 9+
- ADB (for Android testing): `brew install android-platform-tools` (macOS) or [platform-tools download](https://developer.android.com/tools/releases/platform-tools)
- Xcode (for iOS testing, macOS only)

```bash
git clone https://github.com/hmkhan10/beyondagtest.git
cd beyondagtest
npm install
npm run build
npm run dashboard
```

Open **http://localhost:3000**.

---

## Dashboard Pages

| Page | URL | What It Does |
|---|---|---|
| **Home** | `/` | Connect your app path, pick platform, start analysis. See recent runs. |
| **Test Run** | `/test` | Live progress: steps executing, screenshots appearing, logs streaming (WebSocket). |
| **Report** | `/report/:id` | Full results: filterable issues by severity/category, screenshots, performance data, download buttons. |
| **Agents** | `/agents` | Create custom testing agents with your own instructions. |
| **Settings** | `/settings` | Connect AI models, UI testing tools, API endpoints, visual analysis providers. |

---

## CLI Commands

After `npm run build`, the CLI is available at `node packages/cli/dist/index.js`. You can alias it:

```bash
alias beyondagtest="node /path/to/beyondagtest/packages/cli/dist/index.js"
```

### `beyondagtest analyze`

Runs the full analysis on an app.

```bash
beyondagtest analyze --app ./my-app --platform android
```

| Flag | Default | Description |
|---|---|---|
| `--app, -a` | (required) | Path to your app's root directory |
| `--platform, -p` | `android` | Target platform: `android` or `ios` |
| `--scope, -s` | `full` | Test scope: `quick` (smoke test), `full` (all tests), `custom` |
| `--mode, -m` | `build` | Analysis mode: `dev` (live Metro/Flutter run), `build` (static code), `expo-go` (Expo Go connection) |
| `--export` | `all` | Export format: `html`, `json`, `markdown`, or `all` |
| `--output, -o` | `./beyondagtest-results` | Output directory for reports |

**Example — analyze a React Native app:**

```bash
beyondagtest analyze --app ./MyReactNativeApp --platform android --scope full --export all
```

**Example — quick Flutter check:**

```bash
beyondagtest analyze --app ./MyFlutterApp --platform ios --scope quick --export markdown
```

### `beyondagtest doctor`

Checks that required tools are installed.

```bash
beyondagtest doctor
```

Output:
```
✔ Node.js: v20.11.0
✔ npm: 10.2.4
✔ ADB: Android Debug Bridge version 1.0.41
✖ Flutter: not found
✔ Java: openjdk 17.0.10
✔ Gradle: 8.5
```

### `beyondagtest export`

Converts a results JSON file into formatted reports.

```bash
beyondagtest export --results ./beyondagtest-results/report.json --format html --output ./reports
```

| Flag | Default | Description |
|---|---|---|
| `--results, -r` | (required) | Path to the results JSON file |
| `--format, -f` | `all` | Export format: `html`, `json`, `markdown`, or `all` |
| `--output, -o` | `./beyondagtest-reports` | Output directory |

---

## Using the Dashboard

### Step 1: Connect Your App

1. Open **http://localhost:3000**
2. On the Home page, enter your app's absolute path (e.g., `/Users/you/projects/MyApp`)
3. Select platform: **Android** or **iOS**
4. Click **Start Analysis**

### Step 2: Watch It Run

The Test Run page shows live progress:
- Current step executing
- Screenshots captured in real-time
- Logs streaming from the device
- Issues found as they appear

### Step 3: Review Results

The Report page shows everything:
- **Issues** — filterable by severity (Critical / High / Medium / Low) and category (Security, Performance, UI, Accessibility, Code)
- **Screenshots** — captured at each screen
- **Performance** — FPS, memory, startup time
- **Agent Log** — every action the agent took

### Step 4: Download Reports

Click the download buttons on the Report page:
- **HTML** — interactive report you can open in any browser
- **JSON** — machine-readable, for CI/CD pipelines
- **Markdown** — paste directly into GitHub Issues

---

## Custom Agents

Go to **/agents** to create testing agents with your own instructions.

### Create an Agent

1. Click **Create Agent**
2. Fill in:
   - **Name** — e.g., "Security Scanner"
   - **Description** — what this agent tests
   - **Focus** — security, ui, performance, payments, accessibility, or all
   - **Platform** — android, ios, or both
   - **Instructions** — your detailed testing instructions

### Example Agent Instructions

```
You are a senior mobile security tester. Your job:

1. Scan all source files for hardcoded secrets (API keys, tokens, passwords)
2. Check that all API endpoints use HTTPS
3. Verify authentication tokens are stored in secure storage (not AsyncStorage/UserDefaults)
4. Look for insecure data patterns (SQL injection, XSS)
5. Check for exposed logging of sensitive data in logcat/console

Report every issue with:
- File path and line number
- Severity (critical/high/medium/low)
- What the issue is
- How to fix it
```

### Built-in Skills

Reusable test suites in `packages/skills/`:

| Skill | File | Tests |
|---|---|---|
| **Security** | `security/secrets-scan.md` | API key scanning, HTTPS, auth storage, network security |
| **Payment** | `payment/revenuecat.md` | Paywall display, purchase flow, restore, subscription states |
| **Accessibility** | `accessibility/wcag-check.md` | Color contrast, touch targets, screen readers, text scaling |
| **Navigation** | `basic/navigation.md` | Screen transitions, tab navigation, modals, auth flow, error states |

---

## 14-Day Scheduled Testing

For Google Play Console review periods, set up automated daily testing:

1. Create agents for each test area (security, UI, performance, payments)
2. On the **Settings** page, configure your email for notifications
3. Set a schedule: daily runs from start date to end date
4. The system runs all agents every day and sends:
   - **Critical alerts** — immediately when found
   - **Daily summaries** — issues found each day
   - **Final report** — after the 14-day period ends
5. View trend analysis across all runs

---

## Provider System

Connect external tools to enhance analysis. Go to **/settings** to add providers.

### AI Models

Connect any LLM for screenshot analysis and log interpretation:

| Provider | Endpoint | Notes |
|---|---|---|
| OpenAI | `https://api.openai.com/v1` | GPT-4o for screenshot analysis |
| Anthropic | `https://api.anthropic.com` | Claude for code review |
| Grok | `https://api.x.ai/v1` | xAI's model |
| DeepSeek | `https://api.deepseek.com` | Cost-effective option |
| Ollama | `http://localhost:11434` | Local, free, no API key needed |
| Custom | Any endpoint | OpenAI-compatible API |

### UI Testing Tools

| Tool | What It Does |
|---|---|
| Appium | Cross-platform UI automation |
| Detox | React Native E2E testing |
| Maestro | Mobile UI testing framework |
| Espresso | Android native UI testing |

### Visual Analysis

| Tool | What It Does |
|---|---|
| Figma | Design comparison |
| Percy | Visual regression testing |

---

## Project Structure

```
beyondagtest/
├── packages/
│   ├── core/                        # Core agent system
│   │   └── src/
│   │       ├── types/index.ts       # All TypeScript types
│   │       ├── agent/
│   │       │   ├── agent.ts         # Main agent loop (EventEmitter)
│   │       │   └── planner.ts       # Test plan generation
│   │       ├── emulators/index.ts   # Android ADB + iOS simctl
│   │       ├── analyzers/
│   │       │   ├── code.ts          # Secrets + security + lint
│   │       │   ├── performance.ts   # FPS + memory + startup
│   │       │   └── ui.ts            # Accessibility + layout
│   │       ├── plugins/
│   │       │   ├── types.ts         # Plugin interface
│   │       │   └── loader.ts        # Plugin discovery
│   │       ├── export/index.ts      # HTML + JSON + Markdown
│   │       └── utils/index.ts       # exec, detectStack, etc.
│   │
│   ├── cli/                         # CLI entry point
│   │   └── src/index.ts             # analyze, doctor, export
│   │
│   ├── dashboard/
│   │   ├── server/                  # Express + WebSocket
│   │   │   └── src/index.ts         # REST API + live updates
│   │   └── web/                     # React + Vite + Tailwind
│   │       └── src/
│   │           ├── App.tsx          # Router
│   │           └── pages/
│   │               ├── Home.tsx     # App list + new analysis
│   │               ├── TestRun.tsx  # Live WebSocket progress
│   │               ├── Report.tsx   # Results + downloads
│   │               ├── Agents.tsx   # Custom agent CRUD
│   │               └── Settings.tsx # Provider management
│   │
│   └── skills/                      # Reusable test suites
│       ├── security/secrets-scan.md
│       ├── payment/revenuecat.md
│       ├── accessibility/wcag-check.md
│       └── basic/navigation.md
│
├── AGENTS.md                        # Agent instructions
├── Dockerfile                       # Docker image with Android SDK
├── docker-compose.yml               # One-command start
├── package.json                     # Monorepo root
├── tsconfig.json                    # Root TypeScript config
├── LICENSE                          # MIT
└── README.md                        # This file
```

---

## Stack Detection

BeyondAgtest auto-detects your app stack by looking for these files:

| Stack | Detection File |
|---|---|
| React Native / Expo | `app.json` or `package.json` |
| Flutter | `pubspec.yaml` |
| Kotlin (Jetpack Compose) | `build.gradle.kts` |
| Java Android | `build.gradle` |
| SwiftUI | `Package.swift` |

---

## Environment Variables

### Dashboard Server

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Dashboard server port |
| `DATA_DIR` | `./data` | Where results, agents, providers, schedules are stored |

### Docker

```bash
# Override port
PORT=8080 docker-compose up -d

# Custom data directory
DATA_DIR=/mnt/data docker-compose up -d
```

---

## Export Formats

### HTML Report
Interactive report with:
- Issue cards grouped by severity
- Embedded screenshots
- Performance charts
- Expandable code snippets
- One-click download

### JSON Report
Machine-readable for CI/CD:
```json
{
  "id": "uuid",
  "status": "passed",
  "issues": [
    {
      "severity": "critical",
      "category": "security",
      "title": "Stripe Live Key found",
      "file": "src/config.ts",
      "line": 42
    }
  ],
  "performance": {
    "fps": [60, 58, 60],
    "memory": [120, 135, 140],
    "startupTime": 1800
  }
}
```

### Markdown Report
Paste directly into GitHub Issues:
```markdown
## BeyondAgtest Report — MyApp

### Summary
- **Status:** Passed
- **Issues:** 3 critical, 5 high, 2 medium
- **Duration:** 45s

### Critical Issues
1. **Stripe Live Key found** in `src/config.ts:42`
   - Fix: Remove from source, use environment variables

### High Issues
2. **eval() Usage** in `src/utils.ts:18`
   - Fix: Replace with safe alternatives
```

---

## Troubleshooting

**"ADB not found"**
```bash
# macOS
brew install android-platform-tools

# Linux
sudo apt install android-tools-adb

# Verify
adb version
```

**"Dashboard not built" error**
```bash
npm run build:web
```

**"Port 3000 already in use"**
```bash
PORT=3080 npm run dashboard
```

**iOS testing requires macOS**
iOS simulator testing only works on macOS with Xcode installed. Use Android for Linux/Windows.

---

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Make changes
4. Run `npm run build` to verify
5. Submit a pull request

---

## License

MIT — use it however you want.
