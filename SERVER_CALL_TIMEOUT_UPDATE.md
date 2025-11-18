# Server Update Instructions for Call Timeout Feature

## Overview
This document describes the server-side changes needed to support the call timeout feature in the client application.

## Changes Required

### File: `websocket.js`

Add the following event handler after the `video_upgrade_accepted` handler (around line 438):

```javascript
// Handle call timeout (when caller doesn't answer after ringtone)
socket.on("call_timeout", async ({ callId }) => {
  try {
    // Notify the other party that the call timed out
    const parts = callId.split("_");
    if (parts.length >= 4) {
      const callerId = parts[2];
      const receiverId = parts[3];
      
      // Determine who the other party is (opposite of current user)
      const otherParty = currentUsername === callerId ? receiverId : callerId;
      const otherSocketId = onlineUsers.get(otherParty);
      
      if (otherSocketId) {
        io.to(otherSocketId).emit("call_timeout", { 
          callId 
        });
        console.log(`Call ${callId} timed out`);
      }
    }
  } catch (err) {
    console.error("call_timeout error:", err);
  }
});
```

## What This Does

1. **Client Timeout**: When a call is initiated and the ringtone loops 2 times without an answer, the client sends a `call_timeout` event to the server.

2. **Server Relay**: The server receives the `call_timeout` event and forwards it to the other party (caller or receiver).

3. **Cleanup**: Both parties receive the timeout notification and can clean up their call state appropriately.

## Testing

1. Start a call from User A to User B
2. Do not answer the call on User B's device
3. Wait for the ringtone to loop 2 times (~20-30 seconds)
4. Verify that:
   - The call automatically ends on User A's device
   - User B receives a "Missed Call" notification
   - The ringtone stops playing on both devices

## Server File Location

The complete updated `websocket.js` file is available in `/tmp/doAnCoSo4.1.server/websocket.js`.

To apply the changes to your server:

1. Copy the updated websocket.js file to your server repository
2. Restart your server
3. Test the call timeout functionality

## Alternative: Manual Update

If you prefer to manually update the file, add the code snippet above after line 438 in your `websocket.js` file (after the `video_upgrade_accepted` handler).
