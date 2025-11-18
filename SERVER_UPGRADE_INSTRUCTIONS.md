# Hướng dẫn cập nhật Server để hỗ trợ Upgrade to Video Call

## Tổng quan
Server cần được cập nhật để hỗ trợ tính năng upgrade từ voice call sang video call (như Messenger).

## Thay đổi cần thiết trong file `websocket.js`

Thêm đoạn code sau vào file `/home/runner/work/doAnCoSo4.1/doAnCoSo4.1.server/websocket.js`, sau phần xử lý `end_call` event (khoảng dòng 389):

```javascript
// Handle upgrade to video call (like Messenger)
socket.on("upgrade_to_video", async ({ callId }) => {
  try {
    // Notify the other party about the upgrade request
    const parts = callId.split("_");
    if (parts.length >= 4) {
      const callerId = parts[2];
      const receiverId = parts[3];
      
      // Determine who the other party is based on current user
      const otherParty = currentUsername === callerId ? receiverId : callerId;
      const otherSocketId = onlineUsers.get(otherParty);
      
      if (otherSocketId) {
        io.to(otherSocketId).emit("upgrade_to_video", { 
          callId 
        });
        console.log(`Call ${callId} upgraded to video by ${currentUsername}`);
      }
    }
  } catch (err) {
    console.error("upgrade_to_video error:", err);
  }
});

// Handle video upgrade accepted
socket.on("video_upgrade_accepted", async ({ callId }) => {
  try {
    // Notify the requester that upgrade was accepted
    const parts = callId.split("_");
    if (parts.length >= 4) {
      const callerId = parts[2];
      const receiverId = parts[3];
      
      // Determine who the other party is
      const otherParty = currentUsername === callerId ? receiverId : callerId;
      const otherSocketId = onlineUsers.get(otherParty);
      
      if (otherSocketId) {
        io.to(otherSocketId).emit("video_upgrade_accepted", { 
          callId 
        });
        console.log(`Video upgrade accepted for call ${callId}`);
      }
    }
  } catch (err) {
    console.error("video_upgrade_accepted error:", err);
  }
});
```

## Cách áp dụng

1. Mở file `websocket.js` trong thư mục server
2. Tìm phần xử lý `socket.on("end_call", ...)`
3. Sau block code đó (sau dấu `});`), thêm 2 event handlers trên
4. Lưu file và restart server

## Kiểm tra

Sau khi cập nhật, server sẽ:
- Nhận event `upgrade_to_video` từ client khi người dùng bấm nút upgrade
- Chuyển tiếp request đến người còn lại trong cuộc gọi
- Tự động accept và notify cả 2 phía về việc upgrade thành công

## File thay đổi đã sẵn sàng

Thay đổi đã được áp dụng vào file server local tại:
`/home/runner/work/doAnCoSo4.1/doAnCoSo4.1.server/websocket.js`

Bạn cần commit và push thay đổi này lên repository server của bạn.
