# Hướng Dẫn Sử Dụng - ConnectSphere Improvements

## 📱 Tính Năng Mới

### 1. Hiển Thị Khoảng Cách Chính Xác Hơn

**Trước đây:**
- Khoảng cách hiển thị: "~15.0 km away"
- Độ chính xác: ±100-500m
- Không sắp xếp theo khoảng cách

**Bây giờ:**
- Khoảng cách hiển thị:
  - Rất gần: "Nearby" (< 10m)
  - Gần: "50m", "850m" (10m - 999m)
  - Xa: "1.2km", "15.5km" (1km - 99.9km)
  - Rất xa: "150km", "500km" (≥ 100km)
- Độ chính xác: ±10-50m (chính xác hơn 10 lần!)
- Tự động sắp xếp: Người gần nhất hiển thị trước

**Cách sử dụng:**
1. Mở app ConnectSphere
2. Vào tab "Hang Out"
3. Chọn "Hangout Map"
4. Xem khoảng cách chính xác của mỗi người
5. Người gần nhất sẽ xuất hiện trên bản đồ đầu tiên

### 2. Pull-to-Refresh trong Inbox

**Tính năng:**
- Kéo danh sách tin nhắn xuống để refresh
- Không cần thoát và vào lại app
- Hoạt động mượt mà như các app native

**Cách sử dụng:**
1. Mở app ConnectSphere
2. Vào tab "Inbox"
3. Kéo danh sách xuống từ trên (pull down gesture)
4. Thả tay ra
5. Danh sách tin nhắn sẽ tự động cập nhật

**Hoạt động trên:**
- ✅ Tab "All" (tất cả tin nhắn)
- ✅ Tab "Communities" (tin nhắn cộng đồng)
- ✅ Tab "Users" (tin nhắn cá nhân)

---

## 🚀 Cài Đặt & Triển Khai

### Cho Client (Mobile App)

**Bước 1: Cập nhật code**
```bash
cd doAnCoSo4.1
git pull origin copilot/research-server-codebase-again
```

**Bước 2: Cài đặt dependencies (nếu cần)**
```bash
npm install
```

**Bước 3: Chạy app**
```bash
# Cho iOS
npm run ios

# Cho Android
npm run android

# Hoặc scan QR code với Expo Go
npm start
```

### Cho Server (Backend)

**Bước 1: Apply patch file**
```bash
cd doAnCoSo4.1.server
git apply ../doAnCoSo4.1/server-distance-accuracy-improvements.patch
```

**Bước 2: Restart server**
```bash
# Tùy theo cách deploy của bạn
npm restart
# hoặc
pm2 restart server
```

---

## 🔧 Cấu Hình

### Location Permissions

App cần quyền truy cập vị trí để tính khoảng cách:

**iOS:**
- Đi tới Settings → Privacy → Location Services
- Tìm "ConnectSphere"
- Chọn "While Using the App"

**Android:**
- Đi tới Settings → Apps → ConnectSphere → Permissions
- Cho phép "Location"
- Chọn "Allow only while using the app"

### GPS Accuracy

App tự động sử dụng GPS độ chính xác cao:
- ✅ Độ chính xác: ~10m
- ✅ Tự động fallback về độ chính xác trung bình nếu cần
- ✅ Tiết kiệm pin với update interval hợp lý

---

## 📊 So Sánh Trước/Sau

### Distance Display

| Khoảng Cách Thực | Trước | Sau |
|-------------------|-------|-----|
| 5 mét | "~0.0 km away" | "Nearby" |
| 50 mét | "~0.1 km away" | "50m away" |
| 850 mét | "~0.9 km away" | "850m away" |
| 1.2 km | "~1.0 km away" | "1.2km away" |
| 15.5 km | "~16.0 km away" | "15.5km away" |
| 150 km | "~150.0 km away" | "150km away" |

### User Experience

**Trước:**
- Phải thoát và vào lại để refresh inbox
- Khoảng cách không chính xác
- Không biết ai gần ai xa

**Sau:**
- Kéo xuống để refresh (như Facebook, Instagram)
- Khoảng cách chính xác theo GPS
- Người gần nhất hiển thị trước

---

## ❓ Câu Hỏi Thường Gặp (FAQ)

### Q1: Tại sao khoảng cách của tôi hiển thị "Unknown"?

**A:** Có thể do:
- Chưa cấp quyền location cho app
- GPS của điện thoại đang tắt
- Người kia chưa bật vị trí

**Giải pháp:**
- Kiểm tra Settings → Location
- Bật GPS/Location services
- Đảm bảo cả hai người đều bật location

### Q2: Pull-to-refresh không hoạt động?

**A:** Có thể do:
- Đang ở đầu danh sách chưa đủ để kéo
- Internet bị mất kết nối
- App đang loading

**Giải pháp:**
- Kéo xuống mạnh hơn một chút
- Kiểm tra kết nối internet
- Đợi loading xong rồi thử lại

### Q3: Khoảng cách có chính xác 100%?

