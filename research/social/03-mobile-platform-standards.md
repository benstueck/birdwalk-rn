# Mobile Platform Standards for Social Features

## Overview

This document covers iOS and Android best practices for requesting permissions, implementing privacy-first design, and following platform-specific notification patterns for social and location-based features.

## 1. Location Permissions

### 1.1 Permission Types and Characteristics

Modern mobile platforms offer granular location permission controls to protect user privacy.

#### iOS Location Permissions

**Permission Levels:**

1. **Allow Once**
   - Available iOS 13+
   - Grants access for single app session
   - App must request again when reopened
   - Ideal for one-time use cases

2. **While Using the App (Foreground)**
   - Access only when app is in foreground or actively used
   - Default for most apps
   - Blue status bar indicator when tracking in background
   - Sufficient for most social features

3. **Always (Background)**
   - Continuous access even when app is closed
   - Requires strong justification to App Store reviewers
   - User sees additional prompt explaining background usage
   - Blue pill indicator when actively tracking
   - Not recommended unless absolutely necessary

**Accuracy Options (iOS 14+):**
- **Precise Location**: Full GPS accuracy (±5-10m)
- **Approximate Location**: Approximate area only (±500m-5km radius)
- Users can toggle this per-app in Settings
- Apps must handle both modes gracefully

**Best Practices:**
```swift
// Request when-in-use authorization first
locationManager.requestWhenInUseAuthorization()

// Only request always authorization if absolutely needed
// Show contextual explanation first
locationManager.requestAlwaysAuthorization()

// Handle both precise and approximate
if #available(iOS 14.0, *) {
    switch locationManager.accuracyAuthorization {
    case .fullAccuracy:
        // Use precise location
    case .reducedAccuracy:
        // Adapt UI for approximate location
    }
}
```

**User Controls:**
- "iOS 13 or later: Users can tap Allow Once to let an app access Location Services for only one session"
- Users can upgrade from "Allow Once" to "While Using" in Settings
- Settings > Privacy > Location Services shows all apps and their permissions
- Users can see map of where app has tracked them (iOS 13+)

#### Android Location Permissions

**Permission Levels:**

1. **ACCESS_COARSE_LOCATION**
   - Approximate location from WiFi and cellular networks
   - Accuracy: ±100m-5km
   - Less battery intensive
   - Suitable for "nearby users" features

2. **ACCESS_FINE_LOCATION**
   - Precise GPS location
   - Accuracy: ±5-50m
   - Higher battery usage
   - Required for route tracking

3. **ACCESS_BACKGROUND_LOCATION**
   - Android 10+ requires separate permission
   - Must request foreground permission first
   - Requires strong use case justification in manifest
   - Subject to additional Google Play review

**Permission Declaration:**
```xml
<!-- Manifest.xml -->
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

<!-- Background location (Android 10+) -->
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
```

**Runtime Request:**
```kotlin
// Request foreground location
ActivityCompat.requestPermissions(
    this,
    arrayOf(
        Manifest.permission.ACCESS_FINE_LOCATION,
        Manifest.permission.ACCESS_COARSE_LOCATION
    ),
    LOCATION_PERMISSION_REQUEST_CODE
)

// Request background location (separate prompt, Android 10+)
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
    ActivityCompat.requestPermissions(
        this,
        arrayOf(Manifest.permission.ACCESS_BACKGROUND_LOCATION),
        BACKGROUND_LOCATION_PERMISSION_REQUEST_CODE
    )
}
```

**Android 12+ Changes:**
- System shows accuracy options: "Precise" or "Approximate"
- Users can choose approximate even if app requests fine location
- Apps must handle downgraded permissions gracefully

### 1.2 Best Practices for Location Permissions

#### Timing: Just-in-Time Requests

**Key Principle:**
"Apps that defer permission requests until they're contextually relevant see up to 28% higher grant rates compared to those requesting upfront"

**Strategy:**
- Never request permissions during app launch or onboarding
- Wait until user takes action requiring that permission
- "Contextual prompts are now prioritized over static dialogs"
- "Ask permissions only when users take actions needing that permission"

**Good Examples:**
```
❌ BAD: Request on app launch
User opens app → Immediate location permission prompt

✅ GOOD: Request when needed
User taps "Find Friends Nearby" → Show explainer → Request permission
User taps "Start Walk" → Request location permission with context
```

