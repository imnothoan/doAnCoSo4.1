# Server Fix Instructions - Inbox Realtime Updates

## Problem Statement (Vietnamese)
Những người đã từng có cuộc hội thoại nhắn đến phần inbox hoạt động rất tốt, nhưng nếu có người lạ nhắn tin đến thì lại không hề xuất hiện.

**Translation**: Messages from people with existing conversations work well in the inbox, but messages from strangers (new conversations) don't appear.

## Root Cause Analysis

The issue was found in the server's WebSocket emission logic in `websocket.js`.

### The Bug

In the `send_message` event handler (around line 193 in the original code), the server tried to find participant sockets like this:

```javascript
// OLD BUGGY CODE:
participants.forEach(p => {
  for (const [id, s] of io.sockets.sockets) {
    const sockUser = s.handshake.auth?.token; 
    if (sockUser === p.username) {  // ❌ BUG: Comparing token with username
      s.emit("new_message", messagePayload);
    }
  }
});
```

### Why This Was Wrong

1. `s.handshake.auth.token` = Base64 encoded token (e.g., "MToxNzAwMDAwMDAw" representing "userId:timestamp")
2. `p.username` = Plain username string (e.g., "john123")
3. These two values NEVER match, so messages were never emitted to the correct sockets!

### Why It "Worked" for Existing Conversations

Messages appeared to work for existing conversations because of the fallback at line 207:
```javascript
io.to(roomName).emit("new_message", messagePayload);
```

This broadcast to everyone already in the conversation room. BUT for NEW conversations, users weren't in the room yet, so they never received the message!

## The Fix

### Change 1: Store Username on Socket (Line 62)

```javascript
// NEW CODE:
currentUsername = data.username;
// Store username on socket object for easy lookup
socket.username = currentUsername;
onlineUsers.set(currentUsername, socket.id);
```

This stores the username directly on the socket object during authentication.

### Change 2: Use Stored Username for Lookup (Line 196)

```javascript
// NEW CODE:
participants.forEach(p => {
  for (const [id, s] of io.sockets.sockets) {
    // Use the username stored on socket object (set during auth)
    if (s.username === p.username) {  // ✅ CORRECT: Comparing username with username
      if (!s.rooms.has(roomName)) {
        s.join(roomName);
        console.log(`🔗 Auto-joined ${p.username} to room ${roomName}`);
      }
      s.emit("new_message", messagePayload);
      console.log(`📨 Sent message directly to ${p.username}`);
    }
  }
});
```

Now the comparison is username-to-username, which works correctly!

## How to Apply the Fix

### Option 1: Manual Update (Recommended)

1. Navigate to your server repository:
   ```bash
   cd path/to/doAnCoSo4.1.server
   ```

2. Open `websocket.js` in your editor

3. Find line ~60 where it says:
   ```javascript
   currentUsername = data.username;
   onlineUsers.set(currentUsername, socket.id);
   ```

4. Change it to:
   ```javascript
   currentUsername = data.username;
   // Store username on socket object for easy lookup
   socket.username = currentUsername;
   onlineUsers.set(currentUsername, socket.id);
   ```

5. Find line ~193 where it says:
   ```javascript
   const sockUser = s.handshake.auth?.token;
   if (sockUser === p.username) {
   ```

6. Change it to:
   ```javascript
   // Use the username stored on socket object (set during auth)
   if (s.username === p.username) {
   ```

7. Add better logging:
   ```javascript
   if (s.username === p.username) {
     if (!s.rooms.has(roomName)) {
       s.join(roomName);
       console.log(`🔗 Auto-joined ${p.username} to room ${roomName}`);
     }
     s.emit("new_message", messagePayload);
     console.log(`📨 Sent message directly to ${p.username}`);
   }
   ```

8. Save the file

9. Restart your server:
   ```bash
   npm run dev
   # or
   npm start
   ```

### Option 2: Copy Fixed File

A complete fixed version of `websocket.js` is included in this repository as `SERVER_FIX_websocket.js`. You can:

1. Copy it to your server repository:
   ```bash
   cp SERVER_FIX_websocket.js path/to/doAnCoSo4.1.server/websocket.js
   ```

2. Restart your server:
   ```bash
   cd path/to/doAnCoSo4.1.server
   npm run dev
   ```

## Testing the Fix

### Prerequisites
- 4-8 devices or emulators
- Server must be running with the fix applied
- At least 4 user accounts created

### Test Scenario 1: New Stranger Message

1. **Setup**:
   - Device A: Login as User A
   - Device B: Login as User B (never messaged User A before)

