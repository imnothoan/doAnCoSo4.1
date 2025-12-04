# Inbox Realtime Testing Guide

## Overview
This guide provides comprehensive testing scenarios to verify the inbox realtime improvements work correctly and provide a smooth user experience comparable to Facebook Messenger.

## Test Environment Setup

### Prerequisites
1. **Server:** doAnCoSo4.1.server running with patches applied
2. **Client:** doAnCoSo4.1 client app with improvements
3. **Multiple Devices/Users:** At least 2 test accounts and devices
4. **Network Tools:** Ability to simulate poor network conditions (optional)

### Setup Steps
```bash
# 1. Start server
cd /path/to/doAnCoSo4.1.server
npm run dev

# 2. Verify server is running
curl http://localhost:3000/health  # or your server URL

# 3. Start client (in separate terminal)
cd /path/to/doAnCoSo4.1
npm start

# 4. Open on multiple devices or simulators
# iOS: Press 'i' for iOS simulator
# Android: Press 'a' for Android emulator
# Physical device: Scan QR code
```

## Test Scenarios

### Scenario 1: New User Joins New Community (First Time)

**Objective:** Verify that joining a brand new community creates conversation and appears in inbox immediately.

**Setup:**
- User A (test account 1)
- New community (just created, no existing conversations)

**Steps:**
1. User A logs in
2. Navigate to community discovery/search
3. Find the new community
4. Tap "Join" button
5. Wait for success confirmation
6. Navigate to Inbox tab

**Expected Results:**
- ✅ Join succeeds without errors
- ✅ Community conversation appears in Inbox within 1-2 seconds
- ✅ Conversation shows community name and avatar
- ✅ No placeholder or "Loading..." state visible
- ✅ Tapping conversation opens community chat
- ✅ Can send messages immediately without errors

**Pass Criteria:**
- All expected results achieved
- No app crashes or freezes
- Server logs show: `Created new conversation X for community Y`

**Debug Info:**
- Check server logs for `notify_community_conversation` event
- Check database: `SELECT * FROM conversations WHERE community_id = X`
- Check WebSocket connection status in client

---

### Scenario 2: User Joins Existing Community with Messages

**Objective:** Verify joining a community that already has messages works smoothly.

**Setup:**
- User A (already member, has sent messages)
- User B (test account 2, not yet a member)
- Community with existing conversation and messages

**Steps:**
1. User B logs in
2. Navigate to the community
3. Tap "Join" button
4. Wait for confirmation
5. Navigate to Inbox tab
6. Open community chat

**Expected Results:**
- ✅ Join succeeds
- ✅ Community conversation appears in Inbox within 1-2 seconds
- ✅ Opening chat shows previous messages (history)
- ✅ User B can see all messages from before joining
- ✅ User B can send new messages
- ✅ User A receives User B's messages in real-time

**Pass Criteria:**
- Message history loaded correctly
- Real-time messaging works both ways
- Conversation stays in correct order in Inbox

---

### Scenario 3: Multiple Users Chatting Simultaneously

**Objective:** Verify real-time updates work smoothly with multiple active users.

**Setup:**
- User A, User B, User C (3 test accounts)
- All members of same community
- All online simultaneously

**Steps:**
1. All users open community chat at the same time
2. User A sends message: "Hello everyone!"
3. User B sends message: "Hi User A!"
4. User C sends message: "Hey folks!"
5. All users send messages rapidly (stress test)

**Expected Results:**
- ✅ All messages appear in correct chronological order
- ✅ No duplicate messages
- ✅ No missing messages
- ✅ Typing indicators work (if implemented)
- ✅ Messages appear within 1 second
- ✅ No UI lag or stuttering
- ✅ Inbox updates on all devices when switching away

**Pass Criteria:**
- Message order is consistent across all clients
- No race conditions or conflicts
- Performance remains smooth

---

### Scenario 4: App Restart / Reconnection

**Objective:** Verify inbox works correctly after app restart or reconnection.

**Setup:**
- User A with active conversations
- Community with recent messages

**Steps:**
1. User A has app open with active chats
2. Close app completely (force quit)
3. Wait 10 seconds
4. Reopen app
5. Navigate to Inbox
6. Open a community chat
7. Send a message

