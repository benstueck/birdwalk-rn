# UX Patterns for Social Features

## Overview

This document examines common UI/UX patterns for social features in mobile apps, focusing on friend discovery, activity invitations, collaborative interfaces, and privacy controls.

## 1. Connection and Friend Discovery Flows

### 1.1 Find Friends Entry Points

Modern apps place friend discovery strategically throughout the user journey:

#### During Onboarding

**Best Practice:**
DO NOT request contacts or show friend discovery during initial onboarding. Research shows:
- "Don't ask for access to contacts or sending invitations at early stages"
- "Best practices include collecting only essential information during sign-up"
- "Moving quickly through registration if required at the beginning"

**Alternative Approach:**
- Complete core onboarding first
- Let user experience primary features
- Offer friend discovery after first successful activity
- Make it optional, not required

**Good Onboarding Flow:**
```
1. Welcome screen
2. Sign up / Sign in
3. Permission explainers (no actual requests yet)
4. Complete first walk
5. Celebrate completion
6. THEN offer: "Want to share your walks with friends?"
```

#### Post-Onboarding Prompts

**Timing:**
- After completing 1-3 activities
- When user demonstrates engagement
- Contextual to a social feature (e.g., viewing leaderboard)

**Example Prompt:**
```
┌─────────────────────────────────┐
│  Great walk! 🎉                  │
│                                  │
│  Want to share your progress     │
│  with friends?                   │
│                                  │
│  [Find Friends]  [Not Now]       │
└─────────────────────────────────┘
```

#### Dedicated Discovery Tab/Section

**Common Patterns:**
1. **Tab Bar Icon** (Strava approach)
   - "You" tab → Profile → Magnifying glass icon
   - Persistent access to friend search

2. **Menu Item**
   - Settings → Friends & Connections
   - Social → Find Friends

3. **Floating Action Button**
   - Context-specific (e.g., on activity feed)
   - "Invite Friends" or "+" button

#### Empty State Prompts

**When Activity Feed is Empty:**
```
┌─────────────────────────────────┐
│         📭                       │
│                                  │
│  Your feed is quiet              │
│                                  │
│  Connect with friends to see     │
│  their activities here           │
│                                  │
│  [Find Friends]                  │
└─────────────────────────────────┘
```

**Benefits:**
- Contextual to missing content
- Clear value proposition
- Non-intrusive suggestion

### 1.2 Friend Discovery Methods UI

#### Username/Email Search

**Search Interface:**
```
┌─────────────────────────────────┐
│  🔍 Search by name or email      │
├─────────────────────────────────┤
│                                  │
│  Suggested                       │
│  ┌─────────────────────────┐   │
│  │ 👤 Alex Rivera           │   │
│  │ 5 mutual friends         │   │
│  │              [Follow] ──→│   │
│  └─────────────────────────┘   │
│                                  │
│  ┌─────────────────────────┐   │
│  │ 👤 Sam Chen              │   │
│  │ Nearby · Active walker   │   │
│  │              [Follow] ──→│   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

**Search Results:**
- Show avatar/profile photo
- Display name prominently
- Show mutual connections if any
- Indicate activity level (active walker, new user)
- Clear follow/connect button
- Privacy indicator (public/private account)

**Empty Search Results:**
```
┌─────────────────────────────────┐
│         🔍                       │
│                                  │
│  No users found                  │
│                                  │
│  Try inviting them via email:    │
│  [Invite by Email]               │
└─────────────────────────────────┘
```

#### QR Code Scanning

**Scanner Interface:**
```
┌─────────────────────────────────┐
│  [✕]                    [⚡️]     │ ← Close, Flash
│                                  │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │     [Scan Area]         │   │ ← Camera viewfinder
│  │                         │   │
│  └─────────────────────────┘   │
│                                  │
│  Position QR code within frame  │
│                                  │
│  ─── OR ───                      │
│                                  │
│  [Show My QR Code]               │
└─────────────────────────────────┘
```

**Your QR Code Display:**
```
┌─────────────────────────────────┐
│  [✕]                    [Share]  │
│                                  │
│  My QR Code                      │
│                                  │
│  ┌─────────────────────────┐   │
│  │  ▄▄▄▄▄▄▄  ▄  ▄▄▄▄▄▄▄   │   │
│  │  █ ▄▄▄ █ ▄█▄ █ ▄▄▄ █   │   │
│  │  █ ███ █ ▀ █ █ ███ █   │   │
│  │  █▄▄▄▄▄█ █▀█ █▄▄▄▄▄█   │   │
│  │  ▄▄ ▄▄  ██▄▄▄▄  ▄ ▄    │   │
│  │  ...QR CODE...          │   │
│  └─────────────────────────┘   │
│                                  │
│  @your_username                  │
│                                  │
│  Others can scan this to         │
│  connect with you                │
└─────────────────────────────────┘
```

**Best Practices:**
- Large, easily scannable QR code
- Include username as fallback
- Share button for saving/sending image
- Refresh/regenerate option for security
- Works offline (generates client-side)

#### Contacts Integration

**Permission Flow:**
```
1. User taps "Find Friends from Contacts"

