# Complete Guide: Deploying Call Functionality Updates

## Overview
This guide explains how to deploy the complete call functionality fix to both the client and server.

## What Was Fixed

### Issues Resolved:
1. ✅ Ringtone now plays when making a call
2. ✅ Ringtone plays when receiving a call
3. ✅ Ringtone loops exactly 2 times (as specified)
4. ✅ Call automatically times out after 2 ringtone loops if not answered
5. ✅ Incoming call modal now shows on receiver's device
6. ✅ Global call handling works across the entire app

## Client Deployment (Already Complete)

The client code has been updated in this PR with the following changes:
- New RingtoneService for audio playback
- Updated CallingService with timeout handling
- New CallProvider for global call state
- Updated root layout with CallProvider
- Call timeout event handling

**No additional client deployment steps needed** - just merge this PR.

## Server Deployment (Required)

### Option 1: Automatic Deployment (Recommended)

1. Navigate to your server repository:
```bash
cd /path/to/doAnCoSo4.1.server
```

2. Replace the websocket.js file with the updated version:
```bash
# Backup the current file first
cp websocket.js websocket.js.backup

# Copy the updated file from this repo
# (The updated file is available as server-websocket-updated.js in this client repo)
```

3. Restart your server:
```bash
# If using npm
npm restart

# If using pm2
pm2 restart your-app-name

# If running directly
# Stop the current process and run:
npm start
```

### Option 2: Manual Update

If you prefer to manually update the file, add this code to `websocket.js`:

**Location**: After the `video_upgrade_accepted` handler (around line 438)

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

## Testing the Implementation

### Test 1: Outgoing Call with Ringtone
1. User A opens chat with User B
2. User A clicks the call button (phone icon)
3. **Expected**: 
   - Ringtone should start playing immediately
   - Ringtone loops 2 times
   - If User B doesn't answer, call times out automatically
   - User A sees "Call Timeout - The call was not answered" alert

### Test 2: Incoming Call Modal
1. User A initiates a call to User B
2. **Expected on User B's device**:
   - Incoming call modal appears immediately
   - Shows User A's name and avatar
   - Ringtone plays (loops 2 times)
   - Accept and Reject buttons are visible
   - If not answered, auto-rejects after 2 ringtone loops
   - Shows "Missed Call - You missed a call" alert

### Test 3: Accept Call
1. User A calls User B
2. User B accepts the call
3. **Expected**:
   - Ringtone stops immediately on both devices
   - Active call screen appears on both devices
   - Call duration counter starts

### Test 4: Reject Call
1. User A calls User B
2. User B rejects the call
3. **Expected**:
   - Ringtone stops immediately
   - User A sees "Call Rejected" alert
   - Both users return to normal state

### Test 5: End Call
1. User A and User B are in an active call
2. Either user clicks End Call button
3. **Expected**:
   - Call ends immediately
   - Both users return to normal state
   - No ringtone plays (call is already connected)

## Troubleshooting

### Issue: Ringtone doesn't play
**Solution**: 
- Ensure expo-av is installed: `npm install expo-av`
- Check that the audio file exists at `/assets/music/soundPhoneCall1.mp3`
- Verify device volume is not muted

### Issue: Incoming call modal doesn't appear
**Solution**:
- Verify CallProvider is wrapped in root layout
- Check WebSocket connection is active
- Verify server is running the updated websocket.js
- Check browser console for WebSocket errors

### Issue: Call doesn't timeout
**Solution**:
- Verify ringtone loops are completing
- Check server has the call_timeout handler
- Verify WebSocket connection between client and server

### Issue: Server not receiving events
**Solution**:
- Verify server websocket.js has been updated
- Restart the server after updating
- Check server logs for connection issues
- Verify CORS settings allow client origin

## Architecture Overview

```
Client (User A)                Server                    Client (User B)
     |                           |                             |
     |-- initiate_call --------->|                             |
     |   (starts ringtone)       |                             |
     |                           |-- incoming_call ----------->|
     |                           |                   (shows modal + ringtone)
     |                           |                             |
     |                           |<-- accept_call -------------|
     |<-- call_accepted ---------|                             |
(stop ringtone)                  |                  (stop ringtone)
     |                           |                             |
     
     OR (timeout scenario)
     
     |                           |                             |
(after 2 loops)                  |                   (after 2 loops)
     |-- call_timeout ---------->|                             |
     |                           |-- call_timeout ------------>|
(show timeout alert)             |               (show missed call alert)
```

## Files Changed

### Client Repository (doAnCoSo4.1):
- `src/services/ringtoneService.ts` - NEW: Audio playback service
- `src/context/CallContext.tsx` - NEW: Global call state management
- `src/services/callingService.ts` - UPDATED: Added ringtone and timeout
- `app/_layout.tsx` - UPDATED: Added CallProvider
- `app/inbox/chat.tsx` - UPDATED: Added timeout handler
- `package.json` - UPDATED: Added expo-av dependency

### Server Repository (doAnCoSo4.1.server):
- `websocket.js` - UPDATED: Added call_timeout handler

## Support

If you encounter any issues:
1. Check that both client and server are updated
2. Verify WebSocket connection is active
3. Check server logs for errors
4. Ensure both users are mutual followers (required for calls)
5. Test with both users online

## Additional Notes

- Calls only work between users who mutually follow each other
- The ringtone file (soundPhoneCall1.mp3) must exist in the assets folder
- WebSocket connection must be active for calls to work
- Call timeout is exactly 2 loops of the ringtone (~20-30 seconds depending on audio file length)