**Expected Results:**
- ✅ App loads without errors
- ✅ All conversations appear in Inbox
- ✅ Conversations show latest messages
- ✅ WebSocket reconnects automatically
- ✅ Real-time updates work after reconnection
- ✅ Can send and receive messages

**Pass Criteria:**
- No data loss
- Smooth reconnection
- All features work as expected

**Server Logs to Verify:**
```
WebSocket client connected: <socket_id>
User authenticated: <username>
<username> marked as online
Auto-joined <username> to room conversation_X
```

---

### Scenario 5: Poor Network Conditions

**Objective:** Verify app handles poor network gracefully.

**Setup:**
- User A
- Network throttling tool (Chrome DevTools, Charles Proxy, or similar)
- Simulate slow 3G connection

**Steps:**
1. Enable network throttling
2. User A joins a community
3. Navigate to Inbox
4. Try to send a message
5. Disable network completely for 5 seconds
6. Re-enable network

**Expected Results:**
- ✅ Join request completes (may take longer)
- ✅ Conversation appears in Inbox (may be delayed)
- ✅ Loading indicators shown when appropriate
- ✅ Error messages if timeout occurs
- ✅ Automatic retry on network recovery
- ✅ WebSocket reconnects when network returns
- ✅ Queued messages sent after reconnection

**Pass Criteria:**
- No crashes or hangs
- Clear user feedback
- Graceful degradation
- Automatic recovery

---

### Scenario 6: Community Approval Required

**Objective:** Verify behavior when community requires member approval.

**Setup:**
- Private community with approval required
- User A (admin)
- User B (requesting to join)

**Steps:**
1. User B requests to join community
2. Verify "Pending" status shown
3. User A approves the request
4. User B checks Inbox
5. User B tries to send message in community chat

**Expected Results:**
- ✅ User B sees "Request Sent" message
- ✅ Community shows "Pending" status for User B
- ✅ Inbox does NOT show conversation yet (before approval)
- ✅ After approval, conversation appears in Inbox
- ✅ User B can chat after approval
- ✅ Real-time updates work after approval

**Pass Criteria:**
- Correct status indicators
- Conversation appears only after approval
- No premature access

---

### Scenario 7: Direct Message (DM) Conversation

**Objective:** Verify DM conversations also benefit from improvements.

**Setup:**
- User A and User B (2 test accounts)
- No existing DM conversation between them

**Steps:**
1. User A navigates to User B's profile
2. Taps "Message" or similar button
3. Types and sends first message
4. User B checks Inbox
5. User B replies

**Expected Results:**
- ✅ Conversation created immediately
- ✅ Appears in both users' Inbox
- ✅ Messages delivered in real-time
- ✅ Correct other user info shown (name, avatar)
- ✅ Typing indicators work (if implemented)
- ✅ Read receipts work (if implemented)

**Pass Criteria:**
- Same smooth experience as community chats
- No "Direct Message" placeholder names
- Proper user identification

---

### Scenario 8: Leaving and Rejoining Community

**Objective:** Verify proper cleanup when leaving and rejoining.

**Setup:**
- User A (member of community)
- Community with active conversation

**Steps:**
1. User A has community in Inbox
2. User A leaves the community
3. Check Inbox (should conversation disappear?)
4. User A rejoins the community
5. Check Inbox
6. Try to send a message

**Expected Results:**
- ✅ After leaving: Conversation removed from Inbox (or marked as left)
- ✅ After rejoining: Conversation reappears
- ✅ Can access chat after rejoining
- ✅ Can send messages after rejoining
- ✅ Previous messages still accessible (if design allows)

**Pass Criteria:**
- Proper state management
- No orphaned conversations
- Clean rejoining experience

---

### Scenario 9: Multiple Communities

**Objective:** Verify handling of multiple communities simultaneously.

**Setup:**
- User A
- 5+ different communities with User A as member
- Active conversations in all

**Steps:**
1. User A joins multiple communities
2. Check Inbox shows all conversations
3. Send message in Community 1
4. Send message in Community 2
5. Receive messages from other users in Community 3, 4, 5

**Expected Results:**
- ✅ All conversations appear in Inbox
- ✅ Correct order (most recent on top)
- ✅ Unread counts accurate
- ✅ No mixing of messages between communities
- ✅ Real-time updates work for all
- ✅ Can switch between chats smoothly

