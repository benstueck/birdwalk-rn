# Collaborative Walks Research

Comprehensive research on implementing social and collaborative features in mobile walking apps, based on industry best practices from Strava, Nike Run Club, AllTrails, Pokemon Go, and 2026 mobile platform standards.

## Documents

### [Executive Summary](./00-executive-summary.md)
High-level overview, key insights, implementation roadmap, and technology recommendations. **Start here** for a quick overview.

### [1. Social Connection Systems](./01-social-connection-systems.md)
How modern mobile apps handle social connections:
- Finding friends (contacts, email, username, QR codes, nearby users)
- Connection models (one-way following vs. mutual friendship)
- Sending/accepting connection requests
- Privacy controls and permissions
- Managing connections

**Key Insights:**
- Don't request contacts during onboarding (28% higher grant rates when contextual)
- iOS 18 allows partial contact sharing
- Username search + QR codes = zero-permission friend discovery
- Privacy by design, not as an afterthought

### [2. Collaborative Activity Features](./02-collaborative-activity-features.md)
How apps handle real-time and shared activities:
- Invitation methods (direct, links, codes, QR)
- Real-time location sharing (ephemeral, activity-based, continuous)
- Group vs. 1:1 sessions
- Activity visibility and privacy settings

**Key Insights:**
- WebSockets recommended for real-time location tracking
- Activity-based sharing best for fitness apps (privacy-preserving)
- Support multiple invitation methods for different contexts
- Strava Beacon: Updates every 15 seconds, works via web link

### [3. Mobile Platform Standards](./03-mobile-platform-standards.md)
iOS and Android best practices:
- Location permissions (foreground, background, precise, approximate)
- Contacts access (iOS 18 changes, privacy-first design)
- Notification patterns (granular controls, smart timing)
- Regulatory compliance (GDPR, CCPA)

**Key Insights:**
- Always start with "While Using App" permission
- Request just-in-time (28% higher grant rate)
- 2026: Single notification toggle no longer acceptable UX
- CCPA: 45-day deletion requirement, $200/day penalties

### [4. Technical Architecture Patterns](./04-technical-architecture-patterns.md)
Implementation details:
- WebSockets vs. polling (WebSockets win for real-time)
- Geolocation sharing architecture
- Presence systems (heartbeat pattern, Redis)
- Data models for connections and activities

**Key Insights:**
- Socket.IO with Redis adapter for horizontal scaling
- Redis for current locations (5-min TTL), PostgreSQL for history
- Privacy zones: Filter at data level, not display level
- 95.1% of users at risk from improper privacy zone implementation

### [5. UX Patterns](./05-ux-patterns.md)
Common UI/UX patterns:
- Friend discovery flows
- Activity invitation flows
- In-activity collaboration UI
- Privacy controls and settings

**Key Insights:**
- Never show friend discovery during initial onboarding
- Offer after 1-3 successful activities
- Rich invitation details (who, when, where, who else)
- In-context privacy controls (adjust during activity creation)

## Quick Reference

### Permission Request Checklist

**Location:**
```
✅ Request when user taps "Start Walk" (contextual)
✅ Show custom explainer before system dialog
✅ Start with "While Using App"
✅ Handle both precise and approximate
✅ Provide Settings deep link if denied
❌ Never request on app launch
❌ Never request "Always Allow" initially
```

**Contacts:**
```
✅ Only if absolutely necessary
✅ Request when user taps "Find Friends from Contacts"
✅ Show clear value proposition
✅ Handle iOS 18 partial access
✅ Provide alternatives (username search, QR)
❌ Never during onboarding
❌ Never auto-upload without consent
```

**Notifications:**
```
✅ Request after meaningful user action
✅ Granular controls (separate channels)
✅ Respect quiet hours
✅ Quick actions (accept/decline in notification)
❌ Never request during first app launch
❌ Never single on/off toggle
```

### WebSocket Implementation

**Client (React Native):**
```javascript
import io from 'socket.io-client';

const socket = io('https://api.app.com', {
  auth: { token: authToken },
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10
});

socket.on('connect', () => {
  socket.emit('join-activity', activityId);
});

socket.on('participant-location', ({ userId, location }) => {
  updateParticipantMarker(userId, location);
});

// Send location updates
socket.emit('location-update', {
  activityId,
  location: { latitude, longitude, timestamp }
});
```

