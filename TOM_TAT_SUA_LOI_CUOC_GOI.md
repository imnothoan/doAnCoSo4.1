# Tóm Tắt Sửa Lỗi Hệ Thống Cuộc Gọi

## Các Lỗi Đã Sửa

### 1. Hiển Thị Tên Trong Comment (Vấn đề #3)
**Vấn đề**: Comment đang hiển thị username thay vì tên thật của người dùng.

**Giải pháp**: 
- Cập nhật `components/posts/comments_sheet.tsx` để lấy và lưu trữ đầy đủ thông tin người dùng bao gồm tên và avatar
- Thay đổi tất cả hiển thị từ `author_username` sang trường `name` của người dùng
- Vẫn giữ username cho mục đích điều hướng (click vào tên sẽ chuyển đến profile)

**File đã sửa**:
- `components/posts/comments_sheet.tsx`

---

### 2. Hệ Thống Thông Báo Cuộc Gọi (Vấn đề #2)
**Vấn đề**: Khi bắt đầu cuộc gọi, người nhận không nhận được thông báo và không thấy giao diện cuộc gọi đến.

**Nguyên nhân chính**: 
CallingService đang thiết lập các event listener của WebSocket trong constructor của nó, được thực thi khi module được import lần đầu. Tại thời điểm đó, kết nối WebSocket chưa được thiết lập. Phương thức `on()` của WebSocketService sẽ không làm gì nếu `this.socket` là null, nên các listener không bao giờ được đăng ký thực sự.

**Giải pháp**:
1. Sửa đổi constructor của CallingService để kiểm tra xem WebSocket đã kết nối chưa
2. Nếu đã kết nối, thiết lập listener ngay lập tức
3. Nếu chưa kết nối, lắng nghe thay đổi trạng thái kết nối và thiết lập listener khi kết nối được thiết lập
4. Theo dõi trạng thái thiết lập listener để tránh đăng ký trùng lặp
5. Thiết lập lại listener khi kết nối lại

**File đã sửa**:
- `src/services/callingService.ts`
- `app/inbox/chat.tsx`

**Luồng hoạt động**:
```
Khởi động App → CallContext load → CallingService được import
          ↓
Kiểm tra nếu WebSocket đã kết nối
          ↓
Nếu CÓ: Thiết lập listener ngay lập tức
Nếu KHÔNG: Đợi kết nối
          ↓
User đăng nhập → WebSocket kết nối
          ↓
Callback kết nối được gọi → Thiết lập listener
```

---

### 3. Triển Khai Nhạc Chuông (Vấn đề #2)
**Trạng thái**: Đã được triển khai đúng, đã xác minh và cải thiện với logging.

**Triển khai**:
- Nhạc chuông phát chính xác 2 lần sử dụng `ringtoneService.ts`
- Sau 2 lần, callback được kích hoạt
- Đối với cuộc gọi đi: Tự động hết thời gian nếu không được trả lời
- Đối với cuộc gọi đến: Tự động từ chối nếu không được trả lời
- Nhạc chuông dừng khi cuộc gọi được chấp nhận, từ chối hoặc kết thúc

**File đã kiểm tra**:
- `src/services/ringtoneService.ts`

---

### 4. Hết Thời Gian Cuộc Gọi và Điều Hướng (Vấn đề #2)
**Trạng thái**: Đã được triển khai đúng.

**Triển khai**:
- Sau khi nhạc chuông phát 2 lần, nếu cuộc gọi không được trả lời, nó sẽ hết thời gian
- Trạng thái cuộc gọi được reset
- Modal được đóng
- Người dùng vẫn ở màn hình hiện tại (nếu đang trong chat, vẫn ở chat)
- Thông báo phù hợp được hiển thị cho người dùng

---

## Cải Tiến Bổ Sung

### Logging Nâng Cao
Thêm logging chi tiết xuyên suốt hệ thống cuộc gọi để dễ dàng debug:
- Prefix `[CallingService]` cho tất cả log của CallingService
- Prefix `[RingtoneService]` cho tất cả log của RingtoneService  
- Prefix `[CallContext]` cho tất cả log của CallContext

Log theo dõi:
- Thiết lập WebSocket listener
- Khởi tạo cuộc gọi
- Xử lý cuộc gọi đến
- Phát nhạc chuông và vòng lặp
- Chấp nhận/Từ chối/Hết thời gian cuộc gọi
- Phát và nhận sự kiện

### Xác Thực Kết Nối
Thêm kiểm tra kết nối WebSocket trước khi khởi tạo cuộc gọi:
- Kiểm tra xem WebSocket đã kết nối chưa trước khi cho phép khởi tạo cuộc gọi
- Hiển thị thông báo lỗi thân thiện với người dùng nếu không kết nối
- Tránh UX khó hiểu khi offline

---

## Danh Sách Kiểm Tra

Để xác minh tất cả các sửa lỗi hoạt động đúng:

### Hiển Thị Comment
- [ ] Mở một bài post có comment
- [ ] Xác minh comment hiển thị tên người dùng (không phải username)
- [ ] Xác minh click vào tên điều hướng đến profile người dùng
- [ ] Xác minh reply comment hiển thị tên đúng

