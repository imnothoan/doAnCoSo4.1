# Server Update Instructions

This document describes the changes that need to be applied to the server repository at https://github.com/imnothoan/doAnCoSo4.1.server

## Required Changes

### File: `websocket.js`

#### Change Location: Lines 172-185 (message broadcasting)

**Current Code:**
```javascript
// Emit to sender (confirmation) and broadcast to others in the room
const roomName = `conversation_${conversationId}`;

// Emit to sender (confirmation)
socket.emit("message_sent", message);

// Broadcast to others in the room with full sender info
socket.to(roomName).emit("new_message", {
  ...message,
  chatId: conversationId,  // Add for client compatibility
  senderId: senderUsername, // Add for client compatibility
});

console.log(`Message sent in conversation ${conversationId} by ${senderUsername}`);
```

**New Code:**
```javascript
// Emit to sender (confirmation) and broadcast to others in the room
const roomName = `conversation_${conversationId}`;

// Create message payload with complete data
const messagePayload = {
  ...message,
  chatId: conversationId,  // Add for client compatibility
  senderId: senderUsername, // Add for client compatibility
  timestamp: message.created_at, // Add for client compatibility
};

// Emit to sender (confirmation)
socket.emit("message_sent", messagePayload);

// Broadcast to ALL clients in the room (including sender) for inbox list updates
// This ensures inbox lists update in real-time for all participants
io.to(roomName).emit("new_message", messagePayload);

console.log(`Message sent in conversation ${conversationId} by ${senderUsername}`);
```

### Why This Change Is Important

1. **Broadcast to All Participants**: Changed from `socket.to(roomName)` (which excludes sender) to `io.to(roomName)` (which includes all participants). This ensures the sender's inbox also updates when they send a message.

2. **Consistent Message Format**: Creates a unified `messagePayload` object used for both the sender confirmation and the broadcast, ensuring consistency.

3. **Added Timestamp**: Includes the `timestamp` field in the payload for better client-side handling.

## How to Apply

1. Navigate to the server repository:
   ```bash
   cd /path/to/doAnCoSo4.1.server
   ```

2. Open `websocket.js` in your editor

3. Find the "send_message" event handler (around line 125)

4. Replace the message broadcasting section as described above

5. Save the file

6. Restart the server:
   ```bash
   npm run dev  # or npm start for production
   ```

## Testing

After applying these changes:

1. Start the server
2. Open the client app on two different devices/emulators
3. Log in as different users on each device
4. Start a conversation
5. Send messages back and forth
6. Verify that:
   - Messages appear instantly on both devices
   - The inbox list updates in real-time for both sender and receiver
   - Avatars and names display correctly
   - Unread counts update properly

## Alternative: Use Git Patch

If you prefer to use git, you can apply the changes from the working directory:

```bash
cd /home/runner/work/doAnCoSo4.1/doAnCoSo4.1.server
git add websocket.js
git commit -m "Improve WebSocket message broadcasting for real-time inbox updates"
git push
```

## Notes

- These changes are backward compatible with existing clients
- No database migrations are needed
- The changes only affect the real-time WebSocket communication
- All existing REST API endpoints remain unchanged
