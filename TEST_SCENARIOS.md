# Test Scenarios for Unread Messages Fix

## Overview
This document outlines comprehensive test scenarios to verify the unread messages bug fix is working correctly.

## Prerequisites
- Server must have the patch applied (server-unread-messages-fix.patch)
- Database view must be updated
- Both users should be logged in on different devices/browsers

## Test Scenario 1: Basic Message Flow

### Setup
- User A (Alice): alice@example.com
- User B (Bob): bob@example.com
- Both users logged in

### Steps
1. Alice sends 1 message to Bob
2. Check Alice's inbox:
   - ✅ Conversation with Bob should show 0 unread messages
   - ✅ Last message should be Alice's message
3. Check Bob's inbox:
   - ✅ Conversation with Alice should show 1 unread message
   - ✅ Unread badge should appear on conversation
   - ✅ Last message should be Alice's message

### Expected Result
- Alice: 0 unread (sender doesn't see own messages as unread)
- Bob: 1 unread (recipient sees new message)

## Test Scenario 2: Multiple Messages Same Sender

### Steps
1. Alice sends 3 messages to Bob in sequence
   - Message 1: "Hello"
   - Message 2: "How are you?"
   - Message 3: "Are you there?"
2. Check Alice's inbox:
   - ✅ Should still show 0 unread messages
3. Check Bob's inbox:
   - ✅ Should show 3 unread messages
   - ✅ Unread count badge should display "3"

### Expected Result
- Alice: 0 unread
- Bob: 3 unread

## Test Scenario 3: Bidirectional Messages

### Steps
1. Alice sends 2 messages to Bob
2. Bob sends 3 messages to Alice
3. Check Alice's inbox:
   - ✅ Should show 3 unread messages (only Bob's messages)
   - ✅ Should NOT count her own 2 messages
4. Check Bob's inbox:
   - ✅ Should show 2 unread messages (only Alice's messages)
   - ✅ Should NOT count his own 3 messages

### Expected Result
- Alice: 3 unread (Bob's messages only)
- Bob: 2 unread (Alice's messages only)

## Test Scenario 4: Mark as Read

### Setup
- Continue from Scenario 3 (Alice has 3 unread, Bob has 2 unread)

### Steps
1. Bob opens conversation with Alice
   - App should call `markAllMessagesAsRead` API
2. Check Bob's inbox:
   - ✅ Should show 0 unread messages for Alice conversation
   - ✅ Unread badge should disappear
3. Check Alice's inbox:
   - ✅ Should still show 3 unread messages (unchanged)
   - ✅ Alice's unread count is independent of Bob's read status

### Expected Result
- Alice: 3 unread (unchanged)
- Bob: 0 unread (marked as read)

## Test Scenario 5: Group/Community Chat

### Setup
- Community: "Language Exchange Group"
- Members: Alice, Bob, Charlie

### Steps
1. Alice sends a message in the community
2. Check Alice's inbox:
   - ✅ Community conversation should show 0 unread
3. Check Bob's inbox:
   - ✅ Community conversation should show 1 unread
4. Check Charlie's inbox:
   - ✅ Community conversation should show 1 unread
5. Bob sends a message in the community
6. Check Bob's inbox:
   - ✅ Should still show 1 unread (only Alice's message)
   - ✅ Should NOT count his own message
7. Check Alice's inbox:
   - ✅ Should show 1 unread (Bob's message)
8. Check Charlie's inbox:
   - ✅ Should show 2 unread (Alice's + Bob's messages)

### Expected Result
- Alice: 1 unread (Bob's message)
- Bob: 1 unread (Alice's message)
- Charlie: 2 unread (Alice's + Bob's messages)

## Test Scenario 6: Real-time Updates

### Steps
1. Alice and Bob both have inbox screen open
2. Alice sends message to Bob
3. Verify real-time update:
   - ✅ Bob's inbox should immediately show unread badge
   - ✅ Unread count should increment from 0 to 1
   - ✅ Alice's inbox should NOT show unread for this conversation
4. Bob opens the conversation (marks as read)
5. Verify WebSocket update:
   - ✅ Bob's inbox should clear unread badge immediately
   - ✅ Alice's inbox remains unchanged

### Expected Result
- Real-time updates work correctly
- No phantom unread counts

## Test Scenario 7: Offline/Online Sync

### Steps
1. Alice sends 5 messages to Bob
2. Bob is offline (app closed)
3. Bob comes back online and opens inbox
4. Check Bob's inbox:
   - ✅ Should show 5 unread messages
   - ✅ Should load correctly from server
5. Bob opens conversation
6. Check server database:
   - ✅ `message_reads` table should have entries for all 5 messages
   - ✅ Bob's username should be in message_reads

### Expected Result
- Offline messages sync correctly
- Unread counts persist and load accurately

## Test Scenario 8: Edge Case - Rapid Messages

### Steps
1. Alice sends 10 messages to Bob very quickly (within 2 seconds)
2. Check Bob's inbox:
   - ✅ Should show 10 unread messages
   - ✅ No duplicate counting
   - ✅ Each message counted exactly once

### Expected Result
- No race conditions
- Accurate count even with rapid messages

## Test Scenario 9: Multiple Conversations

### Setup
- Alice has conversations with Bob, Charlie, and David

### Steps
1. Bob sends 2 messages to Alice
2. Charlie sends 1 message to Alice
3. David sends 3 messages to Alice
4. Check Alice's inbox:
   - ✅ Bob conversation: 2 unread
   - ✅ Charlie conversation: 1 unread
   - ✅ David conversation: 3 unread
   - ✅ Total across all conversations: 6 unread
5. Alice opens conversation with Bob (marks as read)
6. Check Alice's inbox:
   - ✅ Bob conversation: 0 unread
   - ✅ Charlie conversation: 1 unread (unchanged)
   - ✅ David conversation: 3 unread (unchanged)
   - ✅ Total: 4 unread

### Expected Result
- Each conversation tracks unread independently
- Reading one conversation doesn't affect others

## Test Scenario 10: Media Messages

### Steps
1. Alice sends an image to Bob
2. Bob sends a text message to Alice
3. Alice sends a video to Bob
4. Check unread counts:
   - Alice inbox: ✅ 1 unread (Bob's text)
   - Bob inbox: ✅ 2 unread (image + video)

### Expected Result
- Media messages counted correctly as unread
- Same logic applies regardless of message type

## Verification Queries

### Database Queries to Verify Fix

```sql
-- Check the view is working correctly
SELECT * FROM v_conversation_overview 
WHERE username = 'bob@example.com';

-- Verify message_reads entries
SELECT mr.username, m.sender_username, m.content
FROM message_reads mr
JOIN messages m ON mr.message_id = m.id
WHERE mr.username = 'bob@example.com';

-- Count actual unread messages for a user (manual verification)
SELECT 
  m.conversation_id,
  COUNT(*) as unread_count
FROM messages m
WHERE m.conversation_id IN (
  SELECT conversation_id 
  FROM conversation_members 
  WHERE username = 'bob@example.com'
)
AND m.sender_username != 'bob@example.com'
AND NOT EXISTS (
  SELECT 1 FROM message_reads mr 
  WHERE mr.message_id = m.id 
  AND mr.username = 'bob@example.com'
)
GROUP BY m.conversation_id;
```

## Automated Test Cases (Future)

### Unit Tests Needed
1. `calculateUnreadCount()` - Test function with various scenarios
2. `excludeSelfMessages()` - Verify sender filtering
3. `markMessagesAsRead()` - Test marking logic
4. `WebSocket.onNewMessage()` - Test unread increment logic

### Integration Tests Needed
1. Full message flow from send to unread count update
2. Real-time WebSocket updates
3. Mark as read API endpoint
4. Multi-user scenarios

## Performance Testing

### Load Test Scenarios
1. 1000 unread messages - verify count calculation performance
2. 100 concurrent users sending messages - verify no count errors
3. Database view query performance with large datasets

### Monitoring
- Check API response times for `/messages/conversations`
- Monitor database view query execution time
- Track WebSocket message delivery latency

## Bug Regression Checklist

After fix is applied, verify these bugs are resolved:
- ✅ Sender no longer sees own messages as unread
- ✅ Unread count is accurate (not doubled or inflated)
- ✅ "Unread" doesn't appear for conversations where user sent last message
- ✅ Multiple messages from same sender counted correctly
- ✅ Mark as read clears unread count properly
- ✅ Real-time updates don't create phantom unread counts

## Conclusion

All test scenarios should pass for the fix to be considered complete and production-ready.

### Critical Tests (Must Pass)
- Scenario 1, 2, 3, 4 (basic functionality)
- Scenario 6 (real-time updates)
- Scenario 9 (multiple conversations)

### Important Tests (Should Pass)
- Scenario 5 (group chat)
- Scenario 7 (offline sync)
- Scenario 10 (media messages)

### Nice-to-Have Tests
- Scenario 8 (edge cases)
- Performance testing
- Automated tests
