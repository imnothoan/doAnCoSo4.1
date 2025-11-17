# Implementation Notes - Message Timestamps & Apple Pay Integration

## Overview
This document describes the implementation of enhanced message timestamps (like Facebook Messenger) and Apple Pay/Google Pay integration for the ConnectSphere app.

## 1. Enhanced Message Timestamps

### Problem
Messages only showed the time (e.g., "10:30") without any date context. Users couldn't tell when older messages were sent.

### Solution
Implemented intelligent timestamp formatting similar to Facebook Messenger:
- **Today**: Just time (e.g., "10:30")
- **Yesterday**: "Yesterday 10:30"
- **This Week**: Day name + time (e.g., "Monday 10:30")
- **This Year**: Date + time (e.g., "Nov 15, 10:30")
- **Older**: Full date + time (e.g., "Nov 15, 2024 10:30")

### Implementation Details

#### New Utility Function
File: `src/utils/date.ts`

```typescript
export const formatMessageTime = (date: string | Date | undefined | null): string => {
  // Uses date-fns helpers: isToday, isYesterday, isThisWeek, isThisYear
  // Returns appropriate format based on message age
}
```

#### Updated Components
- **Chat Screen** (`app/inbox/chat.tsx`): Changed from `formatTime()` to `formatMessageTime()`
- **Dependencies**: Uses existing `date-fns` library (v4.1.0)

### Bug Fixed
**Critical Bug**: API service was not properly mapping server response fields.
- Server returns: `created_at`, `conversation_id`, `sender_username`
- Client expected: `timestamp`, `chatId`, `senderId`
- **Fix**: Updated `getChatMessages()` in `src/services/api.ts` to properly map fields

## 2. Apple Pay / Google Pay Integration

### Problem
Payment flow only supported card input, which is not optimal for mobile devices. Users expect native payment options like Apple Pay (iOS) and Google Pay (Android).

### Solution
Integrated Stripe's Platform Pay API to support:
- **Apple Pay** on iOS devices
- **Google Pay** on Android devices
- **Card Payment** as fallback for web and unsupported devices

### Implementation Details

#### Updated Payment Screen
File: `app/account/payment-pro.tsx`

**New Features:**
1. Platform Pay button (Apple Pay / Google Pay)
2. Automatic platform detection
3. Test mode support for all payment methods
4. Better UI organization

**Key Imports:**
```typescript
import {
  isPlatformPaySupported,
  PlatformPayButton,
  PlatformPay,
  confirmPlatformPayPayment,
} from '@stripe/stripe-react-native';
```

**Payment Flow:**
```typescript
handlePlatformPayPayment() {
  // 1. Create payment intent on server
  const { clientSecret } = await ApiService.createPaymentIntent(...)
  
  // 2. Confirm platform pay payment
  await confirmPlatformPayPayment(clientSecret, {
    applePay: { ... },
    googlePay: { ... }
  })
  
  // 3. Activate Pro subscription
  await ApiService.activateProSubscription(...)
  
  // 4. Refresh user data
  await refreshUser()
}
```

#### Configuration
File: `app.json`

Added platform identifiers for production builds:
```json
{
  "ios": {
    "bundleIdentifier": "com.connectsphere.app"
  },
  "android": {
    "package": "com.connectsphere.app"
  }
}
```

**Note**: For production Apple Pay, you'll need to:
1. Register merchant identifier in Apple Developer Portal
2. Configure merchant ID in Stripe Dashboard
3. Add to `app.json`:
   ```json
   "ios": {
     "config": {
       "usesNonExemptEncryption": false
     }
   }
   ```

### Stripe Configuration

**Test Mode Settings:**
- Apple Pay: Automatic test mode in sandbox
- Google Pay: `testEnv: true`
- Test Cards: 4242 4242 4242 4242

**Server-side:**
- Payment intent creation handled by `routes/payment.routes.js`
- Amount: $0.01 USD (test price)
- Metadata includes: username, plan_type, test_mode

## 3. Testing Guide

### Message Timestamps Testing
1. Send a message today → Should show just time
2. Check messages from yesterday → Should show "Yesterday HH:mm"
3. Check older messages → Should show appropriate format

### Payment Testing

#### iOS (Apple Pay)
1. Open Xcode
2. Add test card in Wallet app (simulator)
3. Test payment flow in app
4. Expected: Apple Pay sheet appears

#### Android (Google Pay)
1. Setup Google Pay test environment
2. Add test card in Google Pay
3. Test payment flow
4. Expected: Google Pay sheet appears

#### Web (Card Payment)
1. Test with card field
2. Use test card: 4242 4242 4242 4242
3. Any future expiry, any CVC
4. Expected: Standard Stripe card payment

## 4. Dependencies

All dependencies already present in package.json:
- `@stripe/stripe-react-native`: 0.50.3
- `date-fns`: 4.1.0
- `expo`: 54.0.23

No additional dependencies required.

## 5. Known Limitations

1. **Apple Pay Merchant ID**: For production, requires Apple Developer Account and merchant ID setup
2. **Google Pay**: Requires Google Pay API setup for production
3. **Web Platform Pay**: Not supported on web, falls back to card payment
4. **Timestamp Timezone**: All timestamps use device local timezone

## 6. Future Improvements

1. Add message grouping by date (date separators in chat)
2. Add "Read" indicators with timestamps
3. Support for editing message timestamps
4. Support for scheduled messages
5. Add payment history view in app
6. Add payment method management

## 7. Resources

- [Expo Stripe Docs](https://docs.expo.dev/versions/latest/sdk/stripe/)
- [Stripe Platform Pay](https://stripe.com/docs/payments/payment-methods/pmd-registration)
- [YouTube Tutorial](https://www.youtube.com/watch?v=J0tyxUV_omY)
- [date-fns Documentation](https://date-fns.org/)
- [Facebook Messenger UI Patterns](https://www.facebook.com/business/help/messenger)

## 8. Conclusion

Both features are now fully implemented and tested:
✅ Message timestamps display contextual information
✅ Apple Pay and Google Pay supported on respective platforms
✅ Backward compatible with existing card payment
✅ Test mode enabled for all payment methods
✅ No breaking changes to existing functionality
