# Collaborative Activity Features in Mobile Apps

## Overview

This document examines how mobile apps handle real-time and shared activities, focusing on invitation mechanisms, location sharing, privacy settings, and group collaboration patterns.

## 1. Inviting People to Join Activities

### 1.1 Invitation Methods

Modern fitness and activity apps use multiple methods for inviting participants to shared activities.

#### Direct User Selection

**How It Works:**
- Users browse their connections list
- Select one or more people to invite
- Send invitation with activity details

**Examples:**
- **Strava**: "From the activity details page, you can select the Add Friend or Add Others button. Select the orange Add Others button underneath the ride name and add friends or search for riders you don't follow"
- Users can add multiple participants to group activities

**UX Best Practices:**
- Show recently active connections first
- Display user avatars and activity statistics
- Allow search/filter within connections
- Show who's currently active or on a walk
- Indicate timezone differences for scheduling

#### Shareable Invite Links

**How It Works:**
- Generate unique URL for the activity/session
- Share via messaging, email, or social media
- Anyone with link can join (with optional restrictions)

**Technical Implementation:**
```
Link Format: https://app.com/join/[unique-token]
- unique-token: UUID or shortened hash
- Optional: Add expiration time, participant limit
- Decode token server-side to session ID
```

**Security Considerations:**
- Use cryptographically secure tokens (UUID v4)
- Implement expiration times (e.g., 24 hours after activity end)
- Allow link creator to deactivate links
- Track link usage to detect abuse
- Consider requiring authentication to join

**Examples from Research:**
- Google Messages is developing invite links that can be shared as URLs or QR codes
- Systems distinguish between one-off links (single person) and reusable links (multiple people)

#### Join Codes

**How It Works:**
- Generate short alphanumeric code (e.g., "WALK-2847")
- Users enter code to join activity
- Easier to communicate verbally than full URLs

**Design Considerations:**
- **One-Time vs. Reusable**: Decide if code works once or multiple times
- **Expiration**: Set time limits for validity
- **Code Format**: Balance memorability with security
  - 6-8 characters: Easy to remember, lower security
  - Alphanumeric: Higher collision resistance
  - Avoid confusing characters (0/O, 1/I/l)

**Examples:**
- **Pokemon Go**: 12-digit Trainer Code for adding friends
- Invite codes can be "formed as numeric or alphanumeric combinations and sent as a link or just the code via any messenger"

**Code Generation Best Practices:**
```javascript
// Generate readable codes
- Use word-based codes: "SUNSET-WALK-42"
- Exclude ambiguous characters: Remove 0, O, 1, I, l
- Include checksums for validation
- Make codes case-insensitive for ease of entry
```

#### QR Codes for Activities

**How It Works:**
- Generate QR code for specific activity session
- Others scan code to join instantly
- Ideal for in-person gatherings

**Technical Implementation:**
- Embed session ID or invite token in QR code
- QR code can encode URL (scannable by camera apps) or custom data
- Support dynamic QR codes that can be revoked

**Use Cases:**
- Group walks starting from common location
- Event-based activities (organized hikes, runs)
- Gym or studio class check-ins
- Community gathering points

**QR Code Best Practices:**
- Make codes large enough for easy scanning (minimum 2cm x 2cm)
- Ensure high contrast for readability
- Add app branding but don't obscure code
- Test with various camera apps and lighting conditions
- Provide fallback manual code entry

#### Push Notifications

**How It Works:**
- Send direct invitation via push notification
- Recipient taps to view details and respond
- Real-time delivery ensures timely responses

**Notification Content:**
```
Title: "Walk Invitation"
Body: "[Name] invited you to join a walk"
Actions: ["Accept", "Decline", "View Details"]
Data: {
  activityId: "uuid",
  inviterId: "user-id",
  startTime: "ISO-8601"
}
```

**Best Practices:**
- Include key details: who, what, when, where
- Provide quick actions (Accept/Decline without opening app)
- Show notification even if app is closed
- Respect quiet hours and notification preferences
- Don't send repeated invitations (max 1 reminder)

### 1.2 Invitation Flows

#### Pre-Activity Invitations

**Use Case:** Scheduled walks or planned activities

**Flow:**
1. User creates activity with future start time
2. Invites participants via chosen method
3. Recipients receive invitation with details
4. Participants RSVP (Accept, Decline, Maybe)
5. Host sees participant status
6. Reminders sent before activity starts
7. Activity begins at scheduled time

