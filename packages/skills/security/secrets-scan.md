# Security Test Suite

## Prerequisites
- App source code accessible
- ADB installed (Android) or Xcode (iOS)

## Test Cases

### 1. Hardcoded Secrets Scan
- Scan all source files for API keys
- Check for Stripe live keys (sk_live_)
- Check for AWS access keys (AKIA...)
- Check for GitHub tokens (ghp_...)
- Check for JWT tokens in source
- Check for webhook secrets (whsec_)

### 2. Insecure HTTP Detection
- Find all http:// URLs (should be https://)
- Check API endpoint configurations
- Verify certificate pinning

### 3. Authentication Security
- Verify Clerk Auth is properly configured
- Check token storage (should use secure storage)
- Verify session timeout
- Check for biometric authentication support

### 4. Data Storage Security
- Check for sensitive data in AsyncStorage/UserDefaults
- Verify encryption for local storage
- Check for secure enclave usage

### 5. Network Security
- Verify HTTPS for all API calls
- Check for certificate validation
- Verify API key is not in client code

### 6. Code Quality
- Check for eval() usage
- Check for dangerouslySetInnerHTML
- Verify input validation
- Check for SQL injection vulnerabilities

## Severity Levels
- **Critical**: Exposed API keys, data leaks
- **High**: Insecure storage, missing auth checks
- **Medium**: Insecure HTTP, weak validation
- **Low**: Code quality issues
