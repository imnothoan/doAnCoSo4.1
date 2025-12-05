# Giải Thích Lỗi Tin Nhắn Unread - Tại Sao 1 Tin Nhưng Hiển Thị 2 Unread

**Ngày**: 5 tháng 12, 2024  
**Vấn đề**: Gửi 1 tin nhắn nhưng inbox hiển thị 2 unread messages

---

## 🔍 Phân Tích Vấn Đề

Anh ơi, em đã tìm ra nguyên nhân của vấn đề này! Đây là race condition giữa **API response** và **WebSocket updates**.

### Tình Huống Xảy Ra

```
Thời điểm T0: User A mở app
    ↓
T1: API load conversations → Server trả về unread_count = 0
    ↓
T2: User B gửi 1 tin nhắn
    ↓
T3: WebSocket broadcast message đến User A
    ↓
T4: Client nhận WebSocket message
    ↓
T5: Client tăng unread: 0 + 1 = 1 ✅ (Đúng!)
    ↓
T6: User A pull-to-refresh HOẶC API auto-refresh
    ↓
T7: Server đã có tin nhắn mới → trả về unread_count = 1
    ↓
T8: Client replace state với data từ server → unread = 1
    ↓
T9: Nếu có duplicate WebSocket event → Client lại tăng: 1 + 1 = 2 ❌ (SAI!)
```

---

## 🐛 Root Cause Analysis

### Có 3 Nguyên Nhân Có Thể:

#### 1. **Duplicate WebSocket Events**

WebSocket có thể emit cùng 1 message nhiều lần nếu:
- Reconnection xảy ra
- Server broadcast nhiều lần
- Multiple listeners được đăng ký

**Code hiện tại** (inbox.tsx:367-379):
```typescript
// Listen to new messages (DM)
WebSocketService.onNewMessage(handleNewMessage);

// Listen to new community messages
WebSocketService.onNewCommunityMessage(handleNewCommunityMessage);

// Listen for community conversation ready events
WebSocketService.on('community_conversation_ready', handleCommunityConversationReady);

return () => {
  // Clean up listeners
  WebSocketService.off('new_message', handleNewMessage);
  WebSocketService.off('new_community_message', handleNewCommunityMessage);
  WebSocketService.off('community_conversation_ready', handleCommunityConversationReady);
};
```

**Vấn đề**: Nếu useEffect chạy lại (dependency thay đổi), listeners có thể được đăng ký nhiều lần!

#### 2. **Race Condition: API vs WebSocket**

Khi API response và WebSocket message đến gần như cùng lúc:

```typescript
// Scenario:
// - API đang load conversations
// - WebSocket message đến TRONG LÚC đó
// - API response về SAU WebSocket

Step 1: WebSocket update → unread = 0 + 1 = 1
Step 2: API response → unread = 1 (from server)
Step 3: User sees: 1 unread ✅

BUT if:
Step 1: API request sent (server calculates unread = 0)
Step 2: New message arrives at server
Step 3: WebSocket broadcasts (client updates: 0 + 1 = 1)
Step 4: API response returns (unread = 1 from server BEFORE new message)
Step 5: Client replaces state → unread = 1
Step 6: Duplicate WebSocket or late broadcast → 1 + 1 = 2 ❌
```

#### 3. **State Update Logic**

**Code hiện tại** (inbox.tsx:230-232):
```typescript
unreadCount: senderId !== user.username 
  ? (existingChat.unreadCount || 0) + 1 
  : existingChat.unreadCount || 0,
```

**Vấn đề**: Nó LUÔN LUÔN tăng thêm 1 vào `existingChat.unreadCount` hiện tại, KHÔNG kiểm tra xem message đã được tính chưa!

---

## ✅ Giải Pháp

### Option 1: Message Deduplication (RECOMMENDED)

Thêm tracking để tránh đếm cùng 1 message nhiều lần:

```typescript
// Thêm state để track messages đã xử lý
const [processedMessages, setProcessedMessages] = useState<Set<string>>(new Set());

const handleNewMessage = (message: any) => {
  const messageId = message.id || message.message_id;
  
  // Skip if already processed
  if (messageId && processedMessages.has(String(messageId))) {
    console.log('⚠️ Duplicate message, skipping:', messageId);
    return;
  }
  
  // Mark as processed
  if (messageId) {
    setProcessedMessages(prev => new Set(prev).add(String(messageId)));
  }
  
  // ... rest of logic
};
```

