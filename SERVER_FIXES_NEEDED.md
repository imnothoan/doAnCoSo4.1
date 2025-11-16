# Server-Side Fixes Needed

This document outlines the fixes required in the `doAnCoSo4.1.server` repository to fully resolve the issues mentioned in the problem statement.

## 1. Hangout Endpoint - Filter by Availability Status

**File**: `routes/hangout.routes.js`  
**Lines**: 169-247  
**Priority**: HIGH

### Issue
The `/hangouts` GET endpoint returns all online users, but doesn't filter by `user_hangout_status.is_available`. This means users who have turned off hangout visibility still appear in the hangout list.

### Current Behavior
- Users see ALL online users in hangout, even those who turned off visibility
- Toggle button on client works but doesn't actually hide user from others

### Required Fix
Update the query to join with `user_hangout_status` and filter by `is_available = true`.

**Recommended Implementation**:
```javascript
router.get("/", async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 50), 100);
  const languagesParam = req.query.languages || "";
  const languages = languagesParam ? languagesParam.split(",").map((l) => l.trim()) : [];
  const distanceKm = Number(req.query.distance_km || 0);
  const userLat = req.query.user_lat ? Number(req.query.user_lat) : null;
  const userLng = req.query.user_lng ? Number(req.query.user_lng) : null;

  try {
    // First, get usernames of users who are available for hangout
    const { data: availableStatuses, error: statusErr } = await supabase
      .from("user_hangout_status")
      .select("username")
      .eq("is_available", true);
    
    if (statusErr) {
      console.error("Error fetching hangout statuses:", statusErr);
      // Fall back to showing all online users if status query fails
    }
    
    const availableUsernames = availableStatuses?.map(s => s.username) || [];
    
    // If no users are available, return empty array
    if (availableUsernames.length === 0) {
      return res.json([]);
    }
    
    // Query for users who are online AND available for hangout
    let query = supabase
      .from("users")
      .select(`
        id,
        username,
        name,
        email,
        avatar,
        background_image,
        country,
        city,
        age,
        bio,
        interests,
        is_online,
        latitude,
        longitude,
        status,
        current_activity
      `)
      .eq("is_online", true)
      .in("username", availableUsernames);  // ← ADD THIS FILTER

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data: users, error } = await query;

    if (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ message: "Error fetching users." });
    }

    let hangoutUsers = users || [];

    // Calculate distance and filter if user location is provided
    if (userLat && userLng) {
      hangoutUsers = hangoutUsers.map((user) => {
        let distance = null;
        if (user.latitude && user.longitude) {
          distance = calculateDistance(userLat, userLng, user.latitude, user.longitude);
        }
        return { ...user, distance };
      });

      // Filter by distance if specified
      if (distanceKm > 0) {
        hangoutUsers = hangoutUsers.filter((u) => u.distance !== null && u.distance <= distanceKm);
      }

      // Sort by distance
      hangoutUsers.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    res.json(hangoutUsers);
  } catch (err) {
    console.error("list hangout users error:", err);
    res.status(500).json({ message: "Server error while fetching hangout users." });
  }
});
```

---

## 2. WebSocket - Include Sender Profile in New Message Events

**File**: `websocket.js`  
**Lines**: 124-175  
**Priority**: HIGH

### Issue
When emitting new messages via WebSocket, only basic message data is sent. The sender's full profile (name, avatar) is not included, which causes the inbox to sometimes show incomplete sender information or default avatars.

### Current Behavior
- New messages arrive via WebSocket without sender profile
- Client has to guess or use cached data for sender name/avatar
- Sometimes shows "Unknown User" or default avatar

### Required Fix
Include sender profile information when emitting new messages.

**Current Code** (lines 140-154):
```javascript
const { data: message, error } = await supabase
  .from("messages")
  .insert([
    {
      conversation_id: conversationId,
      sender_username: senderUsername,
      message_type: "text",
      content,
      reply_to_message_id: replyToMessageId || null,
    },
  ])
  .select("id, conversation_id, sender_username, message_type, content, reply_to_message_id, created_at, updated_at")
  .single();
```

**Recommended Fix**:
```javascript
// Insert message with sender profile joined
const { data: message, error } = await supabase
  .from("messages")
  .insert([
    {
      conversation_id: conversationId,
      sender_username: senderUsername,
      message_type: "text",
      content,
      reply_to_message_id: replyToMessageId || null,
    },
  ])
  .select(`
    id,
    conversation_id,
    sender_username,
    message_type,
    content,
    reply_to_message_id,
    created_at,
    updated_at,
    sender:users!messages_sender_username_fkey(id, username, name, avatar, email, country, city)
  `)
  .single();
```

Then update the WebSocket emission (lines 162-168):
```javascript
// Emit to sender (confirmation)
socket.emit("message_sent", message);

// Broadcast to others in the room with full sender info
socket.to(roomName).emit("new_message", {
  ...message,
  chatId: conversationId,  // Add for client compatibility
  senderId: senderUsername, // Add for client compatibility
});
```

---

## 3. User Profile Update Error Handling

**File**: `routes/user.routes.js`  
**Lines**: 240-245  
**Priority**: MEDIUM

### Issue
Using `.single()` on UPDATE query that might affect 0 rows causes 500 error instead of proper 404.

### Current Code
```javascript
const { data, error } = await supabase
  .from("users")
  .update(updates)
  .eq("id", id)
  .select("*")
  .single();

if (error) throw error;
res.json(data);
```

### Recommended Fix
```javascript
const { data, error } = await supabase
  .from("users")
  .update(updates)
  .eq("id", id)
  .select("*")
  .maybeSingle();

if (error) throw error;

if (!data) {
  return res.status(404).json({ 
    message: "User not found with the provided ID." 
  });
}

res.json(data);
```

---

## Testing Checklist

After implementing these fixes:

### Hangout Feature
- [ ] User A enables hangout visibility
- [ ] User B should see User A in hangout list
- [ ] User A disables hangout visibility
- [ ] User B should NOT see User A in hangout list anymore
- [ ] Only users with `is_available = true` appear in hangout
- [ ] Background images display correctly
- [ ] Swipe left shows profile, swipe right shows next user

### Inbox/Messages
- [ ] New message arrives via WebSocket
- [ ] Sender name displays correctly (not "Unknown User")
- [ ] Sender avatar displays correctly (not default icon)
- [ ] Conversation list updates in real-time
- [ ] Unread count increments correctly
- [ ] Opening chat marks messages as read

### User Profile
- [ ] Valid user ID updates successfully
- [ ] Invalid user ID returns 404 (not 500)
- [ ] Proper error messages returned to client

---

## Implementation Priority

1. **WebSocket sender profile** (HIGH) - Fixes inbox display issues
2. **Hangout availability filter** (HIGH) - Makes hangout feature work correctly
3. **User update error handling** (MEDIUM) - Improves error messages

---

## Notes

These changes are critical for the features to work as described in the problem statement. The client-side code is already prepared to handle these improvements - it just needs the server to send the correct data.

All fixes should be implemented in the server repository: https://github.com/imnothoan/doAnCoSo4.1.server
