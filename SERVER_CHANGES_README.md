# Server Changes Required

This file documents the changes that need to be applied to the server repository (https://github.com/imnothoan/doAnCoSo4.1.server) for the client features to work correctly.

## Changes:

### 1. routes/community.routes.js - GET /communities/:id
- Added `membership_status` field to the response
- Returns 'pending', 'approved', or null based on user's membership status
- This enables the client to show the correct button state (Join/Pending/Joined)

### 2. routes/message.routes.js - GET /messages/conversations
- Added `community_id` to the conversation query
- Added community info (name, image_url) for community type conversations
- This enables community chats to show in Inbox with proper name and avatar

## How to Apply:
Apply the patch file `SERVER_CHANGES.patch` to the server repository:
```bash
cd doAnCoSo4.1.server
git apply /path/to/SERVER_CHANGES.patch
```

