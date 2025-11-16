# ConnectSphere - Testing Guide

This guide provides comprehensive instructions for testing the ConnectSphere app with multiple emulators to verify all features work correctly.

## Prerequisites

### Server Setup

1. **Clone and setup the server**:
   ```bash
   git clone https://github.com/imnothoan/doAnCoSo4.1.server
   cd doAnCoSo4.1.server
   npm install
   ```

2. **Configure environment variables** (`.env` file):
   ```env
   PORT=3000
   DATABASE_URL=<your-supabase-url>
   SUPABASE_KEY=<your-supabase-key>
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Verify server is running**:
   - Server should be accessible at `http://<your-ip>:3000`
   - WebSocket should be ready for connections

### Client Setup

1. **Update API URL in `.env`**:
   ```env
   EXPO_PUBLIC_API_URL=http://<your-server-ip>:3000
   ```
   
   Replace `<your-server-ip>` with your actual server IP address.

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Testing with Multiple Emulators

### Option 1: Using Expo Go (Recommended for Quick Testing)

1. **Start the Expo development server**:
   ```bash
   npm start
   ```

2. **On each physical device**:
   - Install Expo Go from Play Store/App Store
   - Scan the QR code shown in terminal
   - App will load on the device

3. **Create test accounts**:
   - Device 1: Create account (e.g., user1)
   - Device 2: Create account (e.g., user2)
   - Device 3: Create account (e.g., user3)
   - Device 4: Create account (e.g., user4)

### Option 2: Using Android Emulators

1. **Setup Android Studio and AVDs**:
   ```bash
   # Create multiple AVDs with different names
   # Example: Pixel_5_API_33_1, Pixel_5_API_33_2, etc.
   ```

2. **Start multiple emulators**:
   ```bash
   # Terminal 1
   emulator -avd Pixel_5_API_33_1
   
   # Terminal 2
   emulator -avd Pixel_5_API_33_2
   
   # Terminal 3
   emulator -avd Pixel_5_API_33_3
   
   # Terminal 4
   emulator -avd Pixel_5_API_33_4
   ```

3. **Run app on each emulator**:
   ```bash
   npm run android
   # Or use Expo Go as described above
   ```

## Test Scenarios

### 1. Inbox Real-time Messaging Test

**Objective**: Verify that messages appear in real-time across all devices and that avatars/names display correctly.

**Steps**:
1. **Setup** (Devices 1 & 2):
   - Login on Device 1 as user1
   - Login on Device 2 as user2
   - Navigate to Connection tab on Device 1
   - Find user2 and tap to view profile
   - Tap "Message" button to create DM conversation

2. **Test Real-time Message Delivery**:
   - Device 1: Send message "Hello from user1"
   - Device 2: Verify message appears immediately in inbox
   - Device 2: Open chat, verify user1's name and avatar show correctly
   - Device 2: Send reply "Hello from user2"
   - Device 1: Verify reply appears immediately in chat
   - Device 1: Go back to inbox, verify conversation shows user2's name and avatar

3. **Test Multiple Conversations**:
   - Device 1: Create DM with user3
   - Device 1: Create DM with user4
   - Send messages in each conversation
   - Verify inbox list updates in real-time
   - Verify each conversation shows correct avatar and name

4. **Expected Results**:
   - ✅ Messages appear instantly on both devices
   - ✅ Inbox list updates in real-time when new message arrives
   - ✅ Avatar always shows the other user's profile picture
   - ✅ Name always shows the other user's display name (NEVER "Direct Message")
   - ✅ Unread count increments correctly
   - ✅ Most recent conversation moves to top of list

5. **Edge Cases to Test**:
   - Send message when other user is in inbox screen (not in chat)
   - Send message when other user is in different tab
   - Send message when app is in background
   - Create new conversation with user who hasn't messaged before
   - Verify avatar loads correctly even if it's a URL

### 2. Hangout Feature Test

**Objective**: Verify Tinder-style swipe mechanics work correctly and only online users appear.

**Steps**:
1. **Setup Online Users**:
   - Login on all 4 devices (user1, user2, user3, user4)
   - On each device, navigate to Hangout tab
   - Tap the visibility toggle to make profile visible in Hangout
   - Upload a background image on at least 2 devices

2. **Test Hangout Visibility Toggle**:
   - Device 1: Toggle visibility ON
   - Verify toggle shows "Visible"
   - Device 1: Toggle visibility OFF
   - Verify toggle shows "Hidden"
   - Device 2: Navigate to Hangout, verify user1 does NOT appear (because hidden)
   - Device 1: Toggle visibility ON again
   - Device 2: Pull down to refresh, verify user1 now appears

