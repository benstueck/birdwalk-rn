# Technical Architecture Patterns for Social Features

## Overview

This document covers technical architecture patterns for implementing social features in mobile apps, including real-time communication, geolocation sharing, presence systems, and data models.

## 1. Real-Time Communication

### 1.1 WebSockets vs. Polling

Modern real-time features require choosing between different communication protocols. The choice significantly impacts performance, scalability, and user experience.

#### WebSocket Protocol

**How It Works:**
"WebSockets are a protocol that enables full-duplex, persistent communication between a client and server over a single TCP connection"

**Characteristics:**
- Bidirectional communication
- Single persistent connection
- Low latency (sub-second updates)
- Minimal overhead after handshake
- Event-driven architecture

**Technical Details:**
- "Data flows in both directions with minimal overhead"
- "Server pushes data to client instantly over the open connection, resulting in minimal latency"
- "Far less overhead per message (after initial handshake) because you aren't constantly re-sending HTTP headers"
- "WebSocket connections consume fewer resources and scale better than long polling"
- "Maintaining a single open connection per client and reducing the overhead"

**Best Use Cases:**
- Real-time location tracking during walks
- Live activity feeds
- Instant messaging/chat during group activities
- Presence indicators (who's online)
- Collaborative features requiring sub-second updates

**Example Implementation:**
"WebSockets can add live location tracking capabilities to urban mobility and food delivery apps"

**Advantages:**
- Extremely low latency (10-100ms)
- Efficient bandwidth usage
- Better battery life on mobile (fewer wake-ups)
- Scales well with proper infrastructure
- Native support in all modern browsers and mobile platforms

**Disadvantages:**
- More complex to implement than polling
- Requires WebSocket-compatible infrastructure
- Connection management (reconnection logic)
- Load balancing considerations
- Stateful connections (sticky sessions or shared state)

#### Long Polling

**How It Works:**
- Client makes HTTP request
- Server holds connection open until new data available
- Server responds with data
- Client immediately makes new request
- Cycle repeats

**Characteristics:**
- Built on standard HTTP
- Simpler than WebSockets
- Higher latency than WebSockets
- More server/network overhead

**Advantages:**
- "Extremely easy to build and debug"
- "Works in almost any environment"
- No special infrastructure required
- Works through most firewalls/proxies
- Stateless (easier to scale horizontally)

**Disadvantages:**
- "Creates strain on infrastructure at scale"
- "Constantly re-sending HTTP headers"
- "Limits performance under load"
- Higher latency (typically 1-5 seconds)
- More battery drain on mobile devices

**Use Cases:**
- Low-traffic scenarios
- Simple notification systems
- When WebSocket infrastructure unavailable
- Fallback when WebSocket connection fails

#### Recommendation

**For Location Tracking and Social Features:**
"For modern mobile apps requiring real-time location tracking, WebSockets are the recommended approach"

**Decision Matrix:**

| Feature | Use WebSockets | Use Polling |
|---------|---------------|-------------|
| Live location sharing | ✅ Yes | ❌ No |
| Real-time chat | ✅ Yes | ❌ No |
| Presence system | ✅ Yes | ⚠️ Maybe |
| Activity feed updates | ✅ Yes | ⚠️ Maybe |
| Periodic stats refresh | ❌ No | ✅ Yes |
| Low-frequency notifications | ❌ No | ✅ Yes |

**Hybrid Approach:**
- Use WebSockets for real-time features
- Fall back to polling if WebSocket fails
- Use REST API for non-real-time operations

### 1.2 WebSocket Implementation

#### Server-Side Architecture

**Popular Solutions:**
- Socket.IO (Node.js)
- WS library (Node.js)
- Pusher (managed service)
- PubNub (managed service)
- Firebase Realtime Database
- AWS AppSync (GraphQL subscriptions)

**Socket.IO Example (Node.js):**
```javascript
const io = require('socket.io')(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://app.com'],
    credentials: true
  },
  transports: ['websocket', 'polling'] // WebSocket preferred, polling fallback
});

// Authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (isValidToken(token)) {
    socket.userId = getUserIdFromToken(token);
    next();
  } else {
    next(new Error('Authentication error'));
  }
});

// Connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);

  // Join user to their personal room
  socket.join(`user:${socket.userId}`);

  // Join activity
  socket.on('join-activity', (activityId) => {
    socket.join(`activity:${activityId}`);

    // Notify others in activity
    socket.to(`activity:${activityId}`).emit('user-joined', {
      userId: socket.userId,
      timestamp: Date.now()
    });
  });

  // Handle location updates
  socket.on('location-update', async (data) => {
    const { activityId, location } = data;

    // Validate and store location
    await storeLocation(socket.userId, activityId, location);

    // Broadcast to activity participants
    socket.to(`activity:${activityId}`).emit('participant-location', {
      userId: socket.userId,
      location,
      timestamp: Date.now()
    });
  });

  // Leave activity
  socket.on('leave-activity', (activityId) => {
    socket.leave(`activity:${activityId}`);

    socket.to(`activity:${activityId}`).emit('user-left', {
      userId: socket.userId,
      timestamp: Date.now()
    });
  });

  // Disconnection
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
    // Update presence status
    updatePresenceStatus(socket.userId, 'offline');
  });
});
```

**Scaling Considerations:**
```javascript
// For multi-server deployments, use Redis adapter
const redisAdapter = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

io.adapter(redisAdapter(pubClient, subClient));

// Now Socket.IO can communicate across multiple server instances
// Clients connected to different servers can still communicate
```

#### Client-Side Implementation (React Native)

**Socket.IO Client:**
```javascript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const useActivitySocket = (activityId, userId, authToken) => {
  const [socket, setSocket] = useState(null);
  const [participants, setParticipants] = useState({});
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io('https://api.app.com', {
      auth: { token: authToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    // Connection events
    socketInstance.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);

      // Join activity room
      socketInstance.emit('join-activity', activityId);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      setConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    // Activity events
    socketInstance.on('user-joined', ({ userId, timestamp }) => {
      console.log(`User ${userId} joined`);
      // Request their current location
      socketInstance.emit('request-location', { userId });
    });

    socketInstance.on('participant-location', ({ userId, location }) => {
      setParticipants(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          location,
          lastUpdate: Date.now()
        }
      }));
    });

    socketInstance.on('user-left', ({ userId }) => {
      setParticipants(prev => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    });

    setSocket(socketInstance);

    // Cleanup
    return () => {
      socketInstance.emit('leave-activity', activityId);
      socketInstance.disconnect();
    };
  }, [activityId, userId, authToken]);

  // Helper function to send location
  const sendLocation = (location) => {
    if (socket && connected) {
      socket.emit('location-update', {
        activityId,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          timestamp: location.timestamp
        }
      });
    }
  };

  return {
    socket,
    connected,
    participants,
    sendLocation
  };
};

export default useActivitySocket;
```

**Usage in Component:**
```javascript
import { useEffect } from 'react';
import * as Location from 'expo-location';
import useActivitySocket from './useActivitySocket';

function LiveActivityMap({ activityId, userId, authToken }) {
  const { connected, participants, sendLocation } = useActivitySocket(
    activityId,
    userId,
    authToken
  );

  useEffect(() => {
    let locationSubscription;

    async function startLocationTracking() {
      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      // Start watching location
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10, // Update every 10 meters
          timeInterval: 5000 // Or every 5 seconds
        },
        (location) => {
          // Send location via WebSocket
          sendLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            timestamp: location.timestamp
          });
        }
      );
    }

    if (connected) {
      startLocationTracking();
    }

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [connected]);

  return (
    <MapView>
      {/* Render current user */}
      <Marker coordinate={currentLocation} />

      {/* Render other participants */}
      {Object.entries(participants).map(([userId, data]) => (
        <Marker
          key={userId}
          coordinate={data.location}
          title={data.name}
        />
      ))}
    </MapView>
  );
}
```

### 1.3 Connection Management

#### Reconnection Strategy

**Exponential Backoff:**
```javascript
const reconnectionConfig = {
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,      // Start with 1 second
  reconnectionDelayMax: 30000,   // Max 30 seconds
  randomizationFactor: 0.5       // Randomize to avoid thundering herd
};

// Results in delays like: 1s, 1.5s, 3s, 6s, 12s, 24s, 30s, 30s...
```

**Manual Reconnection:**
```javascript
function handleReconnection(socket) {
  let reconnectAttempts = 0;
  const maxAttempts = 10;

  socket.on('disconnect', (reason) => {
    if (reason === 'io server disconnect') {
      // Server disconnected, manually reconnect
      socket.connect();
    }
    // For other reasons, Socket.IO auto-reconnects
  });

  socket.on('reconnect_attempt', () => {
    reconnectAttempts++;
    if (reconnectAttempts > maxAttempts) {
      socket.disconnect();
      showError('Unable to connect. Please check your connection.');
    }
  });

  socket.on('reconnect', () => {
    reconnectAttempts = 0;
    // Re-join rooms, sync state
    rejoinActivityRooms();
  });
}
```

#### State Synchronization

**After Reconnection:**
```javascript
socket.on('reconnect', async () => {
  // 1. Rejoin activity
  socket.emit('join-activity', activityId);

  // 2. Request missed updates
  const lastUpdate = getLastUpdateTimestamp();
  socket.emit('sync-state', {
    activityId,
    since: lastUpdate
  });

  // 3. Send current location
  const currentLocation = await getCurrentLocation();
  sendLocation(currentLocation);
});

// Server-side handling
socket.on('sync-state', async ({ activityId, since }) => {
  // Get missed locations
  const missedUpdates = await getLocationsSince(activityId, since);

  socket.emit('state-sync', {
    participants: getCurrentParticipants(activityId),
    locations: missedUpdates
  });
});
```

## 2. Geolocation Sharing

### 2.1 Location Tracking Architecture

#### Client-Side Location Collection

**Foreground Tracking (React Native):**
```javascript
import * as Location from 'expo-location';

async function startForegroundTracking(onLocationUpdate) {
  // Request permission
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission denied');
  }

  // Start watching position
  const subscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,        // Update every 5 seconds minimum
      distanceInterval: 10,       // Or every 10 meters
    },
    (location) => {
      onLocationUpdate({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude,
        accuracy: location.coords.accuracy,
        heading: location.coords.heading,
        speed: location.coords.speed,
        timestamp: location.timestamp
      });
    }
  );

  return subscription;
}

// Usage
const subscription = await startForegroundTracking((location) => {
  // Send to server
  socket.emit('location-update', location);
});

// Stop tracking
subscription.remove();
```

**Background Tracking (React Native):**
```javascript
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

const LOCATION_TASK_NAME = 'background-location-task';

// Define background task
TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }
  if (data) {
    const { locations } = data;
    // Send locations to server
    sendLocationsToServer(locations);
  }
});

// Start background tracking
async function startBackgroundTracking() {
  const { status } = await Location.requestBackgroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Background location permission denied');
  }

  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.High,
    timeInterval: 10000,      // Every 10 seconds
    distanceInterval: 20,      // Or every 20 meters
    foregroundService: {
      notificationTitle: 'Walk in Progress',
      notificationBody: 'Tracking your walk',
      notificationColor: '#00AA00'
    }
  });
}

// Stop background tracking
async function stopBackgroundTracking() {
  await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
}
```

#### Server-Side Location Storage

**Database Schema:**
```sql
-- Location points table
CREATE TABLE location_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    activity_id UUID NOT NULL REFERENCES activities(id),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    altitude DECIMAL(8, 2),
    accuracy DECIMAL(6, 2),
    heading DECIMAL(5, 2),
    speed DECIMAL(6, 2),
    recorded_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Geospatial index for proximity queries
    location GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
    ) STORED
);

-- Index for fast activity queries
CREATE INDEX idx_location_points_activity ON location_points(activity_id, recorded_at);

-- Spatial index for proximity queries
CREATE INDEX idx_location_points_geography ON location_points USING GIST(location);

-- Activities table
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255),
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    visibility VARCHAR(20) DEFAULT 'followers', -- 'public', 'followers', 'private'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity participants
CREATE TABLE activity_participants (
    activity_id UUID REFERENCES activities(id),
    user_id UUID REFERENCES users(id),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    PRIMARY KEY (activity_id, user_id)
);
```

**Location Storage Service:**
```javascript
class LocationService {
  async storeLocation(userId, activityId, location) {
    // Validate activity membership
    const participant = await db.query(
      `SELECT 1 FROM activity_participants
       WHERE activity_id = $1 AND user_id = $2 AND left_at IS NULL`,
      [activityId, userId]
    );

    if (!participant.rows.length) {
      throw new Error('User not in activity');
    }

    // Store location point
    await db.query(
      `INSERT INTO location_points
       (user_id, activity_id, latitude, longitude, altitude, accuracy,
        heading, speed, recorded_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        userId,
        activityId,
        location.latitude,
        location.longitude,
        location.altitude,
        location.accuracy,
        location.heading,
        location.speed,
        new Date(location.timestamp)
      ]
    );

    // Cache latest location in Redis for real-time access
    await redis.setex(
      `location:${activityId}:${userId}`,
      300, // 5 minute TTL
      JSON.stringify({
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: location.timestamp
      })
    );

    return true;
  }

  async getActivityLocations(activityId, since = null) {
    let query = `
      SELECT user_id, latitude, longitude, altitude, accuracy,
             heading, speed, recorded_at
      FROM location_points
      WHERE activity_id = $1
    `;
    const params = [activityId];

    if (since) {
      query += ` AND recorded_at > $2`;
      params.push(new Date(since));
    }

    query += ` ORDER BY recorded_at ASC`;

    const result = await db.query(query, params);
    return result.rows;
  }

  async getCurrentLocations(activityId) {
    // Get from Redis cache for real-time performance
    const participants = await db.query(
      `SELECT user_id FROM activity_participants
       WHERE activity_id = $1 AND left_at IS NULL`,
      [activityId]
    );

    const locations = {};

    for (const { user_id } of participants.rows) {
      const cached = await redis.get(`location:${activityId}:${user_id}`);
      if (cached) {
        locations[user_id] = JSON.parse(cached);
      }
    }

    return locations;
  }

  async getNearbyUsers(latitude, longitude, radiusMeters, userId) {
    // Use PostGIS for efficient proximity search
    const result = await db.query(
      `SELECT DISTINCT l.user_id, l.latitude, l.longitude,
              ST_Distance(l.location, ST_SetSRID(ST_MakePoint($1, $2), 4326)) as distance
       FROM location_points l
       JOIN activity_participants ap ON l.activity_id = ap.activity_id AND l.user_id = ap.user_id
       WHERE ap.left_at IS NULL
         AND l.user_id != $3
         AND l.recorded_at > NOW() - INTERVAL '5 minutes'
         AND ST_DWithin(
           l.location,
           ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
           $4
         )
       ORDER BY distance`,
      [longitude, latitude, userId, radiusMeters]
    );

    return result.rows;
  }
}
```

### 2.2 Privacy Zones Implementation

**Privacy Zone Storage:**
```sql
CREATE TABLE privacy_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    radius_meters INTEGER NOT NULL DEFAULT 200,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    center_point GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
    ) STORED,

    CHECK (radius_meters >= 100 AND radius_meters <= 2000)
);