#### Context: Explain Why

**Pre-Permission Explainer:**
Before showing system permission dialog, show custom explanation:

```javascript
// React Native example
async function requestLocationPermission() {
  // 1. Show custom explainer modal first
  await showModal({
    title: "Track Your Walks",
    message: "Birdwalk needs your location to track your walks and show you interesting birds nearby.",
    primaryButton: "Continue",
    secondaryButton: "Not Now"
  });

  // 2. Only then request system permission
  const { status } = await Location.requestForegroundPermissionsAsync();

  return status === 'granted';
}
```

**Explainer Best Practices:**
- Use plain language, avoid technical jargon
- Explain the user benefit, not just what the app needs
- Show screenshots or illustrations of the feature
- Make it easy to decline without guilt
- Never use dark patterns or manipulation

#### Progressive Permission Requests

**Strategy:** Request minimum necessary permission first, upgrade later if needed

**Flow:**
1. Start with "While Using App" (foreground only)
2. User uses app and finds value
3. Later, contextually request "Always" if needed for background tracking
4. Show value proposition before upgrade request

**Example:**
```
Week 1: Request "While Using App" when user starts first walk
Week 2: After 3-5 successful walks, offer background tracking
        "Want to automatically track walks without opening the app?"
```

**Benefits:**
- Builds trust before asking for more invasive permissions
- Higher grant rates for background permission
- Users understand the value before granting access

#### Graceful Degradation

**Handle Permission Denial:**
- Don't show permission dialog repeatedly (Apple rejects apps that do this)
- Provide alternative workflows
- Explain how to enable in Settings if user changes mind

```javascript
if (locationPermission === 'denied') {
  // Show alternatives
  return (
    <View>
      <Text>Location access is needed to track walks</Text>
      <Button onPress={openAppSettings}>
        Enable in Settings
      </Button>
      <Button onPress={manualEntryMode}>
        Enter Walk Manually
      </Button>
    </View>
  );
}
```

**Handle Approximate Location:**
- Adapt features to work with reduced accuracy
- Don't nag users to enable precise location
- Explain limitations clearly

### 1.3 Regulatory Compliance

#### GDPR (European Union)

**Requirements:**
- "Explicit consent for non-essential data processing"
- Purpose limitation: Only use location for stated purposes
- Data minimization: Collect only what's necessary
- Right to access: Users can export all location data
- Right to deletion: Users can delete all location data
- Clear privacy policy explaining location usage

**Consent Requirements:**
- Must be freely given, specific, informed, and unambiguous
- Cannot bundle consent with terms of service
- Must be as easy to withdraw as to give
- Pre-ticked boxes not valid

#### CCPA/CPRA (California)

**Requirements:**
- "Opt-out mechanisms for data sales"
- "Starting August 1, 2026, every registered data broker in California must retrieve consumer deletion requests every 45 days and process them"
- Failures result in "$200 per-request daily penalties"

**User Rights:**
- Right to know what data is collected
- Right to delete personal information
- Right to opt-out of data sales
- Right to non-discrimination for exercising rights

**Implementation:**
- Provide clear "Do Not Sell My Information" mechanism
- Process deletion requests within 45 days
- Maintain audit logs of data processing
- Update privacy policy annually

#### Global Best Practices

**Privacy by Design:**
- "In 2026, privacy is no longer treated as a compliance requirement; it is a core design principle"
- "Privacy-first app architecture ensures that data protection is built into the foundation of the app, not added later"

**Transparency:**
- "Users are clearly informed about how their data is used"
- "Can easily manage permissions"
- Provide privacy dashboard showing what data is collected
- Plain language explanations, not legalese

**User Control:**
- "Apps focus only on what is necessary to deliver value"
- "Implement privacy by design principles"
- "Transparent data collection notices"
- "Opt-in consent mechanisms"
- "Easy data deletion options"

## 2. Contacts Access Permissions

### 2.1 Platform Approaches

#### iOS Contacts Permission

**Standard Behavior (iOS 17 and earlier):**
- All-or-nothing: Grant access to entire contacts database
- Apps read complete contact info (names, numbers, emails, addresses)
- Significant privacy concern for many users

