# Hướng Dẫn Sửa Lỗi ConnectSphere - Tiếng Việt

## Tổng Quan

Tài liệu này mô tả các lỗi đã được sửa trong ứng dụng ConnectSphere client và những thay đổi cần thiết ở server.

---

## ✅ Đã Sửa Xong (Client)

### 1. Lỗi Routing "Unmatched Route"

**Vấn đề**: Khi bấm vào conversation trong inbox, bị lỗi "Unmatched Route"

**Nguyên nhân**: 
- File `chat.tsx`, `edit-profile.tsx` và các file khác bị đặt sai thư mục
- Routing configuration không khớp với vị trí file thực tế

**Đã sửa**:
- ✅ Di chuyển tất cả file về đúng vị trí như thiết kế ban đầu của bạn
- ✅ Cập nhật `app/_layout.tsx` để routing hoạt động đúng
- ✅ Đảm bảo navigation từ inbox sang chat hoạt động bình thường

---

### 2. Inbox - Avatar và Tên Người Dùng Hiển Thị Sai

**Vấn đề**: 
- Đôi khi inbox hiển thị avatar mặc định thay vì avatar thật
- Tên hiển thị là "Unknown User" hoặc không chính xác
- Không luôn hiển thị thông tin của người đối thoại

**Nguyên nhân**:
- Danh sách participants trong conversation đôi khi không đầy đủ
- Khi nhận tin nhắn mới qua WebSocket, không có đủ thông tin sender
- Logic hiển thị không có fallback tốt

**Đã sửa**:
- ✅ Cải thiện `renderChatItem()` để sử dụng `lastMessage.sender` làm fallback
- ✅ Nâng cấp `handleNewMessage()` trong WebSocket handler để:
  - Lưu giữ thông tin sender từ participants hiện có
  - Tạo User object đầy đủ với tất cả fields bắt buộc
  - Sử dụng cấu trúc dữ liệu fallback khi không tìm thấy sender
- ✅ Logic hiển thị tên với nhiều fallback: `name → username → item.name → 'Unknown User'`

**File đã sửa**: `app/(tabs)/inbox.tsx`

---

### 3. Inbox - Cập Nhật Real-time

**Vấn đề**: Inbox không cập nhật real-time như Messenger

**Đã cải thiện**:
- ✅ WebSocket handler đã được tối ưu để cập nhật conversation list ngay lập tức
- ✅ Tự động tăng unread count khi có tin nhắn mới từ người khác
- ✅ Di chuyển conversation lên đầu danh sách khi có tin nhắn mới
- ✅ Giữ nguyên thông tin sender khi cập nhật

**Lưu ý**: Để hoạt động hoàn hảo, cần sửa server (xem phần Server bên dưới)

---

### 4. Hangout Feature

**Trạng thái hiện tại**:
- ✅ Nút toggle visibility (bật/tắt tham gia) đã hoạt động
- ✅ Swipe left để xem profile người khác
- ✅ Swipe right để xem người tiếp theo
- ✅ Upload ảnh background đã hoạt động
- ✅ Lọc chỉ hiển thị user online (client-side)

**Vấn đề còn lại**: Server chưa lọc theo `is_available` status (xem phần Server)

---

## ⚠️ Cần Sửa Server

Các vấn đề sau cần sửa trong repository server: https://github.com/imnothoan/doAnCoSo4.1.server

### 1. Hangout - Lọc theo Trạng Thái Available (ƯU TIÊN CAO)

**File**: `routes/hangout.routes.js` (dòng 169-247)

**Vấn đề**: 
Endpoint `/hangouts` trả về TẤT CẢ user online, kể cả những user đã tắt hangout visibility. Nút toggle trên client hoạt động nhưng không thực sự ẩn user khỏi danh sách.

**Cách sửa**:
Thêm filter để chỉ lấy user có `is_available = true` trong bảng `user_hangout_status`.