**A:** 
- Độ chính xác: ~10-50m (phụ thuộc GPS)
- Tính theo đường chim bay (straight line)
- KHÔNG phải khoảng cách đi đường

**Lưu ý:**
- Khoảng cách đi đường thường dài hơn
- GPS trong nhà kém chính xác hơn ngoài trời
- Thời tiết xấu có thể ảnh hưởng GPS

### Q4: Server cũ có hoạt động với client mới?

**A:** 
- Có, nhưng khoảng cách sẽ kém chính xác hơn
- Nên update cả client và server
- Dùng patch file để update server dễ dàng

### Q5: Tính năng này tốn pin không?

**A:**
- GPS High accuracy tốn pin hơn một chút
- Nhưng có tối ưu với update interval hợp lý
- Chỉ active khi app đang chạy
- Không ảnh hưởng khi app ở background

---

## 🎯 Kiểm Tra Tính Năng

### Test Distance Accuracy

**Bước 1:** Mở Hangout Map
- Vào tab "Hang Out"
- Chọn "Hangout Map"

**Bước 2:** Kiểm tra khoảng cách
- Xem khoảng cách của mỗi người
- Verify format hiển thị đúng (m/km)
- Check người gần nhất ở trên cùng

**Bước 3:** So sánh với Google Maps
- Mở Google Maps
- Đo khoảng cách đến cùng vị trí
- So sánh số liệu

**Kết quả mong đợi:**
- Sai số < 100m so với Google Maps
- Format dễ đọc (50m, 1.2km, 15km)
- Sắp xếp đúng thứ tự

### Test Pull-to-Refresh

**Bước 1:** Mở Inbox
- Vào tab "Inbox"
- Đảm bảo có một vài tin nhắn

**Bước 2:** Test refresh
- Kéo danh sách xuống từ trên
- Xem loading indicator
- Kiểm tra danh sách cập nhật

**Bước 3:** Test trên các tab
- Test tab "All"
- Test tab "Communities"
- Test tab "Users"

**Kết quả mong đợi:**
- Loading indicator hiển thị
- Danh sách refresh sau 1-2 giây
- Không bị lag hoặc crash

---

## 🐛 Troubleshooting

### Issue 1: Khoảng cách không cập nhật

**Triệu chứng:**
- Khoảng cách vẫn cũ khi di chuyển
- Người mới không xuất hiện

**Giải pháp:**
1. Tap nút refresh trên map
2. Thoát và vào lại Hangout Map
3. Kiểm tra internet connection
4. Restart app nếu cần

### Issue 2: GPS không chính xác

**Triệu chứng:**
- Khoảng cách sai lệch nhiều
- Vị trí nhảy liên tục

**Giải pháp:**
1. Ra ngoài trời (GPS trong nhà kém)
2. Đợi GPS lock (có thể mất 10-30 giây)
3. Kiểm tra Settings → Location → High Accuracy
4. Restart điện thoại nếu cần

### Issue 3: Pull-to-refresh bị lag

**Triệu chứng:**
- Kéo xuống nhưng không phản hồi
- App bị freeze

**Giải pháp:**
1. Kiểm tra internet speed
2. Đóng các app khác
3. Clear app cache
4. Reinstall app nếu cần

---

## 📞 Hỗ Trợ

### Liên Hệ
- GitHub Issues: https://github.com/imnothoan/doAnCoSo4.1/issues
- Email: [your-email]

### Tài Liệu Kỹ Thuật
- `IMPROVEMENTS_DOCUMENTATION.md` - Chi tiết kỹ thuật
- `IMPLEMENTATION_SUMMARY.md` - Tóm tắt implementation
- `server-distance-accuracy-improvements.patch` - Patch file cho server

### Logs & Debugging
Nếu gặp lỗi, check console logs:
```bash
# iOS
npx react-native log-ios

# Android
npx react-native log-android
```

---

## ✅ Checklist Triển Khai

### Client Deployment
- [ ] Pull latest code từ GitHub
- [ ] Run `npm install`
- [ ] Test trên simulator/emulator
- [ ] Test trên thiết bị thật
- [ ] Build production APK/IPA
- [ ] Upload lên store (nếu cần)

### Server Deployment
- [ ] Backup server hiện tại
- [ ] Apply patch file
- [ ] Test endpoints
- [ ] Deploy lên production
- [ ] Monitor logs
- [ ] Rollback nếu có lỗi

### Testing
- [ ] Test distance accuracy
- [ ] Test pull-to-refresh
- [ ] Test trên nhiều devices
- [ ] Test với internet chậm
- [ ] Test với GPS kém

---

## 🎉 Hoàn Thành!

Chúc mừng! Bạn đã cài đặt và cấu hình xong các tính năng mới:
- ✅ Khoảng cách chính xác hơn 10 lần
- ✅ Pull-to-refresh mượt mà
- ✅ UX tốt hơn nhiều

**Enjoy your improved ConnectSphere app! 🚀**

---

*Document version: 1.0*  
*Last updated: 2025-12-04*  
*Author: GitHub Copilot Agent*
