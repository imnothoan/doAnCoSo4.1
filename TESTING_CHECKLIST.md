# Payment Pro Feature - Testing Checklist

## ⚠️ Important: How to Test
This is a **TEST MODE** feature. No real payment is required. Simply click the subscribe/cancel buttons to activate/deactivate Pro features instantly.

## 🧪 Pre-Test Setup
- [ ] Server is running (`npm run dev` in doAnCoSo4.1.server)
- [ ] Client app is running (`npx expo start` in doAnCoSo4.1)
- [ ] You are logged in with a test user (e.g., `hoan_66`)
- [ ] Open the app on your device or simulator

---

## 📋 Test Case 1: Subscribe to Pro (Free → Pro)

### Initial State Verification
- [ ] Go to **Account** tab
- [ ] Check current state:
  - [ ] Theme is **blue** (default)
  - [ ] **No** PRO badge next to your name
  - [ ] Profile completion shows with blue progress bar

### Navigate to Payment Screen
- [ ] Tap on **"Payment & Pro Features"** row
- [ ] Verify payment screen shows:
  - [ ] Status card shows "Free Member" (not gold background)
  - [ ] All Pro features listed (512 friends, AI writer, exclusive theme, priority support)
  - [ ] Each feature does **not** have green checkmark
  - [ ] Price shows $9.99/month with test mode note
  - [ ] Blue info section "How to Test Pro Features" is visible
  - [ ] Bottom button shows **"Subscribe to Pro (Test Mode)"**
  - [ ] Button has blue background

### Subscribe Action
- [ ] Tap **"Subscribe to Pro (Test Mode)"** button
- [ ] Confirm subscription dialog appears
- [ ] Tap **"Subscribe"**
- [ ] Wait for processing (button shows "Processing...")
- [ ] Success alert appears: "You are now a Pro member! Enjoy your exclusive features."
- [ ] Tap **"OK"** on success alert

