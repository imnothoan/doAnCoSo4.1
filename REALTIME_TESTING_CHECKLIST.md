# Testing Checklist for Real-time Features

This document provides a comprehensive checklist to verify all real-time features are working correctly.

## Prerequisites

### Server Setup
1. ✅ Server is running on the correct IP/port
2. ✅ WebSocket server is initialized
3. ✅ Database connection is working
4. ✅ CORS is configured to allow client origin

### Client Setup
1. ✅ Update `.env` file with correct `EXPO_PUBLIC_API_URL`
2. ✅ Install dependencies: `npm install`
3. ✅ Start the app: `npm start`

## Test Scenarios

### 1. WebSocket Connection Persistence

**Goal:** Verify WebSocket stays connected throughout app usage

**Steps:**
1. Login to the app on Device/Account 1
2. Check console logs - should see: `✅ WebSocket connected successfully`
3. Navigate between tabs (Discussion, Connection, Hangout, Inbox, Account)
4. Verify connection status indicator does NOT appear (should stay connected)
5. Put app in background for 30 seconds
6. Bring app back to foreground
7. Verify WebSocket reconnects automatically

**Expected Results:**
- ✅ WebSocket connects on login
- ✅ Connection persists during tab navigation
- ✅ Connection reconnects when app resumes from background
- ✅ No "Reconnecting..." indicator appears when connected
- ✅ Console shows heartbeat acknowledgments every 25 seconds

**Troubleshooting:**
- If connection drops: Check server logs for disconnect reasons
- If won't reconnect: Verify server is running and accessible
- If heartbeat fails: Check WebSocket configuration on both client and server

---

### 2. Real-time Messaging (Inbox)

**Goal:** Verify messages appear instantly for both sender and receiver

**Setup:**
- Device/Account 1: User A
- Device/Account 2: User B

**Steps:**

#### Part A: Start New Conversation
1. On Device 1 (User A):
   - Go to Connection tab
   - Find User B
   - Tap "Message" button
   - Send a message: "Hello from User A"

2. On Device 2 (User B):
   - Stay on Inbox tab
   - **Without refreshing**, verify message appears in conversation list
   - Verify unread count shows "1"
   - Verify sender name is "User A" (not "Direct Message" or blank)

3. On Device 2 (User B):
   - Tap on the conversation with User A
   - Verify message "Hello from User A" appears
   - Send reply: "Hello from User B"

4. On Device 1 (User A):
   - **Without leaving the chat**, verify reply appears instantly
   - Verify message shows "Hello from User B"