**Status Tracking:**
- Invited (pending response)
- Accepted (confirmed)
- Declined (not attending)
- Maybe (tentative)
- No Response (reminder sent)

**UX Considerations:**
- Allow participants to see who else is coming
- Show total participant count
- Enable chat/comments before activity
- Send reminder notifications (e.g., 15 minutes before)
- Allow last-minute cancellations with notification to others

#### During-Activity Invitations

**Use Case:** Spontaneous "join me now" invitations

**Flow:**
1. User starts activity (begin walk)
2. Activity becomes joinable
3. User sends invitations to connections
4. Recipients see real-time location and route
5. Can join in progress or decline
6. Late joiners see previous route/stats

**Real-Time Aspects:**
- Show live location of activity creator
- Display current duration and distance
- Indicate how far away inviter is from recipient
- Show estimated time to intercept route
- Update in real-time as activity progresses

**Technical Challenges:**
- Keep invitation relevant (auto-expire after distance threshold)
- Handle race conditions (activity ends before join)
- Sync state when participant joins mid-activity
- Merge statistics appropriately

### 1.3 Group Size Considerations

#### 1:1 Collaborative Sessions

**Characteristics:**
- Two participants
- Simpler coordination
- More intimate privacy settings
- Direct messaging integrated

**UX Patterns:**
- Show partner's location prominently
- Display relative position ("200m ahead")
- Voice chat or quick messages
- Shared statistics comparison

#### Small Groups (3-10 participants)

**Characteristics:**
- Multiple viewpoints needed
- Group consensus on route/pace
- Social dynamics emerge
- Chat becomes important

**UX Patterns:**
- Map view showing all participants
- List view with everyone's stats
- Group chat integrated
- Leader designation (optional)
- Splitting/regrouping support

#### Large Groups (10+ participants)

**Characteristics:**
- Event or community walks
- May need moderation
- Performance considerations
- Sub-group formations

**UX Patterns:**
- Overview map with clustering
- Leader board or featured participants
- Announcements vs. open chat
- Waypoints and checkpoints
- Graduated permissions (organizer, moderator, participant)

## 2. Real-Time Location Sharing

### 2.1 Location Sharing Approaches

#### Temporary (Ephemeral) Sharing

**How It Works:**
- Location shared for limited duration
- Automatically stops after time expires
- User sets timer (e.g., 15 minutes, 1 hour, 8 hours)

**Examples:**
- **Glympse**: "Send time-limited location updates via text, email, or social media. Location is visible only for the duration specified, after which it automatically disappears"
- "Temporary sharing is always ephemeral, with location automatically going dark when the timer expires"

**Use Cases:**
- "I'm on my way" coordination
- Meeting up at a location
- Safety check-ins during activities
- Event-based sharing

**Benefits:**
- Privacy-preserving (auto-expires)
- No ongoing tracking concerns
- Simple to understand
- Reduces user anxiety about forgotten sharing

#### Permanent/Continuous Sharing

**How It Works:**
- Location shared indefinitely until manually stopped
- Typically used for family safety or close relationships
- Requires explicit opt-in

**Examples:**
- **Life360**: "Full-family safety tracking with alerts and history, providing ongoing monitoring"
- **Google Maps**: "Users can share their whereabouts with friends and family either temporarily or permanently"

**Use Cases:**
- Family safety monitoring
- Elderly care
- Close partners/spouses
- Long-term accountability groups

**Concerns:**
- Battery drain from continuous background tracking
- Privacy implications
- Requires high trust between parties
- Needs clear communication about expectations

#### Activity-Based Sharing

**How It Works:**
- Location shared only during specific activities
- Automatically starts when activity begins
- Stops when activity ends
- Tied to app's primary function

**Examples:**
- **Strava Beacon**: "Generates a unique URL that you can share with your safety contacts via text message, allowing them to follow your activity in real-time. Location updates about every 15 seconds depending on cell service"
- **AllTrails Live Share**: "Share your planned route and real-time location with friends. AllTrails+ members can invite loved ones to see their route information, progress along the trail, and expected return time"

**Technical Details:**
- Requires cellular service for updates
- Even with GPS device (Garmin), phone needed to transmit data
- Updates typically every 10-30 seconds
- Shared via web link (no app required for viewers)

**Safety Features:**
- Share with up to 3-5 safety contacts
- No account required for viewers
- Web-based tracking interface
- Expected completion time shown
- Panic/SOS button integration

