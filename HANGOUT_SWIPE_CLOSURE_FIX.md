# Hangout Swipe Profile Navigation - Closure Fix

## Vấn đề (Problem)

Khi người dùng vuốt sang phải để xem hồ sơ trong màn hình Hangout, ứng dụng không điều hướng đến trang hồ sơ và hiển thị lỗi:

```
LOG  🎯 onSwipeComplete called: {"currentIndex": 0, "currentUserProfile": null, "direction": "right", "totalUsers": 0}
WARN  ⚠️ Cannot navigate to profile: username is missing
WARN  ⚠️ Current user profile: undefined
```

When users swipe right to view a profile in the Hangout screen, the app doesn't navigate to the profile page and shows this error:

```
LOG  🎯 onSwipeComplete called: {"currentIndex": 0, "currentUserProfile": null, "direction": "right", "totalUsers": 0}
WARN  ⚠️ Cannot navigate to profile: username is missing
WARN  ⚠️ Current user profile: undefined
```

## Nguyên nhân (Root Cause)

### Vấn đề Closure trong React

`PanResponder` được tạo một lần duy nhất sử dụng `useRef`, tạo ra một **closure** (bao đóng) với trạng thái ban đầu:

1. Khi component mount lần đầu, `users` là mảng rỗng `[]`
2. `PanResponder` được tạo và **lưu trữ tham chiếu** đến mảng rỗng đó
3. Sau đó, dữ liệu người dùng được tải và `users` state được cập nhật
4. **Nhưng** `PanResponder` vẫn giữ tham chiếu đến mảng rỗng ban đầu
5. Khi người dùng vuốt, `onSwipeComplete` được gọi với **dữ liệu cũ** (mảng rỗng)

### JavaScript Closure Problem

The `PanResponder` is created once using `useRef`, creating a **closure** with the initial state:

1. When component mounts, `users` is an empty array `[]`
2. `PanResponder` is created and **captures reference** to that empty array
3. Later, user data is loaded and `users` state is updated
4. **But** `PanResponder` still holds reference to the initial empty array
5. When user swipes, `onSwipeComplete` is called with **stale data** (empty array)

## Giải pháp (Solution)

### Sử dụng Refs để lưu trữ state hiện tại

Thay vì dựa vào closure của state variables, chúng ta sử dụng `useRef` để lưu trữ state hiện tại mà `PanResponder` có thể truy cập:

Instead of relying on state variable closures, we use `useRef` to store current state that `PanResponder` can access:

```typescript
// 1. Create refs to store current state
const usersRef = useRef<User[]>([]);
const currentIndexRef = useRef(0);

// 2. Sync refs whenever state changes
useEffect(() => {
  usersRef.current = users;
  currentIndexRef.current = currentIndex;
}, [users, currentIndex]);

// 3. Update refs when state is set directly
setUsers(onlineUsers);
setCurrentIndex(0);
usersRef.current = onlineUsers;    // ← Update ref
currentIndexRef.current = 0;        // ← Update ref

// 4. Use refs in closure (onSwipeComplete)
const onSwipeComplete = (direction: 'left' | 'right') => {
  // Use refs to get the most current state
  const currentUserProfile = usersRef.current[currentIndexRef.current];
  // ... rest of code
};
```

## Thay đổi chi tiết (Detailed Changes)

### File: `app/(tabs)/hangout.tsx`

#### 1. Thêm refs (Line 40-42)
```typescript
// Use refs to store current state for panResponder closure
const usersRef = useRef<User[]>([]);
const currentIndexRef = useRef(0);
```

#### 2. Thêm useEffect để đồng bộ refs (Line 243-247)
```typescript
// Sync refs whenever state changes
useEffect(() => {
  usersRef.current = users;
  currentIndexRef.current = currentIndex;
}, [users, currentIndex]);
```

#### 3. Cập nhật refs khi load dữ liệu (Line 117-119)
```typescript
setUsers(onlineUsers);
setCurrentIndex(0);
// Update refs for panResponder closure
usersRef.current = onlineUsers;
currentIndexRef.current = 0;
```

#### 4. Cập nhật refs khi có lỗi (Line 123-126)
```typescript
setUsers([]);
// Update refs for panResponder closure
usersRef.current = [];
currentIndexRef.current = 0;
```

#### 5. Sử dụng refs trong onSwipeComplete (Line 268-281)
```typescript
const onSwipeComplete = (direction: 'left' | 'right') => {
  // Use refs to get the most current state
  const currentUserProfile = usersRef.current[currentIndexRef.current];
  
  console.log('🎯 onSwipeComplete called:', {
    direction,
    currentIndex: currentIndexRef.current,
    totalUsers: usersRef.current.length,
    currentUserProfile: currentUserProfile ? {
      id: currentUserProfile.id,
      username: currentUserProfile.username,
      name: currentUserProfile.name,
    } : null,
  });
  // ... rest of code
```