CREATE INDEX idx_privacy_zones_user ON privacy_zones(user_id);
CREATE INDEX idx_privacy_zones_geography ON privacy_zones USING GIST(center_point);
```

**Privacy Zone Filtering:**
```javascript
class PrivacyService {
  async filterLocationsByPrivacyZones(userId, locations) {
    // Get user's privacy zones
    const zones = await db.query(
      `SELECT latitude, longitude, radius_meters FROM privacy_zones
       WHERE user_id = $1`,
      [userId]
    );

    if (!zones.rows.length) {
      return locations; // No privacy zones, return all
    }

    // Filter out locations within privacy zones
    const filteredLocations = locations.filter(location => {
      for (const zone of zones.rows) {
        const distance = this.calculateDistance(
          location.latitude,
          location.longitude,
          zone.latitude,
          zone.longitude
        );

        if (distance <= zone.radius_meters) {
          return false; // Location is in privacy zone, exclude it
        }
      }
      return true; // Location not in any privacy zone
    });

    return filteredLocations;
  }

  async getPublicRoute(userId, activityId) {
    // Get all locations
    const allLocations = await db.query(
      `SELECT latitude, longitude, recorded_at
       FROM location_points
       WHERE user_id = $1 AND activity_id = $2
       ORDER BY recorded_at ASC`,
      [userId, activityId]
    );

    // Filter by privacy zones
    const filteredLocations = await this.filterLocationsByPrivacyZones(
      userId,
      allLocations.rows
    );

    // IMPORTANT: Also filter metadata to prevent leakage
    // Don't include hidden distance in total distance calculation
    const publicRoute = {
      locations: filteredLocations,
      totalDistance: this.calculateRouteDistance(filteredLocations),
      // Don't expose: allLocations.length, actual start/end times if in zones
    };

    return publicRoute;
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    // Haversine formula
    const R = 6371000; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}
```

**Critical Security Note:**
Research shows that many apps leak privacy zone data through metadata. Always:
- Filter privacy zone locations at data collection level, not just display
- Never include hidden portions in distance calculations exposed via API
- Strip all metadata that could reveal protected locations
- Use separate calculations for user-facing vs. public-facing statistics

## 3. Presence Systems

### 3.1 Presence Architecture

**Presence States:**
```javascript
const PresenceStates = {
  ONLINE: 'online',           // App in foreground
  AWAY: 'away',               // App backgrounded
  ON_WALK: 'on_walk',         // Currently in active walk
  OFFLINE: 'offline'          // Not connected
};
```

**Heartbeat Pattern:**

"The heartbeat signal is used by the presence platform to detect the current status of a client"

**Implementation with Redis:**
```javascript
class PresenceService {
  constructor(redisClient) {
    this.redis = redisClient;
    this.HEARTBEAT_INTERVAL = 30000; // 30 seconds
    this.OFFLINE_THRESHOLD = 60000;  // 60 seconds
  }