**iOS 18 Improvements:**
- "Users can share specific contacts rather than entire address book"
- "Reflects growing demand for granular control"
- Apps must gracefully handle partial contact access

**Best Practice:**
```swift
import Contacts

func requestContactsAccess() async -> Bool {
    let store = CNContactStore()

    do {
        // Request access
        let granted = try await store.requestAccess(for: .contacts)

        if granted {
            // Fetch contacts
            // iOS 18: May only get subset user selected
        }

        return granted
    } catch {
        return false
    }
}
```

#### Android Contacts Permission

**Permission:**
```xml
<uses-permission android:name="android.permission.READ_CONTACTS" />
```

**Runtime Request:**
```kotlin
if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_CONTACTS)
    != PackageManager.PERMISSION_GRANTED) {

    ActivityCompat.requestPermissions(
        this,
        arrayOf(Manifest.permission.READ_CONTACTS),
        CONTACTS_PERMISSION_REQUEST_CODE
    )
}
```

### 2.2 Privacy-First Design for Contacts

#### Permission Minimization

**Key Principle:**
"Don't collect data unless you absolutely need it. Does your weather app really need access to contacts?"

**For Social Apps:**
Ask yourself:
- Is contact matching essential for core functionality?
- Can users find friends via username/email search instead?
- Will most users grant this permission?
- What's the fallback if denied?

**Recommendation:**
"The moment a user downloads your app, the latter is in charge of only asking for the least necessary permissions. If you are not required to have access to the contact list, don't request it."

#### Just-in-Time Request

**Bad Pattern:**
```
User opens app for first time
→ Immediate contacts permission request
→ User has no context or trust
→ High denial rate
```

**Good Pattern:**
```
User completes onboarding, tracks first walk
→ User navigates to "Find Friends" section
→ Show explainer: "Find friends who are already using Birdwalk"
→ Request contacts permission
→ Higher grant rate due to context
```

#### Transparency and Control

**Explainer Content:**
```
Title: "Find Friends on Birdwalk"

Message: "We'll match your contacts with Birdwalk users so you can
easily connect with friends. Your contacts are only used for matching
and are never stored on our servers."

[Continue] [Not Now]
```

**After Grant:**
- Show which contacts matched with existing users
- Allow users to select whom to connect with (no auto-follow)
- Provide option to disconnect and delete contact data
- Never upload full contact list without explicit consent

#### Alternatives to Contacts Access

If contacts permission denied or you want to avoid asking:

1. **Username Search**
   - Users can search by exact username
   - No permission required
   - Works across platforms

2. **Email Invitation**
   - User manually enters friend's email
   - Send invite link via email
   - No access to contacts database

3. **QR Code**
   - Generate unique QR code for user
   - Share in person via scanning
   - Zero permissions required

4. **Social Login**
   - "Sign in with Facebook/Google"
   - Discover friends via OAuth (user approves)
   - More acceptable than raw contacts access

5. **Join Codes**
   - Generate shareable code
   - Friend enters code to connect
   - No permissions needed

## 3. Privacy-First Design Patterns

### 3.1 Core Principles

#### Privacy by Design

**Definition:**
"Privacy-first app architecture ensures that data protection is built into the foundation of the app, not added later"

**Implementation:**
1. **Data Minimization**: Only collect what you need
2. **Purpose Limitation**: Use data only for stated purpose
3. **Storage Limitation**: Delete data when no longer needed
4. **Accuracy**: Keep data up to date or allow corrections
5. **Integrity**: Protect against unauthorized access
6. **Accountability**: Document privacy decisions and compliance

#### Default to Private

**Strategy:**
- Most restrictive settings by default
- Users opt-in to sharing, not opt-out
- "Privacy is default, sharing is optional"

**Examples:**
```
Default Profile Settings:
✅ Profile visibility: Followers only
✅ Activity visibility: Followers only
✅ Location sharing: Off (manual start)
✅ Show in search: Followers can find me
✅ Precise location: Hidden (approximate only)
```

#### Transparency

**User Rights:**
- Know what data is collected
- Know how data is used
- Know who data is shared with
- Export all data (GDPR/CCPA)
- Delete all data (GDPR/CCPA)

**Implementation:**
- Privacy dashboard in app settings
- Plain language explanations
- Activity log showing data access
- Export feature (JSON/CSV)
- One-tap deletion with confirmation

