# Hướng Dẫn Triển Khai - Sửa Lỗi Inbox & Hangout

## Tổng Quan
Hướng dẫn này giải thích cách triển khai các bản sửa lỗi cho cập nhật real-time của inbox và nút bật/tắt hiển thị trong hangout.

## Tóm Tắt Thay Đổi

### Phía Client (doAnCoSo4.1)
✅ Tất cả thay đổi đã được commit vào repository

**Các File Đã Thay Đổi:**
1. `src/services/api.ts` - Cải thiện mapping dữ liệu conversation
2. `app/(tabs)/inbox.tsx` - Đơn giản hóa inbox với cập nhật real-time tốt hơn
3. `app/(tabs)/hangout.tsx` - Thêm nút bật/tắt hiển thị
4. `package.json` - Thêm thư viện expo-linear-gradient

### Phía Server (doAnCoSo4.1.server)
⚠️ **QUAN TRỌNG**: Cần deploy thay đổi server thủ công

**File Đã Thay Đổi:**
- `routes/hangout.routes.js` - Sửa endpoint GET /hangouts

**Chi Tiết Thay Đổi Server:**
Endpoint GET /hangouts được cập nhật để lọc người dùng theo trạng thái availability.
Chỉ những user có `is_available: true` trong bảng `user_hangout_status` mới hiển thị trong hangout.

## Các Bước Triển Khai

### 1. Triển Khai Client (Mobile App)

```bash
# Di chuyển đến thư mục client
cd doAnCoSo4.1

# Cài đặt dependencies (expo-linear-gradient đã được thêm)
npm install

# Test app ở local trước
npm start

# Build cho production (khi sẵn sàng)
# Cho Expo Go:
npx expo publish

# Cho standalone apps:
eas build --platform all
```

### 2. Triển Khai Server

**Cách A: Cập Nhật File Thủ Công**
1. Copy file `routes/hangout.routes.js` đã cập nhật từ `/tmp/doAnCoSo4.1.server/` lên production server
2. Khởi động lại Node.js server

```bash
# SSH vào production server
ssh your-server

# Di chuyển đến thư mục server
cd doAnCoSo4.1.server

# Backup file hiện tại
cp routes/hangout.routes.js routes/hangout.routes.js.backup

# Upload file mới (dùng scp, ftp, hoặc git pull)
# Sau đó restart server
pm2 restart all
# HOẶC
npm run start
```

**Cách B: Deploy Qua Git**
1. Các thay đổi server đang ở `/tmp/doAnCoSo4.1.server/` (chưa commit vào git)
2. Bạn cần commit và push những thay đổi này vào server repository
3. Sau đó pull trên production server

```bash
# Trên máy development
cd /tmp/doAnCoSo4.1.server

# Add và commit thay đổi
git add routes/hangout.routes.js
git commit -m "Lọc người dùng hangout theo trạng thái availability"
git push origin main

# Trên production server
cd doAnCoSo4.1.server
git pull origin main
pm2 restart all
```

## Yêu Cầu Database

Đảm bảo database có bảng `user_hangout_status` với các trường:
- `username` (string, primary key hoặc unique)
- `is_available` (boolean)
- `current_activity` (string, optional)
- `activities` (array/json, optional)

Nếu bảng chưa tồn tại, tạo mới:

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

## Checklist Kiểm Tra

### Kiểm Tra Client
- [ ] Test inbox - xác nhận avatar và tên luôn hiển thị đúng
- [ ] Gửi tin nhắn giữa các user - xác nhận cập nhật real-time hoạt động
- [ ] Test nút bật/tắt hangout - xác nhận nó thay đổi status trong database
- [ ] Test upload ảnh background trong hangout
- [ ] Test vuốt trái (xem profile) và vuốt phải (next user)
- [ ] Xác nhận chỉ những user available mới xuất hiện trong hangout

### Kiểm Tra Server
- [ ] Test GET /hangouts - xác nhận chỉ trả về user available
- [ ] Test PUT /hangouts/status - xác nhận update user availability
- [ ] Test GET /hangouts/status/:username - xác nhận trả về user status
- [ ] Test POST /users/:userId/background-image - xác nhận upload hoạt động

## Biến Môi Trường

Đảm bảo các biến môi trường được thiết lập:

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

## Xử Lý Sự Cố

### Vấn đề: User không hiện trong hangout
**Giải pháp**: 
1. Kiểm tra user có `is_available: true` trong bảng `user_hangout_status`
2. Xác nhận user đang online (`is_online: true` trong bảng users)
3. Kiểm tra server logs để tìm lỗi

### Vấn đề: Inbox hiển thị "Direct Message" thay vì tên
**Giải pháp**:
1. Đảm bảo server trả về trường `other_participant`
2. Kiểm tra network tab để xác minh API response
3. Xóa cache app và reload

### Vấn đề: Cập nhật real-time không hoạt động
**Giải pháp**:
1. Xác nhận WebSocket connection đã được thiết lập
2. Kiểm tra cài đặt CORS cho phép WebSocket connections
3. Đảm bảo user được xác thực với token hợp lệ

### Vấn đề: Upload ảnh background thất bại
**Giải pháp**:
1. Xác nhận storage bucket `background-images` tồn tại trong Supabase
2. Kiểm tra quyền của bucket (phải là public)
3. Xác nhận kích thước file dưới 10MB
4. Kiểm tra server logs để xem lỗi chi tiết

## Kế Hoạch Rollback

Nếu có vấn đề trong production:

**Rollback Client:**
```bash
git revert HEAD~2  # Revert 2 commits cuối
npm install
npx expo publish
```

**Rollback Server:**
```bash
# Khôi phục backup
cp routes/hangout.routes.js.backup routes/hangout.routes.js
pm2 restart all
```

## Hỗ Trợ

Nếu có vấn đề hoặc câu hỏi:
1. Kiểm tra server logs: `pm2 logs`
2. Kiểm tra client logs trong Expo dev tools
3. Xem lại hướng dẫn này cho các vấn đề thường gặp
4. Liên hệ team phát triển

## Checklist Hoàn Thành

- [ ] Đã cài đặt client dependencies
- [ ] Đã test client ở local
- [ ] Đã deploy thay đổi server
- [ ] Đã xác nhận database schema
- [ ] Đã cấu hình biến môi trường
- [ ] Đã test tính năng real-time
- [ ] Đã test nút bật/tắt hangout
- [ ] Đã test upload background
- [ ] Đã bật production monitoring

---

**Ngày Triển Khai**: _________________

**Người Deploy**: _________________

**Ghi Chú**: _________________
