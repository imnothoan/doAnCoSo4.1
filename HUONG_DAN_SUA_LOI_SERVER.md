# Hướng Dẫn Sửa Lỗi Server - Cập Nhật Inbox Realtime

## Vấn Đề

Những người đã từng có cuộc hội thoại nhắn đến phần inbox hoạt động rất tốt, nhưng nếu có người lạ nhắn tin đến thì lại không hề xuất hiện.

## Nguyên Nhân

Lỗi nằm ở phần phát sóng tin nhắn qua WebSocket trong file `websocket.js` của server.

### Code Cũ (Bị Lỗi)

```javascript
// Ở dòng ~193 trong file websocket.js:
participants.forEach(p => {
  for (const [id, s] of io.sockets.sockets) {
    const sockUser = s.handshake.auth?.token; 
    if (sockUser === p.username) {  // ❌ LỖI: So sánh token với username
      s.emit("new_message", messagePayload);
    }
  }
});
```

### Tại Sao Lỗi?

1. `s.handshake.auth.token` = Token được mã hóa Base64 (ví dụ: "MToxNzAwMDAwMDAw")
2. `p.username` = Tên người dùng dạng text (ví dụ: "john123")
3. Hai giá trị này **KHÔNG BAO GIỜ** khớp nhau!
4. Kết quả: Tin nhắn không bao giờ được gửi đến người nhận đúng cách

### Tại Sao Vẫn "Hoạt Động" Với Cuộc Hội Thoại Cũ?

Vì có đoạn code dự phòng ở dòng 207:
```javascript
io.to(roomName).emit("new_message", messagePayload);
```

Code này phát sóng đến tất cả người đã ở trong room. NHƯNG với cuộc hội thoại MỚI, người dùng chưa join room nên không nhận được tin nhắn!

## Cách Sửa

### Bước 1: Lưu Username Vào Socket Object

Tìm dòng ~60 trong file `websocket.js`:

```javascript
// CODE CŨ:
currentUsername = data.username;
onlineUsers.set(currentUsername, socket.id);
```

Sửa thành:

```javascript
// CODE MỚI:
currentUsername = data.username;
// Lưu username vào socket object để dễ tra cứu
socket.username = currentUsername;
onlineUsers.set(currentUsername, socket.id);
```

### Bước 2: Sử Dụng Username Đã Lưu Để Tìm Socket

Tìm dòng ~193 trong file `websocket.js`:

```javascript
// CODE CŨ:
participants.forEach(p => {
  for (const [id, s] of io.sockets.sockets) {
    const sockUser = s.handshake.auth?.token; 
    if (sockUser === p.username) {
      s.emit("new_message", messagePayload);
    }
  }
});
```

Sửa thành:

```javascript
// CODE MỚI:
participants.forEach(p => {
  for (const [id, s] of io.sockets.sockets) {
    // Sử dụng username đã lưu trong socket object
    if (s.username === p.username) {  // ✅ ĐÚNG: So sánh username với username
      if (!s.rooms.has(roomName)) {
        s.join(roomName);
        console.log(`🔗 Auto-joined ${p.username} to room ${roomName}`);
      }
      s.emit("new_message", messagePayload);
      console.log(`📨 Sent message directly to ${p.username}`);
    }
  }
});
```

## Cách Áp Dụng Fix

### Cách 1: Sửa Thủ Công (Khuyến Nghị)

1. Mở terminal và đi đến thư mục server:
   ```bash
   cd đường/dẫn/đến/doAnCoSo4.1.server
   ```

2. Mở file `websocket.js` bằng editor

3. Tìm và sửa 2 đoạn code như hướng dẫn ở trên

4. Lưu file

5. Restart server:
   ```bash
   npm run dev
   ```

### Cách 2: Copy File Đã Fix

File `SERVER_FIX_websocket.js` trong repo này đã được sửa đầy đủ. Anh có thể:

1. Copy file này sang server repo:
   ```bash
   cp SERVER_FIX_websocket.js đường/dẫn/đến/doAnCoSo4.1.server/websocket.js
   ```

2. Restart server:
   ```bash
   cd đường/dẫn/đến/doAnCoSo4.1.server
   npm run dev
   ```

## Cách Test

### Test 1: Tin Nhắn Từ Người Lạ

1. **Chuẩn bị**:
   - Thiết bị A: Đăng nhập User A
   - Thiết bị B: Đăng nhập User B (chưa từng chat với User A)

2. **Thực hiện**:
   - Trên thiết bị A: Mở tab Inbox, giữ nguyên màn hình
   - Trên thiết bị B: Tìm User A trong Connections, nhấn nút Message
   - Trên thiết bị B: Gửi tin nhắn "Xin chào từ B"

3. **Kết quả mong đợi** ✅:
   - Inbox của thiết bị A **NGAY LẬP TỨC** hiện cuộc hội thoại mới với User B
   - Avatar hiện đúng của User B
   - Tên hiện đúng tên User B (KHÔNG phải "Direct Message" hay "User")
   - Tin nhắn cuối hiện "Xin chào từ B"
   - Có dấu chấm đỏ báo tin chưa đọc