#### 6. Cập nhật ref khi increment index (Line 304-308)
```typescript
setCurrentIndex(prevIndex => {
  const newIndex = prevIndex + 1;
  currentIndexRef.current = newIndex; // Update ref
  return newIndex;
});
```

## Tại sao giải pháp này hoạt động? (Why This Works)

### Refs vs State

| Aspect | State (`useState`) | Refs (`useRef`) |
|--------|-------------------|-----------------|
| **Trigger re-render** | ✅ Yes | ❌ No |
| **Mutable** | ❌ No (requires setState) | ✅ Yes (direct mutation) |
| **Persists across renders** | ✅ Yes | ✅ Yes |
| **Current value in closures** | ❌ Captures at closure time | ✅ Always current |

### Tại sao không recreate PanResponder?

Có thể recreate `PanResponder` mỗi khi `users` thay đổi, nhưng:
- ❌ **Performance overhead:** Tạo lại gesture handler mỗi lần render
- ❌ **Potential bugs:** Gesture state có thể bị reset giữa chừng
- ✅ **Refs are better:** Không overhead, luôn có giá trị hiện tại

We could recreate `PanResponder` when `users` changes, but:
- ❌ **Performance overhead:** Recreating gesture handler every render
- ❌ **Potential bugs:** Gesture state might reset mid-gesture
- ✅ **Refs are better:** No overhead, always has current value

## Kiểm tra (Testing)

### Các bước test thủ công

1. Mở ứng dụng và đi đến tab "Hang Out"
2. Đợi danh sách người dùng tải
3. Vuốt **phải** trên một thẻ người dùng
4. **Kết quả mong đợi:** Điều hướng đến trang profile của người dùng đó
5. Quay lại và vuốt **trái** để bỏ qua người dùng
6. **Kết quả mong đợi:** Chuyển đến thẻ người dùng tiếp theo

### Manual Testing Steps

1. Open app and go to "Hang Out" tab
2. Wait for user list to load
3. Swipe **right** on a user card
4. **Expected:** Navigate to that user's profile page
5. Go back and swipe **left** to skip user
6. **Expected:** Move to next user card

### Kiểm tra logs

Trước khi sửa:
```
LOG  🎯 onSwipeComplete called: {"currentIndex": 0, "currentUserProfile": null, "direction": "right", "totalUsers": 0}
```

Sau khi sửa:
```
LOG  🎯 onSwipeComplete called: {
  "currentIndex": 0, 
  "currentUserProfile": {
    "id": "...",
    "username": "khanh_85",
    "name": "..."
  }, 
  "direction": "right", 
  "totalUsers": 1
}
LOG  📱 Navigating to profile: khanh_85
```

## Best Practices Learned

### 1. Hiểu về Closures trong React
- State variables trong closures **không tự động cập nhật**
- Sử dụng refs cho các giá trị mà callbacks cần truy cập
- Sử dụng functional updates `setState(prev => ...)` khi cần

### 2. Khi nào sử dụng Refs vs State
- **State:** Cho data cần trigger re-render UI
- **Refs:** Cho data callbacks cần nhưng không ảnh hưởng UI
- **Cả hai:** Khi cần cả hai tính năng (như trường hợp này)

### 3. PanResponder Pattern
```typescript
const dataRef = useRef(initialData);

// Sync ref with state
useEffect(() => {
  dataRef.current = data;
}, [data]);

// Use ref in PanResponder
const panResponder = useRef(
  PanResponder.create({
    onRelease: () => {
      // Always has current data
      handleGesture(dataRef.current);
    }
  })
).current;
```

## Kết quả (Results)

### Trước khi sửa (Before Fix)
- ❌ Swipe right không hoạt động
- ❌ `currentUserProfile` luôn là `null`
- ❌ `totalUsers` luôn là `0`
- ❌ Không thể xem profile người dùng

### Sau khi sửa (After Fix)
- ✅ Swipe right điều hướng đến profile
- ✅ `currentUserProfile` có dữ liệu đúng
- ✅ `totalUsers` hiển thị số lượng đúng
- ✅ Trải nghiệm người dùng mượt mà

## Commit History

```
bfd0184 - Fix hangout swipe profile navigation using refs for closure
```

## Related Issues

- Vấn đề username missing: Xem `HANGOUT_PROFILE_SOLUTION.md`
- Server-side fixes: Xem `HANGOUT_SERVER_INSTRUCTIONS.md`

## References

- React Hooks - useRef: https://react.dev/reference/react/useRef
- JavaScript Closures: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
- React Native PanResponder: https://reactnative.dev/docs/panresponder
