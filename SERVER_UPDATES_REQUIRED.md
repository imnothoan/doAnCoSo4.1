# Server Updates Required

This document outlines the changes that need to be applied to the server repository to support the improved inbox and hangout features.

## 1. Message Routes - Complete User Profile Data

**File:** `routes/message.routes.js`

### Change 1: Enhanced Last Message Sender Data (Line ~209-220)

**Replace:**
```javascript
        sender:users!messages_sender_username_fkey(id, username, name, avatar)
```

**With:**
```javascript
        sender:users!messages_sender_username_fkey(id, username, name, avatar, email, country, city, status, bio, age, gender, interests, languages, is_online)
```

### Change 2: Enhanced Other Participant Data (Line ~331-336)

**Replace:**
```javascript
          const { data: otherUsers, error: userErr } = await supabase
            .from("users")
            .select("id, username, name, avatar")
            .in("username", otherUsernames);
```

**With:**
```javascript
          const { data: otherUsers, error: userErr } = await supabase
            .from("users")
            .select("id, username, name, avatar, email, country, city, status, bio, age, gender, interests, languages, is_online")
            .in("username", otherUsernames);
```

## 2. WebSocket - Complete Sender Information

**File:** `websocket.js`

The WebSocket already includes complete sender information when sending messages (line 162). No changes needed, but verify that this is working correctly:

```javascript
sender:users!messages_sender_username_fkey(id, username, name, avatar, email, country, city)
```

Consider enhancing this to match the message routes:

```javascript
sender:users!messages_sender_username_fkey(id, username, name, avatar, email, country, city, status, bio, age, gender, interests, languages, is_online)
```

## 3. Database Requirements

### Background Images Storage Bucket

Ensure the Supabase storage bucket `background-images` exists and is configured:

```sql
-- Check if bucket exists
SELECT * FROM storage.buckets WHERE name = 'background-images';

-- If not exists, create it via Supabase Dashboard:
-- 1. Go to Storage section
-- 2. Create new bucket: "background-images"
-- 3. Set as Public
-- 4. File size limit: 10MB
```

### User Hangout Status Table

Verify the `user_hangout_status` table exists:

```sql
-- Should have these columns
CREATE TABLE IF NOT EXISTS user_hangout_status (
    username TEXT PRIMARY KEY REFERENCES users(username) ON DELETE CASCADE,
    is_available BOOLEAN DEFAULT false,
    current_activity TEXT,
    activities TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_hangout_status_available 
ON user_hangout_status(is_available) WHERE is_available = true;
```

## 4. Testing the Changes

After applying these changes, test the following scenarios:

### Inbox Testing

1. **New Conversation:**
   - Create a new DM between two users
   - Verify both users see correct name and avatar (not "Direct Message")
   - Verify complete user profile is available

2. **Real-time Updates:**
   - Send a message from User A to User B
   - Verify User B's inbox updates immediately via WebSocket
   - Verify avatar and name are correct in the inbox list
   - Verify unread count increases

3. **Existing Conversations:**
   - Load inbox with existing conversations
   - Verify all DM conversations show correct user info
   - Verify group conversations show correctly

### Hangout Testing

1. **Toggle Visibility:**
   - User toggles hangout status ON
   - Verify they appear in other users' hangout feed
   - User toggles hangout status OFF
   - Verify they disappear from hangout feed

2. **Background Image:**
   - User uploads background image
   - Verify image uploads to Supabase storage
   - Verify `background_image` field in users table updates
   - Verify image displays in other users' hangout cards

3. **Swipe Gestures:**
   - Swipe left on a user card
   - Verify it navigates to that user's profile
   - Swipe right on a user card
   - Verify it skips to the next user

4. **Online Status:**
   - User goes online
   - Verify they appear in hangout (if is_available = true)
   - User goes offline
   - Verify they disappear from hangout immediately

## 5. Common Issues and Solutions

### Issue: "Direct Message" showing instead of user name

**Cause:** Incomplete user data in conversation response

**Solution:** Apply the changes in section 1 above to include complete user profile fields

### Issue: Avatar showing as default icon

**Cause:** Avatar URL not being returned from server

**Solution:** Ensure `avatar` field is included in all user data queries (already fixed in changes above)

### Issue: Background image not uploading

**Cause:** Storage bucket doesn't exist or is not public

**Solution:** 
1. Check Supabase Dashboard > Storage
2. Create `background-images` bucket if missing
3. Set bucket as public
4. Set appropriate file size limits (10MB recommended)

### Issue: Users not appearing in hangout

**Cause:** `is_available` not set correctly in `user_hangout_status` table

**Solution:**
1. Verify table exists (see section 3)
2. Check user's hangout status: `SELECT * FROM user_hangout_status WHERE username = 'username';`
3. Ensure `is_available = true` for users who should appear
4. Verify user is also online: `SELECT is_online FROM users WHERE username = 'username';`

## 6. Deployment Checklist

- [ ] Apply message routes changes
- [ ] Apply WebSocket changes (optional enhancement)
- [ ] Verify `background-images` storage bucket exists
- [ ] Verify `user_hangout_status` table exists
- [ ] Test new DM conversation creation
- [ ] Test real-time message delivery
- [ ] Test hangout visibility toggle
- [ ] Test background image upload
- [ ] Monitor server logs for errors
- [ ] Verify database queries are performant

## 7. Performance Considerations

The changes add more fields to user queries, which could impact performance. Monitor:

1. **Query Performance:**
   - Watch for slow queries on `/messages/conversations`
   - Consider adding database indexes if needed

2. **Storage Usage:**
   - Background images can consume storage
   - Consider implementing cleanup for old/unused images
   - Implement image compression if needed

3. **Real-time Updates:**
   - WebSocket connections should remain stable
   - Monitor for memory leaks in long-running connections

## 8. Security Considerations

1. **File Upload:**
   - Validate file types (images only)
   - Enforce file size limits (10MB max)
   - Scan for malicious content if possible

2. **Data Access:**
   - Ensure users can only see conversations they're part of
   - Verify hangout status changes are authenticated
   - Protect against data injection in queries

## Summary

These changes enhance the inbox and hangout features by:
- ✅ Ensuring complete user profile data is always returned
- ✅ Fixing "Direct Message" display issue in inbox
- ✅ Supporting background image upload for hangout
- ✅ Maintaining real-time updates via WebSocket
- ✅ Properly filtering hangout users by availability status

All changes are backward compatible and should not break existing functionality.
