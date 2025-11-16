# Multi-Emulator Testing Guide

## Prerequisites

### Required Software
- Node.js (v18+)
- npm or yarn
- Android Studio with Android SDK
- Expo CLI: `npm install -g expo-cli`

### Server Setup
1. Navigate to server repository
2. Install dependencies: `npm install`
3. Create `.env` file (copy from `.env.example`)
4. Start server: `npm start`
5. Server should run on `http://localhost:3000`

### Client Setup
1. Navigate to client repository (this repo)
2. Update `.env` file:
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3000
   ```
   Replace `YOUR_LOCAL_IP` with your machine's IP (e.g., `192.168.1.228`)

3. Install dependencies: `npm install`

## Finding Your Local IP

### Windows
```cmd
ipconfig
```
Look for "IPv4 Address" under your active network adapter.

### macOS/Linux
```bash
ifconfig | grep "inet "
```
or
```bash
hostname -I
```

### Why Local IP is Important
- Emulators/physical devices can't access `localhost`
- They need your machine's local network IP
- Example: `http://192.168.1.228:3000` instead of `http://localhost:3000`

## Option 1: Testing with Physical Devices (Easiest)

### Step 1: Start the Server
```bash
cd path/to/server
npm start
```
Server should show: `🚀 Server listening on port 3000`

### Step 2: Start Expo Dev Server
```bash
cd path/to/client
npm start
```

### Step 3: Open on Devices
1. Install Expo Go app on your phones (from App Store/Play Store)
2. Scan the QR code shown in the terminal
3. App will load on each device

### Step 4: Create Test Accounts
- **Device 1**: Sign up as `user1@test.com`
- **Device 2**: Sign up as `user2@test.com`
- **Device 3**: Sign up as `user3@test.com` (if you have more devices)

### Step 5: Test Hang Out Feature
1. On each device, go to "Hang Out" tab
2. You should see welcome message: "Welcome to Hang Out! 👋"
3. Status should show: 🟢 "You're visible to others"
4. Swipe through cards to see other online users
5. Try toggling "Hidden" on one device → others should not see that user
6. Toggle "Visible" again → user reappears

### Step 6: Test Real-Time Messaging
1. Device 1: Go to "Connection" tab, tap on a user (e.g., user2)
2. Send a message
3. Device 2: Should receive message immediately in "Inbox" tab
4. Reply from Device 2
5. Device 1: Should see reply instantly

## Option 2: Testing with Android Emulators

### Step 1: Create Multiple AVDs (Android Virtual Devices)

Open Android Studio → Tools → Device Manager → Create Virtual Device

Recommended configurations:
- **Emulator 1**: Pixel 5 API 33
- **Emulator 2**: Pixel 4 API 33  
- **Emulator 3**: Pixel 6 API 33
- **Emulator 4**: Pixel 3a API 33

### Step 2: Start Emulators

#### Terminal Method (Parallel Startup)
```bash
# List available AVDs
emulator -list-avds

# Start emulator 1 (default port 5554)
emulator -avd Pixel_5_API_33 &

# Start emulator 2 (port 5556)
emulator -avd Pixel_4_API_33 -port 5556 &

# Start emulator 3 (port 5558)
emulator -avd Pixel_6_API_33 -port 5558 &

# Start emulator 4 (port 5560)
emulator -avd Pixel_3a_API_33 -port 5560 &
```

#### GUI Method
1. Open Android Studio
2. Tools → Device Manager
3. Click ▶️ next to each AVD
4. Wait for each to boot

### Step 3: Start Server
```bash
cd path/to/server
npm start
```

### Step 4: Start Expo Dev Server
```bash
cd path/to/client
npm start
```

### Step 5: Install on Each Emulator

#### Option A: Use Expo Dev Client (Recommended)
1. In Expo terminal, press `a` for Android
2. Select which emulator to use
3. App will install and run
4. Repeat for each emulator

#### Option B: Build and Install APK
```bash
# Build development APK
eas build --profile development --platform android

# After build completes, install on emulators
adb -s emulator-5554 install app.apk
adb -s emulator-5556 install app.apk
adb -s emulator-5558 install app.apk
adb -s emulator-5560 install app.apk
```

### Step 6: Open App on Each Emulator

On each emulator:
1. Open Expo Go app
2. Enter URL: `exp://YOUR_LOCAL_IP:8081`
   Example: `exp://192.168.1.228:8081`
3. App should load

### Step 7: Create Different Users

- **Emulator 1**: Sign up as `user1@test.com` / `password123`
- **Emulator 2**: Sign up as `user2@test.com` / `password123`
- **Emulator 3**: Sign up as `user3@test.com` / `password123`
- **Emulator 4**: Sign up as `user4@test.com` / `password123`

### Step 8: Testing Checklist

#### Hang Out Feature
- [ ] Each user goes to "Hang Out" tab
- [ ] Status shows 🟢 "You're visible to others"
- [ ] Each user sees 3 other users' cards
- [ ] Can swipe through cards (left/right)
- [ ] Toggle "Hidden" on user1 → user1 disappears from others
- [ ] Toggle "Visible" on user1 → user1 reappears to others
- [ ] Reload button works
- [ ] Background image upload button visible

#### Real-Time Messaging
- [ ] User1 → Connection tab → tap user2
- [ ] Send message from user1
- [ ] User2 sees new message notification in Inbox tab immediately
- [ ] User2 opens chat → sees message
- [ ] User2 replies → user1 sees reply instantly
- [ ] Typing indicators work (shows "typing..." when other user types)
- [ ] Unread count updates in real-time
- [ ] Read receipts work

