# 🚀 Hướng Dẫn Cài Đặt và Chạy Ứng Dụng ConnectSphere

## 📋 Tổng Quan

ConnectSphere là ứng dụng mạng xã hội được xây dựng với:
- **Client**: React Native + Expo (chạy được với Expo Go)
- **Server**: Node.js + Express + Supabase

## ✅ Các Lỗi Đã Được Sửa

### 1. Lỗi react-native-webrtc (LỖI CHÍNH)
**Vấn đề**: Ứng dụng không chạy được với Expo Go vì lỗi import `react-native-webrtc`
```
Unable to resolve "react-native-webrtc" from "src/services/webrtcService.native.ts"
```

**Giải pháp**: 
- ✅ Đã xóa file `webrtcService.native.ts` (không tương thích với Expo Go)
- ✅ Sử dụng mock WebRTC service cho Expo Go
- ✅ Video call thực tế hoạt động qua Daily.co + expo-web-browser

### 2. Lỗi phiên bản packages
**Vấn đề**: Phiên bản packages không khớp với Expo SDK 54
```
expo@54.0.24 - expected version: ~54.0.25
react-native-webview@13.16.0 - expected version: 13.15.0
```

**Giải pháp**:
- ✅ Đã cập nhật `expo` lên `~54.0.25`
- ✅ Đã hạ `react-native-webview` xuống `13.15.0`

### 3. Lỗi TypeScript
**Giải pháp**:
- ✅ Sửa đường dẫn route không đúng
- ✅ Sửa lỗi type definition
- ✅ Biên dịch TypeScript: **0 lỗi**

## 🛠️ Yêu Cầu Hệ Thống

### Bắt Buộc:
- Node.js >= 18.0.0
- npm hoặc yarn
- Expo Go app trên điện thoại (iOS/Android)

### Tùy Chọn (cho video call):
- Tài khoản Daily.co (miễn phí 200,000 phút/tháng)

## 📱 Cài Đặt Client (Ứng Dụng Mobile)

### Bước 1: Clone Repository
```bash
git clone https://github.com/imnothoan/doAnCoSo4.1.git
cd doAnCoSo4.1
```

### Bước 2: Cài Đặt Dependencies
```bash
npm install
```

### Bước 3: Cấu Hình File .env
File `.env` đã có sẵn với cấu hình mặc định:
```bash
EXPO_PUBLIC_API_URL=http://192.168.1.228:3000
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_DAILY_DOMAIN=imnothoan
```

**⚠️ LƯU Ý**: Thay đổi `EXPO_PUBLIC_API_URL` thành địa chỉ IP của máy chạy server:
```bash
# Trên Mac/Linux, tìm IP:
ifconfig | grep "inet "

# Trên Windows:
ipconfig

# Cập nhật .env:
EXPO_PUBLIC_API_URL=http://192.168.1.XXX:3000
```

### Bước 4: Chạy Ứng Dụng
```bash
npm start
# hoặc
npx expo start
```

### Bước 5: Quét QR Code
1. Cài đặt **Expo Go** app trên điện thoại
   - iOS: App Store
   - Android: Google Play Store
2. Mở Expo Go
3. Quét QR code hiển thị trên terminal
4. Đợi app build và chạy trên điện thoại

## 🖥️ Cài Đặt Server

### Bước 1: Clone Server Repository
```bash
cd ..
git clone https://github.com/imnothoan/doAnCoSo4.1.server.git server
cd server
```

### Bước 2: Cài Đặt Dependencies
```bash
npm install
```

### Bước 3: Cấu Hình File .env
Copy file `.env.example` thành `.env`:
```bash
cp .env.example .env
```

File `.env` đã có cấu hình Supabase sẵn:
```bash
SUPABASE_URL=https://lryrcmdfhahaddzbeuzn.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
SUPABASE_ANON_KEY=eyJhbGci...
PORT=3000
NODE_ENV=development
```

### Bước 4: Chạy Server
```bash
npm start
# hoặc cho development với auto-reload:
npm run dev
```

Server sẽ chạy tại: `http://localhost:3000`

### Bước 5: Kiểm Tra Server
```bash
curl http://localhost:3000/health
# Kết quả: {"ok":true,"environment":"development"}
```

