# Improvements Documentation

## Tổng Quan / Overview

Tài liệu này mô tả các cải tiến đã được thực hiện cho ứng dụng ConnectSphere client và server, bao gồm:

1. **Cải thiện độ chính xác hiển thị khoảng cách** (Improved Distance Accuracy)
2. **Thêm tính năng pull-to-refresh trong Inbox** (Pull-to-Refresh in Inbox)

---

## 1. Cải Thiện Độ Chính Xác Khoảng Cách

### Vấn Đề / Problem

Khoảng cách hiển thị giữa người dùng không đủ chính xác, cần cải thiện để hiển thị khoảng cách theo đường chim bay (great-circle distance / as the crow flies) chính xác hơn.

### Giải Pháp / Solution

#### A. Nâng Cấp Công Thức Tính Khoảng Cách

**Trước đây:**
- Sử dụng bán kính Trái Đất đơn giản: `R = 6371 km`
- Độ chính xác tương đối

**Sau khi cải tiến:**
- Sử dụng bán kính WGS84 (chuẩn GPS): `R = 6371.0088 km`
- Công thức Haversine được tối ưu hóa
- Độ chính xác cao hơn, phù hợp với hệ thống GPS

#### B. Cải Thiện Định Dạng Hiển Thị Khoảng Cách

**Định dạng mới:**
- Khoảng cách < 10m: Hiển thị "Nearby"
- Khoảng cách < 1km: Hiển thị theo mét (ví dụ: "50m", "500m")
- Khoảng cách 1-100km: Hiển thị với 1 chữ số thập phân (ví dụ: "1.2km", "15.5km")
- Khoảng cách > 100km: Hiển thị số nguyên (ví dụ: "150km", "250km")

#### C. Sắp Xếp Người Dùng Theo Khoảng Cách

Trong trang Hangout Map, người dùng gần nhất được hiển thị trên bản đồ đầu tiên (priority sorting).

#### D. Nâng Cấp Độ Chính Xác GPS

**Trước đây:**
```typescript
accuracy: Location.Accuracy.Balanced
```

**Sau khi cải tiến:**
```typescript
accuracy: Location.Accuracy.High
```

Sử dụng GPS accuracy cao nhất để có vị trí chính xác hơn, với fallback về Balanced nếu High không khả dụng.

---

### Files Changed (Client)

#### 1. `src/utils/distance.ts`

**Thay đổi chính:**
- Cập nhật bán kính Trái Đất từ `6371` sang `6371.0088` (WGS84)
- Cải thiện hàm `formatDistance()` với nhiều mức độ chi tiết hơn
- Thêm JSDoc comments chi tiết

**Code Example:**
```typescript
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  // WGS84 Earth radius in km (more accurate than simple 6371)
  const R = 6371.0088;
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);
  
  // Haversine formula for great-circle distance
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
```

#### 2. `src/services/location.ts`

**Thay đổi chính:**
- Nâng GPS accuracy lên `High` thay vì `Balanced`
- Thêm fallback mechanism khi High accuracy không khả dụng
- Cập nhật bán kính Trái Đất trong `calculateDistance()`

**Code Example:**
```typescript
const location = await Location.getCurrentPositionAsync({
  accuracy: Location.Accuracy.High,
});
```

#### 3. `app/hangout/hangout-map.tsx`

**Thay đổi chính:**
- Import `formatDistance` từ utils
- Thêm logic sắp xếp người dùng theo khoảng cách (closest first)
- Sử dụng `formatDistance()` thay vì format thủ công
- Cập nhật bán kính Trái Đất trong local `calculateDistance()`

**Code Example:**
```typescript
// Sort users by distance (closest first)
const sortedUsers = useMemo(() => {
  if (!myLocation) return users;

  return [...users]
    .map((user) => {
      if (!user.location) return { ...user, distance: undefined };
      
      const distance = calculateDistance(
        myLocation.latitude,
        myLocation.longitude,
        user.location.latitude,
        user.location.longitude
      );
      
      return { ...user, distance };
    })
    .sort((a, b) => {
      if (a.distance === undefined) return 1;
      if (b.distance === undefined) return -1;
      return a.distance - b.distance;
    });
}, [users, myLocation]);
```

