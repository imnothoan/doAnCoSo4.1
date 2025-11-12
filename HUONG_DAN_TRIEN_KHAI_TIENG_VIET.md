# Hướng Dẫn Triển Khai Tính Năng Hangout và Inbox - Tiếng Việt

## Tổng Quan

Đã hoàn thành việc cập nhật ứng dụng ConnectSphere với hai tính năng chính:

### 1. ✅ Inbox Real-time (Giống Facebook Messenger)

**Tính năng đã có sẵn và hoạt động tốt:**
- ✅ WebSocket đã được tích hợp để cập nhật tin nhắn ngay lập tức
- ✅ Danh sách cuộc trò chuyện tự động cập nhật khi có tin nhắn mới
- ✅ Hiển thị người dùng đang gõ (typing indicators)
- ✅ Tin nhắn được gửi và nhận ngay lập tức
- ✅ Đếm số tin nhắn chưa đọc
- ✅ Tự động đánh dấu tin nhắn đã đọc

**Không cần thay đổi gì thêm** - tính năng Inbox đã hoạt động như yêu cầu!

### 2. ✅ Hangout Tinder-like (Kiểu Tinder)

**Tính năng đã được triển khai:**
- ✅ Giao diện thẻ (card) giống Tinder
- ✅ **Vuốt trái (←)** = Xem profile người dùng
- ✅ **Vuốt phải (→)** = Chuyển sang người tiếp theo
- ✅ Nút X (đỏ) = Xem profile
- ✅ Nút ✓ (xanh) = Người tiếp theo
- ✅ Gradient đen ở phía dưới để hiển thị thông tin rõ hơn
- ✅ Chỉ hiển thị người dùng đang online
- ✅ Hỗ trợ upload ảnh nền (background image)
- ✅ Tự động tải lại danh sách khi quay lại màn hình

## Những Gì Cần Làm Trên Server

### Bước 1: Cập Nhật Database (Supabase)

Chạy câu lệnh SQL này trong Supabase SQL Editor:

```sql
-- Thêm cột background_image vào bảng users
ALTER TABLE users ADD COLUMN IF NOT EXISTS background_image TEXT;

-- Tạo index để tăng tốc truy vấn
CREATE INDEX IF NOT EXISTS idx_users_background_image ON users(background_image) WHERE background_image IS NOT NULL;
```

### Bước 2: Tạo Supabase Storage Bucket

#### Cách 1: Qua Supabase Dashboard (Khuyến nghị)

1. Đăng nhập vào Supabase Dashboard
2. Chọn dự án của bạn
3. Vào **Storage** (thanh bên trái)
4. Click **"Create a new bucket"**
5. Đặt tên bucket: `background-images`
6. Chọn **Public bucket** (để ảnh có thể truy cập công khai)
7. File size limit: `10485760` (10MB)
8. Click **Create bucket**

#### Cách 2: Qua Code

Thêm đoạn code này vào file khởi tạo server:

```javascript
const { supabase } = require('./db/supabaseClient');

// Tạo bucket cho background images
async function createBackgroundImagesBucket() {
  const { data, error } = await supabase
    .storage
    .createBucket('background-images', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg']
    });

  if (error && error.message !== 'Bucket already exists') {
    console.error('Error creating bucket:', error);
  } else {
    console.log('Background images bucket ready!');
  }
}

createBackgroundImagesBucket();
```

### Bước 3: Thêm Endpoint Upload Background Image

Thêm route này vào file `routes/user.routes.js`:

