# Fix Summary: Followers and Following Count Display

## Problem
The Summary section in both Account and Profile pages was displaying 0 for followers and following counts, even though users had actual followers/following.

## Root Cause

### Server Response Format:
Server returns data fields with names:
```json
{
  "username": "tung_268",
  "name": "Tung",
  "followers": 5,      // Server field name
  "following": 10,     // Server field name
  "posts": 3           // Server field name
}
```

### Client Expected Format:
TypeScript `User` interface in client expects:
```typescript
interface User {
  username?: string;
  name: string;
  followersCount?: number;  // Expected client field name
  followingCount?: number;  // Expected client field name
  postsCount?: number;      // Expected client field name
}
```

### Issue:
When UI code accessed `user.followersCount`, the value was `undefined` because server sent `followers` instead of `followersCount`. JavaScript/TypeScript treats `undefined` as falsy, so `user.followersCount || 0` evaluated to `0`.

## Solution
Added a helper function `mapServerUserToClient()` to transform server responses to match client expectations:

```typescript
function mapServerUserToClient(serverUser: any): User {
  return {
    ...serverUser,
    // Map server field names to client field names
    followersCount: serverUser.followers ?? serverUser.followersCount ?? 0,
    followingCount: serverUser.following ?? serverUser.followingCount ?? 0,
    postsCount: serverUser.posts ?? serverUser.postsCount ?? 0,
  };
}
```

This function:
1. Preserves all existing fields using spread operator (`...serverUser`)
2. Maps `followers` → `followersCount`
3. Maps `following` → `followingCount`
4. Maps `posts` → `postsCount`
5. Falls back to 0 if neither field exists
6. Handles both server and client field names (backwards compatible)

## Files Changed
- `src/services/api.ts`: Added mapper function and updated all User-returning methods

## Methods Updated
All API methods that return User objects now use the mapper:
- `getCurrentUser()` - Get current user info
- `getUserByUsername()` - Get user by username
- `getUserById()` - Get user by ID
- `updateUser()` - Update user information
- `getUsers()` - Get list of users
- `searchUsers()` - Search users
- `getFollowers()` - Get followers list
- `getFollowing()` - Get following list
- `login()` - User login
- `signup()` - User registration
- `getConversations()` - Get conversations list
- `getConversation()` - Get conversation details

## Data Flow
1. User logs in → `AuthContext.login()` → `ApiService.login()` → mapper applied
2. Profile loads → `AuthContext.refreshUser()` → `ApiService.getUserByUsername()` → mapper applied
3. User object now has both `followers` and `followersCount` fields
4. UI displays `user.followersCount` correctly

## Testing

### Before fix:
```
Server sends: { followers: 5, following: 10 }
Client receives: { followers: 5, following: 10, followersCount: undefined, followingCount: undefined }
UI displays: 0 followers, 0 following ❌
```

### After fix:
```
Server sends: { followers: 5, following: 10 }
Client receives: { followers: 5, following: 10, followersCount: 5, followingCount: 10 }
UI displays: 5 followers, 10 following ✅
```

## Results
✅ Account page (`app/(tabs)/account.tsx`) now displays correct followers/following counts in Summary section
✅ Profile page (`app/profile.tsx`) now displays correct followers count in Summary section
✅ No breaking changes - backwards compatible with both field name formats
✅ No server changes required
✅ All existing functionality preserved

## Security Testing
✅ TypeScript compilation successful
✅ ESLint passes with no errors
✅ CodeQL security scan: 0 vulnerabilities

## Testing Instructions
1. Log into the app with an account that has followers/following
2. Go to Account page (Account tab)
3. Check Summary section - should now show correct followers and following counts
4. Visit another user's profile
5. Check Summary section - should now show correct followers count

## Technical Notes
- This fix is entirely client-side, no server changes needed
- The mapper handles both old server field names (`followers`) and new client field names (`followersCount`)
- Uses nullish coalescing operator (`??`) to handle null/undefined values
- No performance impact as mapper only runs when new user data is received
- The solution is backwards compatible and can handle responses with either naming convention

## Implementation Details
**File: `src/services/api.ts`**
- Lines 28-37: Added `mapServerUserToClient()` helper function
- Lines 145-154: Updated `login()` and `signup()` to map user in response
- Lines 159-169: Updated `getCurrentUser()` and `updateUser()` to use mapper
- Lines 163-164: Updated `getUserByUsername()` to use mapper
- Lines 194-206: Updated `getUsers()` and `searchUsers()` to map array of users
- Lines 200-201: Updated `getUserById()` to use mapper
- Lines 230-278: Updated `getFollowers()` and `getFollowing()` to use mapper
- Lines 409-520: Updated conversation methods to map user objects in participants and messages

## Verification
The fix has been tested with simulated server responses and verified to:
1. Correctly map `followers` → `followersCount`
2. Correctly map `following` → `followingCount`
3. Correctly map `posts` → `postsCount`
4. Default to 0 when counts are missing
5. Preserve existing values if client field names are already present
6. Maintain all other user properties unchanged
