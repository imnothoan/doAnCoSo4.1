# Server Fix for Hangout Profile Navigation Issue

## Problem
When users swipe right on a hangout card to view someone's profile, the app shows "Cannot navigate to profile: username is missing" error.

## Root Cause
Some user records in the database may have NULL or missing `username` values, which causes the profile navigation to fail.

## Server Changes Required

### File: `routes/hangout.routes.js`

#### Change 1: Add NULL filter for username (Line 218)

**Before:**
```javascript
let query = supabase
  .from("users")
  .select(`...`)
  .eq("is_online", true)
  .in("username", availableUsernames);
```

**After:**
```javascript
let query = supabase
  .from("users")
  .select(`...`)
  .eq("is_online", true)
  .in("username", availableUsernames)
  .not("username", "is", null);  // Ensure username is not null
```

#### Change 2: Add debug logging (After line 230)

**Add after line 230:**
```javascript
let hangoutUsers = users || [];

// Debug: Log users being returned
console.log(`[Hangout] Returning ${hangoutUsers.length} users`);
if (hangoutUsers.length > 0) {
  console.log(`[Hangout] First user:`, {
    id: hangoutUsers[0].id,
    username: hangoutUsers[0].username,
    name: hangoutUsers[0].name,
  });
  
  // Validate all users have username
  const usersWithoutUsername = hangoutUsers.filter(u => !u.username);
  if (usersWithoutUsername.length > 0) {
    console.warn(`[Hangout] WARNING: ${usersWithoutUsername.length} users without username!`, 
      usersWithoutUsername.map(u => ({ id: u.id, name: u.name })));
  }
}
```

## How to Apply the Fix

### Option 1: Manual Update
1. SSH into your server or access the server code
2. Edit `routes/hangout.routes.js`
3. Apply the changes shown above
4. Restart the server:
   ```bash
   pm2 restart all
   # or
   npm run dev
   ```

### Option 2: Git Pull (if you push these changes to your server repo)
1. Clone or navigate to your server repository: https://github.com/imnothoan/doAnCoSo4.1.server
2. Make the changes described above
3. Commit and push to GitHub
4. On your server, pull the latest changes:
   ```bash
   git pull origin main
   pm2 restart all
   ```

## Database Fix (Optional but Recommended)

If you want to fix existing users with NULL usernames:

```sql
-- Check for users without username
SELECT id, name, email FROM users WHERE username IS NULL;

-- Option 1: Set username from email
UPDATE users 
SET username = SPLIT_PART(email, '@', 1) 
WHERE username IS NULL;

-- Option 2: Generate random username
UPDATE users 
SET username = 'user_' || SUBSTRING(id::text FROM 1 FOR 8)
WHERE username IS NULL;
```

## Testing

After applying the fix:

1. Restart the server
2. Open the client app
3. Go to Hangout tab
4. Try swiping right on a user card
5. Should successfully navigate to their profile

## Verification

Check server logs for the new debug messages:
```
[Hangout] Returning X users
[Hangout] First user: { id: '...', username: 'someuser', name: '...' }
```

If you see:
```
[Hangout] WARNING: X users without username!
```

Then you need to fix the database as described above.
