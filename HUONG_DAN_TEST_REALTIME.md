# Hướng Dẫn Kiểm Tra Tính Năng Real-time

## Chuẩn Bị

### Server
1. Đảm bảo server đang chạy: `cd doAnCoSo4.1.server && npm start`
2. Kiểm tra địa chỉ IP của server (ví dụ: `192.168.1.228:3000`)

### Client
1. Cập nhật file `.env` với địa chỉ server:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.1.228:3000
   ```
2. Cài đặt: `npm install`
3. Chạy app: `npm start`
4. Quét QR code trên 2 điện thoại khác nhau

## Kiểm Tra Nhanh

### 1. WebSocket Kết Nối Liên Tục ✅

**Cách kiểm tra:**
- Đăng nhập vào app
- Chuyển qua lại giữa các tab
- Không thấy thông báo "Reconnecting..." = thành công

**Dấu hiệu WebSocket đã kết nối:**
- App hoạt động mượt mà
- Tin nhắn gửi/nhận ngay lập tức
- Không có thanh đỏ "Reconnecting..." ở trên cùng

### 2. Inbox Cập Nhật Real-time ✅

**Cách test với 2 điện thoại:**

1. **Điện thoại 1 (User A):**
   - Đăng nhập tài khoản A
   - Vào tab Connection
   - Tìm User B
   - Nhấn nút "Message"
   - Gửi tin nhắn: "Chào em"

2. **Điện thoại 2 (User B):**
   - Đăng nhập tài khoản B
   - Vào tab Inbox
   - **KHÔNG CẦN KÉO ĐỂ REFRESH**
   - Tin nhắn từ User A sẽ xuất hiện ngay lập tức
   - Tên người gửi hiển thị đúng (không phải "Direct Message")
   - Số tin nhắn chưa đọc tăng lên

3. **Điện thoại 2 (User B):**
   - Nhấn vào cuộc trò chuyện với User A
   - Trả lời: "Chào anh"

4. **Điện thoại 1 (User A):**
   - **KHÔNG CẦN LÀM GÌ**
   - Tin nhắn trả lời xuất hiện ngay trong chat

**Kết quả mong đợi:**
- ✅ Tin nhắn xuất hiện ngay lập tức trên cả 2 điện thoại
- ✅ Danh sách inbox tự động cập nhật
- ✅ Tên người gửi hiển thị đúng
- ✅ Số tin nhắn chưa đọc chính xác

### 3. Hang Out - Tìm Người Dùng Khác ✅

**Vấn đề cũ:** "No more users online" luôn xuất hiện
**Đã sửa:** Bây giờ sẽ thấy người dùng khác nếu họ online và bật hiển thị

**Cách test:**

1. **Điện thoại 1 (User A):**
   - Vào tab Hang Out
   - Nếu hỏi, nhấn "Enable" để bật hiển thị
   - Xác nhận nút "Visible" màu xanh
   - Header hiển thị: "🟢 You're visible to others"

2. **Điện thoại 2 (User B):**
   - Vào tab Hang Out
   - Bật hiển thị (nếu được hỏi)
   - **ĐỢI TỐI ĐA 30 GIÂY** để auto-refresh

3. **Kiểm tra:**
   - Điện thoại 1 sẽ thấy User B trong danh sách
   - Điện thoại 2 sẽ thấy User A trong danh sách
   - Vuốt trái để xem profile
   - Vuốt phải để next

**Quan trọng:**
- ✅ CẢ HAI người dùng phải ONLINE (đăng nhập app)
- ✅ CẢ HAI phải BẬT HIỂN THỊ (nút "Visible" màu xanh)
- ✅ Đợi 30 giây để danh sách tự động refresh

**Nếu vẫn không thấy:**
1. Kiểm tra cả 2 điện thoại đã đăng nhập
2. Kiểm tra cả 2 đều bật "Visible"
3. Kéo xuống để refresh thủ công
4. Kiểm tra console log để xem có bao nhiêu users

### 4. Tắt Hiển Thị Trong Hang Out

**Cách test:**
1. User A nhấn nút "Visible" để chuyển sang "Hidden"
2. Đợi 30 giây
3. User B sẽ KHÔNG còn thấy User A
4. User A nhấn "Hidden" để bật lại
5. Đợi 30 giây
6. User B lại thấy User A

## Tính Năng Mới

### 1. Thanh Trạng Thái Kết Nối

- Khi WebSocket mất kết nối: thanh đỏ "Reconnecting..." xuất hiện ở trên
- Khi kết nối lại: thanh tự động biến mất
- Nếu luôn thấy thanh đỏ: kiểm tra server có đang chạy không

### 2. Tự Động Kết Nối Lại

- Khi mở app từ background: tự động kết nối lại WebSocket
- Khi mất mạng rồi có lại: tự động kết nối lại
- Khi kết nối lại: tự động tham gia lại các cuộc trò chuyện đang mở

### 3. Typing Indicator (Đang Gõ...)

**Cách test:**
1. User A và User B mở cùng 1 cuộc trò chuyện
2. User A bắt đầu gõ
3. User B sẽ thấy "User A đang gõ..."
4. User A ngừng gõ
5. Sau 2 giây, chữ "đang gõ" biến mất

## Debug Khi Có Vấn Đề

### Kiểm Tra WebSocket

**Trên app:**
1. Mở React Native Debugger
2. Xem Console
3. Tìm các dòng log:
   - `🔌 Connecting to WebSocket:`
   - `✅ WebSocket connected successfully`
   - `📥 Joined conversation:`
   - `📨 New message received in inbox:`

**Trên server:**
1. Xem terminal đang chạy server
2. Tìm các dòng:
   - `🔌 WebSocket client connected:`
   - `✅ [username] marked as online`
   - `Message sent in conversation`

### Các Vấn Đề Thường Gặp

**1. Tin nhắn không real-time:**
- Kiểm tra thanh "Reconnecting..." có xuất hiện không
- Restart app
- Kiểm tra server đang chạy
- Kiểm tra địa chỉ IP trong .env đúng chưa

**2. Không thấy user trong Hang Out:**
- Đảm bảo CẢ HAI user đã đăng nhập
- Đảm bảo CẢ HAI đã bật "Visible"
- Đợi 30 giây hoặc kéo xuống refresh
- Kiểm tra cả 2 điện thoại cùng mạng WiFi và server accessible

**3. Tên hiển thị "Direct Message":**
- Đã fix trong version mới
- Đảm bảo đã pull code mới nhất
- Clear cache và rebuild app

**4. WebSocket cứ disconnect:**
- Kiểm tra server có bị crash không
- Kiểm tra firewall/network
- Kiểm tra CORS settings trên server

## Test Toàn Diện - 10 Phút

Dành 10 phút test theo thứ tự:

1. **Phút 1-2:** Đăng nhập 2 điện thoại
   - ✅ WebSocket connected
   - ✅ Không có thanh đỏ "Reconnecting"

2. **Phút 3-5:** Test Inbox
   - ✅ Gửi tin nhắn từ A → B (real-time)
   - ✅ Trả lời từ B → A (real-time)
   - ✅ Danh sách inbox tự cập nhật
   - ✅ Tên hiển thị đúng

3. **Phút 6-8:** Test Hang Out
   - ✅ Bật visibility cả 2 user
   - ✅ Thấy nhau trong danh sách
   - ✅ Tắt visibility → không thấy
   - ✅ Bật lại → thấy trở lại

4. **Phút 9:** Test App Background
   - ✅ Minimize app 30 giây
   - ✅ Mở lại, WebSocket tự kết nối
   - ✅ Gửi tin nhắn vẫn real-time

5. **Phút 10:** Test Typing
   - ✅ Gõ tin nhắn, bên kia thấy "đang gõ"
   - ✅ Ngừng gõ, chữ biến mất

## Hoàn Thành ✅

Nếu tất cả các test trên đều pass:
- 🎉 Tính năng real-time hoạt động hoàn hảo
- 🎉 Inbox cập nhật ngay lập tức
- 🎉 Hang Out cho phép tìm người dùng
- 🎉 WebSocket kết nối ổn định

## Liên Hệ Hỗ Trợ

Nếu có vấn đề:
1. Chụp màn hình lỗi
2. Copy console logs
3. Ghi lại các bước tái hiện lỗi
4. Báo cáo chi tiết để được hỗ trợ