2. Explainer Modal:
┌─────────────────────────────────┐
│  Find Friends from Contacts      │
│                                  │
│  We'll match your contacts with  │
│  Birdwalk users so you can       │
│  easily connect.                 │
│                                  │
│  • Contacts used only for        │
│    matching                      │
│  • Never stored on our servers   │
│  • You choose who to connect     │
│    with                          │
│                                  │
│  [Continue]      [Not Now]       │
└─────────────────────────────────┘

3. System permission dialog

4. Results Screen:
┌─────────────────────────────────┐
│  ← Friends from Contacts         │
│                                  │
│  Found 12 friends                │
│                                  │
│  ┌─────────────────────────┐   │
│  │ ✓ 👤 Alex Rivera         │   │
│  │   alex@email.com         │   │
│  │              [Follow] ──→│   │
│  └─────────────────────────┘   │
│                                  │
│  ┌─────────────────────────┐   │
│  │ ✓ 👤 Sam Chen            │   │
│  │   sam@email.com          │   │
│  │              [Follow] ──→│   │
│  └─────────────────────────┘   │
│                                  │
│  [Follow All]                    │
└─────────────────────────────────┘
```

**Key UX Elements:**
- Checkboxes for bulk selection
- "Follow All" option
- Clear indication of matches
- No auto-following without user action
- Option to invite non-users

**iOS 18 Partial Access:**
```
┌─────────────────────────────────┐
│  Limited Contacts Access         │
│                                  │
│  You've shared 5 contacts.       │
│  We found 2 matches.             │
│                                  │
│  Want to find more friends?      │
│  [Share More Contacts]           │
│                                  │
│  [Continue with 2 matches]       │
└─────────────────────────────────┘
```

#### Social Network Integration

**Sign-in with Facebook/Google:**
```
┌─────────────────────────────────┐
│  Find Facebook Friends           │
│                                  │
│  Connect your Facebook account   │
│  to see which friends are on     │
│  Birdwalk                        │
│                                  │
│  • We'll never post without      │
│    your permission               │
│  • You choose who to follow      │
│                                  │
│  [Connect Facebook]              │
│                                  │
│  [Skip]                          │
└─────────────────────────────────┘
```

**Instagram's Approach:**
"Instagram uses existing social connections to create immediate engagement and fear of missing out, using Meta's social network to provide pre-filled form fields and suggest friends who already use Instagram"

### 1.3 Suggested Connections

**Feed of Suggestions:**
```
┌─────────────────────────────────┐
│  ← Suggested for You             │
│                                  │
│  ┌─────────────────────────┐   │
│  │ 👤 Jamie Taylor          │   │
│  │ • Followed by Alex & Sam │   │
│  │ • 15 walks this month    │   │
│  │ • Active in your area    │   │
│  │                          │   │
│  │ [Follow]      [✕]        │   │
│  └─────────────────────────┘   │
│                                  │
│  ┌─────────────────────────┐   │
│  │ 👤 Morgan Lee            │   │
│  │ • Works at TechCo        │   │
│  │ • 8 mutual friends       │   │
│  │ • Similar routes         │   │
│  │                          │   │
│  │ [Follow]      [✕]        │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

**Suggestion Criteria (Shown to User):**
- Mutual friends/followers
- Geographic proximity
- Similar activity patterns
- Shared interests/routes
- Workplace/organization
- Recent activity

**Personalization Note:**
"Personalization is survival infrastructure for 2026, with Spotify's Discover Weekly analyzing 200+ data points per user to generate personalized experiences with 40% click-through rates"

Apply similar data-driven personalization to friend suggestions.

## 2. Activity Invitation Flows

### 2.1 Creating Invitable Activities

