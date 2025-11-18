# Giải Pháp Video Call Cho Expo Go

## 🎯 Vấn Đề
Expo Go không hỗ trợ `react-native-webrtc` vì nó yêu cầu native modules.

## ✅ Giải Pháp: Sử dụng Agora SDK

Agora cung cấp **expo plugin chính thức** cho phép video/voice calls hoạt động với **development builds** (không phải Expo Go thuần).

## Các Lựa Chọn Khác Nhau

### Option 1: Agora RTC SDK ⭐ (Khuyến nghị)

**Ưu điểm:**
- ✅ Hỗ trợ Expo với plugin chính thức
- ✅ Chất lượng cao, độ trễ thấp
- ✅ Miễn phí 10,000 phút/tháng
- ✅ Dễ tích hợp
- ✅ Hỗ trợ cả iOS và Android

**Nhược điểm:**
- ❌ Vẫn cần development build (không hoạt động với Expo Go thuần)
- ⚠️ Cần đăng ký tài khoản Agora

**Chi phí:**
- Free tier: 10,000 phút/tháng
- Sau đó: ~$0.99/1000 phút

### Option 2: Daily.co / Whereby Embed

**Ưu điểm:**
- ✅ Hoạt động với Expo Go (qua WebView)
- ✅ Không cần native modules
- ✅ Dễ setup
- ✅ Miễn phí cho small teams

**Nhược điểm:**
- ❌ Sử dụng WebView (trải nghiệm kém hơn native)
- ❌ Ít control hơn
- ❌ Giới hạn customization

### Option 3: Twilio Video

**Ưu điểm:**
- ✅ Enterprise-grade
- ✅ Reliable và scalable

**Nhược điểm:**
- ❌ Đắt hơn
- ❌ Phức tạp hơn để setup

## 🚀 Triển Khai Agora cho Expo

### Bước 1: Đăng ký Agora

1. Truy cập https://console.agora.io/
2. Tạo tài khoản miễn phí
3. Tạo project mới
4. Lấy App ID

### Bước 2: Cài đặt Dependencies

```bash
# Install Agora SDK
npx expo install agora-rtc-react-native agora-react-native-rtm

# Install required dependencies
npx expo install react-native-permission-handler
```

### Bước 3: Cấu hình app.json

```json
{
  "expo": {
    "plugins": [
      [
        "agora-rtc-react-native",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera for video calls.",
          "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone for voice calls."
        }
      ]
    ]
  }
}
```

### Bước 4: Tạo Development Build

```bash
# Tạo development build
eas build --profile development --platform ios
eas build --profile development --platform android

# Hoặc local build
npx expo prebuild
npx expo run:ios
npx expo run:android
```

### Bước 5: Code Integration

Sẽ tạo service mới sử dụng Agora thay vì WebRTC.

## 🌐 Giải Pháp WebView (Hoạt động với Expo Go)

Nếu bạn muốn một giải pháp **ngay lập tức** mà không cần development build:

### Sử dụng Daily.co với WebView

```bash
npx expo install react-native-webview
```

**Ưu điểm:**
- ✅ Hoạt động ngay với Expo Go
- ✅ Không cần cấu hình phức tạp
- ✅ Free tier: 200,000 phút/tháng

**Code Example:**

```typescript
import { WebView } from 'react-native-webview';

function VideoCall({ roomUrl }) {
  return (
    <WebView
      source={{ uri: `https://yourdomain.daily.co/${roomUrl}` }}
      style={{ flex: 1 }}
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
    />
  );
}
```

## 📊 So Sánh Các Giải Pháp

| Giải Pháp | Expo Go | Chất lượng | Chi phí | Độ khó |
|-----------|---------|------------|---------|--------|
| **Agora** | ❌ (Cần dev build) | ⭐⭐⭐⭐⭐ | $$ | Trung bình |
| **Daily.co (WebView)** | ✅ | ⭐⭐⭐ | $ | Dễ |
| **Twilio** | ❌ (Cần dev build) | ⭐⭐⭐⭐⭐ | $$$ | Khó |
| **react-native-webrtc** | ❌ (Cần dev build) | ⭐⭐⭐⭐ | Free | Khó |

## 💡 Khuyến Nghị

### Cho Development/Testing với Expo Go:
→ **Sử dụng Daily.co với WebView** (solution tạm thời)

### Cho Production:
→ **Sử dụng Agora SDK** với development build (solution lâu dài)

## 🎬 Tôi sẽ làm gì tiếp theo?

Tôi có thể triển khai một trong hai giải pháp:

1. **Giải pháp nhanh (WebView)**: Tích hợp Daily.co/Whereby để test ngay với Expo Go
2. **Giải pháp chất lượng (Agora)**: Setup Agora SDK (cần development build)

Bạn muốn tôi triển khai giải pháp nào?
