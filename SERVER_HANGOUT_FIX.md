# Server Changes Required for Hangout Functionality

## Issue
The Hangout feature (Tinder-like discovery) doesn't work properly between two devices. Users cannot see each other as online.

## Root Cause Analysis

### 1. Online Status Tracking
The server updates `is_online` status when users connect/disconnect (lines 49-57 and 186-199 in `websocket.js`), but this depends on:
- Proper WebSocket authentication
- Token validation
- Database updates

### 2. Hangout User Discovery
The `/hangouts` endpoint (lines 169-247 in `/tmp/doAnCoSo4.1.server/routes/hangout.routes.js`) queries for online users with `is_online = true`.

## Potential Issues

### Issue 1: WebSocket Authentication
**File**: `/tmp/doAnCoSo4.1.server/websocket.js` (lines 26-65)

The authentication logic uses a base64-encoded token format: `userId:timestamp`

```javascript
const decoded = Buffer.from(token, "base64").toString("utf-8");
const userId = decoded.split(":")[0];
```

**Problem**: This token format might not match what the client sends.

**Solution**: Verify the client is sending the correct token format.

### Issue 2: Database is_online Not Updating
**File**: `/tmp/doAnCoSo4.1.server/websocket.js` (lines 46-57)

```javascript
supabase
  .from("users")
  .update({ is_online: true })
  .eq("username", currentUsername)
```

**Potential Problems**:
- Promise not being awaited
- Silent failures
- Username not found

**Solution**: Add proper error handling and logging:

```javascript
try {
  const { data, error } = await supabase
    .from("users")
    .update({ is_online: true })
    .eq("username", currentUsername)
    .select();

  if (error) {
    console.error(`Failed to set online status for ${currentUsername}:`, error);
  } else {
    console.log(`✅ ${currentUsername} is now online`);
  }
  
  // Notify others that user is online
  socket.broadcast.emit("user_status", {
    username: currentUsername,
    isOnline: true,
  });
} catch (err) {
  console.error("Error updating online status:", err);
}
```

### Issue 3: Client WebSocket Connection
**File**: `/home/runner/work/doAnCoSo4.1/doAnCoSo4.1/src/services/websocket.ts`

The client connects with:
```typescript
this.socket = io(url, {
  auth: {
    token,
  },
  transports: ['websocket', 'polling'],
});
```

**Required**: Ensure the token passed matches server expectations.

## Required Server Changes

### Change 1: Improve WebSocket Authentication Logging
**File**: `/tmp/doAnCoSo4.1.server/websocket.js` (lines 26-65)

Add detailed logging:

```javascript
console.log("🔐 WebSocket auth attempt:", {
  socketId: socket.id,
  hasToken: !!token,
  tokenLength: token?.length,
});

try {
  const decoded = Buffer.from(token, "base64").toString("utf-8");
  const userId = decoded.split(":")[0];
  
  console.log("🔍 Decoded token - userId:", userId);
  
  // Get user from database
  const { data, error } = await supabase
    .from("users")
    .select("username, id")
    .eq("id", userId)
    .single();
  
  if (error || !data) {
    console.error("❌ User not found for ID:", userId, error);
    return;
  }
  
  console.log("✅ User authenticated:", data.username);
  
  currentUsername = data.username;
  onlineUsers.set(currentUsername, socket.id);
  
  // Update online status with error handling
  const { error: updateError } = await supabase
    .from("users")
    .update({ is_online: true })
    .eq("username", currentUsername);
  
  if (updateError) {
    console.error("❌ Failed to update online status:", updateError);
  } else {
    console.log(`✅ ${currentUsername} marked as online`);
    
    // Notify others
    socket.broadcast.emit("user_status", {
      username: currentUsername,
      isOnline: true,
    });
  }
} catch (err) {
  console.error("❌ Auth error:", err);
}
```

### Change 2: Add Periodic Online Status Check
**File**: `/tmp/doAnCoSo4.1.server/websocket.js`

Add a heartbeat mechanism:

```javascript
socket.on("connection", (socket) => {
  // ... existing code ...
  
  // Send heartbeat every 30 seconds
  const heartbeatInterval = setInterval(() => {
    socket.emit("heartbeat");
  }, 30000);
  
  socket.on("heartbeat_ack", async () => {
    // User is still active, refresh online status
    if (currentUsername) {
      await supabase
        .from("users")
        .update({ 
          is_online: true,
          last_seen: new Date().toISOString()
        })
        .eq("username", currentUsername);
    }
  });
  
  socket.on("disconnect", () => {
    clearInterval(heartbeatInterval);
    // ... existing disconnect logic ...
  });
});
```

### Change 3: Ensure Disconnect Handler Works
**File**: `/tmp/doAnCoSo4.1.server/websocket.js` (lines 178-201)

Make the disconnect handler async and add logging:

```javascript
socket.on("disconnect", async (reason) => {
  console.log("❌ WebSocket disconnected:", {
    socketId: socket.id,
    username: currentUsername,
    reason,
  });
  
  if (currentUsername) {
    onlineUsers.delete(currentUsername);
    
    try {
      // Update user offline status
      const { error } = await supabase
        .from("users")
        .update({ 
          is_online: false,
          last_seen: new Date().toISOString() 
        })
        .eq("username", currentUsername);
      
      if (error) {
        console.error("❌ Failed to update offline status:", error);
      } else {
        console.log(`✅ ${currentUsername} marked as offline`);
        
        // Notify others
        socket.broadcast.emit("user_status", {
          username: currentUsername,
          isOnline: false,
        });
      }
    } catch (err) {
      console.error("❌ Error in disconnect handler:", err);
    }
  }
});
```

## Client Changes Required

### Add Heartbeat Response
**File**: `/home/runner/work/doAnCoSo4.1/doAnCoSo4.1/src/services/websocket.ts`

Add heartbeat acknowledgment:

```typescript
connect(url: string, token?: string) {
  // ... existing connection code ...
  
  this.socket.on('heartbeat', () => {
    this.socket?.emit('heartbeat_ack');
  });
}
```

## Testing Checklist

1. [ ] Two devices connect with different user accounts
2. [ ] Check server logs for authentication success
3. [ ] Verify `is_online` is set to `true` in database
4. [ ] Check if users appear in `/hangouts` endpoint
5. [ ] Verify users can see each other in the Discover tab
6. [ ] Test disconnect - should set `is_online` to `false`
7. [ ] Test reconnection after network interruption

## Database Verification

Run this SQL to check online users:

```sql
SELECT username, is_online, last_seen 
FROM users 
WHERE is_online = true;
```

## API Testing

Test the hangouts endpoint:

```bash
curl http://localhost:3000/hangouts?limit=10
```

Should return users with `is_online: true`.