2. **Test**:
   - On Device A: Go to Inbox tab, keep it open
   - On Device B: Find User A in Connections, click Message button
   - On Device B: Send a message "Hello from B"

3. **Expected Result** ✅:
   - Device A's Inbox should **IMMEDIATELY** show new conversation with User B
   - Avatar should show User B's avatar (or default icon if no avatar)
   - Name should show User B's name/username (NOT "Direct Message" or "User")
   - Last message should show "Hello from B"
   - Unread badge should appear

4. **Previous Buggy Behavior** ❌:
   - Device A's Inbox would NOT update
   - User A would have to close and reopen the app to see the message

### Test Scenario 2: Multiple New Conversations

1. **Setup**:
   - Device A: Login as User A
   - Devices B, C, D: Login as Users B, C, D (all strangers to User A)

2. **Test**:
   - On Device A: Go to Inbox, keep it open
   - On Devices B, C, D: Simultaneously send messages to User A

3. **Expected Result** ✅:
   - Device A's Inbox should show ALL 3 new conversations in real-time
   - Each should have correct avatar and name
   - Messages should appear instantly

### Test Scenario 3: Existing Conversation (Regression Test)

1. **Test that existing conversations still work**:
   - Users who have already chatted should continue to see messages in real-time
   - No regressions should occur

## Technical Details

### WebSocket Event Flow

1. **User B sends message to User A** (first time):
   ```
   Client B -> WebSocket -> Server
   ```

2. **Server processes message**:
   ```
   1. Verify User B is member of conversation
   2. Insert message into database
   3. Fetch full sender info from users table
   4. Build messagePayload with sender object
   5. Find all sockets belonging to conversation participants
   6. Emit "new_message" directly to each participant's socket
   7. Also broadcast to conversation room (backup)
   ```

3. **User A receives message**:
   ```
   Server -> WebSocket -> Client A
   Client A: Update inbox with new conversation
   ```

### Message Payload Structure

The server sends this payload:
```javascript
{
  id: 123,
  conversation_id: 456,
  sender_username: "userB",
  message_type: "text",
  content: "Hello from B",
  created_at: "2024-11-16T18:00:00Z",
  sender: {
    id: "uuid-123",
    username: "userB",
    name: "User B Name",
    avatar: "https://...",
    email: "userb@example.com",
    country: "Vietnam",
    city: "Hanoi",
    status: "Chilling",
    bio: "...",
    age: 25,
    gender: "Male",
    interests: [...],
    is_online: true
  },
  chatId: 456,
  senderId: "userB",
  timestamp: "2024-11-16T18:00:00Z"
}
```

The client uses `message.sender` to display avatar, name, etc.

## Client-Side Handling

The client's `inbox.tsx` already has robust handling for new messages:

1. **Existing conversation** (lines 73-183): Updates the conversation and moves to top
2. **New conversation** (lines 184-231): Creates minimal entry, then reloads full data

With the server fix, **both paths now work correctly** because:
- The WebSocket message is now properly delivered to all participants
- The message includes full sender data
- The client can immediately display the conversation with correct info

## Verification

After applying the fix, check server logs for these messages:

```
✅ User authenticated: userB
🔗 Auto-joined userA to room conversation_456
📨 Sent message directly to userA
Message sent in conversation 456 by userB
```

These logs confirm:
1. Users are authenticated correctly
2. Sockets are auto-joined to conversation rooms
3. Messages are sent directly to participant sockets
4. Everything is working as expected

## Common Issues

### Issue 1: Still Not Working
- **Check**: Did you restart the server after applying the fix?
- **Check**: Are both users online and connected to WebSocket?
- **Check**: Do server logs show "Auto-joined" messages?

### Issue 2: Old Conversations Work, New Ones Don't
- **Likely**: Server wasn't restarted, still using old code
- **Solution**: Restart server completely

### Issue 3: No Messages at All
- **Check**: Is WebSocket connection established?
- **Check**: Client logs for "WebSocket connected"
- **Check**: Server logs for "User authenticated"

## Summary

The fix is simple but critical:
1. Store `username` on socket object during auth
2. Use stored `username` for participant lookup instead of comparing token

This ensures that when a stranger sends a message:
1. Server correctly finds the recipient's socket
2. Server emits the message directly to that socket
3. Client receives the message immediately
4. Inbox updates in real-time with correct user info

The fix is **minimal**, **safe**, and **effective**. It doesn't change any database schema, API endpoints, or client code - only fixes the WebSocket emission logic.

---

**Author**: GitHub Copilot
**Date**: November 16, 2024
**Issue**: Inbox realtime updates for new conversations
**Status**: ✅ FIXED
