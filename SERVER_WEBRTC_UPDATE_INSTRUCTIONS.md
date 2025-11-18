# Server Update Instructions for WebRTC Video Call Support

## Overview
The client application has been updated with full WebRTC video calling functionality. The server needs to be updated to support WebRTC signaling (relaying SDP offers/answers and ICE candidates between peers).

## Required Server Changes

### File to Update: `websocket.js`

Add the following WebRTC signaling event handlers **after** the `call_timeout` handler and **before** the `disconnect` handler (around line 463):

```javascript
// ==================== WebRTC Signaling Events ====================

// Handle WebRTC offer
socket.on("webrtc_offer", async ({ callId, offer }) => {
  try {
    console.log(`[WebRTC] Received offer for call ${callId}`);
    const parts = callId.split("_");
    if (parts.length >= 4) {
      const callerId = parts[2];
      const receiverId = parts[3];
      
      // Forward offer to the receiver
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("webrtc_offer", {
          callId,
          offer,
        });
        console.log(`[WebRTC] Forwarded offer to ${receiverId}`);
      }
    }
  } catch (err) {
    console.error("webrtc_offer error:", err);
  }
});

// Handle WebRTC answer
socket.on("webrtc_answer", async ({ callId, answer }) => {
  try {
    console.log(`[WebRTC] Received answer for call ${callId}`);
    const parts = callId.split("_");
    if (parts.length >= 4) {
      const callerId = parts[2];
      const receiverId = parts[3];
      
      // Forward answer to the caller
      const callerSocketId = onlineUsers.get(callerId);
      if (callerSocketId) {
        io.to(callerSocketId).emit("webrtc_answer", {
          callId,
          answer,
        });
        console.log(`[WebRTC] Forwarded answer to ${callerId}`);
      }
    }
  } catch (err) {
    console.error("webrtc_answer error:", err);
  }
});

// Handle WebRTC ICE candidate
socket.on("webrtc_ice_candidate", async ({ callId, candidate }) => {
  try {
    console.log(`[WebRTC] Received ICE candidate for call ${callId}`);
    const parts = callId.split("_");
    if (parts.length >= 4) {
      const callerId = parts[2];
      const receiverId = parts[3];
      
      // Determine who the other party is and forward the candidate
      const otherParty = currentUsername === callerId ? receiverId : callerId;
      const otherSocketId = onlineUsers.get(otherParty);
      
      if (otherSocketId) {
        io.to(otherSocketId).emit("webrtc_ice_candidate", {
          callId,
          candidate,
        });
        console.log(`[WebRTC] Forwarded ICE candidate to ${otherParty}`);
      }
    }
  } catch (err) {
    console.error("webrtc_ice_candidate error:", err);
  }
});
```

## Installation Steps

1. Navigate to your server repository:
   ```bash
   cd /path/to/doAnCoSo4.1.server
   ```

2. Open `websocket.js` in your editor

3. Locate the `call_timeout` event handler (should be around line 441-463)

4. Add the WebRTC signaling code shown above after the `call_timeout` handler closing bracket

5. Save the file

6. Restart your server:
   ```bash
   # If using npm
   npm restart
   
   # If using pm2
   pm2 restart your-app-name
   
   # Or simply stop and start again
   node index.js
   ```

## What This Does

The WebRTC signaling handlers relay peer-to-peer connection information between the caller and receiver:

1. **webrtc_offer**: Forwards the SDP offer from caller to receiver
   - Contains media capabilities and connection preferences
   
2. **webrtc_answer**: Forwards the SDP answer from receiver to caller
   - Confirms media capabilities and accepts the connection
   
3. **webrtc_ice_candidate**: Forwards ICE candidates between peers
   - Contains network information for establishing the peer connection
   - Multiple candidates may be exchanged during connection setup

## Testing

After updating the server:

1. Start the server
2. Run the client app on two devices/emulators
3. Log in as different users
4. Make sure users follow each other (mutual follow required)
5. Initiate a video call from one device
6. Accept the call on the other device
7. Verify that:
   - Video streams appear on both devices
   - Audio works in both directions
   - Camera can be switched
   - Mute/unmute works
   - Call can be ended from either side

## Troubleshooting

If video calls don't connect:

1. Check server logs for WebRTC signaling messages
2. Check client logs for WebRTC connection state
3. Verify both devices have camera/microphone permissions
4. Ensure STUN servers are accessible (used for NAT traversal)
5. Check network connectivity between devices

## Server Logs to Look For

Successful connection will show:
```
[WebRTC] Received offer for call call_xxx_user1_user2
[WebRTC] Forwarded offer to user2
[WebRTC] Received answer for call call_xxx_user1_user2
[WebRTC] Forwarded answer to user1
[WebRTC] Received ICE candidate for call call_xxx_user1_user2
[WebRTC] Forwarded ICE candidate to user1
[WebRTC] Received ICE candidate for call call_xxx_user1_user2
[WebRTC] Forwarded ICE candidate to user2
```

## Additional Notes

- The server acts as a signaling server only - actual media (video/audio) flows directly peer-to-peer
- STUN servers (Google's public STUN servers) are used for NAT traversal
- For production, consider using TURN servers for better connectivity in restrictive networks
- WebRTC connections are encrypted by default (DTLS-SRTP)