  // Client-side: Send heartbeat
  async sendHeartbeat(userId, status = 'online', metadata = {}) {
    const presenceData = {
      userId,
      status,
      lastSeen: Date.now(),
      ...metadata
    };

    // Use sliding window pattern with two sets
    const currentSet = 'presence:current';
    const nextSet = 'presence:next';

    // Add to both sets
    await this.redis
      .pipeline()
      .zadd(currentSet, Date.now(), userId)
      .zadd(nextSet, Date.now(), userId)
      .setex(`presence:${userId}`, 60, JSON.stringify(presenceData))
      .exec();

    return true;
  }

  // Server-side: Get online users
  async getOnlineUsers() {
    const now = Date.now();
    const threshold = now - this.OFFLINE_THRESHOLD;

    // Query only current set
    const userIds = await this.redis.zrangebyscore(
      'presence:current',
      threshold,
      '+inf'
    );

    const presence = {};

    for (const userId of userIds) {
      const data = await this.redis.get(`presence:${userId}`);
      if (data) {
        presence[userId] = JSON.parse(data);
      }
    }

    return presence;
  }

  // Get presence for specific users
  async getUsersPresence(userIds) {
    const presence = {};

    const pipeline = this.redis.pipeline();
    userIds.forEach(userId => {
      pipeline.get(`presence:${userId}`);
    });

    const results = await pipeline.exec();

    userIds.forEach((userId, index) => {
      const [error, data] = results[index];
      if (data) {
        const parsed = JSON.parse(data);
        const isOnline = Date.now() - parsed.lastSeen < this.OFFLINE_THRESHOLD;
        presence[userId] = {
          ...parsed,
          status: isOnline ? parsed.status : 'offline'
        };
      } else {
        presence[userId] = { status: 'offline' };
      }
    });

    return presence;
  }