4. **Hành vi cũ (bị lỗi)** ❌:
   - Inbox của thiết bị A KHÔNG cập nhật
   - User A phải tắt app rồi mở lại mới thấy tin nhắn

### Test 2: Nhiều Người Lạ Nhắn Cùng Lúc

1. **Chuẩn bị**:
   - Thiết bị A: Đăng nhập User A
   - Thiết bị B, C, D: Đăng nhập User B, C, D (tất cả đều chưa chat với A)

2. **Thực hiện**:
   - Trên thiết bị A: Mở Inbox, giữ nguyên
   - Trên thiết bị B, C, D: Đồng thời gửi tin nhắn đến User A

3. **Kết quả mong đợi** ✅:
   - Inbox của A hiện CẢ 3 cuộc hội thoại mới real-time
   - Mỗi cuộc hiện đúng avatar và tên
   - Tin nhắn xuất hiện ngay lập tức

### Test 3: Cuộc Hội Thoại Cũ (Kiểm Tra Không Bị Hỏng)

Đảm bảo những người đã từng chat vẫn nhận tin nhắn real-time bình thường.

## Giải Thích Kỹ Thuật

### Luồng WebSocket

1. **User B gửi tin nhắn đến User A** (lần đầu):
   ```
   Client B -> WebSocket -> Server
   ```

2. **Server xử lý**:
   ```
   1. Kiểm tra User B là thành viên conversation
   2. Lưu tin nhắn vào database
   3. Lấy thông tin đầy đủ của người gửi
   4. Tạo messagePayload với đầy đủ thông tin sender
   5. Tìm tất cả socket của các thành viên
   6. Gửi "new_message" trực tiếp đến socket của từng người
   7. Phát sóng vào room (dự phòng)
   ```

3. **User A nhận tin nhắn**:
   ```
   Server -> WebSocket -> Client A
   Client A: Cập nhật inbox với cuộc hội thoại mới
   ```

### Cấu Trúc Message Payload

Server gửi:
```javascript
{
  id: 123,
  conversation_id: 456,
  sender_username: "userB",
  message_type: "text",
  content: "Xin chào từ B",
  created_at: "2024-11-16T18:00:00Z",
  sender: {
    id: "uuid-123",
    username: "userB",
    name: "Tên User B",
    avatar: "https://...",
    email: "userb@example.com",
    country: "Vietnam",
    city: "Hanoi",
    status: "Chilling",
    bio: "...",
    age: 25,
    gender: "Male",
    interests: [...],
    is_online: true
  },
  chatId: 456,
  senderId: "userB",
  timestamp: "2024-11-16T18:00:00Z"
}
```

Client sử dụng `message.sender` để hiển thị avatar, tên, v.v.

## Kiểm Tra Fix Hoạt Động

Sau khi áp dụng fix, kiểm tra log của server sẽ thấy:

```
✅ User authenticated: userB
🔗 Auto-joined userA to room conversation_456
📨 Sent message directly to userA
Message sent in conversation 456 by userB
```

Những log này xác nhận:
1. Users được xác thực đúng
2. Sockets tự động join vào room
3. Tin nhắn được gửi trực tiếp đến socket của người nhận
4. Mọi thứ hoạt động đúng

## Xử Lý Lỗi Thường Gặp

### Vẫn Không Hoạt Động
- **Kiểm tra**: Đã restart server chưa?
- **Kiểm tra**: Cả 2 users đều online và kết nối WebSocket chưa?
- **Kiểm tra**: Server log có hiện "Auto-joined" không?

### Cuộc Hội Thoại Cũ OK, Mới Vẫn Lỗi
- **Nguyên nhân**: Server chưa restart, vẫn dùng code cũ
- **Giải pháp**: Restart server hoàn toàn

### Không Nhận Tin Nhắn Gì Cả
- **Kiểm tra**: WebSocket có kết nối không?
- **Kiểm tra**: Client log có "WebSocket connected" không?
- **Kiểm tra**: Server log có "User authenticated" không?

## Tóm Tắt

Fix rất đơn giản nhưng quan trọng:
1. Lưu `username` vào socket object khi xác thực
2. Dùng `username` đã lưu để tìm socket thay vì so sánh token

Điều này đảm bảo khi người lạ gửi tin nhắn:
1. Server tìm đúng socket của người nhận
2. Server gửi tin nhắn trực tiếp đến socket đó
3. Client nhận tin nhắn ngay lập tức
4. Inbox cập nhật real-time với thông tin đúng

Fix này:
- ✅ **Tối thiểu**: Chỉ sửa logic WebSocket emission
- ✅ **An toàn**: Không thay đổi database, API, hay client code
- ✅ **Hiệu quả**: Giải quyết hoàn toàn vấn đề

## File Liên Quan

1. `SERVER_FIX_websocket.js` - File websocket.js đã sửa hoàn chỉnh
2. `SERVER_FIX_INSTRUCTIONS.md` - Hướng dẫn chi tiết bằng tiếng Anh

---

**Người thực hiện**: GitHub Copilot
**Ngày**: 16/11/2024
**Vấn đề**: Inbox realtime updates cho cuộc hội thoại mới
**Trạng thái**: ✅ ĐÃ SỬA
