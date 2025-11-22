# Quick Fix: Login Issue 🔧

## The Problem
You're seeing this error:
```
ERROR Login error: [AuthApiError: Invalid login credentials]
```

## The Solution (3 Steps)

### Step 1: Sign Up First! ✍️

**The issue**: You're trying to login without an account.

**Solution**: Create an account first!

1. Open the app
2. On the login screen, tap **"Sign Up"**
3. Fill in the form:
   - **Username**: Choose any username (e.g., "testuser")
   - **Email**: Use any valid email format (e.g., "test@test.com")
   - **Password**: At least 6 characters (e.g., "Test123!")
   - **Confirm Password**: Same as above
4. Tap **"Create Account"**
5. Wait for "Success!" message
6. Tap **"OK"** to go back to login

### Step 2: Login with Your New Account 🔐

1. On the login screen, enter:
   - **Email**: The email you just used (e.g., "test@test.com")
   - **Password**: The password you just created (e.g., "Test123!")
2. Tap **"Sign In"**
3. ✅ Success! You're now logged in!

### Step 3: (Optional) Disable Email Confirmation ⚙️

If you see "Email not confirmed" error:

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to: **Authentication** → **Providers** → **Email**
4. Find **"Confirm email"** setting
5. **Toggle it OFF** (for development)
6. **Save**
7. Try signing up again

## Important Notes

✅ **You must sign up before you can login!**

✅ **Use different emails for different accounts**

✅ **Password must be at least 6 characters**

✅ **For testing, use simple emails like test1@test.com, test2@test.com, etc.**

## Still Not Working?

### Check Console Logs

Look for these messages in your terminal:

**Good Signup:**
```
📝 Starting signup process for: test@test.com username: testuser
✅ Supabase user created: xxx-xxx-xxx
✅ Backend sync successful
```

**Good Login:**
```
🔐 Attempting login for: test@test.com
✅ Supabase login successful: test@test.com
```

**Bad Login (No Account):**
```
🔐 Attempting login for: test@test.com
❌ Login error: [AuthApiError: Invalid login credentials]
```
👉 **This means: Create an account first!**

### Run the Test Script

```bash
npx tsx scripts/testSupabaseConnection.ts
```

This will:
- ✅ Test Supabase connection
- ✅ Create a test user
- ✅ Try logging in
- ✅ Tell you what's wrong

### Check Your Environment

Make sure `.env` has:
```env
EXPO_PUBLIC_SUPABASE_URL=https://lryrcmdfhahaddzbeuzn.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_API_URL=http://192.168.1.228:3000
```

### Make Sure Server is Running

```bash
cd ../doAnCoSo4.1.server
npm install
npm start
```

Server should show:
```
✅ Supabase client initialized successfully
🚀 Server running on port 3000
```

## Summary

**The #1 reason for this error**: You haven't created an account yet!

**The #1 solution**: Use the "Sign Up" button first!

---

## For More Help

- 📚 Read: `AUTHENTICATION_GUIDE.md` (detailed guide)
- 🧪 Test: `npx tsx scripts/testSupabaseConnection.ts`
- 💬 Check: Console logs for detailed error messages
- 🔍 Verify: Supabase Dashboard for user list

## Common Test Accounts

You can create these for testing:

```
Email: test1@test.com
Password: Test123!

Email: test2@test.com
Password: Test123!

Email: myname@test.com
Password: MyPassword123!
```

**Remember**: You need to create them first via Sign Up!

---

**That's it!** The error is actually telling you what's wrong - the credentials are invalid because no account exists. Sign up first, then login! 🎉
