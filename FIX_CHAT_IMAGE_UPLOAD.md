# Fix Chat Image Upload Issue

## Problem
Users cannot send images in direct messages. The app has the UI for selecting and sending images, but the upload fails.

## Root Cause Analysis

The server is configured to upload chat images to a Supabase storage bucket called `"messages"` (see `routes/message.routes.js` line 6), but you mentioned creating a bucket called `"chat-image"`. This mismatch causes upload failures.

## Solution Options

### Option 1: Use the Server's Expected Bucket Name (Recommended)

Create a bucket named `"messages"` in Supabase:

1. **Go to Supabase Dashboard** → Storage
2. **Create new bucket**: `messages`
3. **Set as Public bucket** (or configure policies)
4. **Add Storage Policies**:

```sql
-- Allow authenticated users to upload their own images
CREATE POLICY "Users can upload message images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'messages');

-- Allow anyone to read message images (public bucket)
CREATE POLICY "Anyone can view message images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'messages');

-- Allow users to delete their own message images
CREATE POLICY "Users can delete their message images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'messages');
```

### Option 2: Update Server to Use chat-image Bucket

If you prefer to use your `"chat-image"` bucket, update the server:

**File: `/tmp/doAnCoSo4.1.server/routes/message.routes.js`**

Change line 6 from:
```javascript
const MSG_BUCKET = "messages";
```

To:
```javascript
const MSG_BUCKET = "chat-image";
```

Then ensure the `chat-image` bucket has proper policies (same as Option 1, but replace 'messages' with 'chat-image').

## Complete Setup Instructions

### 1. Create/Verify Supabase Storage Bucket

**In Supabase Dashboard:**
1. Navigate to **Storage**
2. Click **Create bucket** (or verify existing)
3. Bucket name: `messages` (or `chat-image` if using Option 2)
4. Public bucket: **Yes** (for easier access)
5. Click **Create bucket**

### 2. Configure Storage Policies

**Go to Storage → messages → Policies**

Add these three policies:

#### Policy 1: Allow uploads
```sql
CREATE POLICY "Authenticated users can upload messages images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'messages');
```

#### Policy 2: Allow public read
```sql
CREATE POLICY "Public read access to messages images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'messages');
```

#### Policy 3: Allow delete own images
```sql
CREATE POLICY "Users can delete their own messages images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'messages' AND auth.uid() = owner);
```

**Alternative: Simple Policy (if authenticated only)**
```sql
-- Single policy for all operations
CREATE POLICY "Full access for authenticated users"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'messages')
WITH CHECK (bucket_id = 'messages');
```

### 3. Test the Setup

#### From Client (React Native):

```typescript
// The existing code in chat.tsx should work:
const handleImagePick = async () => {
  try {
    const image = await ImageService.pickImageFromGallery({
      allowsEditing: true,
      quality: 0.8,
    });
    
    if (!image) return;
    
    const imageFile: any = {
      uri: image.uri,
      type: image.type,
      name: image.name,
    };
    
    await ApiService.sendMessageWithImage(
      chatId,
      currentUser.username,
      inputText || '📷 Photo',
      imageFile
    );
  } catch (error) {
    console.error('Error uploading image:', error);
    Alert.alert('Error', 'Failed to upload image');
  }
};
```

#### From Server Test:

```javascript
// Test with curl
curl -X POST http://localhost:3000/messages/conversations/1/messages \
  -H "Content-Type: multipart/form-data" \
  -F "sender_username=testuser" \
  -F "content=Test image message" \
  -F "image=@/path/to/test-image.jpg"
```

### 4. Verify Upload Path

The server creates this storage path structure:
```
messages/
  └── conversations/
      └── {conversation_id}/
          └── {message_id}/
              └── {timestamp}_{filename}
```

Example:
```
messages/conversations/1/123/1703001234567_photo.jpg
```

### 5. Common Issues & Solutions

#### Issue: "Permission denied" error
**Solution:** Check storage policies allow INSERT for authenticated users

#### Issue: "Bucket not found" error
**Solution:** Verify bucket name matches server code (`messages` by default)

#### Issue: "File too large" error
**Solution:** 
- Supabase free tier: 50MB per file
- Check if image size exceeds limit
- The client validates 5MB limit in `ImageService.validateImageSize()`

#### Issue: Image uploads but URL doesn't load
**Solution:** 
- Verify bucket is set to **Public**
- Check SELECT policy allows public read
- Test URL directly in browser

### 6. Debug Steps

1. **Check server logs** when uploading:
```bash
# In server directory
npm run dev
# Try uploading an image and watch console output
```

2. **Verify Supabase connection**:
```javascript
// Test in server
const { data, error } = await supabase.storage.from('messages').list();
console.log('Bucket accessible:', !error);
```

3. **Check client-side FormData**:
```typescript
// Add logging in api.ts sendMessageWithImage
console.log('Uploading image:', {
  uri: image.uri,
  type: image.type,
  name: image.name
});
```

4. **Test with Postman**:
- Import the Postman collection
- Test the POST /messages/conversations/:id/messages endpoint
- Upload a file manually

### 7. Alternative: Change to Base64 (Not Recommended)

If storage upload continues to fail, you could store images as base64 in the database (not recommended for performance):

This would require significant server changes and is not scalable.

## Expected Behavior After Fix

1. User taps image icon in chat
2. Selects image from gallery
3. Loading indicator shows
4. Image uploads to Supabase storage
5. Message appears in chat with image thumbnail
6. Image is clickable to view full size

## Verification Checklist

- [ ] Supabase storage bucket created (`messages` or `chat-image`)
- [ ] Bucket is set to Public
- [ ] Storage policies configured (INSERT, SELECT, DELETE)
- [ ] Server uses correct bucket name
- [ ] Server restarted after any changes
- [ ] Test image upload from client
- [ ] Verify image URL is accessible
- [ ] Test on both iOS and Android (if applicable)

## Need More Help?

If images still don't upload:
1. Check Supabase logs in Dashboard
2. Enable detailed logging in server
3. Test upload directly via Supabase Dashboard → Storage
4. Verify your Supabase project credentials in `.env`
