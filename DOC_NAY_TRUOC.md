# 📖 ĐỌC TÀI LIỆU NÀY TRƯỚC KHI BẮT ĐẦU

## 🎯 Về Lỗi Đăng Nhập

Nếu em đang gặp lỗi:
```
ERROR Login error: [AuthApiError: Invalid login credentials]
```

**Đây KHÔNG PHẢI là lỗi hệ thống!**

**Nguyên nhân:** Em đang cố đăng nhập nhưng chưa có tài khoản.

**Giải pháp:** Đăng ký trước, rồi mới đăng nhập!

---

## 🚀 Bắt Đầu Nhanh

### Bước 1: Cài Đặt
```bash
npm install
```

### Bước 2: Kiểm Tra Cấu Hình
```bash
npx tsx scripts/checkSupabaseSettings.ts
```

### Bước 3: Chạy App
```bash
npx expo start
```

### Bước 4: Tạo Tài Khoản
1. Mở app
2. Bấm **"Sign Up"**
3. Điền thông tin:
   - Username: `testuser`
   - Email: `test@test.com`
   - Password: `Test123!`
   - Confirm Password: `Test123!`
4. Bấm **"Create Account"**
5. Đợi thông báo "Success!"

### Bước 5: Đăng Nhập
1. Quay lại màn hình login
2. Nhập:
   - Email: `test@test.com`
   - Password: `Test123!`
3. Bấm **"Sign In"**
4. ✅ Thành công!

---

## 📚 Tài Liệu Quan Trọng

### Đọc Ngay Nếu Gặp Vấn Đề:

1. **GIAI_PHAP_DANG_NHAP.md** 🔴 ĐỌC ĐẦU TIÊN
   - Giải pháp chi tiết bằng tiếng Việt
   - Hướng dẫn từng bước
   - Các lỗi thường gặp

2. **QUICK_FIX_LOGIN.md** (English)
   - Quick 3-step fix
   - Fast solution

3. **AUTHENTICATION_GUIDE.md** (English)
   - Complete technical guide
   - Advanced troubleshooting

4. **LOGIN_FIX_SUMMARY.md**
   - Technical summary
   - For developers

---

## 🧪 Công Cụ Kiểm Tra

### Test 1: Kiểm Tra Kết Nối
```bash
npx tsx scripts/checkSupabaseSettings.ts
```
**Kiểm tra:**
- ✅ Kết nối Supabase
- ✅ Danh sách users
- ✅ Cài đặt email confirmation
- ✅ Đưa ra hướng dẫn sửa lỗi

### Test 2: Test Đơn Giản
```bash
npx tsx scripts/testSupabaseConnection.ts
```
**Thực hiện:**
- ✅ Test kết nối cơ bản
- ✅ Tạo user test
- ✅ Test đăng nhập
- ✅ Kiểm tra settings

---

## ⚙️ Cấu Hình

### File `.env` Cần Có:
```env
EXPO_PUBLIC_SUPABASE_URL=https://lryrcmdfhahaddzbeuzn.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_API_URL=http://192.168.1.228:3000
```

### Server Phải Chạy:
```bash
cd ../doAnCoSo4.1.server
npm install
npm start
```

---

## 🐛 Các Lỗi Thường Gặp

### ❌ "Invalid login credentials"
**Nguyên nhân:** Chưa có tài khoản
**Giải pháp:** Đăng ký trước!

### ❌ "Email not confirmed"
**Nguyên nhân:** Supabase bật xác nhận email
**Giải pháp:** Tắt nó đi trong Supabase Dashboard

### ❌ Backend sync thất bại
**Nguyên nhân:** Server không chạy
**Giải pháp:** Chạy server: `cd ../doAnCoSo4.1.server && npm start`

### ❌ Network error
**Nguyên nhân:** Không kết nối được
**Giải pháp:** Kiểm tra internet và server

---

## 📋 Checklist

### Trước Khi Bắt Đầu:
- [ ] Đã đọc `GIAI_PHAP_DANG_NHAP.md`
- [ ] Đã cài đặt dependencies: `npm install`
- [ ] Đã kiểm tra cấu hình: `npx tsx scripts/checkSupabaseSettings.ts`
- [ ] Server đang chạy
- [ ] File `.env` đã cấu hình đúng

### Khi Test:
- [ ] Chạy app: `npx expo start`
- [ ] Tạo tài khoản qua Sign Up
- [ ] Đăng nhập với tài khoản vừa tạo
- [ ] Kiểm tra console logs
- [ ] Xác nhận đăng nhập thành công

---

## 💡 Lưu Ý Quan Trọng

✅ **PHẢI ĐĂNG KÝ TRƯỚC KHI ĐĂNG NHẬP**

✅ **Mỗi email chỉ dùng được 1 lần**

✅ **Password tối thiểu 6 ký tự**

✅ **Xem console logs để biết lỗi chi tiết**

✅ **Có test scripts để kiểm tra**

---

## 📞 Cần Giúp Đỡ?

### Nếu Vẫn Không Được:

1. **Đọc lại** `GIAI_PHAP_DANG_NHAP.md`
2. **Chạy** test scripts
3. **Xem** console logs (cả client và server)
4. **Kiểm tra** .env file
5. **Đảm bảo** server đang chạy
6. **Xác nhận** Supabase project hoạt động

### Các Lệnh Hữu Ích:

```bash
# Kiểm tra cấu hình
npx tsx scripts/checkSupabaseSettings.ts

# Test kết nối
npx tsx scripts/testSupabaseConnection.ts

# Xem git status
git status

# Chạy app
npx expo start

# Chạy server
cd ../doAnCoSo4.1.server && npm start
```

---

## 🎉 Tóm Tắt

1. Lỗi "Invalid login credentials" là **BÌNH THƯỜNG**
2. Nguyên nhân: **Chưa có tài khoản**
3. Giải pháp: **Đăng ký → Đăng nhập**
4. Có đầy đủ tài liệu và công cụ hỗ trợ
5. Làm theo hướng dẫn sẽ OK!

---

## 📖 Thứ Tự Đọc Tài Liệu

Nếu em muốn hiểu rõ hơn, đọc theo thứ tự:

1. **DOC_NAY_TRUOC.md** ← Em đang đọc
2. **GIAI_PHAP_DANG_NHAP.md** ← Giải pháp chi tiết
3. **QUICK_FIX_LOGIN.md** ← Quick fix (English)
4. **AUTHENTICATION_GUIDE.md** ← Complete guide (English)
5. **LOGIN_FIX_SUMMARY.md** ← Technical details

---

**Chúc em thành công!** 🚀

Nếu làm theo đúng hướng dẫn, mọi thứ sẽ hoạt động tốt! 💪