  // Cleanup: Rotate sets
  async rotateSets() {
    // This runs periodically (e.g., every 30 seconds)
    await this.redis
      .pipeline()
      .rename('presence:next', 'presence:current')
      .del('presence:next')
      .exec();
  }

  // Presence change notifications
  async notifyPresenceChange(userId, oldStatus, newStatus) {
    // Publish presence change event
    await this.redis.publish('presence:changes', JSON.stringify({
      userId,
      oldStatus,
      newStatus,
      timestamp: Date.now()
    }));

    // "Presence platform publishes an online event to the real-time
    // platform for notifying subscribers when client status changes to online"
  }
}
```

**Client Implementation:**
```javascript
// React Native presence hook
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

function usePresence(socket, userId) {
  const [status, setStatus] = useState('online');

  useEffect(() => {
    // Send initial heartbeat
    const sendHeartbeat = () => {
      socket.emit('heartbeat', {
        userId,
        status,
        timestamp: Date.now()
      });
    };

    sendHeartbeat();

    // Send periodic heartbeats
    const heartbeatInterval = setInterval(sendHeartbeat, 30000);

    // Handle app state changes
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        setStatus('online');
        sendHeartbeat();
      } else if (nextAppState === 'background') {
        setStatus('away');
        socket.emit('heartbeat', {
          userId,
          status: 'away',
          timestamp: Date.now()
        });
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    return () => {
      clearInterval(heartbeatInterval);
      subscription.remove();
    };
  }, [socket, userId, status]);

  return { status, setStatus };
}
```

### 3.2 Activity-Based Presence

**Track Who's Currently Walking:**
```javascript
class ActivityPresenceService {
  async userStartedWalk(userId, activityId) {
    await this.redis
      .pipeline()
      // Add to active walks set
      .sadd('active:walks', userId)
      // Store activity details
      .setex(`activity:${userId}`, 3600, JSON.stringify({
        activityId,
        startedAt: Date.now()
      }))
      // Update presence status
      .setex(`presence:${userId}`, 60, JSON.stringify({
        status: 'on_walk',
        activityId,
        lastSeen: Date.now()
      }))
      .exec();

    // Notify friends
    await this.notifyFriends(userId, 'started_walk', { activityId });
  }

