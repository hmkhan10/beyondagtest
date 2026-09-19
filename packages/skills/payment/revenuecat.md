# RevenueCat Payment Test Suite

## Prerequisites
- App must have RevenueCat configured
- Sandbox Apple ID configured
- Test Google Play account configured

## Test Cases

### 1. Paywall Display
- Navigate to premium feature
- Verify paywall modal appears
- Check product names and prices display correctly
- Verify restore purchase button exists

### 2. Successful Purchase
- Tap "Subscribe" button
- Wait for processing
- Verify success state
- Check premium content is now accessible
- Verify entitlement is stored locally

### 3. Failed Purchase
- Use declined test card
- Tap "Subscribe"
- Verify error message displays
- Check app doesn't crash
- Verify user can retry

### 4. Restore Purchase
- Complete purchase on Device A
- Install same app on Device B
- Tap "Restore Purchase"
- Verify entitlements transfer

### 5. Subscription States
- Test active subscription
- Test expired subscription
- Test trial period
- Test upgrade/downgrade
