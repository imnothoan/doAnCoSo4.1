# Server Changes Required for Real-Time Inbox Updates

## Issue
Currently, the inbox only updates in real-time if you're in the conversation room. Users need to see new message notifications in their inbox instantly, even when they're on other tabs.

## Root Cause
The server's `websocket.js` only broadcasts `new_message` to users in the specific conversation room using `socket.to(roomName).emit()`. Users viewing their inbox are not joined to conversation rooms, so they don't receive these updates.

## Solution
Broadcast message notifications to all participants of a conversation, not just those in the room.

### Required Changes in `/tmp/doAnCoSo4.1.server/websocket.js`

#### 1. Track User Sockets by Username
Add a map to track username -> socket.id mapping:

```javascript
// Store online users: username -> socket.id
const onlineUsers = new Map();
```

This is already implemented at line 19.

#### 2. Modify the `send_message` Handler
After saving a message, emit to:
1. All users in the conversation room (existing)
2. All participants of the conversation (NEW)

Replace lines 119-126 with:

```javascript
// Emit to sender (confirmation)
socket.emit("message_sent", message);

// Broadcast to others in the room (for active chat)
const roomName = `conversation_${conversationId}`;
socket.to(roomName).emit("new_message", message);

// Also emit inbox update to all participants (even if not in room)
const { data: members } = await supabase
  .from("conversation_members")
  .select("username")
  .eq("conversation_id", conversationId);

if (members) {
  members.forEach((member) => {
    // Don't send to sender (they already got message_sent)
    if (member.username !== senderUsername) {
      const memberSocketId = onlineUsers.get(member.username);
      if (memberSocketId) {
        // Emit inbox_update event with basic message info
        io.to(memberSocketId).emit("inbox_update", {
          conversationId,
          message: {
            content: message.content,
            timestamp: message.created_at,
            sender: { username: senderUsername },
          },
        });
      }
    }
  });
}
```

### Summary of Changes

**File**: `/tmp/doAnCoSo4.1.server/websocket.js`

**Location**: Lines 119-126 (in the `send_message` handler)

**Action**: Add inbox notification broadcast to all conversation participants

## Testing
1. User A sends a message to User B
2. User B should see the inbox update immediately, even if on the "Discover" or "Explore" tab
3. The unread count should increment
4. The conversation should move to the top of the inbox

## Client Changes
The client already has the WebSocket listener infrastructure. We just need to add a handler for the new `inbox_update` event in `inbox.tsx`.
