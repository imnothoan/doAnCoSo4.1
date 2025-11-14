# App Structure

This directory contains all the screens and routes for the ConnectSphere app.

## Directory Organization

### Main Tabs (`(tabs)/`)
The main navigation tabs of the application:

- **hangout.tsx** - Hang out section (Tinder-like swipe for meeting people)
- **connection.tsx** - Explore section (Browse people and events)
- **discussion.tsx** - Feed section (Social feed and discussions)
- **inbox.tsx** - Inbox section (Messages and conversations)
- **account.tsx** - Profile section (User profile and settings)
- **my-events.tsx** - My Events (Hidden tab, accessible from Explore)

### Authentication Screens
- **login.tsx** - Login screen
- **signup.tsx** - Sign up screen

### Profile & User Screens
- **profile.tsx** - User profile view
- **edit-profile.tsx** - Edit user profile
- **followers-list.tsx** - View followers/following
- **settings.tsx** - App settings

### Chat & Messaging
- **chat.tsx** - Individual chat conversation

### Events
- **event-detail.tsx** - Event details and participants

### Other Screens
- **notification.tsx** - Notifications
- **payment-pro.tsx** - Pro/Premium subscription
- **modal.tsx** - Generic modal screen

### Root Files
- **index.tsx** - App entry point
- **_layout.tsx** - Root layout configuration

## Navigation

The app uses Expo Router for file-based navigation. Routes are automatically generated based on the file structure.

## Naming Conventions

- Tab screens are in the `(tabs)` folder
- Modal screens end with `.modal.tsx` (if applicable)
- Layout files are named `_layout.tsx`
