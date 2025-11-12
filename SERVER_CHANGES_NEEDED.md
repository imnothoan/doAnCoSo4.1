# Server Changes Required for Hangout Feature

## Database Schema Updates

### 1. Add background_image field to users table

Run this SQL migration on your Supabase database:

```sql
-- Add background_image column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS background_image TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_background_image ON users(background_image) WHERE background_image IS NOT NULL;
```

### 2. Create Supabase Storage Bucket for Background Images

1. Go to Supabase Dashboard > Storage
2. Create a new bucket named `background-images`
3. Set the bucket to **Public** (so images can be accessed directly)
4. Configure CORS and access policies as needed

Alternatively, you can create the bucket programmatically:

```javascript
const { data, error } = await supabase
  .storage
  .createBucket('background-images', {
    public: true,
    fileSizeLimit: 10485760 // 10MB
  });
```

## Server API Endpoint Updates

### 1. Add Background Image Upload Endpoint

Add this route to `routes/user.routes.js`:

```javascript
// POST /users/:userId/background-image
router.post("/:userId/background-image", upload.single("background_image"), async (req, res) => {
  try {
    const { userId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload to Supabase Storage
    const fileName = `${userId}-${Date.now()}.${file.mimetype.split('/')[1]}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("background-images")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return res.status(500).json({ message: "Failed to upload image" });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("background-images")
      .getPublicUrl(fileName);

    const backgroundImageUrl = publicUrlData.publicUrl;

    // Update user record
    const { error: updateError } = await supabase
      .from("users")
      .update({ background_image: backgroundImageUrl })
      .eq("id", userId);

    if (updateError) {
      console.error("Update error:", updateError);
      return res.status(500).json({ message: "Failed to update user profile" });
    }

    res.json({ backgroundImageUrl });
  } catch (error) {
    console.error("Error uploading background image:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
```

### 2. Update User Response to Include background_image

Make sure all user-related endpoints return the `background_image` field:

```javascript
// In user.routes.js or wherever you fetch user data
const { data: user, error } = await supabase
  .from("users")
  .select("*, background_image") // Make sure to include background_image
  .eq("username", username)
  .single();
```

### 3. Update Hangout Endpoint to Return User background_image

Modify the `/hangouts` endpoint to include `background_image` in the user data:

```javascript
// In routes/hangout.routes.js
router.get("/", async (req, res) => {
  try {
    const { languages, distance_km, user_lat, user_lng, limit = 50 } = req.query;

    // Query for online users who are available for hangout
    let query = supabase
      .from("users")
      .select("id, username, name, email, avatar, background_image, country, city, age, bio, interests, is_online, latitude, longitude, status")
      .eq("is_online", true);

    // ... rest of your filtering logic

    const { data: users, error } = await query;

    if (error) {
      console.error("Error fetching hangout users:", error);
      return res.status(500).json({ message: "Failed to fetch users" });
    }

    // Map users to include proper structure
    const hangoutUsers = users.map(user => ({
      ...user,
      user: user, // Keep backward compatibility if needed
    }));

    res.json(hangoutUsers);
  } catch (error) {
    console.error("Error in hangout endpoint:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
```

## Testing the Changes

1. **Test Background Image Upload:**
   ```bash
   curl -X POST http://localhost:3000/users/{userId}/background-image \
     -F "background_image=@/path/to/image.jpg"
   ```

2. **Verify Database Update:**
   ```sql
   SELECT username, background_image FROM users WHERE background_image IS NOT NULL;
   ```

3. **Test Hangout Endpoint:**
   ```bash
   curl http://localhost:3000/hangouts?limit=10
   ```
   Verify that the response includes `background_image` field for users.

## WebSocket Enhancements (Optional)

To make the inbox even more real-time, ensure your WebSocket implementation in `websocket.js` is working properly:

1. The current implementation already handles:
   - User online/offline status updates
   - New message notifications
   - Typing indicators

2. Make sure the WebSocket server is running on the same port as your HTTP server (already done in `index.js`).

3. Test WebSocket connections:
   ```javascript
   // In your client app
   import WebSocketService from '@/src/services/websocket';
   
   WebSocketService.connect('http://your-server-url:3000', userToken);
   ```

## Environment Variables

Make sure your `.env` file includes:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key

# Server
PORT=3000
CORS_ORIGIN=*

# File Upload Limits
MAX_FILE_SIZE=10485760  # 10MB in bytes
```

## Deployment Notes

1. Restart your server after making these changes
2. Test the background image upload feature in development first
3. Monitor server logs for any errors during image uploads
4. Ensure your Supabase storage bucket has sufficient quota
5. Consider adding image optimization (resize, compress) before uploading to save storage and bandwidth