### Post-Subscribe Verification (Payment Screen)
- [ ] Payment screen updates immediately:
  - [ ] Status card now shows **"Pro Member"** with gold star icon
  - [ ] Status card has **golden border** and cream background
  - [ ] All 4 Pro features now have **green checkmarks**
  - [ ] Blue info section is **hidden** (since you're Pro)
  - [ ] Bottom button changed to **"Cancel Subscription"**
  - [ ] Button is now white with red text/border

### Theme Verification
- [ ] Navigate back to Account tab
- [ ] Verify theme has changed:
  - [ ] Primary color is now **yellow/gold** (#FFB300)
  - [ ] **PRO badge** appears next to your name (gold star + "PRO" text)
  - [ ] Edit Profile button has gold border
  - [ ] Progress bar is gold colored
  - [ ] Interest tags have gold background

### Profile Badge Verification
- [ ] From Account, tap your profile (tap avatar or name area)
- [ ] Verify on profile screen:
  - [ ] **PRO badge** appears next to your name
  - [ ] Badge has gold star icon
  - [ ] Badge says "PRO" in gold text

---

## 📋 Test Case 2: Cancel Pro (Pro → Free)

### Initial State (Should be Pro)
- [ ] You are currently Pro from Test Case 1
- [ ] Theme is yellow/gold
- [ ] PRO badges visible on Account and Profile

### Navigate to Payment Screen
- [ ] Go to Account tab → **"Payment & Pro Features"**
- [ ] Verify payment screen shows:
  - [ ] "Pro Member" status with gold styling
  - [ ] All features have green checkmarks
  - [ ] **"Cancel Subscription"** button visible

### Cancel Action
- [ ] Tap **"Cancel Subscription"** button
- [ ] Confirm cancellation dialog appears
- [ ] Tap **"Yes, Cancel"** (red destructive button)
- [ ] Wait for processing
- [ ] Cancellation alert appears: "Subscription Cancelled"
- [ ] Tap **"OK"**

### Post-Cancel Verification (Payment Screen)
- [ ] Payment screen updates immediately:
  - [ ] Status card shows **"Free Member"** again
  - [ ] Status card lost gold styling (back to grey border)
  - [ ] Features no longer have checkmarks
  - [ ] Blue info section reappears
  - [ ] Button changed to **"Subscribe to Pro (Test Mode)"**
  - [ ] Button is blue again

### Theme Reversion
- [ ] Navigate back to Account tab
- [ ] Verify theme reverted:
  - [ ] Primary color is **blue** again (#007AFF)
  - [ ] **PRO badge is gone** from next to your name
  - [ ] Edit Profile button has blue border
  - [ ] Progress bar is blue
  - [ ] Interest tags have blue background

### Profile Badge Removal
- [ ] View your profile
- [ ] Verify:
  - [ ] **No PRO badge** next to name
  - [ ] Everything looks like free user

---

## 📋 Test Case 3: Multiple Subscribe/Cancel Cycles

Test the flow multiple times to ensure state consistency:

### Cycle 1
- [ ] Free → Subscribe → Pro ✅
- [ ] Pro → Cancel → Free ✅

### Cycle 2
- [ ] Free → Subscribe → Pro ✅
- [ ] Pro → Cancel → Free ✅

### Cycle 3
- [ ] Free → Subscribe → Pro ✅
- [ ] Leave as Pro for next test

---

## 📋 Test Case 4: Navigation & State Persistence

While in **Pro** state:

### Tab Navigation
- [ ] Go to **Explore** tab → theme is yellow
- [ ] Go to **Events** tab → theme is yellow
- [ ] Go to **Messages** tab → theme is yellow
- [ ] Go to **Hangout** tab → theme is yellow
- [ ] Go to **Account** tab → theme is yellow, PRO badge visible

### App Background/Foreground
- [ ] Press home button (background the app)
- [ ] Wait 5 seconds
- [ ] Open app again
- [ ] Verify:
  - [ ] Still Pro (yellow theme)
  - [ ] PRO badge still visible
  - [ ] Go to Payment screen → shows Cancel button

### Full App Restart
- [ ] Force close the app completely
- [ ] Reopen the app
- [ ] Login if needed
- [ ] Verify:
  - [ ] Still Pro (yellow theme persists)
  - [ ] PRO badge visible
  - [ ] Payment screen shows Cancel button

---

## 📋 Test Case 5: Server State Verification

### Check Server Logs
During subscribe, server should log:
```
POST /payments/subscribe 200 1166.720 ms - 551
```

During cancel, server should log:
```
POST /payments/cancel 200 [time] ms - [size]
```

### Check Database (Optional)
If you have database access:

**After Subscribe:**
- [ ] `users` table: `is_premium = true`, `theme_preference = 'yellow'`
- [ ] `user_subscriptions` table: `plan_type = 'pro'`, `status = 'active'`

**After Cancel:**
- [ ] `users` table: `is_premium = false`, `theme_preference = 'blue'`
- [ ] `user_subscriptions` table: `status = 'cancelled'`

---

## ❌ Error Cases to Test

### Network Error Handling
- [ ] Turn off server
- [ ] Try to subscribe
- [ ] Should show: "Failed to process subscription. Please try again."
- [ ] Turn server back on
- [ ] Try again → should work

### Rapid Clicking
- [ ] Click Subscribe button multiple times rapidly
- [ ] Should only process once (button disabled during processing)

---

## ✅ Success Criteria

All tests pass if:
1. ✅ No 404 errors in console
2. ✅ No API errors in console (except intentional network test)
3. ✅ Theme switches instantly after subscribe/cancel
4. ✅ UI updates immediately (button text changes)
5. ✅ PRO badge appears/disappears correctly
6. ✅ State persists across app restarts
7. ✅ Multiple cycles work without issues

---

## 🐛 Known Issues (Before Fix)

These should **NOT** appear anymore:
- ❌ ~~`ERROR API Response Error: 404`~~ → FIXED ✅
- ❌ ~~`User not found with the provided ID`~~ → FIXED ✅
- ❌ ~~Theme doesn't change after subscribe~~ → FIXED ✅
- ❌ ~~Button still shows Subscribe after becoming Pro~~ → FIXED ✅
- ❌ ~~No PRO badge on profile~~ → FIXED ✅

---

## 📸 Screenshot Checklist

Capture screenshots for documentation:
- [ ] Free user - Account screen (blue theme, no badge)
- [ ] Free user - Payment screen (subscribe button)
- [ ] Pro user - Account screen (yellow theme, PRO badge)
- [ ] Pro user - Payment screen (cancel button)
- [ ] Profile with PRO badge

---

## 📝 Notes

- Test mode means no real payment gateway integration
- Subscription activates immediately upon confirmation
- Server automatically creates free subscription if none exists
- Theme changes are instant (no page refresh needed)
- All state is properly synchronized between client and server

---

**Tested By:** _____________
**Date:** _____________
**Result:** ☐ All Pass ☐ Issues Found
**Issues:** _____________________________________________
