# Authentication Guide - Fixing Login Issues

## 🔍 Understanding the Issue

The error `[AuthApiError: Invalid login credentials]` means that Supabase Authentication cannot find a user with the provided email and password. This happens when:

1. **No user exists** - You're trying to login without signing up first
2. **Wrong credentials** - Email or password is incorrect
3. **Email confirmation required** - User signed up but hasn't confirmed their email
4. **Supabase misconfiguration** - Auth settings are not properly configured

## 🎯 Quick Fix

### Option 1: Sign Up First (Recommended)

If you haven't created an account yet:

1. **Open the app**
2. **Tap "Sign Up"** on the login screen
3. **Fill in the form:**
   - Username: Your desired username
   - Email: Your email address
   - Password: At least 6 characters
   - Confirm Password: Same as password
4. **Tap "Create Account"**
5. **Wait for success message**
6. **Go back to login** and use your credentials

### Option 2: Disable Email Confirmation (For Development)

If you're getting "Email not confirmed" errors:

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `lryrcmdfhahaddzbeuzn`
3. **Navigate to**: Authentication → Providers → Email
4. **Find "Confirm email" setting**
5. **Toggle it OFF** (disable)
6. **Save changes**
7. **Try signing up again**

## 🧪 Testing the Connection

We've created a test script to verify your Supabase connection:

```bash
# Install dependencies if needed
npm install

# Run the test script
npx tsx scripts/testSupabaseConnection.ts
```

This script will:
- ✅ Test connection to Supabase
- ✅ Create a test user
- ✅ Try to login immediately
- ✅ Report email confirmation settings
- ✅ Provide recommendations

## 📋 Step-by-Step Login Process

### First Time Setup

1. **Install the app**
   ```bash
   npm install
   npx expo start
   ```

2. **Create a test account**
   - Open the app on your device/emulator
   - Navigate to signup screen
   - Use a real email (if email confirmation is enabled)
   - Or use any email format (if confirmation is disabled)

3. **Login with your credentials**
   - Go back to login screen
   - Enter the email and password you just created
   - Tap "Sign In"

### Common Scenarios

#### ✅ Scenario 1: New User
```
1. Open app → See login screen
2. Tap "Sign Up" → Fill form
3. Tap "Create Account" → Success!
4. Tap "OK" → Back to login
5. Enter credentials → Login successful
6. Redirected to app → Done!
```

#### ❌ Scenario 2: Login Without Signup
```
1. Open app → See login screen
2. Enter email/password (no account exists)
3. Tap "Sign In" → ERROR: Invalid login credentials
4. Solution: Tap "Sign Up" first!
```

#### ⚠️ Scenario 3: Email Confirmation Required
```
1. Signup successful → Check email
2. Try to login → ERROR: Email not confirmed
3. Check inbox → Click confirmation link
4. Try login again → Success!
OR
Disable email confirmation (see Option 2 above)
```

## 🔧 Troubleshooting

### Problem 1: "Invalid login credentials"

**Cause**: No user exists with that email/password

**Solutions:**
1. Make sure you've signed up first
2. Check if you're using the correct email
3. Try the "Forgot Password" feature (if implemented)
4. Create a new account if you can't remember credentials

### Problem 2: "Email not confirmed"

**Cause**: Email confirmation is enabled in Supabase

**Solutions:**
1. Check your email inbox for confirmation link
2. Disable email confirmation in Supabase (see Option 2)
3. Use a real email address if confirmation is enabled

### Problem 3: Backend sync fails after signup

**Cause**: Server is not running or unreachable

**Solutions:**
1. Make sure server is running: `cd ../doAnCoSo4.1.server && npm start`
2. Check EXPO_PUBLIC_API_URL in .env file
3. Verify network connectivity
4. Check server logs for errors

**Note**: Even if backend sync fails, you can still login since the Supabase user was created. The backend will sync when you first make an API call.

### Problem 4: Network errors

**Cause**: Can't connect to Supabase or backend

**Solutions:**
1. Check your internet connection
2. Verify Supabase URL and keys in .env
3. Make sure Supabase project is active
4. Check if any firewall is blocking connections

## 🔐 Environment Variables

Make sure these are set in your `.env` file:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://lryrcmdfhahaddzbeuzn.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend API
EXPO_PUBLIC_API_URL=http://192.168.1.228:3000
```

## 📱 Testing in Development

### Create a Test User

You can create test accounts using these patterns:

```javascript
Email: test1@test.com
Password: Test123!

Email: test2@test.com  
Password: Test123!

Email: your_name@test.com
Password: Test123!
```

**Important**: Use different emails for each account!

### Login Flow in Console

When you run the app, check the console logs:

```
✅ Good signup:
📝 Starting signup process for: test@test.com username: testuser
✅ Supabase user created: uuid-here
🔄 Syncing user data with backend...
✅ Backend sync successful
✅ Session created immediately (email confirmation disabled)

✅ Good login:
🔐 Attempting login for: test@test.com
✅ Supabase login successful: test@test.com

❌ Bad login:
🔐 Attempting login for: test@test.com
❌ Login error: [AuthApiError: Invalid login credentials]
```

## 🎓 How It Works

### Signup Process

```
1. User fills signup form
   ↓
2. App calls supabase.auth.signUp()
   ↓
3. Supabase creates user in Auth database
   ↓
4. App syncs user data with backend API
   ↓
5. Backend creates user in public.users table
   ↓
6. Success! User can now login
```

### Login Process

```
1. User enters email/password
   ↓
2. App calls supabase.auth.signInWithPassword()
   ↓
3. Supabase verifies credentials
   ↓
4. If valid: Returns session token
   ↓
5. App uses token to fetch user profile from backend
   ↓
6. Success! User is logged in
```

## 💡 Best Practices

1. **Development**: Disable email confirmation for faster testing
2. **Production**: Enable email confirmation for security
3. **Always**: Use strong passwords (min 6 characters)
4. **Testing**: Create multiple test accounts with different emails
5. **Debugging**: Check console logs for detailed error messages

## 🆘 Still Having Issues?

If you're still experiencing problems:

1. **Run the test script**: `npx tsx scripts/testSupabaseConnection.ts`
2. **Check all console logs** in the app and server
3. **Verify environment variables** are correct
4. **Make sure server is running** on the correct port
5. **Check Supabase dashboard** for any service issues
6. **Review server logs** for backend errors

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Server Repository](https://github.com/imnothoan/doAnCoSo4.1.server)

---

**Remember**: You must sign up before you can login! The error you're seeing is expected if you haven't created an account yet.
