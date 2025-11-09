# Testing Guide

This guide helps you test all the bug fixes and new features in the ConnectSphere app.

## Prerequisites

1. **Backend Server Running**
   - Make sure the backend server is running at: http://192.168.1.228:3000
   - Or update the URL in `.env` file: `EXPO_PUBLIC_API_URL=http://your-server:3000`

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the App**
   ```bash
   npx expo start
   ```

## Test Cases

### 1. Sign-out Bug Fix ✅

**Before:** Sign-out button kept spinning forever

**Test Steps:**
1. Login to the app
2. Go to Account tab
3. Click "Sign Out" button
4. **Expected:** Should logout in <1 second with loading spinner
5. **Expected:** Should redirect to login screen
6. **Expected:** No infinite spinner

**Alternative Test (Settings):**
1. Login to the app
2. Go to Account → Settings
3. Scroll to bottom → "Logout"
4. Confirm logout
5. **Expected:** Immediate logout with redirect

---

### 2. Messaging Functionality ✅

**Before:** Messages not sending/receiving properly

**Test Steps:**

#### 2a. Send Message
1. Login to the app
2. Go to Inbox tab
3. Open any conversation (or create new one)
4. Type a message
5. Click send
6. **Expected:** Message appears immediately (optimistic)
7. **Expected:** Checkmark or confirmation after ~1-2s
8. **Expected:** If fails, shows error message

#### 2b. Receive Message
1. Have another device/user send you a message
2. **Expected:** Message appears in real-time (within 2s)
3. **Expected:** Chat list updates with latest message
4. **Expected:** Unread badge shows

#### 2c. Typing Indicator
1. Open a conversation
2. Start typing
3. **Expected:** Other user sees "typing..." indicator
4. Stop typing for 3 seconds
5. **Expected:** Typing indicator disappears

#### 2d. WebSocket Fallback
1. Disconnect from network briefly
2. Try sending a message
3. **Expected:** Message still sends via API
4. Reconnect network
5. **Expected:** WebSocket reconnects automatically

---

### 3. Follow/Unfollow Feature ✅

**Test Steps:**

#### 3a. Follow from Profile
1. Login to the app
2. Go to Connection tab
3. Click on any user card
4. **Expected:** Follow button shows correct state (Follow/Following)
5. Click "Follow" button
6. **Expected:** Button changes to "Following" immediately
7. **Expected:** Follower count increases by 1
8. Click "Following" button to unfollow
9. **Expected:** Button changes to "Follow"
10. **Expected:** Follower count decreases by 1

#### 3b. Follow from Connection Screen
1. Go to Connection tab
2. Look at user cards
3. **Expected:** Each card has a circular follow button in top-right
4. Click follow button
5. **Expected:** Button fills with blue color (Following state)
6. **Expected:** Can click card to view full profile
7. Click button again to unfollow
8. **Expected:** Button returns to outline style

---

### 4. Event Participation ✅

**Before:** Event detail always showed as not participating

**Test Steps:**
1. Login to the app
2. Go to My Events tab
3. Join an event
4. Click on the event to see details
5. **Expected:** Event shows as "Joined" or "Going"
6. Leave the event
7. **Expected:** Event shows as "Not Joined"

---

### 5. Network Error Recovery ✅

**Test Steps:**

#### 5a. Temporary Network Error
1. Disconnect from WiFi
2. Try to load users in Connection tab
3. **Expected:** Shows error but doesn't crash
4. Reconnect to WiFi
5. Pull to refresh
6. **Expected:** Data loads successfully

#### 5b. API Request Retry
1. Temporarily block API access
2. Try to perform any action
3. **Expected:** App automatically retries once
4. **Expected:** Shows user-friendly error if still fails
5. Restore API access
6. **Expected:** Next request succeeds

---

## Performance Testing

### Logout Speed
**Target:** <1 second from button click to login screen

**Test:**
1. Click Sign Out
2. Count time until login screen appears
3. **Expected:** Should be almost instant

### Message Sending
**Target:** Optimistic update <100ms, confirmation <2s

**Test:**
1. Send a message
2. Observe how quickly it appears
3. **Expected:** Appears instantly in chat
4. **Expected:** Confirmed within 2 seconds

---

## Error Scenarios

### 1. Invalid Login
1. Try to login with wrong credentials
2. **Expected:** Shows "Invalid email or password" alert
3. **Expected:** Doesn't crash

### 2. Network Offline
1. Turn off network completely
2. Navigate around the app
3. **Expected:** Graceful error messages
4. **Expected:** No crashes
5. **Expected:** Some data from cache still shows

### 3. Server Down
1. Stop the backend server
2. Try various operations
3. **Expected:** Clear error messages
4. **Expected:** No infinite loading
5. **Expected:** Logout still works

---

## Edge Cases

### 1. Follow Yourself
1. Try to follow your own profile
2. **Expected:** Should not show follow button on own profile

### 2. Empty Chat
1. Open a conversation with no messages
2. **Expected:** Shows empty state gracefully

### 3. No Internet on Startup
1. Close app completely
2. Turn off network
3. Open app
4. **Expected:** Shows login screen
5. **Expected:** Doesn't crash trying to connect

---

## Regression Testing

Make sure old features still work:

- [ ] Login with valid credentials
- [ ] Signup new account
- [ ] Browse events
- [ ] View user profiles
- [ ] Search users
- [ ] Filter users by distance/gender
- [ ] Add event comments
- [ ] Upload images
- [ ] Join/leave events
- [ ] Browse communities
- [ ] View notifications
- [ ] Edit profile
- [ ] Update hangout status

---

## Debugging

### Enable Detailed Logging

The app now logs all API requests and WebSocket events. Check the console for:

```
API Request: GET /users
WebSocket connected successfully
API Response Error: 404 Not Found
```

### Common Issues

**Q: Messages not sending**
- Check console for "WebSocket not connected" messages
- Verify API endpoint in .env is correct
- Check if backend server is running

**Q: Follow button not working**
- Check console for API errors
- Verify user is logged in
- Check if backend has follow endpoint

**Q: Logout still spinning**
- Check if you pulled latest changes
- Verify AuthContext.tsx has immediate state clear

---

## Report Issues

If you find any bugs:

1. **What happened:** Describe the bug
2. **Expected behavior:** What should happen
3. **Steps to reproduce:** How to trigger the bug
4. **Console logs:** Any errors in console
5. **Device/Platform:** iOS/Android/Web
6. **Network state:** Online/Offline/Slow

---

## Success Criteria

✅ All test cases pass
✅ No crashes during testing
✅ Error messages are user-friendly
✅ Performance meets targets
✅ All regressions still work

When all criteria are met, the app is ready for production! 🎉
