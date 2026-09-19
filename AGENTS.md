# BeyondAgtest Agent Rules

## Core Loop
1. Read app configuration (package.json, pubspec.yaml, build.gradle)
2. Identify stack (React Native, Flutter, Kotlin, Java, SwiftUI)
3. Generate test plan based on stack and file structure
4. Execute tests: functional, UI, performance, security, accessibility
5. Generate report: JSON + Markdown + HTML

## Stack-Specific Rules

### React Native / Expo
- Check: app.json, babel.config.js, metro.config.js
- Run: `npx expo export` for build verification
- Test: Navigation (React Navigation), Auth (Clerk), Payments (RevenueCat)
- Logs: `adb logcat -s ReactNativeJS:*`

### Flutter
- Check: pubspec.yaml, analysis_options.yaml
- Run: `flutter analyze` + `flutter build apk`
- Test: Widget tree, State management, Navigation
- Logs: `adb logcat -s Flutter:*`

### Kotlin (Jetpack Compose)
- Check: build.gradle.kts, settings.gradle.kts
- Run: `./gradlew assembleRelease`
- Test: Compose navigation, ViewModel, Hilt DI
- Logs: `adb logcat *:E`

### Java Android
- Check: build.gradle, settings.gradle
- Run: `./gradlew assembleRelease`
- Test: Activity lifecycle, Fragment navigation, Retrofit API
- Logs: `adb logcat *:E`

### SwiftUI
- Check: Package.swift, Config.xcconfig
- Run: `xcodebuild -scheme BeyondKitter -sdk iphoneos`
- Test: NavigationStack, ObservableObject, StoreKit 2
- Logs: `log stream --process MyApp`

## Analysis Priority
1. **Critical**: Crashes, security issues, data loss
2. **High**: Broken functionality, payment failures, auth issues
3. **Medium**: Performance problems, accessibility violations
4. **Low**: Code quality warnings, style issues

## Report Format
- JSON: Machine-readable, for CI/CD
- Markdown: Human-readable, for GitHub issues
- HTML: Interactive, with screenshots and charts

## Custom Agent Instructions
Users can create custom agents with specific instructions. Each agent has:
- Name and description
- Focus area (security, UI, performance, payments, accessibility)
- Platform (Android, iOS, or both)
- Custom instructions (free-form text)
- Skills (reusable test suites)

## 14-Day Scheduled Testing
For Google Play Console review periods:
- Schedule agents to run daily
- Email notifications for critical issues
- Daily summary reports
- Final report on completion
- Trend analysis over time