#### Part B: Real-time Conversation List Updates
1. On Device 1 (User A):
   - Go back to Inbox tab (don't close app)
   - Have User B send a new message

2. On Device 1 (User A):
   - **Without pulling to refresh**, verify:
     - Conversation with User B moves to top of list
     - Last message updates to new message
     - Unread count increases

#### Part C: Multiple Conversations
1. Create conversations with 3+ different users
2. Have each user send messages
3. Verify each conversation updates in real-time
4. Verify conversations are sorted by most recent message

**Expected Results:**
- ✅ New messages appear instantly without refresh
- ✅ Conversation list updates in real-time
- ✅ Sender names display correctly (never "Direct Message")
- ✅ Unread counts update correctly
- ✅ Conversations sort by most recent activity
- ✅ Messages appear in chat view instantly

**Common Issues:**
- **Message appears but sender shows "Direct Message"**: 
  - This was fixed - ensure you have the latest code
  - Check that sender info is properly populated in WebSocket message
  
- **Messages don't appear in real-time**:
  - Check WebSocket connection status
  - Verify both users are connected to WebSocket
  - Check server logs for message delivery
  
- **Conversation doesn't move to top**:
  - Verify WebSocket listener in inbox.tsx is active
  - Check console logs for "📨 New message received in inbox"

---

### 3. Typing Indicators

**Goal:** Verify typing indicators work in real-time

**Steps:**
1. Device 1 (User A): Open chat with User B
2. Device 2 (User B): Open chat with User A
3. Device 1 (User A): Start typing in message input
4. Device 2 (User B): Verify "User A is typing..." appears
5. Device 1 (User A): Stop typing
6. Device 2 (User B): Verify typing indicator disappears after 2 seconds

**Expected Results:**
- ✅ Typing indicator appears when other user types
- ✅ Typing indicator disappears when user stops
- ✅ Typing works in both directions

---

### 4. Hangout Feature

**Goal:** Verify users can discover each other in Hangout

**Setup:**
- Device/Account 1: User A
- Device/Account 2: User B

**Steps:**

#### Part A: Enable Visibility
1. On Device 1 (User A):
   - Go to Hangout tab
   - If prompted, tap "Enable" to turn on visibility
   - Verify header shows "🟢 You're visible to others"
   - Verify "Visible" button is green

2. On Device 2 (User B):
   - Go to Hangout tab
   - Enable visibility if prompted
   - Verify visibility is on

#### Part B: Discovery
1. On Device 1 (User A):
   - Pull down to refresh or wait for auto-refresh
   - Check if User B appears in card stack
   - Verify User B's profile shows:
     - ✅ Name
     - ✅ Age (if set)
     - ✅ Location (if set)
     - ✅ Bio (if set)
     - ✅ Interests
     - ✅ "Online" indicator

2. On Device 2 (User B):
   - Verify User A appears in their stack

#### Part C: Visibility Control
1. On Device 1 (User A):
   - Tap "Visible" button to hide
   - Wait 30 seconds for auto-refresh

2. On Device 2 (User B):
   - Verify User A no longer appears in stack
   - May need to wait up to 30s for refresh

3. On Device 1 (User A):
   - Tap "Hidden" button to show again
   - Wait for refresh

4. On Device 2 (User B):
   - Verify User A reappears

**Expected Results:**
- ✅ Users appear when both are online AND visible
- ✅ Users disappear when one hides visibility
- ✅ Profile information displays correctly
- ✅ Online status shows correctly
- ✅ Auto-refresh updates user list every 30 seconds

**Common Issues:**
- **"No more users available" always shows**:
  - Verify both users have visibility enabled
  - Check that both users are online (WebSocket connected)
  - Verify server hangout status API returns is_available: true
  - Check server logs: should see users in `/hangouts` endpoint response
  
- **User appears but profile is incomplete**:
  - User may not have filled out their profile
  - Background image may not be uploaded
  
- **Auto-refresh doesn't work**:
  - Check console logs for refresh messages
  - Verify interval is running (should log every 30s)

---

### 5. Online Status

**Goal:** Verify user online status updates correctly

**Steps:**
1. On Device 1 (User A):
   - Login
   - Go to Connection tab
   
2. On Device 2 (User B):
   - Login
   - Go to Connection tab
   - Find User A in user list
   - Verify green dot shows "Online"

3. On Device 1 (User A):
   - Close app or logout
   
4. On Device 2 (User B):
   - Refresh user list
   - Verify User A no longer shows green dot

**Expected Results:**
- ✅ Online users show green indicator
- ✅ Offline users don't show green indicator
- ✅ Status updates when users login/logout

---

### 6. Conversation Persistence on Reconnection

**Goal:** Verify conversations rejoin rooms after reconnection

**Steps:**
1. Device 1 (User A):
   - Open chat with User B
   - Verify WebSocket connected (console logs)
   - Note the conversation ID

2. Device 1 (User A):
   - Put app in background for 60+ seconds (force disconnect)
   - OR: Turn off WiFi briefly then turn back on
   
3. Device 1 (User A):
   - Bring app to foreground
   - Check console logs - should see:
     - `❌ WebSocket disconnected`
     - `✅ WebSocket connected successfully`
     - `🔄 Rejoining X conversation rooms...`
     - `📥 Joined conversation: [conversation-id]`

4. Device 2 (User B):
   - Send a message to User A

5. Device 1 (User A):
   - Verify message appears instantly (without manual action)

**Expected Results:**
- ✅ WebSocket reconnects on app resume
- ✅ Active conversations are rejoined automatically
- ✅ Messages arrive after reconnection
- ✅ No manual refresh needed

---

## Debug Mode

### Enable Verbose Logging

To see detailed WebSocket and API logs:

1. Open browser DevTools (for web) or React Native Debugger
2. Check console for these log patterns:
   - `🔌 Connecting to WebSocket:`
   - `✅ WebSocket connected successfully`
   - `📥 Joined conversation:`
   - `📨 New message received in inbox:`
   - `📡 Fetching hangout users...`
   - `✅ Filtered to X available users for hangout`

### Server Logs

Monitor server console for:
- `🔌 WebSocket client connected:`
- `✅ [username] marked as online`
- `Message sent in conversation [id]`
- WebSocket disconnect/reconnect events

### Network Inspection

1. Open Network tab in DevTools
2. Filter by "WS" (WebSocket)
3. Monitor WebSocket frames:
   - `join_conversation`
   - `send_message`
   - `new_message`
   - `typing`
   - `heartbeat_ack`

---

## Performance Benchmarks

### Expected Performance

- **Message Delivery**: < 500ms from send to receive
- **Typing Indicator**: < 200ms delay
- **Connection Time**: < 2 seconds on WiFi
- **Reconnection Time**: < 3 seconds
- **Hangout Refresh**: Every 30 seconds

### Resource Usage

- WebSocket should use minimal bandwidth (< 1KB/min idle)
- Heartbeat every 25 seconds keeps connection alive
- No memory leaks after 1 hour of usage

---

## Sign-off Checklist

After completing all tests, verify:

- [ ] ✅ WebSocket connects and stays connected
- [ ] ✅ Messages appear in real-time for both users
- [ ] ✅ Inbox conversation list updates without refresh
- [ ] ✅ Typing indicators work bidirectionally
- [ ] ✅ Hangout shows online AND visible users
- [ ] ✅ Users appear/disappear based on visibility setting
- [ ] ✅ Online status updates correctly
- [ ] ✅ Conversations rejoin on reconnection
- [ ] ✅ No "Direct Message" or blank names in conversations
- [ ] ✅ Connection status indicator appears only when disconnected
- [ ] ✅ App works on multiple devices simultaneously

---

## Rollback Plan

If issues are found:

1. Check git history: `git log --oneline`
2. Identify last working commit
3. Rollback if needed: `git revert [commit-hash]`
4. Report issues with detailed logs and steps to reproduce

---

## Support

For issues or questions:
1. Check console logs (both client and server)
2. Verify server is running and accessible
3. Check network connectivity
4. Review WebSocket connection status
5. Consult implementation documentation in code comments