**Pass Criteria:**
- No performance degradation
- Messages stay in correct conversations
- UI remains responsive

---

### Scenario 10: Rapid Join/Leave/Join

**Objective:** Stress test the system with rapid state changes.

**Setup:**
- User A
- Test community

**Steps:**
1. User A joins community
2. Immediately navigate to Inbox
3. Leave community
4. Immediately join again
5. Check Inbox
6. Try to send a message

**Expected Results:**
- ✅ System handles rapid changes without errors
- ✅ Eventual consistency achieved
- ✅ No duplicate conversations
- ✅ Final state is correct (member with conversation in Inbox)
- ✅ Can send messages in final state

**Pass Criteria:**
- No crashes or data corruption
- System reaches consistent state
- All WebSocket events processed correctly

---

## Automated Testing (Optional)

### Unit Tests
```javascript
// Example test for WebSocket service
describe('WebSocketService', () => {
  it('should notify server when joining community', () => {
    const spy = jest.spyOn(WebSocketService, 'notifyCommunityJoined');
    // ... test implementation
    expect(spy).toHaveBeenCalledWith(communityId, username);
  });
});
```

### Integration Tests
```javascript
// Example test for inbox update
describe('Inbox Real-time Updates', () => {
  it('should show new community conversation after join', async () => {
    // 1. Join community via API
    // 2. Wait for WebSocket events
    // 3. Check inbox state
    // 4. Assert conversation present
  });
});
```

## Performance Benchmarks

### Metrics to Measure
1. **Time to Inbox Appearance:** < 2 seconds after join
2. **Message Delivery Time:** < 500ms end-to-end
3. **WebSocket Reconnection Time:** < 3 seconds
4. **Memory Usage:** Should not increase > 50MB during normal use
5. **CPU Usage:** Should stay < 10% during messaging

### Tools
- React Native Performance Monitor
- Chrome DevTools Performance tab
- Xcode Instruments (iOS)
- Android Profiler (Android)

## Debugging Tools

### Client-Side
```javascript
// Enable verbose WebSocket logging
WebSocketService.on('*', (event, data) => {
  console.log('WebSocket Event:', event, data);
});

// Monitor conversation list changes
useEffect(() => {
  console.log('Conversations updated:', chats);
}, [chats]);
```

### Server-Side
```javascript
// Log all WebSocket events
io.on('connection', (socket) => {
  socket.onAny((event, ...args) => {
    console.log(`[${socket.id}] ${event}:`, args);
  });
});
```

### Database Queries
```sql
-- Check conversation creation
SELECT * FROM conversations 
WHERE community_id = ? 
ORDER BY created_at DESC;

-- Check conversation members
SELECT cm.*, u.username, u.name 
FROM conversation_members cm
JOIN users u ON u.username = cm.username
WHERE cm.conversation_id = ?;

-- Check community members
SELECT * FROM community_members 
WHERE community_id = ? 
AND status = 'approved';
```

## Bug Report Template

If you find an issue, use this template:

```markdown
### Bug Report: Inbox Realtime Issue

**Environment:**
- Client version: 
- Server version:
- Device: 
- OS version:

**Scenario:**
[Which test scenario from above]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Screenshots:**
[If applicable]

**Logs:**
**Client logs:**
```
[paste relevant client logs]
```

**Server logs:**
```
[paste relevant server logs]
```

**Database State:**
```sql
-- Paste relevant queries and results
```

**Additional Context:**
[Any other relevant information]
```

## Success Criteria Summary

### Must Pass (Critical)
- ✅ All scenarios 1-7 pass completely
- ✅ No data loss in any scenario
- ✅ No crashes or freezes
- ✅ Real-time updates work consistently

### Should Pass (Important)
- ✅ Scenarios 8-10 pass
- ✅ Performance metrics within targets
- ✅ Graceful error handling
- ✅ Clear user feedback

### Nice to Have
- ✅ Automated tests pass
- ✅ Edge cases handled
- ✅ Optimizations applied

## Conclusion

Thorough testing ensures the inbox realtime improvements provide a smooth, reliable experience. Document all findings and refer to bug report template for any issues discovered.

For technical details, see `INBOX_REALTIME_IMPROVEMENTS.md`.
For server deployment, see `SERVER_PATCH_GUIDE.md`.
