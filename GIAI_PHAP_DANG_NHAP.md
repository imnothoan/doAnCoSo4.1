# Giải Pháp Lỗi Đăng Nhập 🔧

## Lỗi Gặp Phải
```
ERROR Login error: [AuthApiError: Invalid login credentials]
```

## Nguyên Nhân

**Lý do chính**: Em đang cố đăng nhập nhưng chưa có tài khoản!

Đây không phải là lỗi hệ thống, mà là hành vi đúng. Supabase không thể xác thực thông tin đăng nhập không tồn tại.

## Giải Pháp (3 Bước Đơn Giản)

### Bước 1: Đăng Ký Tài Khoản Trước ✍️

1. Mở app
2. Trên màn hình đăng nhập, bấm nút **"Sign Up"**
3. Điền form:
   - **Username**: Tên người dùng (ví dụ: "testuser")
   - **Email**: Địa chỉ email (ví dụ: "test@test.com")
   - **Password**: Mật khẩu (tối thiểu 6 ký tự, ví dụ: "Test123!")
   - **Confirm Password**: Nhập lại mật khẩu
4. Bấm **"Create Account"**
5. Đợi thông báo "Success!"
6. Bấm **"OK"** để quay lại màn hình đăng nhập

### Bước 2: Đăng Nhập Với Tài Khoản Mới 🔐

1. Trên màn hình đăng nhập, nhập:
   - **Email**: Email vừa dùng (ví dụ: "test@test.com")
   - **Password**: Mật khẩu vừa tạo (ví dụ: "Test123!")
2. Bấm **"Sign In"**
3. ✅ Thành công! Em đã đăng nhập!

### Bước 3: (Tuỳ chọn) Tắt Xác Nhận Email ⚙️

Nếu gặp lỗi "Email not confirmed":

1. Truy cập: https://supabase.com/dashboard
2. Chọn project của em
3. Vào: **Authentication** → **Providers** → **Email**
4. Tìm mục **"Confirm email"**
5. **Tắt nó đi** (dành cho development)
6. **Save**
7. Thử đăng ký lại

## Lưu Ý Quan Trọng

✅ **Phải đăng ký trước khi đăng nhập!**

✅ **Mỗi tài khoản cần email khác nhau**

✅ **Mật khẩu phải ít nhất 6 ký tự**

✅ **Để test, dùng email đơn giản như: test1@test.com, test2@test.com**

## Kiểm Tra Console Logs

Khi chạy app, xem log trong terminal:

**Đăng ký thành công:**
```
📝 Starting signup process for: test@test.com username: testuser
✅ Supabase user created: abc-123-xyz
🔄 Syncing user data with backend...
✅ Backend sync successful
✅ Session created immediately
```

**Đăng nhập thành công:**
```
🔐 Attempting login for: test@test.com
✅ Supabase login successful: test@test.com
🔑 Handling session for user: test@test.com
✅ User profile loaded: testuser
```

**Đăng nhập thất bại (chưa có tài khoản):**
```
🔐 Attempting login for: test@test.com
❌ Login error: [AuthApiError: Invalid login credentials]
```
👉 **Nghĩa là: Cần đăng ký trước!**

## Công Cụ Kiểm Tra

Đã tạo sẵn 2 script để test:

### 1. Kiểm tra kết nối Supabase
```bash
npx tsx scripts/checkSupabaseSettings.ts
```

Script này sẽ:
- ✅ Test kết nối Supabase
- ✅ Liệt kê users hiện có
- ✅ Test luồng đăng ký/đăng nhập
- ✅ Kiểm tra cài đặt email confirmation
- ✅ Đưa ra hướng dẫn cụ thể

### 2. Test kết nối đơn giản
```bash
npx tsx scripts/testSupabaseConnection.ts
```

## Các Vấn Đề Thường Gặp

### Vấn đề 1: "Invalid login credentials"

**Nguyên nhân**: Chưa có tài khoản với email/password đó

**Giải pháp:**
1. Đăng ký trước (Sign Up)
2. Kiểm tra email có đúng không
3. Kiểm tra password có đúng không
4. Tạo tài khoản mới nếu quên mật khẩu