**Server (Node.js):**
```javascript
const io = require('socket.io')(server);
const redisAdapter = require('@socket.io/redis-adapter');

// Enable scaling across multiple servers
io.adapter(redisAdapter(pubClient, subClient));

io.on('connection', (socket) => {
  socket.join(`activity:${activityId}`);

  socket.on('location-update', (data) => {
    // Broadcast to activity participants
    socket.to(`activity:${activityId}`).emit('participant-location', {
      userId: socket.userId,
      location: data.location
    });
  });
});
```

### Database Schemas

**Connections (One-Way Following):**
```sql
CREATE TABLE connections (
    id UUID PRIMARY KEY,
    follower_id UUID NOT NULL REFERENCES users(id),
    following_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_approved BOOLEAN DEFAULT true,
    UNIQUE(follower_id, following_id)
);

CREATE INDEX idx_connections_follower ON connections(follower_id);
CREATE INDEX idx_connections_following ON connections(following_id);
```

**Activities:**
```sql
CREATE TABLE activities (
    id UUID PRIMARY KEY,
    creator_id UUID NOT NULL REFERENCES users(id),
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    visibility VARCHAR(20) DEFAULT 'followers',
    is_collaborative BOOLEAN DEFAULT false
);

CREATE TABLE activity_participants (
    activity_id UUID REFERENCES activities(id),
    user_id UUID REFERENCES users(id),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    PRIMARY KEY (activity_id, user_id)
);
```

**Locations:**
```sql
CREATE TABLE location_points (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    activity_id UUID NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL,

    -- For spatial queries
    location GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
    ) STORED
);

CREATE INDEX idx_location_points_geography
    ON location_points USING GIST(location);
```

**Privacy Zones:**
```sql
CREATE TABLE privacy_zones (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    radius_meters INTEGER NOT NULL,

    center_point GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
    ) STORED,

    CHECK (radius_meters >= 100 AND radius_meters <= 2000)
);
```

### Privacy Zone Filtering

**CRITICAL: Filter at data level, not display**
```javascript
async function getPublicRoute(userId, activityId) {
  // Get privacy zones
  const zones = await db.query(
    'SELECT latitude, longitude, radius_meters FROM privacy_zones WHERE user_id = $1',
    [userId]
  );

  // Get all locations
  const locations = await db.query(
    'SELECT * FROM location_points WHERE user_id = $1 AND activity_id = $2',
    [userId, activityId]
  );

  // Filter out locations in privacy zones
  const filtered = locations.filter(loc => {
    for (const zone of zones) {
      const distance = calculateDistance(
        loc.latitude, loc.longitude,
        zone.latitude, zone.longitude
      );
      if (distance <= zone.radius_meters) {
        return false; // Exclude this location
      }
    }
    return true;
  });

  // IMPORTANT: Calculate distance only from filtered points
  // Don't expose total distance including hidden portions
  return {
    locations: filtered,
    totalDistance: calculateRouteDistance(filtered)
    // Never include: locations.length, unfiltered distance
  };
}
```

### Presence System (Redis)

```javascript
class PresenceService {
  async sendHeartbeat(userId, status = 'online') {
    // Use sliding window pattern
    await redis.pipeline()
      .zadd('presence:current', Date.now(), userId)
      .zadd('presence:next', Date.now(), userId)
      .setex(`presence:${userId}`, 60, JSON.stringify({
        status,
        lastSeen: Date.now()
      }))
      .exec();
  }

  async getOnlineUsers() {
    const threshold = Date.now() - 60000; // 60 seconds
    const userIds = await redis.zrangebyscore(
      'presence:current',
      threshold,
      '+inf'
    );
    return userIds;
  }

  // Rotate sets every 30 seconds
  async rotateSets() {
    await redis.pipeline()
      .rename('presence:next', 'presence:current')
      .del('presence:next')
      .exec();
  }
}
```

## Technology Stack

### Recommended
- **Backend:** Node.js + Express + Socket.IO
- **Database:** PostgreSQL with PostGIS extension
- **Cache:** Redis (for presence, real-time data)
- **Push:** Firebase Cloud Messaging
- **Frontend:** React Native + Expo
- **Maps:** react-native-maps
- **Location:** expo-location
- **QR Codes:** react-native-qrcode-svg

