# Deployment Guide - Inbox & Hangout Fixes

## Overview
This guide explains how to deploy the fixes for inbox real-time updates and hangout availability toggle.

## Changes Summary

### Client Side (doAnCoSo4.1)
✅ All changes are already committed to the repository

**Files Changed:**
1. `src/services/api.ts` - Enhanced conversation data mapping
2. `app/(tabs)/inbox.tsx` - Simplified inbox with better real-time updates
3. `app/(tabs)/hangout.tsx` - Added availability toggle
4. `package.json` - Added expo-linear-gradient dependency

### Server Side (doAnCoSo4.1.server)
⚠️ **IMPORTANT**: Server changes need to be deployed manually

**File Changed:**
- `routes/hangout.routes.js` - Modified GET /hangouts endpoint

**Server Change Details:**
The GET /hangouts endpoint was updated to filter users by availability status. 
Only users with `is_available: true` in the `user_hangout_status` table will be shown in hangout.

## Deployment Steps

### 1. Client Deployment (Mobile App)

```bash
# Navigate to client directory
cd doAnCoSo4.1

# Install dependencies (expo-linear-gradient was added)
npm install

# Test the app locally first
npm start

# Build for production (when ready)
# For Expo Go:
npx expo publish

# For standalone apps:
eas build --platform all
```

### 2. Server Deployment

**Option A: Manual File Update**
1. Copy the updated `routes/hangout.routes.js` from `/tmp/doAnCoSo4.1.server/` to your production server
2. Restart your Node.js server

```bash
# SSH to production server
ssh your-server

# Navigate to server directory
cd doAnCoSo4.1.server

# Backup current file
cp routes/hangout.routes.js routes/hangout.routes.js.backup

# Upload the new file (use scp, ftp, or git pull)
# Then restart the server
pm2 restart all
# OR
npm run start
```

**Option B: Git Deployment**
1. The server changes are in `/tmp/doAnCoSo4.1.server/` (not in git yet)
2. You need to commit and push these changes to your server repository
3. Then pull on your production server

```bash
# On your development machine
cd /tmp/doAnCoSo4.1.server

# Add and commit changes
git add routes/hangout.routes.js
git commit -m "Filter hangout users by availability status"
git push origin main

# On production server
cd doAnCoSo4.1.server
git pull origin main
pm2 restart all
```

## Database Requirements

Ensure your database has the `user_hangout_status` table with these fields:
- `username` (string, primary key or unique)
- `is_available` (boolean)
- `current_activity` (string, optional)
- `activities` (array/json, optional)

If the table doesn't exist, create it:

```sql
CREATE TABLE user_hangout_status (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  is_available BOOLEAN DEFAULT false,
  current_activity TEXT,
  activities JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Testing Checklist

### Client Testing
- [ ] Test inbox - verify avatar and name always display correctly
- [ ] Send messages between users - verify real-time updates work
- [ ] Test hangout toggle - verify it changes status in database
- [ ] Test background image upload in hangout
- [ ] Test swipe left (view profile) and swipe right (next user)
- [ ] Verify only available users appear in hangout

### Server Testing
- [ ] Test GET /hangouts - verify it returns only available users
- [ ] Test PUT /hangouts/status - verify it updates user availability
- [ ] Test GET /hangouts/status/:username - verify it returns user status
- [ ] Test POST /users/:userId/background-image - verify upload works

## Environment Variables

Ensure these environment variables are set:

**Client (.env)**
```
EXPO_PUBLIC_API_URL=http://your-server-url:3000
```

**Server (.env)**
```
PORT=3000
CORS_ORIGIN=*
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
```

## Troubleshooting

### Issue: Users not appearing in hangout
**Solution**: 
1. Check if users have `is_available: true` in `user_hangout_status` table
2. Verify users are online (`is_online: true` in users table)
3. Check server logs for errors

### Issue: Inbox showing "Direct Message" instead of name
**Solution**:
1. Ensure server is returning `other_participant` field
2. Check network tab to verify API response
3. Clear app cache and reload

### Issue: Real-time updates not working
**Solution**:
1. Verify WebSocket connection is established
2. Check CORS settings allow WebSocket connections
3. Ensure user is authenticated with valid token

### Issue: Background image upload fails
**Solution**:
1. Verify `background-images` storage bucket exists in Supabase
2. Check bucket permissions (should be public)
3. Verify file size is under 10MB
4. Check server logs for detailed error

## Rollback Plan

If issues occur in production:

**Client Rollback:**
```bash
git revert HEAD~2  # Revert last 2 commits
npm install
npx expo publish
```

**Server Rollback:**
```bash
# Restore backup
cp routes/hangout.routes.js.backup routes/hangout.routes.js
pm2 restart all
```

## Support

For issues or questions:
1. Check server logs: `pm2 logs`
2. Check client logs in Expo dev tools
3. Review this guide for common issues
4. Contact the development team

## Completion Checklist

- [ ] Client dependencies installed
- [ ] Client tested locally
- [ ] Server changes deployed
- [ ] Database schema verified
- [ ] Environment variables configured
- [ ] Real-time features tested
- [ ] Hangout toggle tested
- [ ] Background upload tested
- [ ] Production monitoring enabled

---

**Deployment Date**: _________________

**Deployed By**: _________________

**Notes**: _________________