```javascript
// Thêm đoạn code này vào đầu hàm
const { data: availableStatuses } = await supabase
  .from("user_hangout_status")
  .select("username")
  .eq("is_available", true);

const availableUsernames = availableStatuses?.map(s => s.username) || [];

// Sau đó thêm filter vào query users
let query = supabase
  .from("users")
  .select(`...`)
  .eq("is_online", true)
  .in("username", availableUsernames);  // ← THÊM DÒNG NÀY
```

Chi tiết đầy đủ xem file `SERVER_FIXES_NEEDED.md`

---

### 2. WebSocket - Gửi Thông Tin Sender Đầy Đủ (ƯU TIÊN CAO)

**File**: `websocket.js` (dòng 124-175)

**Vấn đề**:
Khi emit tin nhắn mới qua WebSocket, chỉ gửi dữ liệu message cơ bản, không có profile của sender (name, avatar). Làm inbox hiển thị "Unknown User" hoặc avatar mặc định.

**Cách sửa**:
Khi insert message, join với bảng users để lấy thông tin sender:

```javascript
const { data: message, error } = await supabase
  .from("messages")
  .insert([...])
  .select(`
    id,
    conversation_id,
    sender_username,
    message_type,
    content,
    reply_to_message_id,
    created_at,
    updated_at,
    sender:users!messages_sender_username_fkey(id, username, name, avatar, email)
  `)
  .single();
```

Chi tiết đầy đủ xem file `SERVER_FIXES_NEEDED.md`

---

### 3. User Profile Update - Error Handling (ƯU TIÊN TRUNG BÌNH)

**File**: `routes/user.routes.js` (dòng 240-245)

**Vấn đề**: 
Khi update user không tồn tại, trả về lỗi 500 thay vì 404.

**Cách sửa**:
Đổi `.single()` thành `.maybeSingle()` và kiểm tra kết quả.

Chi tiết xem file `SERVER_FIXES_NEEDED.md`

---

## 📋 Checklist Test

### Test Inbox
- [ ] Gửi tin nhắn từ user A đến user B
- [ ] User B thấy tin nhắn real-time trong inbox
- [ ] Avatar của user A hiển thị đúng
- [ ] Tên của user A hiển thị đúng (không phải "Unknown User")
- [ ] Unread count tăng lên
- [ ] Conversation di chuyển lên đầu danh sách
- [ ] Bấm vào conversation, mở chat screen thành công
- [ ] Messages trong chat hiển thị đầy đủ

### Test Hangout
- [ ] User A bật hangout visibility
- [ ] User B thấy user A trong danh sách hangout
- [ ] User A tắt hangout visibility  
- [ ] User B KHÔNG còn thấy user A trong danh sách
- [ ] Chỉ user có `is_available = true` xuất hiện
- [ ] Background image hiển thị đúng
- [ ] Swipe left xem profile
- [ ] Swipe right sang người tiếp theo
- [ ] Test với 2 điện thoại (Expo Go) cùng lúc

---

## 🔧 Cách Deploy Changes

### Client (repository này)
```bash
# Đã commit và push lên branch
git pull origin copilot/fix-inbox-realtime-updates-again

# Test với Expo
npm install
npx expo start
```

### Server (cần update riêng)
1. Clone server repo: `git clone https://github.com/imnothoan/doAnCoSo4.1.server.git`
2. Áp dụng các fix trong `SERVER_FIXES_NEEDED.md`
3. Test server locally
4. Deploy server lên production

---

## 📝 Ghi Chú

- Client code đã sẵn sàng để nhận dữ liệu đúng format từ server
- Các fix server là BẮT BUỘC để tính năng hoạt động đúng như mô tả
- Sau khi sửa server, test kỹ với 2+ devices để đảm bảo real-time sync hoạt động

---

## 🆘 Hỗ Trợ

Nếu có vấn đề, kiểm tra:
1. Console logs trong app (Expo)
2. Server logs  
3. Network requests trong React Native Debugger
4. WebSocket connections trong browser DevTools

Chi tiết kỹ thuật đầy đủ bằng tiếng Anh trong file `SERVER_FIXES_NEEDED.md`