#### WebSocket Connection
- [ ] Open app → check console for "✅ WebSocket connected"
- [ ] Minimize app → bring back → connection maintained
- [ ] Turn off wifi → turn on → reconnects automatically
- [ ] Check server logs for online status updates

## Testing Multiple Scenarios

### Scenario 1: User Goes Offline
1. User1 and User2 both in Hang Out tab
2. Close app on User1's device
3. Wait 30 seconds
4. User2 should no longer see User1's card
5. Reopen app on User1
6. User2 should see User1's card reappear

### Scenario 2: Toggle Visibility
1. User1 and User2 both in Hang Out
2. User1 toggles "Hidden"
3. User2 reloads → User1 disappears
4. User1 toggles "Visible"
5. User2 reloads → User1 reappears

### Scenario 3: Messaging While Other Screen Active
1. User1 and User2 both logged in
2. User1 on "Account" tab, User2 on "Connection" tab
3. User2 sends message to User1
4. User1 → check Inbox tab → should see new message indicator
5. Open conversation → message visible

### Scenario 4: Multiple Conversations
1. User1 chats with User2
2. User1 chats with User3
3. User1 chats with User4
4. All 3 conversations appear in Inbox
5. Newest message at top
6. Unread counts correct for each

## Monitoring & Debugging

### Check Server Logs
```bash
cd path/to/server
npm start
```

Look for:
- `🔌 WebSocket client connected: <socket-id>`
- `✅ User authenticated: <username>`
- `✅ <username> marked as online`
- `Message sent in conversation X by <username>`

### Check Client Logs
In each emulator, use `adb logcat`:
```bash
adb -s emulator-5554 logcat | grep ReactNative
adb -s emulator-5556 logcat | grep ReactNative
```

Or in Metro bundler terminal, logs appear automatically.

### Database Queries

Connect to your database and run:

#### Check Online Users
```sql
SELECT username, is_online, last_seen 
FROM users 
WHERE is_online = true
ORDER BY last_seen DESC;
```

#### Check Hangout Availability
```sql
SELECT u.username, u.is_online, h.is_available, h.last_updated
FROM users u
LEFT JOIN user_hangout_status h ON u.username = h.username
WHERE u.is_online = true;
```

#### Check Active Conversations
```sql
SELECT c.id, c.type, c.created_at,
       (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id) as message_count
FROM conversations c
ORDER BY c.updated_at DESC
LIMIT 10;
```

## Common Issues & Solutions

### Issue: "No more users online" even with multiple devices

**Cause**: Users haven't enabled visibility or WebSocket not connected

**Solutions**:
1. Check visibility toggle: Should show 🟢 "You're visible to others"
2. Check server logs: Should see "User authenticated" for each user
3. Check database: Run queries above to verify `is_online` and `is_available`
4. Restart app on each device
5. Check `.env` file has correct API URL with local IP

### Issue: Messages not appearing in real-time

**Cause**: WebSocket connection lost or not established

**Solutions**:
1. Check server logs for WebSocket connection
2. Check Metro bundler logs for "WebSocket connected"
3. Restart server
4. Reload app on devices (shake device → Reload)
5. Check network: emulator and server on same network

### Issue: Can't connect from emulator to server

**Cause**: Using `localhost` instead of local IP

**Solutions**:
1. Update `.env`: `EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3000`
2. Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
3. Restart Expo dev server
4. Reload app on emulators

### Issue: Emulators too slow

**Solutions**:
1. Increase RAM allocation: AVD settings → Advanced → RAM → 4096 MB
2. Enable Hardware acceleration: AVD settings → Graphics → Hardware
3. Close unnecessary applications
4. Reduce number of running emulators to 2-3
5. Use physical devices instead

## Performance Tips

### For Better Emulator Performance
- Close unnecessary apps
- Allocate more RAM to emulators (4GB each)
- Enable hardware acceleration
- Use SSD for AVD storage
- Limit to 4 emulators maximum

### For Better Testing Experience
- Use mix of emulators and physical devices
- Keep server logs visible in separate terminal
- Use database GUI tool for quick verification
- Take screenshots of issues for bug reports

## Test Results Template

```markdown
## Test Session: [Date]

### Environment
- Server: Running on port 3000 ✅
- Devices: 4 Android emulators ✅
- Network: Local WiFi

### Hang Out Feature
- [ ] Users appear in each other's lists: PASS
- [ ] Visibility toggle works: PASS
- [ ] Auto-enable on first visit: PASS
- [ ] Empty state messages correct: PASS

### Real-Time Messaging
- [ ] Messages deliver instantly: PASS
- [ ] Typing indicators work: PASS
- [ ] Unread counts update: PASS
- [ ] Multiple conversations: PASS

### WebSocket Connection
- [ ] Auto-connect on login: PASS
- [ ] Reconnect on network change: PASS
- [ ] Heartbeat maintaining connection: PASS
- [ ] Online status updates: PASS

### Issues Found
1. [Description of any issues]
2. [Screenshots if applicable]

### Notes
[Any additional observations]
```

## Next Steps After Testing

1. Document any bugs found
2. Take screenshots/videos of working features
3. Note any performance issues
4. Test on production-like environment
5. Prepare for deployment

---

**Good Luck Testing! 🚀**

For questions or issues, check:
- HANG_OUT_FIX_SUMMARY.md
- Server logs
- Database queries above