### 3.2 Permission Patterns

#### The "Allow While Using App" Pattern

**When:**
Location, camera, microphone permissions

**Pattern:**
1. User takes action requiring permission (e.g., "Start Walk")
2. Show explainer screen (custom UI)
3. User taps "Continue"
4. Show system permission dialog
5. Handle grant/deny gracefully

**Benefits:**
- Higher grant rates (28%+ improvement)
- Builds trust through transparency
- Reduces permission fatigue
- Compliant with platform guidelines

#### The "Progressive Permission" Pattern

**When:**
Features that benefit from multiple permission levels

**Pattern:**
1. Week 1: Request basic permission (e.g., "While Using App")
2. User gets value from app
3. Week 2+: Offer upgrade (e.g., "Always Allow" for auto-tracking)
4. Show clear value proposition for upgrade
5. Allow easy downgrade later

**Example:**
```
Initial: "While Using App" for walk tracking
After 5 walks: "Enable auto-tracking to never miss a walk"
Benefit: "Start walks automatically when you start moving"
```

#### The "Settings Deep Link" Pattern

**When:**
User previously denied permission but feature requires it

**Pattern:**
1. User tries to use feature
2. Show explanation: "This feature requires location access"
3. Show button: "Open Settings"
4. Deep link directly to app's settings page
5. Use onResume/onFocus to detect permission changes

```javascript
import { Linking } from 'react-native';

function openAppSettings() {
  Linking.openSettings();
}

// Show UI
<View>
  <Text>Location access is required for this feature</Text>
  <Text style={styles.detail}>
    You previously denied location access. You can enable it in Settings.
  </Text>
  <Button onPress={openAppSettings}>
    Open Settings
  </Button>
</View>
```

### 3.3 Consent Patterns

#### Just-in-Time Consent

**Design System Component:**
```javascript
<ConsentModal
  title="Track Your Location?"
  description="We'll use your location to track your walks and show you interesting birds nearby."
  permissions={['location']}
  onAccept={handleAccept}
  onDecline={handleDecline}
  privacyPolicyLink="/privacy"
/>
```

