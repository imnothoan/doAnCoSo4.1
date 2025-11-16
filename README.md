# ConnectSphere - Social Networking Mobile App

A comprehensive React Native mobile application built with Expo that replicates the core functionality of the UniVini social networking app. Connect with people, attend events, join communities, and make new friends around the world.

## 🎯 Project Overview

ConnectSphere is a feature-rich social networking app designed to help users:
- Find and connect with people nearby or globally
- Discover and join events
- Participate in community discussions
- Chat with other users in real-time
- Manage their social profile and connections

## 🚀 Tech Stack

- **React Native** with **Expo** (~54.0.20)
- **TypeScript** for type safety
- **Expo Router** for file-based navigation
- **React Navigation** for bottom tabs and stack navigation
- **AsyncStorage** for local data persistence
- **Axios** for API communication
- **date-fns** for date formatting
- **React Native Paper** for UI components
- **Expo Location** for geolocation features
- **@expo/vector-icons** (Ionicons) for icons
- **@expo/ui** for SwiftUI components (iOS liquid glass effect) ✨

## 🎨 iOS Premium Features

### Liquid Glass Bottom Tab Bar (iOS Only)
ConnectSphere features Apple's latest **iOS 18 Liquid Glass** design on iOS devices:
- ✨ Native SwiftUI liquid glass morphism effect
- 🎯 Interactive glass that responds to touches
- 🔵 Dynamic states: clear glass for active tabs, regular glass for inactive
- 📱 Platform-specific: iOS gets premium experience, Android/Web use standard tabs
- 📖 See [LIQUID_GLASS_IMPLEMENTATION.md](./LIQUID_GLASS_IMPLEMENTATION.md) for details

## ✨ Features Implemented

### Authentication
- ✅ Login screen with email/password
- ✅ Signup screen with validation
- ✅ Social login UI (Google, Facebook, Apple)
- ✅ Protected routes based on auth state
- ✅ Token management with AsyncStorage

### Main Tabs

#### 1. Hang Out Tab
- Toggle availability to hang out
- Display status with selected activities
- Sliding tabs for "Open hangouts" and "My hangouts"
- Notification icon with badge in header

#### 2. My Events Tab
- Event cards with images, distance, and details
- Event detail screen with:
  - Full event information
  - Participants list
  - Comments section
  - Join/interested functionality
  - Chat and invite buttons

#### 3. Discussion Tab
- Browse communities
- Search communities
- Upload to communities
- Community cards with member counts

#### 4. Connection Tab
- User cards with complete profiles
- Availability badges
- Interest tags
- Search functionality
- View mode toggle (Users/Events)
- Navigate to user profiles

#### 5. Inbox Tab
- Chat list with avatars
- Last message preview
- Unread message counts and badges
- Filter tabs (All/Events/Users)
- Navigate to chat screens

#### 6. Account Tab
- Profile header with avatar
- Profile completion progress bar
- Bio, languages, and summary statistics
- Interests display
- Settings menu
- Sign out functionality

### Additional Screens

- **Notification Screen**: View all notifications with type-based icons
- **Event Detail Screen**: Complete event information and interactions with image upload for comments
- **Chat Screen**: Full messaging UI with quick messages, real-time updates via WebSocket, typing indicators, and image sharing
- **Profile Screen**: View other users' profiles with all details
- **Edit Profile Screen**: Comprehensive profile editing with avatar upload, languages, interests, and hangout activities
- **Settings Screen**: Full app settings including notifications, privacy, account management, and logout

## 📁 Project Structure

```
doAnCoSo4.1/
├── app/                          # App screens (Expo Router)
│   ├── (tabs)/                   # Bottom tab screens
│   │   ├── hangout.tsx
│   │   ├── my-events.tsx
│   │   ├── discussion.tsx
│   │   ├── connection.tsx
│   │   ├── inbox.tsx
│   │   └── account.tsx
│   ├── index.tsx                 # Auth router
│   ├── login.tsx                 # Login screen
│   ├── signup.tsx                # Signup screen
│   ├── notification.tsx          # Notifications
│   ├── event-detail.tsx          # Event details
│   ├── chat.tsx                  # Chat/messaging
│   ├── profile.tsx               # User profile
│   ├── edit-profile.tsx          # Edit profile
│   ├── settings.tsx              # App settings
│   └── _layout.tsx               # Root layout
├── src/
│   ├── constants/                # App constants
│   │   └── options.ts
│   ├── context/                  # React Context
│   │   └── AuthContext.tsx
│   ├── services/                 # API and services
│   │   ├── api.ts
│   │   ├── websocket.ts         # WebSocket service
│   │   ├── location.ts          # Location service
│   │   ├── image.ts             # Image upload service
│   │   └── mockData.ts
│   ├── types/                    # TypeScript types
│   │   └── index.ts
│   └── utils/                    # Utility functions
│       ├── distance.ts
│       └── date.ts
├── components/                   # Reusable components
├── constants/                    # Theme and colors
├── assets/                       # Images and fonts
├── app.json                      # Expo configuration
├── package.json                  # Dependencies
└── tsconfig.json                 # TypeScript config
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac) or Android Emulator

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/imnothoan/doAnCoSo4.1.git
   cd doAnCoSo4.1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device/emulator**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on physical device

## 📱 Usage

### Running the App

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web

# Lint code
npm run lint
```

