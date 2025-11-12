# Tóm Tắt Sửa Lỗi: Hiển Thị Số Followers và Following

## Vấn Đề
Phần Summary (Tóm tắt) trong trang Account và Profile hiển thị số 0 cho followers và following, mặc dù người dùng có followers/following thực tế.

## Nguyên Nhân Gốc Rễ

### Định dạng phản hồi từ Server:
Server trả về các trường dữ liệu với tên:
```json
{
  "username": "tung_268",
  "name": "Tung",
  "followers": 5,      // Tên trường từ server
  "following": 10,     // Tên trường từ server
  "posts": 3           // Tên trường từ server
}
```

### Định dạng mong đợi của Client:
TypeScript interface `User` trong client mong đợi:
```typescript
interface User {
  username?: string;
  name: string;
  followersCount?: number;  // Tên trường client mong đợi
  followingCount?: number;  // Tên trường client mong đợi
  postsCount?: number;      // Tên trường client mong đợi
}
```

### Vấn đề:
Khi UI code truy cập `user.followersCount`, giá trị là `undefined` vì server gửi `followers` thay vì `followersCount`. JavaScript/TypeScript coi `undefined` là falsy, nên `user.followersCount || 0` đánh giá thành `0`.

## Giải Pháp
Đã thêm hàm helper `mapServerUserToClient()` để chuyển đổi phản hồi từ server sang định dạng mà client mong đợi:

```typescript
function mapServerUserToClient(serverUser: any): User {
  return {
    ...serverUser,
    // Map tên trường từ server sang client
    followersCount: serverUser.followers ?? serverUser.followersCount ?? 0,
    followingCount: serverUser.following ?? serverUser.followingCount ?? 0,
    postsCount: serverUser.posts ?? serverUser.postsCount ?? 0,
  };
}
```

Hàm này:
1. Giữ nguyên tất cả các trường hiện có bằng spread operator (`...serverUser`)
2. Map `followers` → `followersCount`
3. Map `following` → `followingCount`
4. Map `posts` → `postsCount`
5. Mặc định là 0 nếu không có trường nào tồn tại
6. Xử lý cả tên trường từ server và client (tương thích ngược)

## File Đã Thay Đổi
- `src/services/api.ts`: Đã thêm hàm mapper và cập nhật tất cả các phương thức trả về User

## Các Phương Thức Đã Cập Nhật
Tất cả các phương thức API trả về đối tượng User đều sử dụng mapper:
- `getCurrentUser()` - Lấy thông tin user hiện tại
- `getUserByUsername()` - Lấy user theo username
- `getUserById()` - Lấy user theo ID
- `updateUser()` - Cập nhật thông tin user
- `getUsers()` - Lấy danh sách users
- `searchUsers()` - Tìm kiếm users
- `getFollowers()` - Lấy danh sách followers
- `getFollowing()` - Lấy danh sách following
- `login()` - Đăng nhập
- `signup()` - Đăng ký
- `getConversations()` - Lấy danh sách cuộc trò chuyện
- `getConversation()` - Lấy chi tiết cuộc trò chuyện

## Luồng Dữ Liệu
1. User đăng nhập → `AuthContext.login()` → `ApiService.login()` → mapper được áp dụng
2. Profile được load → `AuthContext.refreshUser()` → `ApiService.getUserByUsername()` → mapper được áp dụng
3. Đối tượng User giờ có cả `followers` và `followersCount`
4. UI hiển thị `user.followersCount` đúng

## Kiểm Tra

### Trước khi sửa:
```
Server gửi: { followers: 5, following: 10 }
Client nhận: { followers: 5, following: 10, followersCount: undefined, followingCount: undefined }
UI hiển thị: 0 followers, 0 following ❌
```

### Sau khi sửa:
```
Server gửi: { followers: 5, following: 10 }
Client nhận: { followers: 5, following: 10, followersCount: 5, followingCount: 10 }
UI hiển thị: 5 followers, 10 following ✅
```

## Kết Quả
✅ Trang Account (`app/(tabs)/account.tsx`) giờ hiển thị đúng số followers/following trong phần Summary
✅ Trang Profile (`app/profile.tsx`) giờ hiển thị đúng số followers trong phần Summary
✅ Không có breaking changes - tương thích ngược với cả hai định dạng tên trường
✅ Không cần thay đổi server
✅ Tất cả chức năng hiện có được giữ nguyên

## Kiểm Tra Bảo Mật
✅ TypeScript compilation thành công
✅ ESLint không có lỗi
✅ CodeQL security scan: 0 lỗ hổng bảo mật

## Hướng Dẫn Kiểm Tra
1. Đăng nhập vào app với tài khoản có followers/following
2. Vào trang Account (tab Account)
3. Kiểm tra phần Summary - giờ sẽ hiển thị số followers và following đúng
4. Vào profile của user khác
5. Kiểm tra phần Summary - giờ sẽ hiển thị số followers đúng

## Ghi Chú Kỹ Thuật
- Fix này hoàn toàn ở phía client, không cần thay đổi server
- Hàm mapper xử lý cả trường hợp server trả về tên cũ (`followers`) và tên mới (`followersCount`)
- Sử dụng nullish coalescing operator (`??`) để xử lý các giá trị null/undefined
- Không ảnh hưởng đến performance vì mapper chỉ chạy khi có dữ liệu user mới
