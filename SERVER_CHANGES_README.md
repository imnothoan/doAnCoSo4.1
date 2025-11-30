# Server Changes Required

This file documents the changes that need to be applied to the server repository (https://github.com/imnothoan/doAnCoSo4.1.server) for the client features to work correctly.

## Changes:

### 1. routes/community.routes.js - GET /communities/:id
- Added `membership_status` field to the response
- Returns 'pending', 'approved', or null based on user's membership status
- This enables the client to show the correct button state (Join/Pending/Joined)

### 2. routes/message.routes.js - GET /messages/conversations
- Added `community_id` to the conversation query
- Added community info (name, image_url) for community type conversations
- This enables community chats to show in Inbox with proper name and avatar

### 3. NEW: Community Events Feature (requires new database table and routes)

#### Database Table: `community_events`
```sql
CREATE TABLE community_events (
  id SERIAL PRIMARY KEY,
  community_id INTEGER REFERENCES communities(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  location VARCHAR(500),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  created_by VARCHAR(255) REFERENCES users(username) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Database Table: `community_event_participants`
```sql
CREATE TABLE community_event_participants (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES community_events(id) ON DELETE CASCADE,
  username VARCHAR(255) REFERENCES users(username) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('going', 'interested')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, username)
);
```

#### Required API Endpoints in routes/community.routes.js:

1. **GET /communities/:id/events** - List all events for a community
   - Query params: `viewer` (username to check participation status)
   - Returns array of events with `participant_count`, `is_going`, `is_interested`

2. **GET /communities/:id/events/:eventId** - Get single event details
   - Query params: `viewer` (username to check participation status)
   - Returns event with creator info and participation status

3. **POST /communities/:id/events** - Create new event (auth required, member only)
   - Body: `name`, `description`, `location`, `start_time`, `end_time`
   - Supports image upload via multipart form data

4. **PUT /communities/:id/events/:eventId** - Update event (auth required, creator/admin only)
   - Body: fields to update

5. **DELETE /communities/:id/events/:eventId** - Delete event (auth required, creator/admin only)

6. **POST /communities/:id/events/:eventId/respond** - Respond to event
   - Body: `status` ('going', 'interested', 'not_going')
   - Creates or updates participation record

7. **GET /communities/:id/events/:eventId/participants** - List event participants
   - Query params: `status` (optional, filter by 'going' or 'interested')
   - Returns array of participants with user info

## How to Apply Existing Patches:
Apply the patch file `SERVER_CHANGES.patch` to the server repository:
```bash
cd doAnCoSo4.1.server
git apply /path/to/SERVER_CHANGES.patch
```

## Example Implementation for Events:

```javascript
// GET /communities/:id/events
router.get("/:id/events", optionalAuth, async (req, res) => {
  const { id } = req.params;
  const viewer = req.query.viewer || req.user?.username;
  
  try {
    const { data: events, error } = await supabase
      .from("community_events")
      .select(`
        *,
        creator:created_by(username, name, avatar)
      `)
      .eq("community_id", id)
      .order("start_time", { ascending: true });
    
    if (error) throw error;
    
    // Get participant counts and viewer status for each event
    const enrichedEvents = await Promise.all(events.map(async (event) => {
      const { count: goingCount } = await supabase
        .from("community_event_participants")
        .select("*", { count: "exact", head: true })
        .eq("event_id", event.id)
        .eq("status", "going");
      
      let isGoing = false, isInterested = false;
      if (viewer) {
        const { data: participation } = await supabase
          .from("community_event_participants")
          .select("status")
          .eq("event_id", event.id)
          .eq("username", viewer)
          .single();
        
        if (participation) {
          isGoing = participation.status === "going";
          isInterested = participation.status === "interested";
        }
      }
      
      return {
        ...event,
        participant_count: goingCount || 0,
        is_going: isGoing,
        is_interested: isInterested,
      };
    }));
    
    res.json(enrichedEvents);
  } catch (err) {
    console.error("get community events error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
```