### Vấn đề 2: "Email not confirmed"

**Nguyên nhân**: Supabase đang bật xác nhận email

**Giải pháp:**
1. Check email inbox để xác nhận
2. Hoặc tắt email confirmation trong Supabase Dashboard (khuyến nghị cho dev)

### Vấn đề 3: Backend sync thất bại

**Nguyên nhân**: Server không chạy hoặc không kết nối được

**Giải pháp:**
1. Chạy server: `cd ../doAnCoSo4.1.server && npm start`
2. Kiểm tra EXPO_PUBLIC_API_URL trong file .env
3. Kiểm tra kết nối mạng

**Lưu ý**: Ngay cả khi backend sync thất bại, em vẫn có thể đăng nhập vì user đã được tạo trong Supabase. Backend sẽ sync sau.

### Vấn đề 4: Lỗi network

**Nguyên nhân**: Không kết nối được Supabase hoặc backend

**Giải pháp:**
1. Kiểm tra internet
2. Xác nhận Supabase URL và keys trong .env
3. Đảm bảo Supabase project đang hoạt động
4. Kiểm tra firewall

## Kiểm Tra Môi Trường

Đảm bảo file `.env` có các thông tin này:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://lryrcmdfhahaddzbeuzn.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend API
EXPO_PUBLIC_API_URL=http://192.168.1.228:3000
```

## Test Accounts Mẫu

Em có thể tạo các tài khoản test theo pattern này:

```
Email: test1@test.com
Password: Test123!

Email: test2@test.com  
Password: Test123!

Email: hoan@test.com
Password: MyPassword123!
```

**Quan trọng**: Mỗi email chỉ dùng được 1 lần! Phải đăng ký qua Sign Up trước!

## Cách Hệ Thống Hoạt Động

### Quy Trình Đăng Ký

```
1. User điền form đăng ký
   ↓
2. App gọi Supabase Auth (tạo user trong auth)
   ↓
3. Supabase tạo user thành công
   ↓
4. App đồng bộ thông tin với backend API
   ↓
5. Backend tạo record trong bảng users
   ↓
6. Thành công! Có thể đăng nhập
```

### Quy Trình Đăng Nhập

```
1. User nhập email/password
   ↓
2. App gọi Supabase Auth để xác thực
   ↓
3. Supabase kiểm tra thông tin
   ↓
4. Nếu đúng: Trả về JWT token
   ↓
5. App dùng token gọi backend API
   ↓
6. Backend trả về thông tin user
   ↓
7. Thành công! User đã đăng nhập
```

## Tài Liệu Chi Tiết

Đã tạo sẵn tài liệu tiếng Anh đầy đủ:

1. **QUICK_FIX_LOGIN.md** - Hướng dẫn nhanh
2. **AUTHENTICATION_GUIDE.md** - Hướng dẫn chi tiết toàn diện

## Tóm Tắt

Lỗi em đang gặp là **hoạt động đúng như thiết kế**. 

**Nguyên nhân**: Em đang thử đăng nhập mà chưa có tài khoản.

**Giải pháp**:
1. ✅ Dùng nút "Sign Up" để tạo tài khoản
2. ✅ Sau đó dùng "Sign In" với thông tin vừa tạo
3. ✅ Xong!

---

## Hỗ Trợ Thêm

Nếu vẫn gặp vấn đề:

1. **Chạy test script**: `npx tsx scripts/checkSupabaseSettings.ts`
2. **Xem console logs** trong app và server
3. **Kiểm tra .env** có đúng không
4. **Đảm bảo server đang chạy** trên đúng port
5. **Xem Supabase dashboard** có vấn đề gì không
6. **Đọc logs server** để biết lỗi backend

## Liên Hệ

Nếu làm theo hướng dẫn mà vẫn không được, em check lại:
- Console logs (cả client và server)
- Supabase dashboard (có user nào không?)
- Server có chạy không?
- .env có đúng không?

**Nhớ**: Lỗi này rất bình thường! Chỉ cần đăng ký trước rồi đăng nhập là được! 🎉
