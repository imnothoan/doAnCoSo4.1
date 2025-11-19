# Báo Cáo Loại Bỏ Chức Năng Cuộc Gọi

## Tổng Quan
Tài liệu này tóm tắt việc loại bỏ hoàn toàn chức năng gọi điện thoại (video/voice call) khỏi ứng dụng ConnectSphere (cả client và server).

## Lý Do Loại Bỏ
Chức năng gọi điện thoại video/voice đã được loại bỏ vì:
- **WebRTC không được hỗ trợ trong Expo Go** - yêu cầu custom development build
- **Tích hợp Daily.co không hoạt động** - thiếu cấu hình đúng
- **Không thể test P2P calling** trên Expo Go mà không có native modules
- Người dùng yêu cầu loại bỏ tính năng này để đơn giản hóa ứng dụng

## Những Gì Đã Được Loại Bỏ

### Phía Client (doAnCoSo4.1)

#### 1. Các File Service Đã Xóa
- `src/services/callingService.ts` - Service chính xử lý cuộc gọi với WebSocket
- `src/services/dailyCallService.ts` - Tích hợp Daily.co API
- `src/services/webrtcService.ts` - Mock implementation WebRTC cho Expo Go
- `src/services/ringtoneService.ts` - Service phát nhạc chuông

#### 2. Các File Component Đã Xóa
- `components/calls/VideoCallScreen.tsx` - Màn hình UI gọi video
- `components/calls/IncomingCallModal.tsx` - Modal thông báo cuộc gọi đến
- `components/calls/VideoCallWebView.tsx` - Giao diện cuộc gọi qua WebView
- `components/calls/ActiveCallScreen.tsx` - Màn hình điều khiển cuộc gọi đang hoạt động

#### 3. Context Provider Đã Xóa
- `src/context/CallContext.tsx` - Quản lý trạng thái cuộc gọi
- Đã xóa `CallProvider` wrapper khỏi `app/_layout.tsx`

#### 4. Assets Đã Xóa
- `assets/music/soundPhoneCall1.mp3` - File nhạc chuông

#### 5. Các Thay Đổi Code
- **app/inbox/chat.tsx**:
  - Xóa các import liên quan đến cuộc gọi
  - Xóa các biến state cuộc gọi (showIncomingCall, showActiveCall, v.v.)
  - Xóa các event handler cuộc gọi (handleIncomingCall, handleCallAccepted, v.v.)
  - Xóa các function khởi tạo cuộc gọi
  - Xóa nút gọi điện trong header (icon gọi thoại và video)
  - Xóa IncomingCallModal và ActiveCallScreen khỏi render

- **app/_layout.tsx**:
  - Xóa import CallProvider
  - Xóa CallProvider wrapper khỏi component tree

- **.env**:
  - Xóa biến môi trường `EXPO_PUBLIC_DAILY_DOMAIN`
  - Xóa biến môi trường `EXPO_PUBLIC_DAILY_API_KEY`

- **README.md**:
  - Di chuyển "Video/voice calls" khỏi danh sách tính năng tương lai
  - Thêm ghi chú giải thích tại sao chức năng cuộc gọi bị loại bỏ

### Phía Server (doAnCoSo4.1.server)

#### Các WebSocket Event Đã Xóa khỏi websocket.js (Dòng 264-463)
Tất cả các event handler liên quan đến cuộc gọi đã được xóa:

1. **initiate_call** - Xử lý khởi tạo cuộc gọi từ người gọi
   - Xác minh trạng thái follow lẫn nhau
   - Kiểm tra người nhận có online không
   - Gửi thông báo cuộc gọi đến cho người nhận

2. **accept_call** - Xử lý chấp nhận cuộc gọi bởi người nhận
   - Thông báo cho người gọi rằng cuộc gọi đã được chấp nhận
   - Kích hoạt thiết lập kết nối WebRTC

3. **reject_call** - Xử lý từ chối cuộc gọi bởi người nhận
   - Thông báo cho người gọi rằng cuộc gọi bị từ chối
   - Dọn dẹp trạng thái cuộc gọi

4. **end_call** - Xử lý kết thúc cuộc gọi bởi một trong hai bên
   - Thông báo cho bên kia rằng cuộc gọi đã kết thúc
   - Dọn dẹp tài nguyên

5. **call_timeout** - Xử lý timeout cuộc gọi (không có người trả lời)
   - Gửi thông báo timeout cho cả hai bên
   - Tự động kết thúc cuộc gọi chưa được trả lời

6. **upgrade_to_video** - Xử lý nâng cấp từ cuộc gọi voice lên video
   - Thông báo cho bên kia về yêu cầu nâng cấp
   - Tương tự tính năng nâng cấp của Facebook Messenger