  async userEndedWalk(userId) {
    await this.redis
      .pipeline()
      .srem('active:walks', userId)
      .del(`activity:${userId}`)
      .setex(`presence:${userId}`, 60, JSON.stringify({
        status: 'online',
        lastSeen: Date.now()
      }))
      .exec();

    await this.notifyFriends(userId, 'ended_walk');
  }

  async getActiveWalkers(userIds) {
    // Check which of the given users are currently walking
    const pipeline = this.redis.pipeline();
    userIds.forEach(userId => {
      pipeline.sismember('active:walks', userId);
      pipeline.get(`activity:${userId}`);
    });

    const results = await pipeline.exec();
    const activeWalkers = [];

    for (let i = 0; i < userIds.length; i++) {
      const isActive = results[i * 2][1]; // sismember result
      const activityData = results[i * 2 + 1][1]; // get result

      if (isActive && activityData) {
        activeWalkers.push({
          userId: userIds[i],
          ...JSON.parse(activityData)
        });
      }
    }

    return activeWalkers;
  }

  async notifyFriends(userId, event, data = {}) {
    // Get user's friends
    const friends = await db.query(
      `SELECT following_id FROM connections
       WHERE follower_id = $1 AND status = 'accepted'`,
      [userId]
    );

    // Publish to each friend's channel
    friends.rows.forEach(({ following_id }) => {
      this.redis.publish(`user:${following_id}:events`, JSON.stringify({
        type: event,
        userId,
        ...data,
        timestamp: Date.now()
      }));
    });
  }
}
```

## 4. Data Models for Connections and Shared Activities

### 4.1 Social Connection Data Models

Research shows three primary connection models used in social apps:

#### One-Way Following Model (Twitter/Instagram)

**Characteristics:**
- "Users can establish a one-way relationship where one user can follow another user without requiring mutual consent"
- Asymmetric relationship
- Creates "Followers" and "Following" counts

**Database Schema:**
```sql
CREATE TABLE connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(id),
    following_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_approved BOOLEAN DEFAULT true, -- false for private accounts
    approved_at TIMESTAMPTZ,