### Luồng Cuộc Gọi - Gọi Đi
- [ ] Mở chat với người dùng khác (yêu cầu follow lẫn nhau)
- [ ] Click nút gọi thoại
- [ ] Xác minh nhạc chuông phát trên thiết bị người gọi
- [ ] Xác minh màn hình cuộc gọi đang hoạt động hiển thị
- [ ] Xác minh người nhận nhận được thông báo cuộc gọi đến
- [ ] Xác minh người nhận thấy modal cuộc gọi đến với nút chấp nhận/từ chối
- [ ] Test chấp nhận cuộc gọi
- [ ] Test từ chối cuộc gọi
- [ ] Test để chuông reo (2 vòng) không trả lời → nên hết thời gian

### Luồng Cuộc Gọi - Gọi Đến  
- [ ] Đăng nhập trên hai thiết bị/emulator
- [ ] Thiết bị A gọi Thiết bị B
- [ ] Xác minh Thiết bị B hiển thị modal cuộc gọi đến
- [ ] Xác minh nhạc chuông phát trên Thiết bị B
- [ ] Test chấp nhận cuộc gọi
- [ ] Test từ chối cuộc gọi
- [ ] Test bỏ qua cuộc gọi → nên tự động từ chối sau 2 vòng

### Cuộc Gọi Video
- [ ] Test luồng tương tự như trên nhưng với nút cuộc gọi video
- [ ] Xác minh loại cuộc gọi hiển thị là "Video Call" trong modal

### Trường Hợp Đặc Biệt
- [ ] Test gọi người không follow lẫn nhau → nên hiển thị lỗi
- [ ] Test gọi khi offline → nên hiển thị lỗi kết nối
- [ ] Test nhận cuộc gọi khi đang ở tab khác
- [ ] Test nhận cuộc gọi khi đang trong chat khác

---

## Hạn Chế Đã Biết

1. **Xử Lý Modal Trùng Lặp**: Cả CallContext và chat.tsx đều xử lý cuộc gọi đến. Điều này dư thừa nhưng không làm hỏng chức năng. Có thể đơn giản hóa trong tương lai.

2. **WebRTC Chưa Triển Khai**: Hệ thống cuộc gọi xử lý tín hiệu và UI, nhưng việc streaming audio/video thực tế qua WebRTC chưa được triển khai. Đây sẽ là tính năng chính tiếp theo.

3. **Lịch Sử Cuộc Gọi**: Không có lịch sử cuộc gọi hoặc thông báo cuộc gọi nhỡ được lưu trữ vĩnh viễn.

---

## Tổng Quan Kiến Trúc

### Các Component Cuộc Gọi
- `IncomingCallModal.tsx`: UI để nhận cuộc gọi (nút chấp nhận/từ chối)
- `ActiveCallScreen.tsx`: UI trong cuộc gọi đang hoạt động (tắt tiếng, bật/tắt video, kết thúc cuộc gọi)
- `callingService.ts`: Logic nghiệp vụ cho vòng đời cuộc gọi
- `ringtoneService.ts`: Phát nhạc chuông với kiểm soát vòng lặp
- `CallContext.tsx`: Context toàn cục để quản lý trạng thái cuộc gọi

### Luồng Cuộc Gọi
```
Người gọi                Server                    Người nhận
  |                         |                         |
  |--initiate_call--------->|                         |
  | (phát nhạc chuông)      |                         |
  |                         |--incoming_call--------->|
  |                         |                         | (hiện modal)
  |                         |                         | (phát nhạc chuông)
  |                         |                         |
  |                         |<-----accept_call--------|
  |<--call_accepted---------|                         |
  | (kết nối)               |                         | (kết nối)
  |                         |                         |
  |--end_call-------------->|                         |
  |                         |--call_ended------------>|
```

---

## Cấu Hình

### API URL
Thiết lập trong `.env`:
```
EXPO_PUBLIC_API_URL=http://192.168.1.228:3000
```

### File Nhạc Chuông
Vị trí: `assets/music/soundPhoneCall1.mp3`
Số vòng lặp: 2 lần
Thời lượng mỗi vòng: ~10-15 giây (ước tính)

---

## Cải Tiến Trong Tương Lai

1. **Triển Khai WebRTC**: Thêm streaming audio/video thực tế
2. **Lịch Sử Cuộc Gọi**: Lưu trữ nhật ký cuộc gọi trong database
3. **Push Notification**: Thông báo người dùng về cuộc gọi ngay cả khi app đã đóng
4. **Chất Lượng Cuộc Gọi**: Thêm chỉ báo chất lượng mạng
5. **Cuộc Gọi Nhóm**: Hỗ trợ cuộc gọi nhiều người
6. **Chia Sẻ Màn Hình**: Thêm chia sẻ màn hình cho cuộc gọi video
7. **Ghi Âm Cuộc Gọi**: Cho phép người dùng ghi lại cuộc gọi (với sự cho phép)
8. **Giảm Code Trùng Lặp**: Hợp nhất xử lý cuộc gọi chỉ sử dụng CallContext

---

## Kết Luận

Cả ba vấn đề chính đã được giải quyết:
1. ✅ Comment giờ hiển thị tên thay vì username
2. ✅ Thông báo cuộc gọi giờ hoạt động (đã sửa lỗi timing WebSocket listener)
3. ✅ Nhạc chuông phát 2 lần và tự động hết thời gian

Hệ thống cuộc gọi giờ nên hoạt động đúng cho việc tín hiệu cuộc gọi thoại/video cơ bản. Bước tiếp theo sẽ là triển khai WebRTC để streaming media thực tế.