---

### Files Changed (Server)

#### 1. `routes/hangout.routes.js`

**Thay đổi chính:**
- Cập nhật bán kính Trái Đất từ `6371` sang `6371.0088`
- Tối ưu hóa công thức Haversine
- Thêm JSDoc comments

**Patch File:** `server-distance-accuracy-improvements.patch`

**Cách áp dụng patch:**
```bash
cd doAnCoSo4.1.server
git apply ../doAnCoSo4.1/server-distance-accuracy-improvements.patch
```

Hoặc apply thủ công bằng cách cập nhật hàm `calculateDistance` trong file `routes/hangout.routes.js`:

```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
   // WGS84 Earth radius in km (more accurate than simple 6371)
   const R = 6371.0088;
   
   const dLat = ((lat2 - lat1) * Math.PI) / 180;
   const dLon = ((lon2 - lon1) * Math.PI) / 180;
   
   const lat1Rad = (lat1 * Math.PI) / 180;
   const lat2Rad = (lat2 * Math.PI) / 180;

   const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) ** 2;

   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
   
   return R * c;
}
```

---

## 2. Pull-to-Refresh trong Inbox

### Vấn Đề / Problem

Người dùng không thể refresh danh sách tin nhắn trong Inbox bằng cách kéo xuống (pull-down gesture), phải thoát và vào lại.

### Giải Pháp / Solution

Thêm tính năng Pull-to-Refresh sử dụng React Native's `RefreshControl` component.

### Files Changed

#### 1. `app/(tabs)/inbox.tsx`

**Thay đổi chính:**

1. **Import RefreshControl:**
```typescript
import { RefreshControl } from 'react-native';
```

2. **Thêm state quản lý refreshing:**
```typescript
const [refreshing, setRefreshing] = useState(false);
```

3. **Thêm handler onRefresh:**
```typescript
const onRefresh = useCallback(async () => {
  if (!user?.username) return;
  try {
    setRefreshing(true);
    const data = await ApiService.getConversations(user.username);
    setChats(data);

    // Re-join all conversation rooms
    data.forEach(c => {
      if (c?.id != null) {
        WebSocketService.joinConversation(String(c.id));
      }
      if (c?.type === 'community' && c?.communityId) {
        WebSocketService.joinCommunityChat(c.communityId);
      }
    });
  } catch (error) {
    console.error('Error refreshing chats:', error);
  } finally {
    setRefreshing(false);
  }
}, [user?.username]);
```

4. **Thêm RefreshControl vào FlatList:**
```typescript
<FlatList
  data={filteredChats}
  renderItem={renderChatItem}
  keyExtractor={(item) => item.id}
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[colors.primary]}
      tintColor={colors.primary}
    />
  }
  ListEmptyComponent={...}
/>
```

---

## Testing & Validation

### Kiểm Tra Distance Accuracy

1. **Kiểm tra trong Hangout Map:**
   - Mở trang Hangout Map
   - Kiểm tra khoảng cách hiển thị có chính xác không
   - Verify rằng người dùng gần nhất xuất hiện đầu tiên
   - Kiểm tra format: meters cho < 1km, km cho >= 1km

2. **Kiểm tra GPS Accuracy:**
   - Enable location permissions
   - Verify app sử dụng High accuracy GPS
   - Test fallback khi High accuracy không khả dụng

### Kiểm Tra Pull-to-Refresh

1. **Kiểm tra trong Inbox:**
   - Mở tab Inbox
   - Kéo danh sách xuống từ trên
   - Verify loading indicator hiển thị
   - Verify danh sách được refresh sau khi thả

