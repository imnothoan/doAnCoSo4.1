# Deployment Guide: Unread Messages Fix

## Overview
This guide provides step-by-step instructions for deploying the unread messages bug fix to the production server.

## Prerequisites

### Required Access
- [ ] SSH/terminal access to server
- [ ] Database admin access (Supabase dashboard or SQL access)
- [ ] Git repository access
- [ ] Ability to restart server processes

### Required Files
- [ ] `server-unread-messages-fix.patch` - The patch file
- [ ] Backup plan documented
- [ ] Rollback procedure ready

## Pre-Deployment Checklist

### 1. Backup Current State
```bash
# Backup database view
pg_dump -h YOUR_DB_HOST -U YOUR_DB_USER -d YOUR_DB_NAME \
  --table=v_conversation_overview > backup_view_$(date +%Y%m%d).sql

# Backup server code
cd /path/to/doAnCoSo4.1.server
git stash
git pull origin main
git tag backup-before-unread-fix-$(date +%Y%m%d)
```

### 2. Test in Development First
```bash
# Apply patch in dev environment
cd /path/to/dev/doAnCoSo4.1.server
git apply /path/to/server-unread-messages-fix.patch

# Run tests if available
npm test

# Start dev server
npm run dev

# Manually test scenarios from TEST_SCENARIOS.md
```

### 3. Notify Users (Optional)
If this is a critical production deployment:
- [ ] Notify users of brief maintenance window
- [ ] Estimate downtime (should be < 1 minute for this fix)

## Deployment Steps

### Step 1: Apply Database View Fix

#### Option A: Using Supabase Dashboard
1. Log into Supabase Dashboard
2. Navigate to SQL Editor
3. Execute the following SQL:

```sql
-- Update the view to exclude sender's own messages from unread count
CREATE OR REPLACE VIEW v_conversation_overview AS
SELECT 
  cm.conversation_id,
  cm.username,
  MAX(m.created_at) as last_message_at,
  COUNT(m.id) FILTER (
    WHERE m.sender_username != cm.username
    AND NOT EXISTS (
      SELECT 1 FROM message_reads mr 
      WHERE mr.message_id = m.id 
      AND mr.username = cm.username
    )
  ) as unread_count
FROM conversation_members cm
LEFT JOIN messages m ON m.conversation_id = cm.conversation_id
GROUP BY cm.conversation_id, cm.username;
```

4. Verify the view was updated:
```sql
-- Test the view with a known user
SELECT * FROM v_conversation_overview 
WHERE username = 'test_user@example.com'
LIMIT 10;
```

#### Option B: Using psql CLI
```bash
# Connect to database
psql -h YOUR_DB_HOST -U YOUR_DB_USER -d YOUR_DB_NAME

# Run the update
\i /path/to/updated_view.sql

# Verify
SELECT * FROM v_conversation_overview LIMIT 5;

# Exit
\q
```

### Step 2: Apply Server Code Fix

#### Option A: Using Git Patch
```bash
# Navigate to server directory
cd /path/to/doAnCoSo4.1.server

# Apply the patch
git apply /path/to/server-unread-messages-fix.patch

# Verify changes
git diff

# Review the specific changes
git diff routes/message.routes.js
git diff db/schema.sql
```

#### Option B: Manual Update
If patch fails, manually edit `routes/message.routes.js`:

Find this code (around line 252):
```javascript
// Get all messages for all conversations
const { data: allConvMsgs, error: allMsgErr } = await supabase
  .from("messages")
  .select("id, conversation_id")
  .in("conversation_id", convIds);
```

Replace with:
```javascript
// Get all messages for all conversations (excluding messages sent by viewer)
const { data: allConvMsgs, error: allMsgErr } = await supabase
  .from("messages")
  .select("id, conversation_id, sender_username")
  .in("conversation_id", convIds)
  .neq("sender_username", viewer);
```

### Step 3: Commit Changes
```bash
git add .
git commit -m "Fix: Exclude sender's own messages from unread count

- Updated v_conversation_overview view to filter out sender's messages
- Modified fallback calculation to exclude sender's messages
- Fixes issue where users see their own messages as unread

Related: #ISSUE_NUMBER"

git push origin main
```

### Step 4: Restart Server

#### For Node.js with PM2
```bash
pm2 restart connectsphere-server
pm2 logs connectsphere-server --lines 50
```

#### For systemd
```bash
sudo systemctl restart connectsphere-server
sudo systemctl status connectsphere-server
journalctl -u connectsphere-server -f
```

#### For Docker
```bash
docker-compose down
docker-compose up -d
docker-compose logs -f
```

#### For simple Node.js
```bash
# Find and kill existing process
pkill -f "node index.js"

# Start in background
nohup node index.js > server.log 2>&1 &

# Check logs
tail -f server.log
```

### Step 5: Verify Deployment

#### Health Check
```bash
# Check server is running
curl http://YOUR_SERVER_URL/health

# Check API endpoint
curl http://YOUR_SERVER_URL/messages/conversations?user=test_user
```

#### Functional Tests
1. Open the mobile app
2. Send a message from User A to User B
3. Check User A's inbox - should show 0 unread
4. Check User B's inbox - should show 1 unread
5. Open conversation as User B
6. Check User B's inbox - should show 0 unread

