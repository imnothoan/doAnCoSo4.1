# Server Fixes Required

## ⚠️ IMPORTANT: Server Repository Changes Required

The client application has been updated to work with proper authentication. However, **you MUST update the server repository** with the changes below for the authentication to work correctly.

## What's Wrong with Current Server

1. **Login accepts any password** - The server doesn't validate passwords
2. **No password hashing** - Passwords are not securely stored
3. **Security risk** - Anyone can login with any email if they know it exists

## Required Server Changes

### 1. Install bcryptjs Package

In your server repository (`doAnCoSo4.1.server`):

```bash
npm install bcryptjs
```

### 2. Database Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Add password_hash column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Create index for faster email lookups during login
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Add comment
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password for authentication';
```

### 3. Update routes/auth.routes.js

Replace the entire file with the updated version. The key changes:

**At the top, add bcrypt import:**
```javascript
const bcrypt = require('bcryptjs');
```

**Updated signup route** (hashes passwords):
```javascript
router.post('/signup', async (req, res) => {
  const { name, email, password, country, city, username: customUsername, gender } = req.body;
  
  // Validate password
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Insert with password_hash field
  const { data: inserted, error: insErr } = await supabase
    .from('users')
    .insert([{
      id,
      email,
      username,
      name: name || username,
      country: country || null,
      city: city || null,
      gender: gender || null,
      password_hash: passwordHash,  // ← Store hashed password
      email_confirmed: false
    }])
    .select('*')
    .single();
  
  // Rest of the code...
});
```

**Updated login route** (validates passwords):
```javascript
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Fetch user
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .limit(1)
    .single();
  
  // Validate password
  if (!user.password_hash) {
    return res.status(401).json({ message: 'Invalid credentials. Please reset your password.' });
  }
  
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Remove password hash from response
  delete user.password_hash;
  
  // Rest of the code...
});
```

### 4. Update routes/user.routes.js

Add a helper function to sanitize user objects:

```javascript
function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, ...sanitized } = user;
  return sanitized;
}

// Update getUserById and getUserByUsername to use sanitizeUser
async function getUserById(id) {
  const { data, error } = await supabase.from("users").select("*").eq("id", id).single();
  if (error) throw error;
  return sanitizeUser(data);
}

async function getUserByUsername(username) {
  const { data, error } = await supabase.from("users").select("*").eq("username", username).single();
  if (error) throw error;
  return sanitizeUser(data);
}
```

## Complete Server Files

The complete updated server files are available in the server repository `/tmp/doAnCoSo4.1.server/` directory:

- `routes/auth.routes.js` - Updated authentication routes
- `routes/user.routes.js` - Updated user routes with sanitization
- `db/schema.sql` - Updated with password_hash column
- `db/migrations/add_password_hash.sql` - Migration file
- `package.json` - Updated with bcryptjs dependency

## Deployment Steps

1. **Backup your database** (always backup before migrations!)

2. **Update server code:**
   ```bash
   cd doAnCoSo4.1.server
   git pull origin main
   npm install
   ```

3. **Run database migration:**
   - Open Supabase SQL Editor
   - Copy and paste the SQL from step 2 above
   - Execute

4. **Restart server:**
   ```bash
   npm start
   ```

5. **Test the authentication:**
   - Try creating a new account
   - Try logging in with correct password (should work)
   - Try logging in with wrong password (should fail)

## Important Notes

- **Existing users**: Users created before this update will have `password_hash` as NULL and won't be able to login until their password is reset
- **Security**: Make sure to use HTTPS in production to protect passwords in transit
- **Password reset**: You may want to implement a password reset feature for existing users

## Verification

After deployment, verify:

✅ New signups create users with hashed passwords
✅ Login accepts correct passwords
✅ Login rejects incorrect passwords  
✅ Password hashes are never exposed in API responses
✅ Client receives proper error messages

## Support

If you encounter any issues during deployment, check:
1. Node.js version (should be >= 18.0.0)
2. bcryptjs is installed (`npm list bcryptjs`)
3. Database migration was executed successfully
4. Server logs for any errors

---

**This is a critical security update. Please deploy as soon as possible.**
