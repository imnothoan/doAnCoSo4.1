# Server-Side Fixes Needed

This document outlines the fixes required in the `doAnCoSo4.1.server` repository to resolve the errors shown in the client terminal.

## Issue: 500 Error on User Profile Update

### Error Details
```
PUT /users/e9f6b527-7d70-4e00-ba9f-a4ed2e6f193d 500
update profile error: {
  code: 'PGRST116',
  details: 'The result contains 0 rows',
  hint: null,
  message: 'Cannot coerce the result to a single JSON object'
}
```

### Root Cause
The error occurs in `routes/user.routes.js` at line 240-245 when using `.single()` on an UPDATE query that affects 0 rows. This happens when the user ID doesn't exist in the database.

### Fix Required

**File**: `routes/user.routes.js`  
**Lines**: 240-245

**Current Code**:
```javascript
const { data, error } = await supabase
  .from("users")
  .update(updates)
  .eq("id", id)
  .select("*")
  .single();

if (error) throw error;
res.json(data);
```

**Recommended Fix** (Option 1 - Use maybeSingle):
```javascript
const { data, error } = await supabase
  .from("users")
  .update(updates)
  .eq("id", id)
  .select("*")
  .maybeSingle();

if (error) throw error;

if (!data) {
  return res.status(404).json({ 
    message: "User not found with the provided ID." 
  });
}

res.json(data);
```

**Recommended Fix** (Option 2 - Check user exists first):
```javascript
// First, verify user exists
const { data: existingUser, error: checkError } = await supabase
  .from("users")
  .select("id")
  .eq("id", id)
  .maybeSingle();

if (checkError) throw checkError;

if (!existingUser) {
  return res.status(404).json({ 
    message: "User not found with the provided ID." 
  });
}

// Then update
const { data, error } = await supabase
  .from("users")
  .update(updates)
  .eq("id", id)
  .select("*")
  .single();

if (error) throw error;
res.json(data);
```

### Why This Happens
1. User data might be cached on the client side with an old/invalid ID
2. User might have been deleted from the database
3. There could be a mismatch between auth system and users table

### Additional Recommendations
1. Add logging to track when this error occurs
2. Consider adding a user sync endpoint to refresh client-side user data
3. Implement proper database constraints and cascading deletes if using auth system

## Impact
This fix will:
- Prevent 500 errors and provide proper 404 responses
- Give better error messages to the client
- Improve user experience with clearer feedback
- Prevent server crashes from unhandled errors

## Testing
After implementing the fix, test with:
1. Valid user ID - should update successfully
2. Non-existent user ID - should return 404 with clear message
3. Malformed user ID - should return 400 or 404

## Priority
**HIGH** - This error affects core functionality (profile updates) and provides poor user experience.