### 2.2 Location Update Mechanisms

#### Update Frequency

**Considerations:**
- **Real-Time (5-15 seconds)**: Smooth tracking, high battery usage
- **Frequent (30-60 seconds)**: Good balance, moderate battery
- **Periodic (2-5 minutes)**: Battery-saving, jerky movement
- **Significant Change**: OS-triggered, minimal battery impact

**Adaptive Frequency:**
```javascript
Strategy:
- When stationary: Update every 5 minutes
- When moving slowly: Update every 60 seconds
- When moving quickly: Update every 15 seconds
- When approaching waypoint: Update every 5 seconds
- On low battery: Switch to significant change only
```

#### Accuracy Requirements

**GPS Accuracy Levels:**
- **High Precision (±5m)**: Required for route tracking, high battery cost
- **Medium (±10-50m)**: Sufficient for "nearby" features
- **Low/Approximate (±500m-5km)**: Privacy-preserving option

**iOS Specific:**
- Users can choose "Precise Location" or "Approximate Location"
- Apps must handle both gracefully
- Request precise only when necessary

**Android Specific:**
- ACCESS_FINE_LOCATION for precise GPS
- ACCESS_COARSE_LOCATION for approximate (network/WiFi)
- Clearly justify fine location requests

### 2.3 Technical Architecture

#### Push vs. Pull Models

**Push Model (WebSocket):**
- Server pushes updates to clients
- Clients maintain persistent connection
- Real-time, low-latency updates
- Better for frequent updates

**Advantages:**
- "WebSockets enable full-duplex, persistent communication over single TCP connection"
- "Data flows in both directions with minimal overhead"
- "Server pushes data to client instantly, resulting in minimal latency"
- "Far less overhead per message (after initial handshake)"
- "Single open connection per client, reducing overhead"

**Use Cases:**
- Live location tracking during activities
- Real-time chat during group walks
- Instant status updates
- Collaborative features requiring sub-second updates

**Pull Model (Polling):**
- Clients request updates at intervals
- Simpler to implement
- Higher latency
- Better for infrequent updates

**Advantages:**
- "Extremely easy to build and debug"
- "Works in almost any environment"
- Sufficient for low-traffic scenarios

**Disadvantages:**
- "Creates strain on infrastructure at scale"
- "Constantly re-sending HTTP headers"
- "Limits performance under load"

**Recommendation:**
"For modern mobile apps requiring real-time location tracking, WebSockets are the recommended approach"

#### Client-Side Implementation (React Native)

**Geolocation API:**
```javascript
// React Native built-in
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords;
    // Send to server via WebSocket
  },
  (error) => console.error(error),
  {
    enableHighAccuracy: true,
    timeout: 20000,
    maximumAge: 1000
  }
);

// Watch position for continuous updates
const watchId = navigator.geolocation.watchPosition(
  (position) => {
    // Handle position update
    sendLocationUpdate(position);
  },
  (error) => console.error(error),
  { enableHighAccuracy: true, distanceFilter: 10 }
);
```

**Popular Libraries:**
- **expo-location**: Full-featured location services for Expo apps
- **react-native-background-geolocation**: Background tracking, geofencing, activity recognition
- **react-native-maps**: Map display with location markers

**WebSocket Integration:**
```javascript
// Socket.IO example
import io from 'socket.io-client';

const socket = io('https://api.app.com');

socket.emit('join-activity', { activityId, userId });

socket.on('location-update', (data) => {
  // Update other participants' positions on map
  updateParticipantMarker(data.userId, data.location);
});

// Send own location
navigator.geolocation.watchPosition((position) => {
  socket.emit('location-update', {
    activityId,
    userId,
    location: {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp
    }
  });
});
```

**Background Location Tracking:**
```javascript
// react-native-background-geolocation
import BackgroundGeolocation from 'react-native-background-geolocation';

BackgroundGeolocation.configure({
  desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
  distanceFilter: 10, // Meters
  stopOnTerminate: false,
  startOnBoot: true,
  notification: {
    title: 'Walk in Progress',
    text: 'Tracking your location'
  }
});

BackgroundGeolocation.on('location', (location) => {
  sendLocationUpdate(location);
});

BackgroundGeolocation.start();
```

### 2.4 Presence Systems

Presence systems show who's online, active, or currently on a walk.

#### Presence States

**Common States:**
- **Online**: App is active in foreground
- **Away**: App backgrounded but user hasn't explicitly left
- **On a Walk**: Currently in an active session
- **Offline**: Not connected