2. **Kiểm tra với các tab khác nhau:**
   - Test trong tab "All"
   - Test trong tab "Communities"
   - Test trong tab "Users"

---

## Technical Details

### Distance Calculation Improvements

#### Haversine Formula

Công thức Haversine tính khoảng cách great-circle (đường chim bay) giữa hai điểm trên mặt cầu:

```
a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
c = 2 × atan2(√a, √(1-a))
d = R × c
```

Trong đó:
- `R` = bán kính Trái Đất (6371.0088 km - WGS84 standard)
- `lat1, lon1` = vĩ độ và kinh độ điểm 1
- `lat2, lon2` = vĩ độ và kinh độ điểm 2
- `Δlat` = lat2 - lat1
- `Δlon` = lon2 - lon1
- `d` = khoảng cách giữa hai điểm

#### GPS Accuracy Levels

Expo Location cung cấp các mức độ chính xác:

- `Lowest`: ~3km accuracy (fastest)
- `Low`: ~1km accuracy
- `Balanced`: ~100m accuracy (default)
- `High`: ~10m accuracy (uses GPS, slowest but most accurate)
- `Highest`: < 10m accuracy
- `BestForNavigation`: Best possible accuracy for navigation

Chúng ta sử dụng `High` để có độ chính xác ~10m, phù hợp cho distance calculations.

---

## Performance Considerations

### Distance Calculation

- Haversine formula là O(1) - constant time complexity
- Không ảnh hưởng performance với số lượng users lớn
- Sorting users by distance là O(n log n) - acceptable cho < 1000 users

### Pull-to-Refresh

- Chỉ gọi API khi người dùng chủ động pull
- Không ảnh hưởng realtime updates từ WebSocket
- State management tối ưu với `useCallback`

---

## Browser/Device Compatibility

### Distance Calculation
- ✅ iOS - Full support
- ✅ Android - Full support
- ✅ Web - Partial support (GPS may not be available)

### Pull-to-Refresh
- ✅ iOS - Native feel with bounce animation
- ✅ Android - Material Design ripple effect
- ⚠️ Web - Limited support (requires touch device)

---

## Future Improvements

### Distance Accuracy
1. Implement Vincenty formula for even higher accuracy (accounts for Earth's ellipsoid shape)
2. Add caching for calculated distances to improve performance
3. Add distance filters (e.g., "Show only users within 5km")

### Pull-to-Refresh
1. Add haptic feedback on iOS
2. Add custom animations
3. Add "last updated" timestamp display

---

## Changelog

### Version 1.0 - 2025-12-04

#### Added
- ✅ Improved distance calculation accuracy using WGS84 Earth radius
- ✅ Better distance formatting (meters/kilometers)
- ✅ Distance-based user sorting in Hangout Map (closest first)
- ✅ High GPS accuracy for better location tracking
- ✅ Pull-to-refresh functionality in Inbox tab
- ✅ Server patch file for distance calculation improvements

#### Changed
- ⚡ Updated `src/utils/distance.ts` - Improved calculateDistance and formatDistance
- ⚡ Updated `src/services/location.ts` - High GPS accuracy with fallback
- ⚡ Updated `app/hangout/hangout-map.tsx` - Sorting and formatting
- ⚡ Updated `app/(tabs)/inbox.tsx` - Pull-to-refresh support

#### Fixed
- 🐛 Distance display now more accurate (WGS84 standard)
- 🐛 GPS accuracy improved for better location tracking

---

## Support

Nếu có vấn đề hoặc câu hỏi:
1. Kiểm tra logs trong console
2. Verify location permissions được cấp
3. Test trên thiết bị thật (GPS accuracy tốt hơn trên simulator)

---

## References

1. [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)
2. [WGS84 Earth Model](https://en.wikipedia.org/wiki/World_Geodetic_System)
3. [Expo Location Documentation](https://docs.expo.dev/versions/latest/sdk/location/)
4. [React Native RefreshControl](https://reactnative.dev/docs/refreshcontrol)