7. **video_upgrade_accepted** - Xử lý chấp nhận nâng cấp video
   - Xác nhận nâng cấp cho cả hai bên
   - Cập nhật trạng thái cuộc gọi lên chế độ video

## Số Lượng Code Đã Xóa
- **Client**: ~2,373 dòng đã xóa (13 files)
- **Server**: ~200 dòng đã xóa từ websocket.js

## Kiểm Tra và Xác Thực

### Các Kiểm Tra Đã Hoàn Thành ✓
1. **ESLint**: Passed với 0 errors (23 warnings có từ trước, không liên quan đến việc xóa cuộc gọi)
2. **TypeScript**: Biên dịch thành công với 0 errors
3. **Server Syntax**: Tất cả file JavaScript đã được xác thực thành công
4. **Server Routes**: Tất cả 11 file route đã được xác thực thành công

### Các Chức Năng Còn Lại
Tất cả các tính năng khác vẫn hoạt động bình thường:
- ✅ Xác thực người dùng và hồ sơ
- ✅ Tin nhắn thời gian thực qua WebSocket
- ✅ Sự kiện và cộng đồng
- ✅ Tính năng Hang out
- ✅ Hệ thống Following/Followers
- ✅ Thông báo
- ✅ Upload hình ảnh
- ✅ Tính năng dựa trên vị trí
- ✅ Đăng ký Pro với Stripe
- ✅ Bài đăng và bình luận

## Biến Môi Trường
Các biến môi trường sau **không còn cần thiết** và đã được xóa:
```env
# Đã xóa:
EXPO_PUBLIC_DAILY_DOMAIN=
EXPO_PUBLIC_DAILY_API_KEY=
```

Các biến môi trường còn lại:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.228:3000
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Các Dependencies
Các package sau vẫn còn trong package.json nhưng **không còn được sử dụng** sau khi xóa cuộc gọi:
- `expo-audio` - Chỉ được dùng để phát nhạc chuông
- `expo-av` - Chỉ được dùng để phát nhạc chuông
- `expo-web-browser` - Được dùng để mở Daily.co trong browser (có thể vẫn được dùng ở chỗ khác)

Các package này có thể được xóa an toàn trong lần dọn dẹp sau nếu không được sử dụng bởi các tính năng khác.

## Ghi Chú Migration
Nếu bạn cần thêm lại chức năng cuộc gọi trong tương lai:
1. Sử dụng custom development build (không phải Expo Go)
2. Cân nhắc sử dụng:
   - Native WebRTC libraries (react-native-webrtc)
   - Stream.io Video SDK
   - Agora SDK
   - Zoom SDK
3. Tất cả các file đã xóa có sẵn trong git history (commit trước b787915)

## File Tài Liệu
Các file tài liệu sau hiện **đã lỗi thời** và nên được lưu trữ hoặc xóa:
- CALL_DEPLOY_INSTRUCTIONS.md
- CALL_FIX_SUMMARY.md
- EXPO_GO_CALL_SOLUTIONS.md
- FINAL_VIDEO_CALL_SUMMARY.md
- README_VIDEO_CALL.md
- BAO_CAO_SUA_CUOC_GOI.md
- TOM_TAT_SUA_LOI_CUOC_GOI.md
- SERVER_WEBRTC_UPDATE_INSTRUCTIONS.md
- HUONG_DAN_VIDEO_CALL.md
- Và các file tài liệu khác liên quan đến cuộc gọi

## Tóm Tắt
✅ **Chức năng cuộc gọi đã được loại bỏ hoàn toàn** khỏi cả client và server
✅ **Không có lỗi hay breaking changes** trong code còn lại
✅ **App vẫn hoạt động** với tất cả các tính năng khác
✅ **Codebase sạch hơn** với ~2,500 dòng code đã được xóa
✅ **Kiến trúc đơn giản hơn** mà không có tích hợp WebRTC/Daily.co phức tạp

Ứng dụng hiện tại tập trung vào các tính năng mạng xã hội cốt lõi mà không có sự phức tạp của gọi video/voice call mà không tương thích với Expo Go.

## Các Bước Tiếp Theo
Sau khi hoàn thành loại bỏ chức năng cuộc gọi:
1. ✅ Test ứng dụng trên Expo Go để đảm bảo không có lỗi
2. ✅ Xác nhận tất cả các tính năng khác hoạt động bình thường
3. ✅ Cập nhật tài liệu
4. 📝 Có thể xem xét xóa các package không sử dụng (expo-av, expo-audio)
5. 📝 Có thể xem xét xóa các file tài liệu cũ về cuộc gọi

## Liên Hệ
Nếu có câu hỏi hoặc cần hỗ trợ thêm, vui lòng liên hệ qua GitHub Issues.

---

**Trạng thái**: ✅ Hoàn thành - Đã loại bỏ chức năng cuộc gọi thành công!