**Activity Creation Screen:**
```
┌─────────────────────────────────┐
│  ← New Walk                      │
│                                  │
│  Name (optional)                 │
│  ┌─────────────────────────┐   │
│  │ Morning riverside walk   │   │
│  └─────────────────────────┘   │
│                                  │
│  Start Time                      │
│  ◉ Now                           │
│  ○ Schedule for later            │
│                                  │
│  Who can join?                   │
│  ┌─────────────────────────┐   │
│  │ ✓ Just me                │   │
│  │ ○ Invite friends         │   │
│  │ ○ Anyone with link       │   │
│  └─────────────────────────┘   │
│                                  │
│  [Start Walk]                    │
└─────────────────────────────────┘
```

**Progressive Disclosure:**
- Default: Solo walk
- User opts-in to collaborative features
- Don't overwhelm with options upfront

### 2.2 Inviting Participants

**Invitation Methods Sheet:**
```
┌─────────────────────────────────┐
│  Invite Friends                  │
│                                  │
│  ┌─────────────────────────┐   │
│  │ 👥 Select Friends        │   │
│  └─────────────────────────┘   │
│                                  │
│  ┌─────────────────────────┐   │
│  │ 🔗 Share Link            │   │
│  └─────────────────────────┘   │
│                                  │
│  ┌─────────────────────────┐   │
│  │ #️⃣  Generate Join Code    │   │
│  └─────────────────────────┘   │
│                                  │
│  ┌─────────────────────────┐   │
│  │ 📱 Share QR Code         │   │
│  └─────────────────────────┘   │
│                                  │
│  [Cancel]                        │
└─────────────────────────────────┘
```

#### Select Friends Interface

**Friend Selector:**
```
┌─────────────────────────────────┐
│  ← Select Friends                │
│                                  │
│  🔍 Search friends...            │
│                                  │
│  Active Now                      │
│  ┌───────────────────┐          │
│  │ ✓ 👤 Alex         │ 🟢       │
│  │   On a walk nearby│          │
│  └───────────────────┘          │
│                                  │
│  Recent                          │
│  ┌───────────────────┐          │
│  │ ✓ 👤 Sam          │          │
│  │   Active 2h ago   │          │
│  └───────────────────┘          │
│                                  │
│  ┌───────────────────┐          │
│  │   👤 Jordan       │          │
│  │   Active 1d ago   │          │
│  └───────────────────┘          │
│                                  │
│  All Friends (A-Z)               │
│  ...                             │
│                                  │
│  [Invite 2 Friends]              │
└─────────────────────────────────┘
```

**Smart Ordering:**
1. Currently active (online now)
2. Currently on walks nearby
3. Recently active
4. Frequently walked with
5. Alphabetical (all others)

**Status Indicators:**
- 🟢 Online now
- 🚶 On a walk
- ⏰ Last active time
- 📍 Distance away (if nearby)

#### Share Link Interface

**Link Sharing:**
```
┌─────────────────────────────────┐
│  Share Invite Link               │
│                                  │
│  Anyone with this link can join  │
│  your walk                       │
│                                  │
│  ┌─────────────────────────┐   │
│  │ birdwalk.app/join/      │   │
│  │ XyZ9mN                  │ 📋 │
│  └─────────────────────────┘   │
│                                  │
│  Link Settings                   │
│  Expires: Never          [Edit]  │
│  Max uses: Unlimited     [Edit]  │
│                                  │
│  Share via:                      │
│  ┌──────────────────────────┐  │
│  │ 💬  📧  📱  ···  ⋮       │  │
│  └──────────────────────────┘  │
│                                  │
│  [Done]                          │
└─────────────────────────────────┘
```

**Native Share Sheet Integration:**
- Use platform-native sharing
- Include preview/metadata
- Support all messaging apps
- Copy link option
- Save to clipboard confirmation

#### Join Code Interface

**Code Display:**
```
┌─────────────────────────────────┐
│  Join Code                       │
│                                  │
│  Share this code with friends:   │
│                                  │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │      WALK-2847          │   │
│  │                         │   │
│  └─────────────────────────┘   │
│         📋 Copy                  │
│                                  │
│  Expires in 4 hours              │
│                                  │
│  Tell friends to:                │
│  1. Open Birdwalk                │
│  2. Tap "Join Walk"              │
│  3. Enter code                   │
│                                  │
│  [Share Code]                    │
└─────────────────────────────────┘
```

