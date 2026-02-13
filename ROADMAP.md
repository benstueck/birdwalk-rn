# Birdwalk RN - Development Roadmap

## Overview
This roadmap tracks the planned features and improvements for the Birdwalk React Native application.

## Priority Levels
- **P0**: High priority - Core features that should be implemented soon
- **P1**: Medium priority - Important features for enhanced functionality
- **P2**: Lower priority - Nice-to-have features for future consideration

---

## Tasks

### P0 - High Priority

#### 1. Offline Mode
**Status**: Planning
**Plan Document**: [plans/03-offline-mode.md](plans/03-offline-mode.md)
**User Priority**: #1 requested feature

Add offline functionality to allow the app to work without an internet connection. This is the top user-reported pain point for using the app in remote areas without cell service.

**Key Requirements:**
- Cache walks, sightings, and life list locally
- Queue actions when offline, sync when back online
- Cache eBird taxonomy data for species search
- Cache Wikipedia images for offline viewing
- Handle sync conflicts gracefully

---

### P1 - Medium Priority

#### 3. Collaborative Walks ⭐
**Status**: Planning
**User Priority**: Most wanted social feature

Allow multiple users to contribute to the same walk in real-time. Perfect for birding groups, couples, or friends who want to pool their sightings on a shared outing.

**Key Features:**
- Start a walk with friends/group where everyone can add sightings
- Real-time sync of sightings as they're added
- Show who added each sighting
- Notifications when collaborators add new birds
- Permissions: walk creator vs contributors

**Technical Requirements:**
- Friends/invite system (add via email, username, or invite link)
- `walk_collaborators` table to track participants
- Real-time subscriptions using Supabase
- Permission levels: owner, contributor, viewer

#### 4. Share Life List
**Status**: Planning
**User Priority**: Top requested feature

Generate shareable links to view life lists, making it easy to show friends and family your birding accomplishments.

**Key Features:**
- Public URL or private link options
- Read-only view with species count, recent sightings
- Filter by date range, location, or specific walks
- Privacy controls: fully public, friends-only, or private
- Optional: embed widget for personal websites

#### 5. Compare Lists with Friends
**Status**: Planning

See which species your friends have seen that you haven't (and vice versa). Great for friendly competition and getting birding suggestions.

**Key Features:**
- Visual comparison showing shared species, unique to each person
- Suggestions: "These 5 birds were spotted near you recently"
- Gamification: "You're 5 birds away from catching up!"
- Requires: friends system or invite links

#### 6. Public Profile / Life List Page
**Status**: Planning

Public-facing profile page to showcase birding achievements and activity.

**Key Features:**
- Total species count and recent sightings
- Top birding locations
- Optional: walks, photos, stats
- Customizable URL: birdwalk.app/@username
- Privacy controls for each section

#### 7. Stats Dashboard Enhancement
**Status**: Planning

Expand the profile screen with richer analytics and visualizations.

**Key Features:**
- Birds per month/year graphs
- Most active birding times (time of day, season)
- Location heatmap of sightings
- Species frequency charts
- Year-over-year comparisons
- Streak tracking

#### 8. Face ID / Touch ID Authentication
**Status**: Planning

Add biometric authentication (Face ID on newer devices, Touch ID on older devices) to allow quick login without typing email/password. Improves UX when accessing the app in the field.

---

### P2 - Lower Priority

#### 9. Map Visualization
**Status**: Planning
**Plan Document**: [plans/04-map-visualization.md](plans/04-map-visualization.md)

Implement map-based visualization to display bird sightings geographically on an interactive map.

#### 10. Export Data
**Status**: Planning

Download walks and sightings as CSV or JSON for backups and external analysis.

**Key Features:**
- Export all data or filter by date range
- CSV format for spreadsheet analysis
- JSON format for programmatic access
- Import capability to restore from backup

#### 11. Field Guide Details
**Status**: Planning

Tap any species to see comprehensive field guide information.

**Key Features:**
- Range maps showing where species is found
- Audio samples of calls and songs
- Identification tips and key field marks
- Similar species comparisons
- Integration with existing Wikipedia images

#### 12. Notifications & Reminders
**Status**: Planning

Smart notifications to encourage regular birding and celebrate milestones.

**Key Features:**
- "You haven't logged a walk in 2 weeks"
- "You're close to 100 species!"
- Milestone celebrations (10th, 50th, 100th lifer)
- Optional: "Rare bird spotted near you" (requires community data)

#### 13. Advanced Sighting Metadata
**Status**: Planning

Add optional detailed fields for serious birders who want to track more information.

**Key Features:**
- Weather conditions at time of sighting
- Habitat type (forest, wetland, urban, etc.)
- Behavior observations (feeding, nesting, migrating)
- Age/sex if known
- Abundance (1, 2-5, 5-10, 10+)
- Breeding evidence codes

---

## Completed Tasks

#### Dark Mode
**Completed**: 2026-02-13
**Plan Document**: [plans/dark-mode.md](plans/dark-mode.md)

Implemented comprehensive dark mode support with Discord-inspired color palette. Users can toggle between Light, Dark, and System modes via the Profile screen. Theme preference persists across app restarts. All screens, components, and modals fully support both themes with proper contrast ratios and smooth transitions.

#### Add Sort to Lifers Tab
**Completed**: 2026-02-10
**Plan Document**: [plans/01-lifers-sort.md](plans/01-lifers-sort.md)

Implemented sorting functionality for the Lifers tab with options to sort by recent sighting, species name, and total sightings count. Matches Walks tab UI/UX pattern.

---

## Features NOT Planned (Based on User Feedback)

The following features were considered but are not currently planned based on user feedback:

- **eBird Integration** - User doesn't use eBird, low priority for now
- **Merlin Integration** - Similar to eBird, can revisit if user interest changes
- **Photo Capture** - User not currently interested, can add later if requested

---

## Notes

### User Feedback Summary (2026-02-11)
- **Main Pain Point**: Missing data offline - app doesn't work well without internet in remote areas
- **Top Requested Feature**: Share lists - ability to share life list or walks with others
- **eBird Usage**: Not interested in eBird integration
- **Social Interests**: Share lists publicly, compare with friends, collaborative walks

### Implementation Priorities
Based on user feedback, offline mode has been elevated from P1 to P0 priority as it addresses the #1 user pain point. Social features (collaborative walks, sharing, comparing) have been added as P1 priorities since these were the most requested enhancements.

---

**Last Updated**: 2026-02-13