## 🎥 Cấu Hình Video Call (Tùy Chọn)

### Nếu KHÔNG cấu hình Daily.co:
- ✅ App vẫn chạy bình thường
- ✅ Hiển thị mock UI cho video call
- ✅ Có thông báo hướng dẫn setup

### Nếu MUỐN video call thực:

#### Bước 1: Đăng ký Daily.co
1. Truy cập https://dashboard.daily.co/
2. Sign up (FREE - 200,000 phút/tháng)
3. Lấy domain của bạn (VD: `imnothoan`)

#### Bước 2: Cập nhật .env
```bash
EXPO_PUBLIC_DAILY_DOMAIN=your-domain-here
```

#### Bước 3: Restart app
```bash
# Dừng app (Ctrl+C)
# Chạy lại
npm start
```

## 🧪 Kiểm Tra Ứng Dụng

### Checklist:
- [ ] Server chạy thành công tại port 3000
- [ ] Client build không có lỗi
- [ ] Expo Go quét QR code thành công
- [ ] App hiển thị màn hình login
- [ ] Có thể đăng ký/đăng nhập
- [ ] WebSocket kết nối (xem console server)
- [ ] Các tab chính hoạt động (Hang Out, Events, Discussion, etc.)

## 🐛 Xử Lý Lỗi Thường Gặp

### Lỗi: "Unable to connect to server"
**Giải pháp**:
1. Kiểm tra server đang chạy
2. Kiểm tra IP trong `.env` đúng chưa
3. Đảm bảo điện thoại và máy tính cùng mạng WiFi

### Lỗi: "Network request failed"
**Giải pháp**:
1. Tắt firewall tạm thời
2. Kiểm tra port 3000 không bị chặn
3. Thử restart cả server và client

### Lỗi: Metro bundler không build
**Giải pháp**:
```bash
# Xóa cache và build lại
npx expo start --clear
```

### Lỗi: "Supabase connection failed" trên server
**Giải pháp**:
- Đây là cảnh báo bình thường nếu không có internet
- Server vẫn chạy được
- Chỉ ảnh hưởng khi cần truy cập database

## 📊 Kiến Trúc Ứng Dụng

### Client:
```
doAnCoSo4.1/
├── app/                      # Screens (Expo Router)
│   ├── (tabs)/              # Tab screens
│   ├── account/             # Account screens
│   ├── overview/            # Overview screens
│   └── inbox/               # Chat screens
├── src/
│   ├── services/            # API, WebSocket, WebRTC
│   ├── context/             # React Context
│   └── types/               # TypeScript types
└── components/              # Reusable components
```

### Server:
```
server/
├── routes/                  # API routes
├── db/                      # Database config
├── websocket.js            # WebSocket server
└── index.js                # Main entry point
```

## 🎯 Tính Năng Chính

### ✅ Đã Hoạt Động:
- 🔐 Authentication (Login/Signup)
- 💬 Real-time Chat với WebSocket
- 📅 Event Management
- 👥 Community/Discussion
- 🎲 Hang Out (Swipe cards)
- 👤 User Profiles
- 📍 Location-based features
- 📷 Image uploads
- 🔔 Notifications
- 📞 Video/Voice calls (qua Daily.co)

## 🚀 Production Deployment

### Deploy Server:
**Recommended platforms**:
- Railway (https://railway.app)
- Render (https://render.com)
- Heroku
- DigitalOcean

### Deploy Client:
- Sử dụng EAS Build cho production
- Hoặc tiếp tục dùng Expo Go cho development

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra lại các bước cài đặt
2. Đọc phần "Xử Lý Lỗi Thường Gặp"
3. Kiểm tra logs trong terminal
4. Kiểm tra console trong Expo Go app

## 📝 Notes

- ✅ App **hoàn toàn tương thích** với Expo Go
- ✅ Không cần development build
- ✅ Video call hoạt động qua browser (Daily.co)
- ✅ Tất cả lỗi đã được sửa
- ✅ TypeScript biên dịch không lỗi
- ✅ ESLint chỉ còn warnings nhỏ (không ảnh hưởng)

---

**Happy Coding! 🎉**
