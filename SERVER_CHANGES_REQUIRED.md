# Server Changes Required

This document describes the changes that need to be applied to the server repository at:
https://github.com/imnothoan/doAnCoSo4.1.server

## Summary of Changes

All changes are in the file: `routes/community.routes.js`

### 1. Allow Private Communities in Search & Suggested (Issue #4)

**Problem**: Private communities were filtered out from search and suggested endpoints, making them undiscoverable.

**Solution**: Remove the `.eq("is_private", false)` filter to allow private communities to appear.

**Lines Changed**:
- Line 196: Remove `.eq("is_private", false)` from GET `/communities` endpoint
- Line 227: Remove `.eq("is_private", false)` from GET `/communities/suggested` endpoint

### 2. Restrict Private Community Posts to Members Only (Issue #4)

**Problem**: Once discoverable, private communities need post access control.

**Solution**: Add viewer parameter check and return empty array for non-members.

**Changes to GET `/communities/:id/posts`**:
```javascript
// Add viewer parameter
const viewer = (req.query.viewer || "").trim();

// Check membership for private communities
if (community.is_private) {
  if (!viewer) {
    return res.status(403).json({ message: "Must be logged in to view private community posts." });
  }
  
  const isMember = await isCommunityMember(communityId, viewer);
  if (!isMember) {
    // Return empty array instead of error so UI can still show community info
    return res.json([]);
  }
}
```

### 3. Auto-Join Community Chat on Join (Issue #6 & #7)

**Problem**: When users join a community, they aren't automatically added to the community chat conversation.

**Solution**: Add logic to auto-add members to community chat conversation.

**Changes to POST `/communities/:id/join`**:
```javascript
// After successful join, add this block before res.json(data):

// Auto-add member to community chat conversation
try {
  // Get or create community conversation
  const { data: conv, error: convErr } = await supabase
    .from("conversations")
    .select("id")
    .eq("community_id", communityId)
    .single();

  if (conv && conv.id) {
    // Add member to conversation
    await supabase
      .from("conversation_members")
      .upsert(
        [{ conversation_id: conv.id, username }],
        { onConflict: "conversation_id,username" }
      );
    console.log(`Auto-added ${username} to community ${communityId} chat`);
  }
} catch (chatErr) {
  console.error("Error adding member to community chat:", chatErr);
  // Don't fail the join operation if chat addition fails
}
```

### 4. Auto-Join Community Chat on Join Request Approval (Issue #6 & #7)

**Problem**: When admins approve join requests for private communities, approved members aren't added to chat.

**Solution**: Same logic as above, but for the approval flow.

**Changes to POST `/communities/:id/join-requests/:requestId`**:
```javascript
// After the member insert in the approve block, add:

// Auto-add member to community chat conversation
try {
  const { data: conv, error: convErr } = await supabase
    .from("conversations")
    .select("id")
    .eq("community_id", communityId)
    .single();

  if (conv && conv.id) {
    await supabase
      .from("conversation_members")
      .upsert(
        [{ conversation_id: conv.id, username: request.username }],
        { onConflict: "conversation_id,username" }
      );
    console.log(`Auto-added ${request.username} to community ${communityId} chat (via join request approval)`);
  }
} catch (chatErr) {
  console.error("Error adding member to community chat:", chatErr);
  // Don't fail the approval if chat addition fails
}
```

## How to Apply Changes

### Option 1: Apply the Patch File (Recommended)

A git patch file has been created at `/tmp/server-changes.patch`. To apply:

```bash
cd /path/to/server/repo
git apply /path/to/server-changes.patch
```

### Option 2: Manual Changes

Edit `routes/community.routes.js` and make the changes described above.

### Option 3: Copy Modified File

The modified file is available at:
```
/tmp/server/routes/community.routes.js
```

You can copy this file to replace the original, but make sure to:
1. Backup the original file first
2. Review all changes to ensure they fit with any other modifications you may have made

## Testing the Changes

After applying changes, test the following scenarios:

### Test 1: Private Community Discovery
1. Create a private community as a PRO user
2. Search for it as a non-member - should appear in results
3. View suggested communities as non-member - should appear if it has members

### Test 2: Private Community Post Access
1. As a non-member, view a private community
2. Should see: name, description, member count, "Join" button
3. Should NOT see: any posts
4. Should see: message "This is a private community. Join to see posts..."

### Test 3: Auto-Join Community Chat
1. Join a public community
2. Navigate to community chat
3. Should be able to see old messages
4. Should be able to send messages

### Test 4: Private Community with Join Request
1. Request to join a private community
2. Admin approves the request
3. Navigate to community chat
4. Should be able to see old messages
5. Should be able to send messages

## Database Requirements

Ensure your database has these tables with proper relationships:
- `communities` (with `community_id` column)
- `community_members`
- `conversations` (with `community_id` column)
- `conversation_members`
- `messages`

The schema should already be correct if you're using the provided migration files.

## Notes

- These changes are backward compatible with existing communities
- The auto-join chat feature gracefully handles errors (doesn't fail the join if chat addition fails)
- The private community post restriction returns an empty array (not an error) so the UI can still display community information
- Community chat creation is already implemented in the POST `/communities` endpoint (line 164-175)

## Questions or Issues?

If you encounter any issues applying these changes, please check:
1. Database schema is up to date
2. Supabase client is properly configured
3. WebSocket server is running for real-time chat features
4. All required environment variables are set