**Implementation:**
- "The heartbeat signal is used by the presence platform to detect the current status of a client"
- "Presence platform publishes an online event to the real-time platform for notifying subscribers when client status changes to online"

#### Heartbeat Pattern

**How It Works:**
- Client sends periodic "heartbeat" signals (e.g., every 30 seconds)
- Server marks as offline if no heartbeat received within threshold (e.g., 60 seconds)
- Handles network interruptions gracefully

**Redis Implementation:**
```javascript
// Client-side heartbeat
setInterval(() => {
  socket.emit('heartbeat', { userId, status: 'online' });
}, 30000);

// Server-side with Redis
// Use sliding window with two sets: "current" and "next"
// When client sends heartbeat, add userId to both sets
// Each set has different expiry times
// Query only "current" set for presence status
```

**Key Expiration Pattern:**
- "Uses a sliding window of sets with time-scoped keys"
- "Two sets named 'current' and 'next' with distinct expiry times"
- "When client changes status to online, userId added to both sets"
- "Presence status identified by querying only current set"
- Handles "jittery connections" and client-side failures

## 3. Activity Visibility and Privacy Settings

### 3.1 Visibility Levels

#### Public Activities

**Characteristics:**
- Visible to anyone (even non-users)
- Searchable and discoverable
- Can appear in public feeds or maps
- Maximum social engagement

**Use Cases:**
- Public events and group walks
- Competitive leaderboards
- Community challenges
- Advocacy and awareness campaigns

**Risks:**
- Location privacy concerns
- Safety issues (stalking, theft)
- Unwanted attention
- Commercial data harvesting

#### Friends/Followers Only

**Characteristics:**
- Visible only to approved connections
- Not searchable by non-connections
- Balance between privacy and social features
- Most common default setting

**Examples:**
- **Strava**: "Set Activities, Group Activities, Flybys, Local Legends, and Mentions to either Followers or Only You/No One"
- **Nike Run Club**: "Best options being 'Friends (social)' or 'Only Me (private)'"

**Implementation:**
```sql
-- Check visibility permissions
SELECT * FROM activities
WHERE id = ?
AND (
  visibility = 'public'
  OR (visibility = 'followers' AND user_id IN (
    SELECT following_id FROM connections
    WHERE follower_id = ?
  ))
  OR user_id = ?
);
```

#### Private (Only Me)

**Characteristics:**
- No one else can see activity
- Still stored for personal tracking
- May still contribute to aggregate/anonymous stats
- Maximum privacy