3. **Test Swipe Mechanics** (Device 1):
   - Swipe RIGHT on a card → Next user should appear
   - Swipe LEFT on a card → User's profile should open
   - Verify profile shows correct information
   - Go back to Hangout
   - Use bottom buttons:
     - Tap ✓ button → Should skip to next user
     - Tap ✕ button → Should open user profile

4. **Test Background Image Display**:
   - Verify users with background images show their background
   - Verify users without background show their avatar
   - Verify users without avatar show default placeholder

5. **Test Online Status**:
   - Device 4: Logout
   - Devices 1-3: Pull down to refresh Hangout
   - Verify user4 no longer appears in the list
   - Device 4: Login again
   - Devices 1-3: Wait 30 seconds (auto-refresh interval)
   - Verify user4 reappears in the list

6. **Expected Results**:
   - ✅ Only users with visibility ON appear in Hangout
   - ✅ Only online users appear
   - ✅ Swipe left opens profile
   - ✅ Swipe right shows next user
   - ✅ Background images display correctly
   - ✅ Avatar fallback works when no background
   - ✅ Default placeholder shows when no background or avatar
   - ✅ List auto-refreshes every 30 seconds
   - ✅ Visibility toggle works instantly

### 3. Stress Test - Many Users

**Objective**: Test system performance with multiple simultaneous users.

**Steps**:
1. **Setup 8 users** (if possible, use 8 devices/emulators)
2. **Create DM conversations**:
   - User1 creates DM with users 2-8 (7 conversations)
   - User2 creates DM with users 3-8 (6 new conversations)
   - Continue pattern...

3. **Simulate Active Chat**:
   - All users send messages rapidly in multiple conversations
   - Verify messages arrive in correct order
   - Verify no messages are lost
   - Verify inbox updates smoothly without lag

4. **Expected Results**:
   - ✅ All messages delivered correctly
   - ✅ Correct message order maintained
   - ✅ Inbox list stays responsive
   - ✅ No UI freezing or crashes

## Common Issues and Solutions

### Issue: Messages not appearing in real-time
**Solution**:
- Check if WebSocket is connected (look for "✅ WebSocket connected" in server logs)
- Verify server URL is correct in client `.env` file
- Ensure devices are on same network as server
- Check firewall settings

### Issue: "Direct Message" or default avatar appearing
**Solution**:
- This should NOT happen with current code
- If it does, check server logs for errors
- Verify server is returning `other_participant` data in conversation list
- Check if user profile has avatar URL set

### Issue: Hangout showing offline users
**Solution**:
- Wait 30 seconds for auto-refresh
- Manually pull down to refresh
- Check server database - verify `is_online` field is updating correctly

### Issue: Background image not showing in Hangout
**Solution**:
- Verify image was uploaded successfully
- Check server storage/Supabase bucket
- Verify image URL is accessible
- Check if image format is supported (JPEG, PNG)

## Logging and Debugging

### Enable Debug Logs

The app has comprehensive logging. Check console output for:
- `📨 New message received in inbox:` - WebSocket message events
- `✅ Updated conversation in inbox:` - Inbox updates
- `🔄 Reloading chats due to missing user data` - Data recovery
- `📥 Fetching hangout users...` - Hangout data loading
- `✅ WebSocket connected successfully` - Connection status

### Server Logs

Monitor server logs for:
- `🔌 WebSocket client connected:` - Client connections
- `✅ User authenticated:` - User login
- `Message sent in conversation` - Message delivery

## Performance Metrics

Expected performance benchmarks:
- Message delivery latency: < 200ms
- Inbox refresh: < 1 second
- Hangout list load: < 2 seconds
- Image upload: < 5 seconds (depends on image size)

## Test Result Template

Use this template to document your test results:

```markdown
## Test Session: [Date]
**Tester**: [Name]
**Devices Used**: [Number and types]
**Server Version**: [Commit hash or version]
**Client Version**: [Commit hash or version]

### Inbox Real-time Test
- [ ] Messages appear instantly
- [ ] Avatars display correctly
- [ ] Names display correctly (never "Direct Message")
- [ ] Unread counts update
- [ ] Inbox list reorders correctly
- **Issues Found**: [List any issues]

### Hangout Feature Test
- [ ] Visibility toggle works
- [ ] Swipe left opens profile
- [ ] Swipe right shows next user
- [ ] Only online users appear
- [ ] Background images display
- [ ] Auto-refresh works (30s)
- **Issues Found**: [List any issues]

### Overall Rating
- **Stability**: [1-5 stars]
- **Performance**: [1-5 stars]
- **User Experience**: [1-5 stars]
- **Notes**: [Additional comments]
```

## Next Steps After Testing

1. Document all bugs found
2. Create GitHub issues for each bug
3. Prioritize bugs by severity
4. Re-test after fixes
5. Deploy to production when all tests pass