**Code Entry (Recipient):**
```
┌─────────────────────────────────┐
│  Join Walk                       │
│                                  │
│  Enter join code                 │
│                                  │
│  ┌─────────────────────────┐   │
│  │ W A L K - 2 8 4 7       │   │
│  └─────────────────────────┘   │
│                                  │
│  [Join Walk]                     │
│                                  │
│  ─── OR ───                      │
│                                  │
│  [Scan QR Code]                  │
└─────────────────────────────────┘
```

**UX Considerations:**
- Auto-format as user types (WALK-2847)
- Case-insensitive entry
- Clear error messages
- Immediate feedback on valid/invalid codes
- Haptic feedback on success

### 2.3 Receiving Invitations

#### Push Notification

**Immediate Invitation:**
```
┌─────────────────────────────────┐
│ 🚶 Birdwalk              now     │
│                                  │
│ Walk Invitation                  │
│ Alex invited you to join a walk  │
│ starting now at Riverside Park   │
│                                  │
│     [Accept]      [Decline]      │
└─────────────────────────────────┘
```

**Scheduled Invitation:**
```
┌─────────────────────────────────┐
│ 🚶 Birdwalk              2h ago  │
│                                  │
│ Walk Invitation                  │
│ Sam invited you to a walk        │
│ tomorrow at 9:00 AM              │
│                                  │
│  [View Details]    [Decline]     │
└─────────────────────────────────┘
```

**Best Practices:**
- Include key details (who, when, where)
- Quick actions (accept/decline)
- Rich notification with map preview (iOS)
- Group similar notifications
- Sound/vibration for immediate invites only

#### In-App Invitation Card

**Invitation Detail View:**
```
┌─────────────────────────────────┐
│  ← Invitation                    │
│                                  │
│  👤 Alex Rivera                  │
│  invited you to a walk           │
│                                  │
│  📅 Tomorrow, March 15           │
│  ⏰ 9:00 AM                      │
│  📍 Riverside Park (2.3 km away) │
│                                  │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │    [Map Preview]        │   │
│  │                         │   │
│  └─────────────────────────┘   │
│                                  │
│  Who's coming (3)                │
│  👤👤👤 Alex, Sam, Jordan        │
│                                  │
│  Planned route: 5 km loop        │
│  Estimated time: 1 hour          │
│                                  │
│  💬 "Looking forward to seeing   │
│      some great birds!"          │
│                                  │
│  ┌─────────────────────────┐   │
│  │      Accept              │   │
│  └─────────────────────────┘   │
│                                  │
│  [Maybe]        [Decline]        │
└─────────────────────────────────┘
```

**Key Information:**
- Who invited (with avatar)
- When (date/time, relative time)
- Where (location, distance from you)
- Who else is coming
- Route details if available
- Personal message if included
- Clear accept/decline actions

#### RSVP States

**Status Options:**
- ✅ Accepted (Going)
- ❓ Maybe (Tentative)
- ❌ Declined (Not Going)
- ⏳ No Response (pending)

**State Transitions:**
```
User can change mind:
Accepted → Maybe → Declined
         ↕        ↕
      Direct switches allowed
```

**Notifications to Organizer:**
- Notify on accept/decline
- Don't notify on "maybe"
- Batch notifications if many responses
- Summary before event: "5 going, 2 maybe, 1 declined"

## 3. In-Activity Collaboration UI

### 3.1 Live Activity Map View

**Map Interface During Walk:**
```
┌─────────────────────────────────┐
│  [≡]  Morning Walk       [···]   │
│                                  │
│  ┌─────────────────────────┐   │
│  │ 📍                      │   │
│  │    You    🚶           │   │
│  │                         │   │
│  │           Alex 🚶       │   │
│  │   200m →                │   │
│  │                         │   │
│  │      Sam 🚶             │   │
│  │   ← 150m                │   │
│  └─────────────────────────┘   │
│                                  │
│  ┌─────────────────────────┐   │
│  │ 2.4 km  •  24:15  •  5'12"/km│
│  └─────────────────────────┘   │
│                                  │
│  Participants (3)          [▼]   │
│  ┌───────────────────┐          │
│  │ You        2.4 km │ 📍       │
│  │ Alex       2.6 km │ 🟢       │
│  │ Sam        2.2 km │ 🟢       │
│  └───────────────────┘          │
│                                  │
│  [💬]              [⏸️ Pause]     │
└─────────────────────────────────┘
```