**Best Practices:**
- One permission per modal (don't bundle)
- Clear, specific description
- Visual illustration of what permission enables
- Link to full privacy policy
- Equal visual weight for accept/decline buttons
- Remember user's choice

#### Granular Consent

**Pattern:**
Allow users to consent to different data uses separately

**Example:**
```
Location Sharing Preferences:

☑️ Track my walks (Required for core features)
☐ Show me nearby birds (Optional, uses location)
☐ Suggest friends nearby (Optional, uses location)
☐ Contribute to bird sighting database (Optional, anonymous)

[Save Preferences]
```

**Benefits:**
- User feels in control
- Can use app with minimal data sharing
- Clear purpose for each data use
- Easy to modify later

#### Periodic Re-Consent

**Pattern:**
Periodically remind users of permissions and allow changes

**Implementation:**
- Annual privacy checkup notification
- Show current permission status
- Highlight new features that benefit from permissions
- Easy to revoke or modify

**Example:**
```
Title: "Annual Privacy Checkup"

We've tracked 127 walks this year! Let's review your privacy settings.

Current Settings:
• Location: While Using App ✓
• Contacts: Not allowed
• Activity Sharing: Friends only ✓

[Review Settings] [Looks Good]
```

### 3.4 Privacy UX Patterns

#### Privacy Indicators

**Visual Cues:**
- Show icon when location is being tracked
- Indicate when data is being synced to server
- Display who can see current activity
- Alert when entering/leaving privacy zone

**Examples:**
```
Status Bar:
🔵 Location tracking active
☁️ Syncing data
👥 Visible to 12 friends
🏠 Privacy zone active
```

#### Privacy Dashboard

**Components:**
1. **Permission Status**
   - List all requested permissions
   - Show granted/denied status
   - Link to system settings

2. **Data Usage**
   - Show what data has been collected
   - Display storage usage
   - Show third-party sharing (if any)

3. **Activity Log**
   - Recent data access events
   - Who viewed your profile/activities
   - Export requests

4. **Controls**
   - Export all data
   - Delete account
   - Manage privacy zones
   - Customize sharing settings

#### Privacy Zones UI

**Setup Flow:**
1. Tap "Add Privacy Zone"
2. Choose location (current location, address, or map pin)
3. Set radius (200m - 1km slider)
4. Name the zone ("Home", "Work", "School")
5. Preview which activities would be affected
6. Confirm creation

**Ongoing Management:**
- List all privacy zones
- Edit/delete zones
- See how many activities use each zone
- Temporarily disable zone without deleting

## 4. Notification Patterns

### 4.1 Types of Social Notifications

#### Connection Requests

**Trigger:** Someone wants to connect/follow

**Content:**
```json
{
  "title": "New Connection Request",
  "body": "Alex wants to connect with you",
  "data": {
    "type": "connection_request",
    "requestId": "uuid",
    "requesterId": "user-id"
  },
  "actions": [
    { "id": "accept", "title": "Accept" },
    { "id": "decline", "title": "Decline" }
  ]
}
```

**Best Practices:**
- Include requester's name and photo
- Show mutual connections if any
- Allow inline accept/decline (no app open required)
- Don't send if user has muted notifications from strangers

#### Activity Invitations

**Trigger:** Friend invites you to join activity

**Content:**
```json
{
  "title": "Walk Invitation",
  "body": "Sam invited you to a walk starting in 30 minutes",
  "data": {
    "type": "activity_invitation",
    "activityId": "uuid",
    "inviterId": "user-id",
    "startTime": "ISO-8601"
  },
  "actions": [
    { "id": "accept", "title": "Accept" },
    { "id": "decline", "title": "Decline" },
    { "id": "view", "title": "View Details" }
  ]
}
```

**Timing Considerations:**
- Send immediately for spontaneous invites ("join me now")
- Send 1 hour before for scheduled activities
- Send reminder 15 minutes before start time
- Don't send if activity already started (unless real-time join allowed)

#### Activity Updates

**Triggers:**
- Friend completed a walk
- Friend achieved a milestone
- Friend started a walk you might want to join

**Content:**
```json
{
  "title": "Activity Update",
  "body": "Jordan just completed a 5km walk and spotted 12 bird species!",
  "data": {
    "type": "activity_update",
    "activityId": "uuid",
    "userId": "user-id"
  },
  "image": "https://cdn.app.com/activity-map.jpg"
}
```

**Best Practices:**
- Batch updates to avoid spam (max 1 per user per hour)
- Allow users to mute specific friends
- Make achievements opt-in (user chooses to share)
- Include rich media (map snapshot, photos)

#### Presence Notifications

**Triggers:**
- Close friend is nearby
- Friend started a walk near you
- Group member waiting at meeting point

**Content:**
```json
{
  "title": "Friend Nearby",
  "body": "Taylor is on a walk 0.5km from you",
  "data": {
    "type": "presence",
    "userId": "user-id",
    "distance": 500
  }
}
```

**Privacy Considerations:**
- Opt-in only for both parties
- Don't reveal exact location without consent
- Respect "invisible" mode
- Don't notify if user is at home (privacy zone)

### 4.2 Notification Best Practices (2026)

#### User Control

**Granular Settings:**
"In 2026, a single 'Allow notifications?' toggle is no longer acceptable UX"

**Required Controls:**
```
Notification Settings:
├─ Connection Requests: On/Off
├─ Activity Invitations: On/Off
├─ Activity Updates: On/Off
├─ Friend Achievements: On/Off
├─ Nearby Friends: On/Off
├─ Group Messages: On/Off
└─ App Announcements: On/Off

Quiet Hours:
├─ Enabled: Yes
├─ Start: 10:00 PM
└─ End: 8:00 AM
```

**Platform Integration:**
- Use iOS notification categories for grouping
- Use Android notification channels (required Android 8+)
- Allow per-channel volume/priority
- Support critical alerts sparingly (emergency only)

#### Timing and Relevance

**Key Findings:**
- "Sending the same notification to every user at the same time is increasingly ineffective"
- "Interruption science consistently shows that relevance and timing matter as much as content"
- "Don't request permission during the first seconds of onboarding"

**Smart Timing:**
```javascript
// Personalized send time based on user behavior
function getOptimalNotificationTime(userId) {
  const userTimezone = getUserTimezone(userId);
  const historicalEngagement = getEngagementPatterns(userId);

  // Find time window with highest engagement
  const optimalHour = historicalEngagement.peakHour; // e.g., 7 PM

  // Respect quiet hours
  if (isInQuietHours(optimalHour, userId)) {
    return getNextAvailableSlot(userId);
  }

  return optimalHour;
}
```

**Relevance Filters:**
- Only notify about activities within user's typical range
- Don't notify about activities when user is busy (calendar integration)
- Prioritize close friends over distant connections
- Learn from user's past responses (accepted/declined invites)

#### Content Best Practices

**Language:**
- "Notifications are intimate—they appear alongside messages from family and friends"
- "Using guilt-driven copy, passive-aggressive reminders, or anxiety-inducing language breaks trust fast"

**Good Examples:**
```
✅ "Alex invited you to a walk at Riverside Park"
✅ "3 friends are walking near you"
✅ "You completed 10 walks this month!"

❌ "You haven't walked in 3 days... feeling lazy?"
❌ "All your friends are walking without you"
❌ "Don't let your streak die!"
```

**Structure:**
- "Keep push notification copy short, sweet, and to the point"
- "Use persuasive words with a clear call to action"
- "Make it catchy enough to grab attention while specific enough so users know exactly what to do next"

**Format:**
```
Title: [Short, specific] (40 chars max)
Body: [Actionable context] (120 chars max)
Image: [Optional, relevant visual]
Actions: [Max 2-3 inline buttons]
```

#### Personalization and Segmentation

**Strategy:**
"To truly personalize push notifications, consider the whole user context including behavior, preferences, demographics, and real-time interactions"

**Segmentation Dimensions:**
- Activity level (daily walker vs. occasional user)
- Social engagement (many friends vs. solo walker)
- Location (urban vs. rural, climate)
- Time zone and typical active hours
- Device type (iOS vs. Android)
- App version and feature adoption

**Example:**
```javascript
// Segment: Highly social users
if (user.friendCount > 20 && user.groupActivitiesCount > 5) {
  sendNotification({
    title: "Group Walk Tomorrow",
    body: "15 friends are joining the Saturday morning walk"
  });
}

// Segment: Solo walkers
else if (user.soloActivitiesCount > user.groupActivitiesCount * 5) {
  sendNotification({
    title: "New Route Discovered",
    body: "Explore a peaceful trail near you"
  });
}
```

### 4.3 Implementation

#### iOS Push Notifications

**Setup:**
1. Enable Push Notifications in Xcode capabilities
2. Request authorization at appropriate time
3. Register for remote notifications
4. Handle device token
5. Process received notifications

**Code Example:**
```swift
import UserNotifications

// Request authorization
UNUserNotificationCenter.current().requestAuthorization(
    options: [.alert, .sound, .badge]
) { granted, error in
    if granted {
        DispatchQueue.main.async {
            UIApplication.shared.registerForRemoteNotifications()
        }
    }
}

// Handle device token
func application(_ application: UIApplication,
                didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    let token = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
    // Send to server
}

// Handle notification
func userNotificationCenter(_ center: UNUserNotificationCenter,
                          didReceive response: UNNotificationResponse,
                          withCompletionHandler completionHandler: @escaping () -> Void) {
    let userInfo = response.notification.request.content.userInfo

    if response.actionIdentifier == "accept" {
        // Handle accept action
    }

    completionHandler()
}
```

**Categories and Actions:**
```swift
// Define notification actions
let acceptAction = UNNotificationAction(
    identifier: "accept",
    title: "Accept",
    options: [.foreground]
)

let declineAction = UNNotificationAction(
    identifier: "decline",
    title: "Decline",
    options: []
)

// Create category
let inviteCategory = UNNotificationCategory(
    identifier: "invitation",
    actions: [acceptAction, declineAction],
    intentIdentifiers: []
)

// Register
UNUserNotificationCenter.current().setNotificationCategories([inviteCategory])
```

#### Android Push Notifications

**Setup:**
1. Add Firebase Cloud Messaging (FCM) dependency
2. Create notification channels (Android 8+)
3. Request permission (Android 13+)
4. Handle messages

**Code Example:**
```kotlin
// Create notification channel (Android 8+)
private fun createNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        val channel = NotificationChannel(
            "invitations",
            "Activity Invitations",
            NotificationManager.IMPORTANCE_HIGH
        ).apply {
            description = "Notifications for walk invitations"
            enableLights(true)
            enableVibration(true)
        }

        val notificationManager = getSystemService(NotificationManager::class.java)
        notificationManager.createNotificationChannel(channel)
    }
}

// Request permission (Android 13+)
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
    ActivityCompat.requestPermissions(
        this,
        arrayOf(Manifest.permission.POST_NOTIFICATIONS),
        NOTIFICATION_PERMISSION_REQUEST_CODE
    )
}

// Handle FCM message
override fun onMessageReceived(remoteMessage: RemoteMessage) {
    val data = remoteMessage.data

    when (data["type"]) {
        "activity_invitation" -> showInvitationNotification(data)
        "connection_request" -> showConnectionNotification(data)
    }
}
```

**Notification with Actions:**
```kotlin
val acceptIntent = Intent(this, NotificationActionReceiver::class.java).apply {
    action = "ACCEPT_INVITATION"
    putExtra("activityId", activityId)
}
val acceptPendingIntent = PendingIntent.getBroadcast(
    this, 0, acceptIntent, PendingIntent.FLAG_IMMUTABLE
)

val notification = NotificationCompat.Builder(this, "invitations")
    .setContentTitle("Walk Invitation")
    .setContentText("Alex invited you to a walk")
    .setSmallIcon(R.drawable.ic_notification)
    .addAction(R.drawable.ic_check, "Accept", acceptPendingIntent)
    .addAction(R.drawable.ic_close, "Decline", declinePendingIntent)
    .setPriority(NotificationCompat.PRIORITY_HIGH)
    .setAutoCancel(true)
    .build()

notificationManager.notify(notificationId, notification)
```

## Key Takeaways

### Location Permissions
1. **Always start with "While Using App"**, never "Always Allow" initially
2. **Request just-in-time** when user initiates location feature (28% higher grant rate)
3. **Handle approximate location gracefully** on iOS 14+ and Android 12+
4. **Provide clear value explanation** before system permission dialog
5. **Implement graceful degradation** if permission denied

### Contacts Access
1. **Avoid requesting if possible** - use username search, QR codes, invite links instead
2. **iOS 18 requires handling partial access** - don't assume full contact list
3. **Never upload contacts without explicit consent**
4. **Provide clear alternatives** if permission denied
5. **Be transparent** about how contact data is used and stored

### Privacy-First Design
1. **Privacy by design from day one**, not added later
2. **Default to most restrictive settings**, let users opt-in to sharing
3. **Minimize data collection** - only request what's essential
4. **Transparency dashboard** showing all data collection and usage
5. **Easy data export and deletion** (GDPR/CCPA compliance)

### Notifications
1. **Granular user control required** - not just on/off
2. **Personalize timing based on user behavior** for higher engagement
3. **Avoid guilt/anxiety language** - notifications are intimate
4. **Support inline actions** (accept/decline without opening app)
5. **Respect quiet hours and user preferences**

## Sources

- [Request location permissions - Android Developers](https://developer.android.com/develop/sensors-and-location/location/permissions)
- [About privacy and Location Services in iOS](https://support.apple.com/en-us/102515)
- [Mobile Permission Requests: Timing, Strategy & Compliance Guide](https://www.dogtownmedia.com/the-ask-when-and-how-to-request-mobile-app-permissions-camera-location-contacts/)
- [Mastering Android Permissions in 2025: Best Practices](https://medium.com/@vivek.beladia/mastering-android-permissions-in-2025-best-practices-and-new-trends-0c1058c12673)
- [Security by Design: Building Privacy First Mobile Apps in 2026](https://booleaninc.com/blog/security-by-design-building-privacy-first-mobile-apps-in-2026/)
- [Mobile App Consent for iOS: A Deep Dive (2025)](https://secureprivacy.ai/blog/mobile-app-consent-ios-2025)
- [14 Push Notification Best Practices for 2026](https://reteno.com/blog/push-notification-best-practices-ultimate-guide-for-2026)
- [App Push Notification Best Practices for 2026](https://appbot.co/blog/app-push-notifications-2026-best-practices/)
- [iOS push notifications guide (2026)](https://www.pushwoosh.com/blog/ios-push-notifications/)
- [Privacy Practices for User Location](https://www.termsfeed.com/blog/user-location-privacy-practices/)
