# Server Deployment Guide - Hang Out Fix

## Overview

This guide explains how to deploy the server-side changes required for the Hang Out feature fix.

## Changes Made

### File: `routes/auth.routes.js`

Added automatic hangout status creation when new users sign up.

**Location**: Lines 47-59

**Change**:
```javascript
// After user is created in database...
if (insErr) throw insErr;

// Create default hangout status for new user (visible by default)
try {
  await supabase
    .from('user_hangout_status')
    .insert([{
      username: inserted.username,
      is_available: true, // Auto-enable visibility for new users
      current_activity: null,
      activities: []
    }]);
  console.log(`✅ Created default hangout status for ${inserted.username}`);
} catch (hangoutErr) {
  // Non-critical - log but don't fail signup
  console.error('Warning: Could not create hangout status:', hangoutErr);
}
```

## Why This Change is Needed

**Problem**: New users who signed up didn't have a record in `user_hangout_status` table, so they couldn't appear in Hang Out even after logging in.

**Solution**: Automatically create a hangout status record when user signs up, with `is_available = true` by default.

## Deployment Steps

### Option 1: Manual Update (Recommended for Small Change)

1. **Pull latest changes from client repo**:
   ```bash
   cd path/to/doAnCoSo4.1
   git pull origin copilot/fix-inbox-and-hangout-issues
   ```

2. **Navigate to server repo**:
   ```bash
   cd path/to/doAnCoSo4.1.server
   ```

3. **Edit `routes/auth.routes.js`**:
   - Open the file in your editor
   - Find line 46: `if (insErr) throw insErr;`
   - Add the new code block after it (see "Change" section above)

4. **Test locally**:
   ```bash
   npm start
   ```

5. **Verify the fix**:
   ```bash
   # In another terminal, test signup endpoint
   curl -X POST http://localhost:3000/auth/signup \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "password": "password123",
       "country": "Vietnam",
       "city": "Hanoi"
     }'
   ```

6. **Check database**:
   ```sql
   SELECT * FROM user_hangout_status 
   WHERE username = (SELECT username FROM users WHERE email = 'test@example.com');
   ```
   Should return a row with `is_available = true`

7. **Commit and push**:
   ```bash
   git add routes/auth.routes.js
   git commit -m "Auto-create hangout status on user signup"
   git push origin main
   ```

8. **Deploy to production** (depending on your hosting):
   - Heroku: `git push heroku main`
   - Railway: Automatically deploys from GitHub
   - Render: Automatically deploys from GitHub
   - VPS: Pull changes and restart: `git pull && pm2 restart all`

### Option 2: Cherry-Pick from Client Repo

If you have the client repo cloned locally with the fix:

```bash
cd path/to/doAnCoSo4.1.server
git remote add client-repo https://github.com/imnothoan/doAnCoSo4.1.git
git fetch client-repo
git cherry-pick <commit-hash>  # Hash of the auth.routes.js change
git push origin main
```

## Verification Steps

### 1. Server Logs

After deploying, watch server logs for:
```
✅ Created default hangout status for <username>
```

### 2. Database Check

Query to verify hangout status is created:
```sql
-- Check recent signups
SELECT u.username, u.email, u.created_at,
       h.is_available, h.last_updated
FROM users u
LEFT JOIN user_hangout_status h ON u.username = h.username
ORDER BY u.created_at DESC
LIMIT 10;
```

All recent signups should have a corresponding `user_hangout_status` record.

### 3. API Test

Test the signup endpoint:
```bash
curl -X POST https://your-server.com/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "newuser@test.com",
    "password": "test123",
    "country": "Vietnam",
    "city": "Hanoi"
  }'
```

Then check hangout status:
```bash
curl https://your-server.com/hangouts/status/<username>
```

Should return:
```json
{
  "username": "newuser_123",
  "is_available": true,
  "current_activity": null,
  "activities": []
}
```

### 4. End-to-End Test

1. Sign up new user on mobile app
2. Go to Hang Out tab
3. Should see status: 🟢 "You're visible to others"
4. Another online user should see new user in their Hang Out cards

## Existing Users

**Note**: This fix only affects NEW users signing up. Existing users who don't have hangout status will have it created automatically when they first visit the Hang Out tab (handled by client-side fix).

### Optional: Backfill Existing Users

If you want to create hangout status for all existing users:

```sql
-- Create hangout status for users who don't have one
INSERT INTO user_hangout_status (username, is_available, current_activity, activities)
SELECT username, true, null, ARRAY[]::text[]
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_hangout_status h 
  WHERE h.username = u.username
);
```

## Rollback Plan

If something goes wrong, you can rollback:

```bash
cd path/to/doAnCoSo4.1.server
git revert HEAD
git push origin main
```

The client will still work - new users just won't have default hangout status and will need to manually enable visibility.

## Environment Variables

No new environment variables needed for this change.

## Database Migrations

No schema changes required. The `user_hangout_status` table already exists.

## Dependencies

No new dependencies added.

## Performance Impact

**Minimal**: One additional database insert per signup. Non-blocking and error-handled.

## Security Considerations

**No security impact**: Change only creates a record in `user_hangout_status` table with default safe values.

## Monitoring

After deployment, monitor:

1. **Signup success rate**: Should remain the same (error is caught and logged)
2. **Database writes**: One additional write per signup
3. **Server logs**: Look for any hangout status creation errors

## Support

If you encounter issues:

1. Check server logs for error messages
2. Verify database schema has `user_hangout_status` table
3. Test signup endpoint with curl
4. Check database for created records
5. Rollback if necessary

## Related Files

- **Client Fix**: `app/(tabs)/hangout.tsx` (already deployed in client repo)
- **Server Fix**: `routes/auth.routes.js` (this guide)
- **Documentation**: `HANG_OUT_FIX_SUMMARY.md` (in client repo)
- **Testing**: `EMULATOR_TESTING_GUIDE.md` (in client repo)

## Timeline

1. **Deploy server change** (this guide)
2. **Merge client PR** (already completed)
3. **Test with multiple devices** (see EMULATOR_TESTING_GUIDE.md)
4. **Monitor for 24 hours**
5. **Consider complete** ✅

---

**Questions?** Check the HANG_OUT_FIX_SUMMARY.md for detailed explanation of the fix.
