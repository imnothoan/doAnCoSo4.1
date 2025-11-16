# Server Setup and Integration Guide

This guide explains how to set up and configure the ConnectSphere server for use with the mobile client.

## Server Repository

**Repository**: https://github.com/imnothoan/doAnCoSo4.1.server

## Quick Start

### 1. Clone the Server

```bash
git clone https://github.com/imnothoan/doAnCoSo4.1.server
cd doAnCoSo4.1.server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file in the server root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:19000,http://192.168.1.228:19000

# File Upload Configuration
MAX_FILE_SIZE=10485760  # 10MB in bytes
```

### 4. Database Setup

The server uses Supabase (PostgreSQL) as the database. Required tables:

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  avatar TEXT,
  background_image TEXT,  -- For hangout cards
  country TEXT,
  city TEXT,
  bio TEXT,
  gender TEXT,
  age INTEGER,
  status TEXT,
  languages JSONB,
  interests TEXT[],
  is_online BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Conversations Table
```sql
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('dm', 'group', 'event')),
  title TEXT,
  created_by TEXT REFERENCES users(username),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Conversation Members Table
```sql
CREATE TABLE conversation_members (
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
  username TEXT REFERENCES users(username),
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_muted BOOLEAN DEFAULT false,
  PRIMARY KEY (conversation_id, username)
);
```

#### Messages Table
```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
  sender_username TEXT REFERENCES users(username),
  message_type TEXT DEFAULT 'text',
  content TEXT NOT NULL,
  reply_to_message_id INTEGER REFERENCES messages(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Message Reads Table
```sql
CREATE TABLE message_reads (
  message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
  username TEXT REFERENCES users(username),
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (message_id, username)
);
```

#### Hangouts Tables
```sql
CREATE TABLE hangout_status (
  username TEXT PRIMARY KEY REFERENCES users(username),
  is_available BOOLEAN DEFAULT false,
  current_activity TEXT,
  activities TEXT[],
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

See the server repository's `DATABASE_SETUP.md` for complete schema.

### 5. Start the Server

```bash
npm start
```

The server should start on `http://localhost:3000` (or your configured port).

## Server Features Required by Client

### 1. WebSocket (Socket.IO)

The server MUST implement WebSocket functionality for real-time messaging:

#### Events the server MUST handle:
- `join_conversation` - When user enters a chat
- `leave_conversation` - When user exits a chat
- `send_message` - When user sends a message
- `typing` - Typing indicator
- `mark_read` - Mark messages as read
- `heartbeat_ack` - Keep connection alive

#### Events the server MUST emit:
- `new_message` - Broadcast new messages to conversation participants
- `typing` - Broadcast typing status
- `messages_read` - Broadcast read status
- `user_status` - Broadcast online/offline status
- `heartbeat` - Keep connection alive

### 2. REST API Endpoints

#### Users
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `GET /users` - Get all users (with filters)
- `GET /users/:username` - Get user by username
- `PUT /users/:username` - Update user profile
- `POST /users/:username/avatar` - Upload avatar
- `POST /users/:username/background` - Upload background image

#### Conversations
- `GET /messages/conversations?user=<username>` - **CRITICAL**: Must return `other_participant` field for DM conversations
  ```json
  {
    "id": 1,
    "type": "dm",
    "last_message": {
      "id": 123,
      "content": "Hello",
      "sender": {
        "username": "user1",
        "name": "User One",
        "avatar": "https://...",
        // ... full user object
      }
    },
    "other_participant": {  // REQUIRED for DM conversations
      "username": "user2",
      "name": "User Two", 
      "avatar": "https://...",
      // ... full user object
    },
    "unread_count": 2
  }
  ```
- `POST /messages/conversations` - Create conversation (DM or group)
- `GET /messages/conversations/:id` - Get conversation details
- `GET /messages/conversations/:id/messages` - Get messages in conversation
- `POST /messages/conversations/:id/messages` - Send message (if WebSocket fails)

#### Hangouts
- `GET /hangouts` - Get users available for hangout (MUST filter by `is_online=true`)
- `GET /hangouts/status/:username` - Get user's hangout status
- `PUT /hangouts/status` - Update hangout status (visibility toggle)

## Critical Requirements for Real-time Messaging

### 1. Complete User Data in WebSocket Messages

When emitting `new_message` event, the server MUST include complete sender information:

```javascript
// ❌ BAD - Incomplete data
socket.emit('new_message', {
  id: messageId,
  content: 'Hello',
  senderId: 'user1'
});

// ✅ GOOD - Complete data
socket.emit('new_message', {
  id: messageId,
  content: 'Hello',
  chatId: conversationId,
  senderId: 'user1',
  sender: {
    id: 'user1',
    username: 'user1',
    name: 'User One',
    avatar: 'https://...',
    email: 'user1@example.com',
    country: 'USA',
    city: 'New York',
    // ... all user fields
  },
  timestamp: '2024-01-01T12:00:00.000Z'
});
```

### 2. Online Status Management

The server MUST:
- Set `is_online = true` when user connects via WebSocket
- Set `is_online = false` when user disconnects
- Update `last_seen` timestamp on disconnect
- Broadcast `user_status` events when online status changes

### 3. Conversation List with Participants

The `GET /messages/conversations` endpoint MUST:
- Return `other_participant` object for DM conversations
- Include full user profile (name, avatar, etc.)
- Calculate `unread_count` correctly
- Include last message with sender details

## Network Configuration

### For Local Testing

1. **Find your server's IP address**:
   ```bash
   # On macOS/Linux
   ifconfig | grep "inet "
   
   # On Windows
   ipconfig
   ```

2. **Update client `.env`**:
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.XXX:3000
   ```

3. **Ensure firewall allows connections** on port 3000

### For Production Deployment

1. Deploy server to a cloud provider (Heroku, AWS, DigitalOcean, etc.)
2. Set up SSL/TLS for HTTPS
3. Update client `.env` with production URL:
   ```env
   EXPO_PUBLIC_API_URL=https://your-server.com
   ```

## Troubleshooting

### Issue: WebSocket not connecting

**Check**:
1. Server is running and accessible
2. Client `.env` has correct server URL
3. CORS is configured to allow client origin
4. Firewall allows WebSocket connections

**Server logs should show**:
```
🔌 WebSocket client connected: <socket-id>
✅ User authenticated: <username>
```

### Issue: Messages not delivered

**Check**:
1. WebSocket is connected (client logs should show "✅ WebSocket connected")
2. User is authenticated (check server logs)
3. User has joined the conversation room
4. Message is being emitted to correct room

### Issue: Inbox shows "Direct Message" instead of user name

**Cause**: Server not returning `other_participant` field in conversation list

**Fix**: Ensure `/messages/conversations` endpoint returns:
```javascript
// In the response for DM conversations
{
  type: 'dm',
  other_participant: {
    username: '...',
    name: '...',
    avatar: '...',
    // ... full user object
  }
}
```

### Issue: Hangout shows offline users

**Cause**: `is_online` field not being updated correctly

**Fix**: 
1. Verify WebSocket disconnect handler updates `is_online = false`
2. Check `/hangouts` endpoint filters by `is_online = true`
3. Verify heartbeat mechanism is working

## Server Monitoring

Recommended monitoring:
- WebSocket connection count
- Active conversations
- Message delivery rate
- Failed message count
- Database query performance
- API response times

## Security Considerations

1. **Authentication**: Verify JWT tokens on WebSocket connections
2. **Authorization**: Check user permissions before:
   - Sending messages
   - Accessing conversations
   - Viewing user profiles
3. **Rate Limiting**: Implement rate limits for:
   - Message sending (prevent spam)
   - API requests
   - File uploads
4. **Input Validation**: Sanitize all user inputs
5. **File Upload**: 
   - Validate file types
   - Limit file sizes
   - Scan for malware

## Performance Optimization

1. **Database Indexing**:
   ```sql
   CREATE INDEX idx_messages_conversation ON messages(conversation_id);
   CREATE INDEX idx_messages_sender ON messages(sender_username);
   CREATE INDEX idx_conversation_members ON conversation_members(username);
   ```

2. **Caching**: Consider Redis for:
   - Online user list
   - Conversation metadata
   - User profiles

3. **Connection Pooling**: Configure database connection pool
   ```javascript
   // Example for PostgreSQL
   pool: {
     min: 2,
     max: 10
   }
   ```

## Updating the Server

When pulling server updates:

```bash
cd doAnCoSo4.1.server
git pull
npm install  # Install new dependencies
# Run any migrations if needed
npm start
```

## Support

For server issues:
1. Check server logs
2. Review server repository issues: https://github.com/imnothoan/doAnCoSo4.1.server/issues
3. Verify database schema matches requirements
4. Test API endpoints with Postman/curl

---

**Last Updated**: 2024
**Server Repository**: https://github.com/imnothoan/doAnCoSo4.1.server