**Map Elements:**
- Your position (blue dot, prominent)
- Other participants (different colors)
- Distance/direction to others
- Breadcrumb trail for each person
- Waypoints/meeting points
- Privacy zones (blurred areas)

**Participant List (Expanded):**
```
┌─────────────────────────────────┐
│  Participants (3)                │
│                                  │
│  You                             │
│  2.4 km • 24:15 • 5'12"/km      │
│  ────────────────────            │
│                                  │
│  👤 Alex Rivera           🟢     │
│  2.6 km • 26:30 • 5'20"/km      │
│  200m ahead                      │
│  [📍 Show on map]                 │
│  ────────────────────            │
│                                  │
│  👤 Sam Chen              🟢     │
│  2.2 km • 22:00 • 5'00"/km      │
│  150m behind                     │
│  [📍 Show on map]                 │
│                                  │
│  [+ Invite More]                 │
└─────────────────────────────────┘
```

**Relative Positioning:**
- Show distance ahead/behind
- Indicate direction with arrows
- Update in real-time (every 5-15 seconds)
- Tap to focus on map

### 3.2 Group Chat Integration

**Minimal Chat Interface:**
```
┌─────────────────────────────────┐
│  💬 Activity Chat                │
│                                  │
│  Alex • 2m ago                   │
│  "Taking a quick water break!"   │
│  📍 Show location                │
│                                  │
│  Sam • 5m ago                    │
│  "Spotted a blue jay! 🐦"        │
│  📷 [Photo]                      │
│                                  │
│  System • 8m ago                 │
│  Jordan left the activity        │
│                                  │
│  ┌─────────────────────────┐   │
│  │ Type a message...       │ 🎤│
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

**Quick Messages:**
```
┌─────────────────────────────────┐
│  Quick Send                      │
│                                  │
│  👋 Wave                         │
│  ⏸️  Taking a break               │
│  💧 Water stop                   │
│  🚶 Keep going, catch up later   │
│  ⏱️  Almost there                 │
│  📍 Meet here                    │
│                                  │
│  [Cancel]                        │
└─────────────────────────────────┘
```

**Benefits:**
- Reduce typing while walking
- Common scenarios covered
- One-tap communication
- Less distraction from activity

### 3.3 Waypoints and Meeting Points

**Waypoint Interface:**
```
┌─────────────────────────────────┐
│  📍 Waypoint: Viewpoint          │
│                                  │
│  450m ahead • ~5 minutes         │
│                                  │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │    [Map to waypoint]    │   │
│  │    You ─────→ 📍        │   │
│  │                         │   │
│  └─────────────────────────┘   │
│                                  │
│  Who's arrived:                  │
│  ✓ Alex (2m ago)                │
│  ✓ Sam (just now)               │
│  ⏳ You (approaching)            │
│                                  │
│  ☑️ Wait for everyone            │
│                                  │
│  [Continue to next waypoint]     │
└─────────────────────────────────┘
```

**Arrival Notifications:**
```
┌─────────────────────────────────┐
│ 🚶 Birdwalk                      │
│                                  │
│ Sam reached Viewpoint waypoint   │
│ Waiting for you and Alex         │
└─────────────────────────────────┘
```

### 3.4 Leader/Follower Modes

**Leader Controls:**
```
┌─────────────────────────────────┐
│  👑 You're leading this walk     │
│                                  │
│  ┌─────────────────────────┐   │
│  │ Set next waypoint        │   │
│  └─────────────────────────┘   │
│                                  │
│  ┌─────────────────────────┐   │
│  │ Broadcast message        │   │
│  └─────────────────────────┘   │
│                                  │
│  ┌─────────────────────────┐   │
│  │ Adjust pace              │   │
│  └─────────────────────────┘   │
│                                  │
│  ┌─────────────────────────┐   │
│  │ Pass leadership          │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

**Follower View:**
```
┌─────────────────────────────────┐
│  Following Alex's route          │
│                                  │
│  Next waypoint: Viewpoint        │
│  450m ahead                      │
│                                  │
│  Suggested pace: 5'15"/km        │
│  You're on pace ✓                │
│                                  │
│  [Request to lead]               │
└─────────────────────────────────┘
```

### 3.5 Activity Completion