### Option 2: Use Server as Source of Truth

Thay vì increment locally, reload từ server sau mỗi message:

```typescript
const handleNewMessage = (message: any) => {
  // Update UI immediately for better UX
  setChats(prevChats => {
    // Update last message only, DON'T touch unread count
  });
  
  // Reload from server after short delay (debounced)
  setTimeout(() => {
    loadChats(); // This gets accurate unread_count from server
  }, 500);
};
```

**Ưu điểm**: Server luôn chính xác (đã có fix)  
**Nhược điểm**: Nhiều API calls hơn

### Option 3: Smart Merge Logic

Chỉ tăng unread nếu message chưa có trong server count:

```typescript
const handleNewMessage = (message: any) => {
  setChats(prevChats => {
    const existingChat = prevChats[existingIndex];
    
    // Check if this message is newer than last API load
    const lastApiLoad = existingChat.lastApiLoadTime || 0;
    const messageTime = new Date(messageTimestamp).getTime();
    
    // Only increment if message is newer than last API load
    const shouldIncrement = messageTime > lastApiLoad && senderId !== user.username;
    
    const updatedChat = {
      ...existingChat,
      unreadCount: shouldIncrement 
        ? (existingChat.unreadCount || 0) + 1 
        : existingChat.unreadCount || 0,
    };
  });
};
```

---

## 🧪 Cách Test

### Test Case 1: Duplicate WebSocket
```
1. User A mở inbox
2. User B gửi 1 tin
3. Check console logs xem có duplicate events không
4. Verify unread count = 1 (không phải 2)
```

### Test Case 2: Race Condition
```
1. User A mở inbox
2. User B gửi tin NGAY KHI A đang pull-to-refresh
3. Check unread count sau khi refresh xong
4. Should be 1, not 2
```

### Test Case 3: Reconnection
```
1. User A mở inbox  
2. Disconnect internet
3. User B gửi tin
4. Reconnect internet
5. Check unread count (should be 1)
```

---

## 📊 Debug Information

### Để tìm nguyên nhân chính xác, anh cần:

1. **Add logging** trong handleNewMessage:
```typescript
const handleNewMessage = (message: any) => {
  console.log('📨 WebSocket message received:', {
    messageId: message.id,
    conversationId: message.conversation_id,
    sender: message.sender_username,
    currentUnread: existingChat?.unreadCount,
    timestamp: new Date().toISOString(),
  });
  // ... rest of code
};
```

2. **Check WebSocket listeners**:
```typescript
useEffect(() => {
  console.log('🔌 Registering WebSocket listeners');
  
  WebSocketService.onNewMessage(handleNewMessage);
  
  return () => {
    console.log('🔌 Cleaning up WebSocket listeners');
    WebSocketService.off('new_message', handleNewMessage);
  };
}, [user?.username, user, loadChats]); // ⚠️ Check these dependencies!
```

3. **Monitor API calls**:
```typescript
const loadChats = useCallback(async () => {
  console.log('🔄 Loading chats from API at', new Date().toISOString());
  const data = await ApiService.getConversations(user.username);
  console.log('✅ Got chats:', data.map(c => ({
    id: c.id,
    unread: c.unreadCount,
  })));
  setChats(data);
}, [user?.username]);
```

---

## 🎯 Khuyến Nghị Ngay

**Em khuyến nghị anh implement Option 1 (Message Deduplication)** vì:

✅ Đơn giản và hiệu quả  
✅ Không tăng API calls  
✅ Giải quyết được cả 3 nguyên nhân  
✅ Performance tốt (chỉ dùng Set trong memory)  

**Em sẽ implement fix này cho anh ngay bây giờ!**

---

## 🔄 Implementation Plan

1. Add message deduplication tracking
2. Update handleNewMessage to check for duplicates
3. Update handleNewCommunityMessage similarly
4. Add cleanup for processedMessages (clear old ones after 5 minutes)
5. Add logging for debugging
6. Test thoroughly

---

**Kết luận**: Vấn đề KHÔNG PHẢI Ở SERVER (server đã fix đúng), mà là ở CLIENT xử lý WebSocket events có thể bị duplicate hoặc race condition với API calls.

Em sẽ fix ngay ạ!