### Libraries
```json
// package.json (backend)
{
  "dependencies": {
    "express": "^4.18.0",
    "socket.io": "^4.5.0",
    "@socket.io/redis-adapter": "^8.0.0",
    "pg": "^8.8.0",
    "redis": "^4.3.0",
    "firebase-admin": "^11.0.0"
  }
}

// package.json (React Native)
{
  "dependencies": {
    "expo-location": "~16.0.0",
    "react-native-maps": "1.7.0",
    "socket.io-client": "^4.5.0",
    "react-native-qrcode-svg": "^6.2.0",
    "expo-camera": "~14.0.0"
  }
}
```

## Common Pitfalls to Avoid

### Privacy
❌ Filtering privacy zones only at display level
✅ Filter at data collection level, never expose in any API

❌ Including hidden portions in distance/duration calculations
✅ Calculate only from visible portions

❌ Exposing metadata that reveals protected locations
✅ Strip all revealing metadata from API responses

### Permissions
❌ Requesting permissions during app launch
✅ Request just-in-time when user initiates relevant action

❌ Requesting "Always Allow" location initially
✅ Start with "While Using App", upgrade later if needed

❌ Single notification on/off toggle
✅ Granular controls for each notification type

### Performance
❌ Continuous GPS polling (drains battery)
✅ Adaptive update frequency based on movement

❌ Storing all locations in Redis forever
✅ Use TTL (5 minutes), move to PostgreSQL for history

❌ Single WebSocket server (doesn't scale)
✅ Redis adapter for horizontal scaling

### UX
❌ Showing friend discovery during onboarding
✅ Offer after 1-3 successful activities

❌ Auto-following contacts without user action
✅ Show matches, let user choose whom to follow

❌ Complex privacy settings hidden in deep menus
✅ In-context controls, clear visual indicators

## Testing Checklist

### Location Sharing
- [ ] Updates work in foreground
- [ ] Updates work in background (if implemented)
- [ ] Works with poor cellular connection
- [ ] Works offline (queues updates)
- [ ] Battery impact acceptable (<10% per hour)
- [ ] Privacy zones properly hide locations
- [ ] Handles approximate location permission

### WebSockets
- [ ] Connects successfully
- [ ] Reconnects after network interruption
- [ ] Reconnects after app backgrounding
- [ ] State syncs after reconnection
- [ ] Works across multiple server instances
- [ ] Handles 10+ concurrent participants
- [ ] Latency <1 second for location updates

### Permissions
- [ ] Location permission flow works
- [ ] Contacts permission flow works (if implemented)
- [ ] Notification permission flow works
- [ ] Settings deep links work
- [ ] Handles permission denial gracefully
- [ ] Works with partial permissions (iOS 18 contacts)

### Privacy
- [ ] Privacy zones hide start/end locations
- [ ] Privacy zones hide mid-route locations
- [ ] No metadata leakage in API responses
- [ ] Activity visibility settings enforced
- [ ] Profile privacy settings enforced
- [ ] Can delete all data (GDPR/CCPA)

## Resources

### External Documentation
- [Socket.IO Documentation](https://socket.io/docs/)
- [PostGIS Documentation](https://postgis.net/docs/)
- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [iOS Location Services](https://developer.apple.com/documentation/corelocation)
- [Android Location](https://developer.android.com/develop/sensors-and-location/location)
- [GDPR Guidelines](https://gdpr.eu/)
- [CCPA Overview](https://oag.ca.gov/privacy/ccpa)

### Research Sources
All detailed sources are cited in individual research documents. Key categories:
- App support documentation (Strava, Nike Run Club, AllTrails, Pokemon Go)
- Platform developer docs (iOS, Android)
- Privacy regulations (GDPR, CCPA)
- Academic research on fitness app privacy
- 2026 mobile UX trends
- Technical architecture patterns

## Contributing

This research was compiled in February 2026. Mobile technology and best practices evolve rapidly. If you notice outdated information or have additional insights, please update the relevant documents.

## License

This research is provided as-is for the Birdwalk project. Sources are cited throughout the documents.