**Group Summary:**
```
┌─────────────────────────────────┐
│  Walk Complete! 🎉               │
│                                  │
│  Group Stats                     │
│  Total distance: 5.2 km          │
│  Total time: 52:30               │
│  Participants: 3                 │
│                                  │
│  ┌─────────────────────────┐   │
│  │      [Route Map]        │   │
│  │  All participants shown │   │
│  └─────────────────────────┘   │
│                                  │
│  Individual Stats                │
│  You:    5.2 km • 52:30 • 5'06" │
│  Alex:   5.4 km • 54:00 • 5'12" │
│  Sam:    5.0 km • 50:00 • 5'00" │
│                                  │
│  Bird Sightings: 12 species      │
│                                  │
│  ┌─────────────────────────┐   │
│  │   Share Activity        │   │
│  └─────────────────────────┘   │
│                                  │
│  [Done]                          │
└─────────────────────────────────┘
```

**Social Sharing Options:**
```
┌─────────────────────────────────┐
│  Share Your Walk                 │
│                                  │
│  ☑️ Include route map            │
│  ☑️ Show statistics              │
│  ☑️ Tag participants             │
│  ☐ Share to activity feed        │
│  ☐ Post to social media          │
│                                  │
│  Privacy                         │
│  Who can see: Followers    [▼]   │
│                                  │
│  [Share]            [Skip]       │
└─────────────────────────────────┘
```

## 4. Privacy Control UX

### 4.1 Privacy Settings Organization

**Main Privacy Hub:**
```
┌─────────────────────────────────┐
│  ← Privacy & Safety              │
│                                  │
│  Profile                         │
│  ┌─────────────────────────┐   │
│  │ Who can see your        │   │
│  │ profile          Friends│ ▶ │
│  └─────────────────────────┘   │
│                                  │
│  Activities                      │
│  ┌─────────────────────────┐   │
│  │ Activity visibility     │   │
│  │                  Friends│ ▶ │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ Map visibility          │   │
│  │             Start/End   │ ▶ │
│  │             hidden      │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ Privacy zones     2 set │ ▶ │
│  └─────────────────────────┘   │
│                                  │
│  Social                          │
│  ┌─────────────────────────┐   │
│  │ Who can find you        │ ▶ │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ Connection requests     │ ▶ │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

**Visibility Settings:**
```
┌─────────────────────────────────┐
│  ← Activity Visibility           │
│                                  │
│  Who can see your activities?    │
│                                  │
│  ○ Public                        │
│    Anyone can see                │
│                                  │
│  ◉ Friends                       │
│    Only people you follow        │
│                                  │
│  ○ Private                       │
│    Only you                      │
│                                  │
│  ───────────────────────         │
│                                  │
│  ☑️ Hide activities from         │
│     search results               │
│                                  │
│  ☑️ Don't include in             │
│     leaderboards                 │
│                                  │
│  [Save]                          │
└─────────────────────────────────┘
```

### 4.2 Privacy Zones UI

**Privacy Zones List:**
```
┌─────────────────────────────────┐
│  ← Privacy Zones                 │
│                                  │
│  Hide activity near these        │
│  locations                       │
│                                  │
│  ┌─────────────────────────┐   │
│  │ 🏠 Home                  │   │
│  │ 123 Main St • 400m      │ ▶ │
│  └─────────────────────────┘   │
│                                  │
│  ┌─────────────────────────┐   │
│  │ 💼 Work                  │   │
│  │ TechCo HQ • 300m        │ ▶ │
│  └─────────────────────────┘   │
│                                  │
│  [+ Add Privacy Zone]            │
│                                  │
│  ℹ️ Your location will be hidden │
│    when you start or end walks  │
│    within these areas            │
└─────────────────────────────────┘
```

**Adding Privacy Zone:**
```
┌─────────────────────────────────┐
│  ← Add Privacy Zone              │
│                                  │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │    [Interactive Map]    │   │
│  │    📍 Drop pin          │   │
│  │    ⭕ Radius circle      │   │
│  └─────────────────────────┘   │
│                                  │
│  Name                            │
│  ┌─────────────────────────┐   │
│  │ Home                    │   │
│  └─────────────────────────┘   │
│                                  │
│  Location                        │
│  ○ Current location              │
│  ◉ Enter address                 │
│  ○ Choose on map                 │
│                                  │
│  Radius                          │
│  ├────────●──────┤ 400m          │
│  200m         1000m              │
│                                  │
│  📊 This will hide parts of      │
│     37 past activities           │
│                                  │
│  [Create Zone]                   │
└─────────────────────────────────┘
```

**Privacy Zone Visual Feedback:**
- Show circle on map during creation
- Adjust radius with slider or pinch gesture
- Preview affected activities count
- Warning if zone too large/small
- Confirm before applying to past activities

### 4.3 In-Context Privacy Controls

**Activity Privacy (During Creation):**
```
┌─────────────────────────────────┐
│  New Walk                        │
│  ...                             │
│                                  │
│  Privacy              [🔒]       │
│  ┌─────────────────────────┐   │
│  │ Friends              ▼  │   │
│  └─────────────────────────┘   │
│                                  │
│  Quick options:                  │
│  ☑️ Hide start/end locations     │
│  ☑️ Don't notify followers       │
│  ☐ Just for me (private)         │
│                                  │
│  [More privacy settings...]      │
└─────────────────────────────────┘
```

**Location Sharing Indicator:**
```
┌─────────────────────────────────┐
│  Walk in Progress                │
│  ┌─────────────────────────┐   │
│  │  🔵 Sharing location     │   │
│  │  with 3 friends          │   │
│  │                     [⏹️]  │   │
│  └─────────────────────────┘   │
│  ...                             │
└─────────────────────────────────┘
```

**Quick Privacy Toggle:**
- Persistent indicator when sharing
- One-tap to stop sharing
- Clear who can see your location
- Warning before stopping in group activity

### 4.4 Permission Status Dashboard

**Permissions Overview:**
```
┌─────────────────────────────────┐
│  ← Permissions                   │
│                                  │
│  Location                        │
│  ┌─────────────────────────┐   │
│  │ ✅ While Using App       │   │
│  │ Required for tracking   │ ▶ │
│  └─────────────────────────┘   │
│                                  │
│  Contacts                        │
│  ┌─────────────────────────┐   │
│  │ ❌ Not Allowed           │   │
│  │ Find friends from       │ ▶ │
│  │ contacts                │   │
│  └─────────────────────────┘   │
│                                  │
│  Notifications                   │
│  ┌─────────────────────────┐   │
│  │ ✅ Allowed               │   │
│  │ Get walk invites        │ ▶ │
│  └─────────────────────────┘   │
│                                  │
│  Camera                          │
│  ┌─────────────────────────┐   │
│  │ ✅ Allowed               │   │
│  │ Take photos on walks    │ ▶ │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