    UNIQUE(follower_id, following_id),
    CHECK(follower_id != following_id)
);

CREATE INDEX idx_connections_follower ON connections(follower_id);
CREATE INDEX idx_connections_following ON connections(following_id);
CREATE INDEX idx_connections_mutual ON connections(follower_id, following_id)
    WHERE is_approved = true;
```

**Queries:**
```sql
-- Get followers
SELECT follower_id FROM connections
WHERE following_id = $1 AND is_approved = true;

-- Get following
SELECT following_id FROM connections
WHERE follower_id = $1 AND is_approved = true;

-- Get mutual connections
SELECT c1.following_id as mutual_friend_id
FROM connections c1
JOIN connections c2
  ON c1.following_id = c2.follower_id
  AND c1.follower_id = c2.following_id
WHERE c1.follower_id = $1
  AND c1.is_approved = true
  AND c2.is_approved = true;

-- Check if following
SELECT 1 FROM connections
WHERE follower_id = $1 AND following_id = $2 AND is_approved = true;
```

#### Mutual Friendship Model (Facebook/LinkedIn)

**Characteristics:**
- "Mutual consent is required to establish a friendship between two users"
- Symmetric relationship
- Friendship pending until accepted

**Database Schema:**
```sql
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_1 UUID NOT NULL REFERENCES users(id),
    user_id_2 UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    initiator_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,

    UNIQUE(user_id_1, user_id_2),
    CHECK(user_id_1 < user_id_2), -- Ensure consistent ordering
    CHECK(initiator_id IN (user_id_1, user_id_2))
);