### Mock Data

The app currently uses mock data defined in `src/services/mockData.ts`. This includes:
- Mock users with complete profiles
- Mock events with participants and details
- Mock chats and messages
- Mock communities
- Mock notifications

### Services Architecture

The app uses a service-oriented architecture with the following services:

#### API Service (`src/services/api.ts`)
- Axios-based HTTP client
- Automatic token management
- RESTful API endpoints for all features
- Error handling and request/response interceptors

#### WebSocket Service (`src/services/websocket.ts`)
- Socket.IO client for real-time features
- Auto-reconnection with exponential backoff
- Room-based messaging
- Typing indicators and presence tracking
- Event-driven architecture

#### Location Service (`src/services/location.ts`)
- GPS permission handling
- Current location tracking
- Distance calculation (Haversine formula)
- Location-based filtering and sorting
- Position watching for real-time updates

#### Image Service (`src/services/image.ts`)
- expo-image-picker integration
- Camera and gallery access
- Image validation (size, format)
- FormData creation for uploads
- Multiple image selection support

### Authentication Flow

1. App starts at `index.tsx` which checks auth state
2. If not authenticated → redirects to `login.tsx`
3. After login/signup → redirects to main tabs and initializes WebSocket
4. All tab screens are protected and require authentication
5. On logout → disconnects WebSocket and clears local storage

## 🔧 Configuration

### Location Permissions

Location permissions are configured in `app.json`:
- iOS: `NSLocationWhenInUseUsageDescription`
- Android: `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`

### API Configuration

Update the API base URL in `src/services/api.ts`:
```typescript
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com';
```

## 📝 Key Features Details

### Real-Time Chat with WebSocket
- Real-time message delivery via Socket.IO
- Typing indicators showing when other users are typing
- Online/offline status tracking
- Auto-reconnection on network issues
- Message read receipts
- Support for text and image messages

### Image Upload
- Camera and gallery support via expo-image-picker
- Image size validation (max 5MB)
- Preview before upload
- FormData multipart uploads
- Support for:
  - Profile avatars
  - Chat messages
  - Event comments
  - Community posts

### Location Features
- GPS permission handling
- Real-time location tracking
- Haversine formula for accurate distance calculation
- Distance-based filtering (1km, 2km, 5km, 10km, 20km, 50km)
- Location-based user sorting
- Distance display on user cards
- Auto-request permissions on first use

### Quick Messages in Chat
- Type `/x` for "Xin chào"
- Type `/h` for "Hello!"
- Type `/t` for "Thank you!"
- Type `/s` for "See you soon!"

### Distance Calculation
- Uses Haversine formula for accurate distance
- Filters: Under 1km, 2km, 5km, 10km, 20km, 50km
- Displays distance in meters (<1km) or kilometers

### Event Management
- Join/leave events
- View participants
- Add comments with images
- See event details and schedule

## 🎨 Design & UI

- **Primary Color**: #007AFF (iOS Blue)
- **Success**: #4CAF50 (Green)
- **Error**: #FF3B30 (Red)
- **Background**: #f5f5f5 (Light Gray)
- **Cards**: White with subtle shadows
- **Icons**: Ionicons from @expo/vector-icons

## 🔐 Security

- Passwords are handled securely (ready for backend integration)
- Tokens stored in AsyncStorage
- Protected routes with auth guards
- Input validation on all forms

## 🚧 Next Steps / Roadmap

### Completed Features
- ✅ Connect to real backend API
- ✅ Implement WebSocket for real-time chat
- ✅ Add image upload functionality
- ✅ Implement filters (languages, distance, age)
- ✅ Create edit profile screen
- ✅ Build settings screens
- ✅ Add location permissions and distance filtering
- ✅ Implement typing indicators in chat
- ✅ Add image upload to event comments
- ✅ Auto-connect WebSocket on authentication

### High Priority
- [ ] Add pull-to-refresh on lists (partially implemented)
- [ ] Implement pagination for large data sets
- [ ] Add skeleton loading states
- [ ] Push notifications integration
- [ ] Complete backend integration testing

### Medium Priority
- [ ] Offline support with local caching
- [ ] Dark mode implementation
- [ ] Multi-language support
- [ ] Advanced search and filters
- [ ] User blocking and reporting

### Future Enhancements
- [ ] AI-based user matching
- [ ] Message translation
- [ ] Video/voice calls
- [ ] Real-time location sharing
- [ ] AI Gemini integration
- [ ] Story/status features

## 🤝 Contributing

This is a client-side repository. The server-side code is at:
https://github.com/imnothoan/doAnCoSo4.1.server

## 📄 License

This project is part of a university thesis project.

## 👥 Credits

Built as a client app for the UniVini-like social networking platform.

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

**Status**: ✅ MVP Complete - Ready for API integration and deployment!