**Status Indicators:**
- ✅ Allowed / Granted
- ❌ Denied / Not Allowed
- ⚠️ Limited Access (iOS 18 contacts)
- ⏳ Not Yet Requested

**Permission Detail View:**
```
┌─────────────────────────────────┐
│  ← Location Permission           │
│                                  │
│  Current Status                  │
│  ✅ While Using App              │
│                                  │
│  Why we need this:               │
│  Location access allows us to:   │
│  • Track your walks              │
│  • Show route on map             │
│  • Share location with friends   │
│  • Suggest nearby bird sightings │
│                                  │
│  What we don't do:               │
│  • Track when app is closed      │
│  • Share location without your   │
│    permission                    │
│  • Sell location data            │
│                                  │
│  To change this:                 │
│  [Open Settings]                 │
│                                  │
│  Learn more about privacy...     │
└─────────────────────────────────┘
```

## 5. Onboarding and Education

### 5.1 Social Features Tutorial

**Progressive Onboarding:**
```
After first solo walk completion:

┌─────────────────────────────────┐
│  Great First Walk! 🎉            │
│                                  │
│  Did you know you can walk       │
│  with friends?                   │
│                                  │
│  ┌─────────────────────────┐   │
│  │  • Invite friends to     │   │
│  │    join your walks       │   │
│  │  • Share your routes     │   │
│  │  • See who's nearby      │   │
│  └─────────────────────────┘   │
│                                  │
│  [Find Friends]  [Not Now]       │
└─────────────────────────────────┘

After 3 walks:

┌─────────────────────────────────┐
│  You're on a roll! 🔥            │
│                                  │
│  Make walks more fun:            │
│  Connect with friends to         │
│  compare progress                │
│                                  │
│  [Connect]     [Maybe Later]     │
└─────────────────────────────────┘
```

**Feature Discovery:**
- Show tips contextually
- Don't interrupt core experience
- Easy to dismiss
- "Don't show again" option
- Reappear if feature becomes more relevant