```javascript
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// POST /users/:userId/background-image
router.post("/:userId/background-image", upload.single("background_image"), async (req, res) => {
  try {
    const { userId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Không có file được upload" });
    }

    // Upload lên Supabase Storage
    const fileName = `${userId}-${Date.now()}.${file.mimetype.split('/')[1]}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("background-images")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      console.error("Lỗi upload:", uploadError);
      return res.status(500).json({ message: "Upload ảnh thất bại" });
    }

    // Lấy public URL
    const { data: publicUrlData } = supabase.storage
      .from("background-images")
      .getPublicUrl(fileName);

    const backgroundImageUrl = publicUrlData.publicUrl;

    // Cập nhật record user
    const { error: updateError } = await supabase
      .from("users")
      .update({ background_image: backgroundImageUrl })
      .eq("id", userId);

    if (updateError) {
      console.error("Lỗi cập nhật:", updateError);
      return res.status(500).json({ message: "Cập nhật profile thất bại" });
    }

    res.json({ backgroundImageUrl });
  } catch (error) {
    console.error("Lỗi upload background image:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});
```

### Bước 4: Cập Nhật Endpoints Trả Về background_image

#### Trong `routes/user.routes.js`:

Đảm bảo tất cả endpoints trả về user data đều bao gồm `background_image`:

```javascript
// GET /users/:username hoặc /users/username/:username
router.get("/username/:username", async (req, res) => {
  try {
    const { username } = req.params;
    
    const { data: user, error } = await supabase
      .from("users")
      .select(`
        *,
        background_image
      `)
      .eq("username", username)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});
```

#### Trong `routes/hangout.routes.js`:

Cập nhật endpoint `/hangouts` để trả về `background_image`:

```javascript
// GET /hangouts
router.get("/", async (req, res) => {
  try {
    const { languages, distance_km, user_lat, user_lng, limit = 50 } = req.query;

    // Query cho users đang online và available for hangout
    let query = supabase
      .from("users")
      .select(`
        id,
        username,
        name,
        email,
        avatar,
        background_image,
        country,
        city,
        age,
        bio,
        interests,
        is_online,
        latitude,
        longitude,
        status,
        current_activity
      `)
      .eq("is_online", true);

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data: users, error } = await query;

    if (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ message: "Lỗi lấy danh sách users" });
    }

    // Map users để giữ backward compatibility
    const hangoutUsers = users.map(user => ({
      ...user,
      user: user, // Để tương thích với code cũ
    }));

    res.json(hangoutUsers);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});
```

### Bước 5: Kiểm Tra và Khởi Động Lại Server

```bash
# Trong thư mục server
cd /path/to/server

# Cài đặt dependencies nếu cần
npm install

# Khởi động server
npm run dev
# hoặc
npm start
```

## Cách Sử Dụng

### Người Dùng Upload Background Image:

1. Mở app
2. Vào tab **Hang Out**
3. Click vào icon **hình ảnh** (📷) ở góc trên bên phải
4. Chọn ảnh từ thư viện
5. Ảnh sẽ được upload và hiển thị cho người khác khi họ xem profile bạn trong Hangout

### Xem và Tương Tác với Người Dùng Online:

1. Vào tab **Hang Out**
2. Bạn sẽ thấy các thẻ (cards) của người dùng đang online
3. **Vuốt trái (hoặc nhấn nút X đỏ)**: Xem profile chi tiết
4. **Vuốt phải (hoặc nhấn nút ✓ xanh)**: Chuyển sang người tiếp theo
5. Ảnh nền (background image) sẽ hiển thị nếu người dùng đã upload
6. Nếu không có ảnh nền, sẽ hiển thị avatar thay thế

## Kiểm Tra Hoạt Động

### 1. Test Upload Background Image:

```bash
curl -X POST http://localhost:3000/users/{userId}/background-image \
  -F "background_image=@/path/to/image.jpg"
```

Response mong đợi:
```json
{
  "backgroundImageUrl": "https://your-supabase-url.supabase.co/storage/v1/object/public/background-images/..."
}
```

### 2. Test Hangout Endpoint:

```bash
curl http://localhost:3000/hangouts?limit=10
```

Kiểm tra response có chứa `background_image` field:
```json
[
  {
    "id": "...",
    "username": "user1",
    "name": "User One",
    "avatar": "...",
    "background_image": "https://...",
    "is_online": true,
    ...
  }
]
```

### 3. Kiểm Tra Database:

```sql
SELECT username, background_image 
FROM users 
WHERE background_image IS NOT NULL 
LIMIT 5;
```

## Lưu Ý Quan Trọng

### WebSocket (Inbox Real-time)

WebSocket đã được cấu hình sẵn và hoạt động tốt. Đảm bảo:
- Server WebSocket đang chạy cùng port với HTTP server (đã có sẵn trong `index.js`)
- Biến môi trường `EXPO_PUBLIC_API_URL` trong client trỏ đúng địa chỉ server
- Users có thể kết nối qua WebSocket để nhận tin nhắn real-time

### Storage & Performance

1. **Giới hạn kích thước ảnh**: Hiện tại là 10MB
2. **Format hỗ trợ**: JPG, JPEG, PNG
3. **Tối ưu hóa ảnh** (khuyến nghị):
   - Resize ảnh về kích thước phù hợp (ví dụ: 1080x1920 cho ảnh dọc)
   - Nén ảnh để giảm dung lượng
   - Có thể dùng thư viện như `sharp` hoặc `jimp` để xử lý

### Bảo Mật

1. **Xác thực**: Thêm middleware xác thực cho endpoint upload
2. **Validate file**: Kiểm tra loại file và kích thước
3. **Rate limiting**: Giới hạn số lần upload của mỗi user
4. **Scan virus**: Nên thêm virus scanning cho file upload

Example middleware xác thực:

```javascript
const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  // Verify token và lấy user info
  // ... your auth logic
  
  next();
};

// Sử dụng:
router.post("/:userId/background-image", 
  authenticateUser,
  upload.single("background_image"), 
  async (req, res) => {
    // ...
  }
);
```

## Troubleshooting

### Vấn đề: Không upload được ảnh

**Giải pháp:**
1. Kiểm tra Supabase Storage bucket đã được tạo chưa
2. Kiểm tra bucket có public không
3. Xem log server để tìm lỗi cụ thể
4. Kiểm tra CORS settings trong Supabase

### Vấn đề: Ảnh không hiển thị

**Giải pháp:**
1. Kiểm tra URL ảnh có hợp lệ không
2. Kiểm tra bucket có public không
3. Thử truy cập trực tiếp URL ảnh qua browser
4. Kiểm tra database có lưu đúng URL không

### Vấn đề: WebSocket không kết nối

**Giải pháp:**
1. Kiểm tra server có đang chạy không
2. Kiểm tra CORS settings
3. Kiểm tra firewall/network
4. Xem log trong client và server
5. Thử kết nối bằng tool như `wscat`

## Liên Hệ & Hỗ Trợ

Nếu gặp vấn đề, hãy:
1. Kiểm tra server logs
2. Kiểm tra Supabase logs
3. Xem file `SERVER_CHANGES_NEEDED.md` (bản tiếng Anh) để biết thêm chi tiết
4. Test từng endpoint riêng lẻ để xác định vấn đề

## Tổng Kết

**Đã hoàn thành:**
- ✅ Client code đã được cập nhật hoàn chỉnh
- ✅ Inbox real-time đã hoạt động tốt (không cần thay đổi)
- ✅ Hangout UI kiểu Tinder đã được triển khai
- ✅ Hỗ trợ upload và hiển thị background image

**Cần làm trên server:**
1. Thêm cột `background_image` vào database
2. Tạo bucket `background-images` trong Supabase Storage
3. Thêm endpoint upload background image
4. Cập nhật các endpoint trả về user data

Sau khi hoàn thành các bước trên server, tính năng sẽ hoạt động đầy đủ! 🎉
