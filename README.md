# BeyondAgtest

Open-source agentic mobile app testing tool. Test React Native, Flutter, SwiftUI, Kotlin, and Java apps with AI-powered agents.

## Quick Start

### Docker (Recommended)

```bash
git clone https://github.com/hmkhan10/beyondagtest.git
cd beyondagtest
docker-compose up -d
open http://localhost:3000
```

### npm

```bash
git clone https://github.com/hmkhan10/beyondagtest.git
cd beyondagtest
npm install
npm run build
npm run dashboard
```

## Features

- **5 Stack Support**: React Native, Flutter, SwiftUI, Kotlin, Java
- **AI-Powered Analysis**: Connect OpenAI, Anthropic, or any AI model
- **Custom Agents**: Create testers with custom instructions
- **14-Day Scheduler**: Automated testing for Google Play Console review
- **Real-Time Dashboard**: Live progress via WebSocket
- **Export Reports**: HTML, JSON, Markdown
- **Plugin System**: Extend with custom analyzers
- **Docker Ready**: One command to start

## CLI Commands

```bash
# Analyze an app
beyondagtest analyze --app ./my-app --platform android

# Check environment
beyondagtest doctor

# Export reports
beyondagtest export --results ./report.json --format html
```

## Dashboard

Access the dashboard at `http://localhost:3000`:

- **Home**: Connect apps, view recent analyses
- **Test Run**: Live progress with WebSocket updates
- **Report**: View issues, screenshots, performance data
- **Agents**: Create custom testing agents
- **Settings**: Connect AI models, UI testing tools, API endpoints

## Custom Agents

Create agents with custom instructions:

```json
{
  "name": "Security Tester",
  "description": "Tests for security vulnerabilities",
  "focus": "security",
  "platform": "android",
  "instructions": "You are a senior security tester. Check for hardcoded secrets, insecure HTTP, missing auth..."
}
```

## 14-Day Testing Schedule

For Google Play Console review periods:

1. Create agents for different test areas
2. Set schedule: daily runs until review period ends
3. Get email notifications for critical issues
4. View trend analysis over time
5. Download final report when review completes

## Provider System

Connect any provider to enhance testing:

- **AI Models**: OpenAI GPT-4o, Anthropic Claude, Grok, DeepSeek, Ollama
- **UI Testing**: Appium, Detox, Maestro, Espresso
- **Visual Analysis**: Figma, Percy
- **API Endpoints**: Supabase, custom backends

## Architecture

```
beyondagtest/
├── packages/
│   ├── core/          # Agent system, analyzers, export
│   ├── cli/           # CLI entry point
│   └── dashboard/
│       ├── server/    # Express + WebSocket
│       └── web/       # React + Vite + Tailwind
├── packages/skills/   # Reusable test suites
├── AGENTS.md          # Agent instructions
├── Dockerfile
└── docker-compose.yml
```

## License

MIT
