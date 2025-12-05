# Unread Messages Bug Fix

## Problem Summary

The inbox was showing incorrect unread message counts. Specifically:
- Users would see unread counts for messages they sent themselves
- When a user sends 1 message, the recipient might see "2 unread messages"
- The sender would also see their own message as "unread" in their inbox

## Root Cause Analysis

### Issue 1: Database View Bug
The database view `v_conversation_overview` was counting ALL messages that haven't been explicitly marked as read, including messages sent by the user themselves.

**Location**: `db/schema.sql` line 463-477

**Problem**: The view was filtering messages only by whether they've been read, but NOT checking if the message sender is the same as the viewer.

```sql
-- BEFORE (INCORRECT) CODE:
COUNT(m.id) FILTER (
  WHERE NOT EXISTS (
    SELECT 1 FROM message_reads mr 
    WHERE mr.message_id = m.id 
    AND mr.username = cm.username
  )
) as unread_count
```

### Issue 2: Fallback Calculation Bug
When the view is not available, the code falls back to calculating unread counts directly. This fallback had the same bug - it wasn't excluding messages sent by the viewer.

**Location**: `routes/message.routes.js` line 252-257

**Problem**: The query was fetching ALL messages in the conversations without filtering out messages sent by the viewer.

```javascript
// BEFORE (INCORRECT) CODE:
const { data: allConvMsgs, error: allMsgErr } = await supabase
  .from("messages")
  .select("id, conversation_id")
  .in("conversation_id", convIds);
```

## Solution

### Fix 1: Update Database View
Add a condition to exclude messages where the sender is the same as the viewer.

```sql
-- AFTER (CORRECTED) CODE:
COUNT(m.id) FILTER (
  WHERE m.sender_username != cm.username  -- ✅ NEW: Exclude own messages
  AND NOT EXISTS (
    SELECT 1 FROM message_reads mr 
    WHERE mr.message_id = m.id 
    AND mr.username = cm.username
  )
) as unread_count
```

### Fix 2: Update Fallback Calculation
Filter out messages sent by the viewer when fetching messages for unread count calculation.

```javascript
// AFTER (CORRECTED) CODE:
const { data: allConvMsgs, error: allMsgErr } = await supabase
  .from("messages")
  .select("id, conversation_id, sender_username")  // ✅ Added sender_username
  .in("conversation_id", convIds)
  .neq("sender_username", viewer);  // ✅ NEW: Exclude messages sent by viewer
```

## How to Apply the Fix

### Option 1: Using Git Patch
```bash
cd /path/to/doAnCoSo4.1.server
git apply /path/to/server-unread-messages-fix.patch
```

### Option 2: Manual Update

1. **Update Database View** (`db/schema.sql`):
   - Find the `v_conversation_overview` view (around line 463)
   - Add `WHERE m.sender_username != cm.username` before the `NOT EXISTS` clause

2. **Update Fallback Logic** (`routes/message.routes.js`):
   - Find the fallback calculation (around line 252)
   - Add `.select("id, conversation_id, sender_username")`
   - Add `.neq("sender_username", viewer)` to the query

3. **Deploy the changes**:
   ```bash
   # If using migrations, create a migration:
   supabase migration new fix_unread_count_view
   
   # Add the updated view SQL to the migration file
   
   # Apply the migration:
   supabase db push
   ```

## Testing the Fix

### Test Scenario 1: Self-sent Messages
1. User A sends a message to User B
2. Check User A's inbox - should show 0 unread messages for this conversation
3. Check User B's inbox - should show 1 unread message

### Test Scenario 2: Multiple Messages
1. User A sends 3 messages to User B
2. User B sends 2 messages to User A
3. User A's inbox should show 2 unread messages (only B's messages)
4. User B's inbox should show 3 unread messages (only A's messages)

### Test Scenario 3: Mark as Read
1. User B opens the conversation with User A
2. The app calls the mark_read API
3. User B's inbox should now show 0 unread messages for this conversation
4. User A's unread count should remain unchanged

## Client-Side Verification

The client code in `app/(tabs)/inbox.tsx` is already correctly handling this:

```typescript
// Line 230-232 - CORRECT implementation
unreadCount: senderId !== user.username 
  ? (existingChat.unreadCount || 0) + 1 
  : existingChat.unreadCount || 0,
```

The client only increments unread count for messages from other users, not own messages.

## Impact

### Before Fix
- ❌ Sender sees their own messages as unread
- ❌ Incorrect unread counts displayed (often doubled)
- ❌ Confusing UX where "unread" appears for conversations where user sent the last message

### After Fix
- ✅ Only messages from other users count as unread
- ✅ Accurate unread counts
- ✅ Clear indication of which conversations have messages to read
- ✅ Sender's own messages never show as unread

## Additional Notes

### Why Two Fixes?
The server has two code paths for calculating unread counts:
1. **Primary**: Uses the `v_conversation_overview` database view (optimized)
2. **Fallback**: Direct calculation when view is unavailable

Both needed to be fixed to ensure consistent behavior.

### Performance Impact
The fix actually improves performance slightly by:
- Reducing the number of messages counted
- Adding a simple equality check (`sender_username != username`) which is highly efficient

### Future Improvements
Consider adding:
1. An index on `messages.sender_username` if not already present
2. Automated tests for unread count logic
3. Real-time unread count updates via WebSocket events
4. Periodic cleanup of stale message_reads entries

## Related Files

### Server (doAnCoSo4.1.server)
- `db/schema.sql` - Database view definition
- `routes/message.routes.js` - API route for fetching conversations
- `websocket.js` - Real-time message delivery (no changes needed)

### Client (doAnCoSo4.1)
- `app/(tabs)/inbox.tsx` - Inbox UI and unread count display
- `src/services/api.ts` - API service layer
- `src/services/websocket.ts` - WebSocket client

## Conclusion

This fix resolves the core issue of incorrect unread message counts by ensuring that:
1. Users never see their own messages counted as "unread"
2. Unread counts accurately reflect only messages from other participants
3. Both the optimized view and fallback calculation use consistent logic

The fix is minimal, surgical, and addresses the root cause without changing the overall architecture or breaking existing functionality.