CREATE INDEX idx_friendships_user1 ON friendships(user_id_1) WHERE status = 'accepted';
CREATE INDEX idx_friendships_user2 ON friendships(user_id_2) WHERE status = 'accepted';
CREATE INDEX idx_friendships_pending ON friendships(initiator_id, status)
    WHERE status = 'pending';
```

**Helper Functions:**
```sql
-- Function to get ordered pair
CREATE FUNCTION ordered_user_pair(uid1 UUID, uid2 UUID)
RETURNS TABLE(user_id_1 UUID, user_id_2 UUID) AS $$
BEGIN
    IF uid1 < uid2 THEN
        RETURN QUERY SELECT uid1, uid2;
    ELSE
        RETURN QUERY SELECT uid2, uid1;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Check if friends
CREATE FUNCTION are_friends(uid1 UUID, uid2 UUID)
RETURNS BOOLEAN AS $$
DECLARE
    pair RECORD;
BEGIN
    SELECT * FROM ordered_user_pair(uid1, uid2) INTO pair;

    RETURN EXISTS(
        SELECT 1 FROM friendships
        WHERE user_id_1 = pair.user_id_1
          AND user_id_2 = pair.user_id_2
          AND status = 'accepted'
    );
END;
$$ LANGUAGE plpgsql;
```

**Queries:**
```sql
-- Send friend request
WITH pair AS (SELECT * FROM ordered_user_pair($1, $2))
INSERT INTO friendships (user_id_1, user_id_2, initiator_id, status)
SELECT user_id_1, user_id_2, $1, 'pending'
FROM pair
ON CONFLICT (user_id_1, user_id_2) DO NOTHING;

-- Accept friend request
WITH pair AS (SELECT * FROM ordered_user_pair($1, $2))
UPDATE friendships
SET status = 'accepted', accepted_at = NOW()
WHERE user_id_1 = (SELECT user_id_1 FROM pair)
  AND user_id_2 = (SELECT user_id_2 FROM pair)
  AND status = 'pending';

-- Get all friends
SELECT CASE
    WHEN user_id_1 = $1 THEN user_id_2
    ELSE user_id_1
END as friend_id
FROM friendships
WHERE (user_id_1 = $1 OR user_id_2 = $1)
  AND status = 'accepted';

-- Get pending requests received
SELECT CASE
    WHEN user_id_1 = $1 THEN user_id_2
    ELSE user_id_1
END as requester_id
FROM friendships
WHERE (user_id_1 = $1 OR user_id_2 = $1)
  AND initiator_id != $1
  AND status = 'pending';
```

### 4.2 Shared Activity Data Model

**Complete Schema:**
```sql
-- Activities
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255),
    description TEXT,
    activity_type VARCHAR(50) DEFAULT 'walk', -- 'walk', 'run', 'hike'
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    visibility VARCHAR(20) DEFAULT 'followers', -- 'public', 'followers', 'private'
    is_collaborative BOOLEAN DEFAULT false,
    max_participants INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CHECK (ended_at IS NULL OR ended_at > started_at)
);

-- Activity participants
CREATE TABLE activity_participants (
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    role VARCHAR(20) DEFAULT 'participant', -- 'creator', 'moderator', 'participant'
    invite_status VARCHAR(20) DEFAULT 'accepted', -- 'invited', 'accepted', 'declined'

    PRIMARY KEY (activity_id, user_id),
    CHECK (left_at IS NULL OR left_at > joined_at)
);

-- Activity invitations
CREATE TABLE activity_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    inviter_id UUID NOT NULL REFERENCES users(id),
    invitee_id UUID REFERENCES users(id), -- NULL for shareable links
    invite_token VARCHAR(255) UNIQUE,
    invite_type VARCHAR(20) NOT NULL, -- 'direct', 'link', 'code'
    max_uses INTEGER, -- NULL = unlimited
    used_count INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CHECK (invite_type IN ('direct', 'link', 'code'))
);