### 5.2 Privacy Onboarding

**Initial Privacy Setup:**
```
┌─────────────────────────────────┐
│  Protect Your Privacy            │
│                                  │
│  Before you start, let's set up  │
│  privacy zones around places     │
│  you visit often                 │
│                                  │
│  ┌─────────────────────────┐   │
│  │  🏠  Add your home        │   │
│  │      address to hide     │   │
│  │      location nearby     │   │
│  │                          │   │
│  │  [Add Home Location]     │   │
│  └─────────────────────────┘   │
│                                  │
│  You can:                        │
│  • Add more zones later          │
│  • Adjust radius               │
│  • Turn off anytime              │
│                                  │
│  [Set Up Privacy]    [Skip]      │
└─────────────────────────────────┘
```

### 5.3 Empty States

**No Friends Yet:**
```
┌─────────────────────────────────┐
│  Activity Feed                   │
│                                  │
│         👥                       │
│                                  │
│  No friends yet                  │
│                                  │
│  Connect with friends to see     │
│  their walks here                │
│                                  │
│  [Find Friends]                  │
│                                  │
│  ─── OR ───                      │
│                                  │
│  Continue walking solo and       │
│  track your progress             │
│                                  │
│  [Start Walk]                    │
└─────────────────────────────────┘
```

**No Invitations:**
```
┌─────────────────────────────────┐
│  Invitations                     │
│                                  │
│         📭                       │
│                                  │
│  No invitations                  │
│                                  │
│  Want to walk with others?       │
│  Create a walk and invite        │
│  friends to join                 │
│                                  │
│  [Create Walk]                   │
└─────────────────────────────────┘
```

## Key Takeaways

### Friend Discovery
1. **Never request permissions during onboarding** - wait for contextual action
2. **Offer multiple discovery methods** - username search, QR codes, contacts, social login
3. **Show clear value before asking** - explain why finding friends matters
4. **Make suggestions intelligent** - use mutual connections, activity patterns, proximity
5. **Respect privacy choices** - graceful fallbacks if permissions denied

### Activity Invitations
1. **Multiple invitation methods** - direct, links, codes, QR for different contexts
2. **Rich invitation details** - who, when, where, route, other participants
3. **Quick actions in notifications** - accept/decline without opening app
4. **Clear RSVP states** - going, maybe, declined, pending
5. **Flexible state changes** - allow users to change mind

### Collaborative UI
1. **Clear visual hierarchy** - your position prominent, others secondary
2. **Real-time updates** - location, stats, chat messages
3. **Relative positioning** - show distance/direction to others
4. **Quick communication** - preset messages for less distraction
5. **Group awareness** - who's where, who's arrived at waypoints

### Privacy Controls
1. **Granular settings** - control each aspect separately
2. **Privacy by default** - most restrictive settings initially
3. **In-context controls** - adjust privacy where it matters
4. **Visual feedback** - clear indicators when sharing location
5. **Easy to understand** - plain language, no technical jargon
6. **Privacy zones essential** - protect home/work locations
7. **Regular checkups** - remind users to review settings

## Sources

- [Best Sign Up Flows (2026): 15 UX Examples](https://www.eleken.co/blog-posts/sign-up-flow)
- [App Onboarding Guide - Top 10 Examples 2026](https://uxcam.com/blog/10-apps-with-great-user-onboarding/)
- [UI design pattern tips: 'Find & Invite Friends'](https://www.creativebloq.com/ux/ui-design-pattern-tips-find-invite-friends-121413499)
- [7 Mobile UX/UI Design Patterns Dominating 2026](https://www.sanjaydey.com/mobile-ux-ui-design-patterns-2026-data-backed/)
- [Elevating The Invite Process: UX Design Case Study](https://medium.com/@rakshitgopnarayan/elevating-the-invite-process-49fe8a65b5cb)
- [Strava: Finding Friends and Managing Contacts](https://support.strava.com/hc/en-us/articles/216919127-Finding-Friends-and-Managing-Contacts-on-Strava-Android)
- [AllTrails: How to use Live Share](https://support.alltrails.com/hc/en-us/articles/37212858771348-How-to-use-Live-Share)
- [Security and privacy settings in Strava](https://www.kaspersky.com/blog/running-apps-privacy-settings-part2-strava/52409/)
- [How to control your privacy settings on Strava](https://www.androidcentral.com/apps-software/how-to-control-your-privacy-settings-strava)