#### Database Verification
```sql
-- Check unread counts for a test user
SELECT 
  conversation_id,
  username,
  unread_count
FROM v_conversation_overview
WHERE username = 'test_user@example.com';

-- Verify the fix with a known conversation
-- Should only count messages NOT sent by the user
SELECT 
  cm.conversation_id,
  cm.username,
  COUNT(m.id) FILTER (
    WHERE m.sender_username != cm.username
    AND NOT EXISTS (
      SELECT 1 FROM message_reads mr 
      WHERE mr.message_id = m.id 
      AND mr.username = cm.username
    )
  ) as unread_count,
  COUNT(m.id) as total_messages
FROM conversation_members cm
LEFT JOIN messages m ON m.conversation_id = cm.conversation_id
WHERE cm.username = 'test_user@example.com'
  AND cm.conversation_id = 123  -- Replace with actual conversation ID
GROUP BY cm.conversation_id, cm.username;
```

## Post-Deployment

### Monitoring
Monitor these metrics for 24-48 hours:
- [ ] API response times for `/messages/conversations`
- [ ] Database view query performance
- [ ] Error logs for any new errors
- [ ] User reports of unread count issues

### Validation
- [ ] Run through TEST_SCENARIOS.md scenarios
- [ ] Check with internal users for feedback
- [ ] Monitor support tickets for related issues

### Documentation
- [ ] Update internal documentation
- [ ] Update API documentation if needed
- [ ] Document this deployment in your changelog

## Rollback Procedure

If issues are detected:

### 1. Rollback Database View
```sql
-- Restore the old view (without sender filter)
CREATE OR REPLACE VIEW v_conversation_overview AS
SELECT 
  cm.conversation_id,
  cm.username,
  MAX(m.created_at) as last_message_at,
  COUNT(m.id) FILTER (
    WHERE NOT EXISTS (
      SELECT 1 FROM message_reads mr 
      WHERE mr.message_id = m.id 
      AND mr.username = cm.username
    )
  ) as unread_count
FROM conversation_members cm
LEFT JOIN messages m ON m.conversation_id = cm.conversation_id
GROUP BY cm.conversation_id, cm.username;
```

### 2. Rollback Server Code
```bash
cd /path/to/doAnCoSo4.1.server
git reset --hard backup-before-unread-fix-YYYYMMDD
pm2 restart connectsphere-server
```

### 3. Verify Rollback
```bash
# Check server is running
curl http://YOUR_SERVER_URL/health

# Check logs
pm2 logs connectsphere-server --lines 50
```

## Troubleshooting

### Issue: Patch fails to apply
**Solution**: Apply changes manually as described in Step 2, Option B

### Issue: View creation fails
**Possible Causes**:
- Syntax error - check PostgreSQL version compatibility
- Permission denied - ensure user has CREATE VIEW permission
- View already exists with conflicting definition

**Solution**:
```sql
-- Drop and recreate
DROP VIEW IF EXISTS v_conversation_overview;
-- Then run CREATE VIEW command again
```

### Issue: Server won't start after update
**Solution**:
1. Check logs: `pm2 logs` or `journalctl -u connectsphere-server`
2. Look for syntax errors in routes/message.routes.js
3. Verify all dependencies are installed: `npm install`
4. If all else fails, rollback using procedure above

### Issue: Unread counts still incorrect
**Possible Causes**:
- View not updated in database
- Server still using cached view
- Client needs to refresh

**Solution**:
1. Verify view in database: `SELECT * FROM v_conversation_overview LIMIT 5;`
2. Restart server to clear any caches
3. Have client users logout and login again

## Performance Impact

### Expected Impact
- **Database View**: Minimal - adding one equality check is very efficient
- **API Response Time**: Should remain the same or slightly improve
- **Memory Usage**: No change expected
- **CPU Usage**: Negligible increase (< 1%)

### Monitoring Queries
```sql
-- Check view query performance
EXPLAIN ANALYZE 
SELECT * FROM v_conversation_overview 
WHERE username = 'test_user@example.com';

-- Check for slow queries
SELECT 
  query, 
  mean_exec_time, 
  calls 
FROM pg_stat_statements 
WHERE query LIKE '%v_conversation_overview%' 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

## Success Criteria

Deployment is successful when:
- [ ] Server starts without errors
- [ ] Database view queries return expected results
- [ ] API endpoint `/messages/conversations` works correctly
- [ ] Users see accurate unread counts (not inflated)
- [ ] Sender doesn't see own messages as unread
- [ ] All test scenarios pass
- [ ] No new errors in logs
- [ ] Performance metrics are normal

## Support Contacts

If issues arise during deployment:
- Database Admin: [contact info]
- DevOps Team: [contact info]
- Backend Developer: [contact info]
- Project Manager: [contact info]

## Timeline

**Estimated Total Time**: 15-30 minutes
- Database view update: 2-3 minutes
- Server code update: 3-5 minutes
- Server restart: 1-2 minutes
- Testing/verification: 10-15 minutes
- Buffer for issues: 5-10 minutes

**Recommended Deployment Window**: Off-peak hours
- Suggested: Late evening or early morning in your timezone
- Avoid: Peak usage hours (lunch time, evening)

## Final Checklist

Before marking deployment complete:
- [ ] All deployment steps completed
- [ ] Server running without errors
- [ ] Test scenarios validated
- [ ] Monitoring in place
- [ ] Team notified of successful deployment
- [ ] Documentation updated
- [ ] Support team briefed on changes
- [ ] Rollback procedure tested and ready if needed

---

**Deployment Date**: _____________

**Deployed By**: _____________

**Deployment Notes**: 
_____________________________________________
_____________________________________________
_____________________________________________