-- Activity statistics (denormalized for performance)
CREATE TABLE activity_stats (
    activity_id UUID PRIMARY KEY REFERENCES activities(id) ON DELETE CASCADE,
    total_distance_meters DECIMAL(10, 2),
    duration_seconds INTEGER,
    participant_count INTEGER DEFAULT 0,
    location_points_count INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activities_creator ON activities(creator_id, started_at DESC);
CREATE INDEX idx_activities_collaborative ON activities(is_collaborative, started_at DESC)
    WHERE is_collaborative = true AND ended_at IS NULL;
CREATE INDEX idx_activity_participants_user ON activity_participants(user_id, joined_at DESC)
    WHERE left_at IS NULL;
CREATE INDEX idx_activity_invitations_token ON activity_invitations(invite_token)
    WHERE expires_at > NOW();
```

**Application Layer Models (TypeScript):**
```typescript
interface Activity {
  id: string;
  creatorId: string;
  name?: string;
  description?: string;
  activityType: 'walk' | 'run' | 'hike';
  startedAt: Date;
  endedAt?: Date;
  visibility: 'public' | 'followers' | 'private';
  isCollaborative: boolean;
  maxParticipants?: number;
  createdAt: Date;
}

interface ActivityParticipant {
  activityId: string;
  userId: string;
  joinedAt: Date;
  leftAt?: Date;
  role: 'creator' | 'moderator' | 'participant';
  inviteStatus: 'invited' | 'accepted' | 'declined';
}

interface ActivityInvitation {
  id: string;
  activityId: string;
  inviterId: string;
  inviteeId?: string;
  inviteToken?: string;
  inviteType: 'direct' | 'link' | 'code';
  maxUses?: number;
  usedCount: number;
  expiresAt?: Date;
  createdAt: Date;
}

interface LocationPoint {
  id: string;
  userId: string;
  activityId: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  recordedAt: Date;
  createdAt: Date;
}
```

## Key Takeaways

### Real-Time Communication
1. **Use WebSockets for location tracking and chat** - industry standard for real-time features
2. **Implement exponential backoff reconnection** - prevent server overload
3. **State synchronization after reconnection** - resync missed updates
4. **Use Redis adapter for multi-server deployments** - enable horizontal scaling
5. **Fall back to polling if WebSocket fails** - graceful degradation

### Geolocation
1. **Adaptive update frequency** - balance battery vs accuracy based on movement
2. **Cache current locations in Redis** - fast real-time access
3. **Store historical points in PostgreSQL** - full route history
4. **Use PostGIS for proximity queries** - efficient geospatial searches
5. **Implement privacy zones at data level** - never expose hidden locations in any API

### Presence
1. **Heartbeat pattern with Redis** - efficient presence detection
2. **Sliding window sets** - handle connection failures gracefully
3. **Activity-based presence** - know who's currently walking
4. **Publish presence changes** - notify subscribers of status updates
5. **Cleanup stale presence data** - rotate sets periodically

### Data Models
1. **Choose connection model based on use case** - one-way vs mutual friendship
2. **Use UUID primary keys** - distributed-friendly
3. **Index frequently queried fields** - follower_id, following_id, activity_id
4. **Denormalize for performance** - activity statistics table
5. **Implement proper constraints** - prevent invalid states

## Sources

- [WebSockets vs Long Polling](https://ably.com/blog/websockets-vs-long-polling)
- [WebSocket vs HTTP Polling: Enterprise Comparison](https://lightyear.ai/tips/websocket-versus-http-polling)
- [Real Time Presence Platform System Design](https://systemdesign.one/real-time-presence-platform-system-design/)
- [Firebase Firestore for Real-Time Mobile App Databases](https://developersappindia.com/blog/using-firebase-firestore-for-real-time-mobile-app-databases)
- [Cloud Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Real-time location sharing with React Native and Socket.io](https://medium.com/@joycecyoj01/how-to-build-a-location-sharing-feature-using-react-native-and-socket-io-496413ee8065)
- [Create and monitor geofences - Android Developers](https://developer.android.com/develop/sensors-and-location/location/geofencing)
- [How to Design Database for Followers-Following Systems](https://www.geeksforgeeks.org/dbms/design-database-for-followers-following-systems-in-social-media-apps/)
- [User Friends System & Database Design](https://www.coderbased.com/p/user-friends-system-and-database)
- [Data modeling for social media followers/following](https://www.mongodb.com/community/forums/t/data-modeling-for-social-media-followers-following-bucket-pattern/3563)