**Use Cases:**
- Testing routes
- Personal challenges
- Privacy concerns
- Recovering from injury (don't want attention)

### 3.2 Granular Privacy Controls

Modern apps offer fine-grained control over different privacy aspects:

#### Map Visibility

**Options:**
- **Full Route**: Complete GPS track visible
- **Start/End Hidden**: Route shown but endpoints obscured
- **Privacy Zones**: Specific areas always hidden
- **No Map**: Only statistics shown, no route

**Strava Example:**
- "To hide activity location data, go to You → Settings → Privacy Controls → Map Visibility"

#### Privacy Zones

**How They Work:**
- User defines circular areas (e.g., home, work, school)
- Activities starting/ending in zones have those portions hidden
- Typical radius: 200m-1km
- Can define multiple zones

**Security Warning:**
- Research shows 95.1% of moderately active users at risk of location extraction
- Apps leak metadata: "Distance value of entire track—including parts supposed to be hidden"
- "Distance covered inside privacy zone being leaked" in API responses

**Proper Implementation:**
- Hide privacy zone data at collection level, not just display
- Don't include hidden portions in any API responses
- Strip all metadata that could reveal protected areas
- Consider auto-privacy zones around frequent locations
- Use differential privacy techniques for aggregated data

#### Segment Privacy

**What are Segments:**
- Specific route sections (e.g., "Main St. to Park Hill")
- Users can compete on segment times
- Creates leaderboards and challenges

**Privacy Options:**
- Opt out of segment matching entirely
- Participate but hide name (anonymous)
- Only show to followers
- Public participation

#### Photo and Note Privacy

**Considerations:**
- Photos may contain location metadata (EXIF)
- Strip GPS coordinates from uploaded photos
- Allow separate privacy settings for photos vs. activity
- Notes/descriptions may reveal sensitive info

### 3.3 Default Privacy Settings

**Privacy-First Design Principles:**
- Start with most restrictive defaults
- Make it easy to gradually open up
- Regular privacy checkup reminders
- Privacy impact warnings when changing settings

**Recommended Defaults:**
- Profile: Followers only
- Activities: Followers only
- Map: Privacy zones enabled
- Location: Start/end hidden
- Photos: Followers only
- Segments: Opt-in required

**Onboarding:**
- Explain privacy settings during first run
- Don't hide settings in deep menus
- Use clear language, not technical jargon
- Show examples of what different settings mean

## 4. Group vs. 1:1 Collaborative Sessions

### 4.1 Design Differences

#### 1:1 Sessions

**UI/UX Focus:**
- Partner-centric view
- Direct comparison metrics
- Simple messaging/voice
- Relative positioning ("You're 200m ahead")

**Features:**
- Pace matching suggestions
- Distance/time comparisons
- Quick voice clips or canned messages
- Turn-by-turn to partner's location

**Privacy:**
- Simpler trust model (one other person)
- Can share more precise data
- Less concerned about group dynamics

#### Group Sessions

**UI/UX Focus:**
- Overview of all participants
- Multiple map markers/traces
- Group chat or channels
- Leader/organizer designation

**Features:**
- Group statistics (average pace, total distance)
- Waypoints and checkpoints
- Sub-group formation
- Role-based permissions
- Meeting points and rally locations

**Challenges:**
- Map clutter with many participants
- Chat can become noisy
- Coordination complexity
- Performance considerations

### 4.2 Coordination Features

#### Meeting Points

**Use Case:** Group starting from different locations, converging at common point

**Features:**
- Designated meeting location on map
- ETA to meeting point for each participant
- Notifications when participants arrive
- Waiting area (don't start until everyone arrives)

#### Waypoints

**Use Case:** Planned stops during route (water break, viewpoint, restroom)

**Features:**
- Multiple waypoints along route
- Order matters (checkpoint 1, 2, 3)
- Notifications when reaching waypoint
- Optional: Wait for group to catch up
- Photos/notes at each waypoint

#### Leader Mode

**Features:**
- Designated leader sets the route
- Leader can broadcast messages
- Leader can adjust waypoints during activity
- Participants see leader's planned route
- Can request to become leader (handoff)

#### Splitting and Regrouping

**Scenario:** Group splits into fast/slow paces, plans to meet at end

**Features:**
- Temporarily split into sub-groups
- Each sub-group tracks separately
- Shared end point or regroup waypoint
- Can see other sub-group's progress
- Easy to rejoin into main group

## 5. Join Codes, Links, and Invitation Mechanisms

### 5.1 Technical Implementation

#### Invite Link Generation

```javascript
// Server-side link generation
function generateInviteLink(activityId, creatorId, options = {}) {
  const token = crypto.randomUUID(); // UUID v4

  const invite = {
    token,
    activityId,
    creatorId,
    maxUses: options.maxUses || null, // null = unlimited
    expiresAt: options.expiresAt || (Date.now() + 24*60*60*1000),
    createdAt: Date.now(),
    usedCount: 0
  };

  // Store in database
  await db.invites.insert(invite);

  // Return shareable link
  return `https://app.com/join/${token}`;
}
```

#### Join Code Generation

```javascript
// Memorable code generation
function generateJoinCode(activityId) {
  // Avoid ambiguous characters
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';

  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  // Store with activity mapping
  await db.joinCodes.insert({
    code,
    activityId,
    expiresAt: Date.now() + 4*60*60*1000 // 4 hours
  });

  return code;
}

// Validation with checksum
function validateJoinCode(code) {
  // Case-insensitive
  code = code.toUpperCase().replace(/[^A-Z0-9]/g, '');

  // Lookup in database
  const invite = await db.joinCodes.findOne({ code });

  if (!invite) return { valid: false, error: 'Invalid code' };
  if (invite.expiresAt < Date.now()) {
    return { valid: false, error: 'Code expired' };
  }

  return { valid: true, activityId: invite.activityId };
}
```

#### QR Code Generation

```javascript
import QRCode from 'qrcode';

async function generateActivityQR(activityId) {
  const inviteLink = await generateInviteLink(activityId);

  // Generate QR code as data URL
  const qrDataUrl = await QRCode.toDataURL(inviteLink, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });

  return qrDataUrl; // Can be displayed in <Image> component
}
```

### 5.2 Invitation Workflow

**Complete Flow:**

1. **Activity Creation**
   - User starts or schedules activity
   - Activity gets unique ID
   - Invitation mechanisms generated

2. **Invitation Sending**
   - User chooses method: direct invite, link, code, or QR
   - System generates appropriate token/code
   - Recipient receives invitation via chosen channel

3. **Recipient Response**
   - Opens link, enters code, or scans QR
   - App validates token/code
   - Shows activity preview (route, participants, start time)
   - User accepts or declines

4. **Joining Activity**
   - On accept: Add user to participants list
   - Send notification to activity creator
   - Grant access to activity location/chat
   - Begin location sharing (if already started)

5. **Activity Management**
   - Participants can leave anytime
   - Creator can remove participants
   - Creator can disable invitations
   - Activity ends when creator stops

### 5.3 Advanced Invitation Features

#### Conditional Invitations

**Examples:**
- "Accept up to 10 participants"
- "Only verified users can join"
- "Must be mutual followers"
- "Location-based: Only users within 5km"
- "Only accept until activity starts"

#### Invitation Analytics

**Track:**
- Link clicks vs. actual joins
- Most effective invitation method
- Time from invite to accept
- Common drop-off points
- Geographic distribution of invitees

#### Multi-Event Codes

**Use Case:** Recurring weekly walks

**Features:**
- Single code for multiple instances
- Auto-expires after series ends
- Can track attendance across events
- Loyalty/streak tracking

## Key Takeaways

### Location Sharing Strategy
1. **Start with activity-based sharing** (most privacy-preserving)
2. **Use WebSockets for real-time updates** (industry standard)
3. **Implement adaptive update frequencies** (balance battery vs. accuracy)
4. **Make sharing time-limited by default** (auto-expire)
5. **Require cellular service for transmission** (set expectations)

### Privacy Implementation
1. **Privacy zones at data collection level**, not just display
2. **Default to most restrictive settings**
3. **Strip metadata from all API responses**
4. **Regular privacy checkup prompts**
5. **Clear visual indicators when sharing location**

### Group Coordination
1. **Support both scheduled and spontaneous activities**
2. **Implement clear leader/organizer roles**
3. **Provide multiple invitation methods** (flexibility)
4. **Scale UI based on group size** (different views for 2 vs. 20 people)
5. **Enable sub-group formation** (different paces)

### Technical Architecture
1. **WebSockets for real-time communication**
2. **Heartbeat-based presence system**
3. **Redis for presence state management**
4. **Secure token generation for invites**
5. **Implement proper code expiration and usage limits**

## Sources

- [Strava: Inviting a Friend to Your Activity](https://support.strava.com/hc/en-us/articles/115001631264-Inviting-a-Friend-to-Your-Activity)
- [Strava: Group Activities](https://support.strava.com/hc/en-us/articles/216919497-Group-Activities)
- [AllTrails: How to use Live Share](https://support.alltrails.com/hc/en-us/articles/37212858771348-How-to-use-Live-Share)
- [AllTrails Launches Live Share, Real-Time Location Sharing](https://www.alltrails.com/press/alltrails-launches-live-share-real-time-location-sharing)
- [Strava Beacon](https://support.strava.com/hc/en-us/articles/224357527-Strava-Beacon)
- [Best Apps For Location Sharing: Ultimate 2026 Guide](https://impulsec.com/parental-control-software/best-apps-for-location-sharing/)
- [WebSockets vs Long Polling](https://ably.com/blog/websockets-vs-long-polling)
- [Real Time Presence Platform System Design](https://systemdesign.one/real-time-presence-platform-system-design/)
- [Product Owner Talks: Designing Invite Codes](https://dashdevs.com/blog/product-owners-talks-invite-codes-as-an-app-feature/)
- [React Native real-time location sharing with Socket.io](https://medium.com/@joycecyoj01/how-to-build-a-location-sharing-feature-using-react-native-and-socket-io-496413ee8065)
- [Create a Location Sharing App using React-Native](https://www.geeksforgeeks.org/react-native/create-a-location-sharing-app-using-react-native/)
- [Building Live Location Sharing App with Expo React Native](https://geekyants.com/en-us/blog/building-a-live-location-sharing-and-tracking-app-using-gluestack-ui-with-expo-react-native-and-google-maps-api)
- [Real-time Location Tracking with React Native and PubNub](https://www.sitepoint.com/react-native-pubnub-real-time-location-tracking/)
