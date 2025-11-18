# WebRTC Setup Guide for ConnectSphere

## 🚨 Important: Expo Go Limitations

**WebRTC does NOT work with Expo Go** because it requires native modules that are not included in the Expo Go app.

## Current Implementation

The app currently uses a **mock WebRTC service** that allows the app to run in Expo Go without errors, but **video and voice calls will not actually work**. Users will see a warning message when attempting to make calls.

### What Works in Expo Go:
- ✅ All other app features (messaging, events, hangouts, etc.)
- ✅ Call UI displays
- ✅ Mock call simulation (for testing UI)
- ✅ WebSocket signaling

### What Doesn't Work in Expo Go:
- ❌ Real video streaming
- ❌ Real audio streaming
- ❌ Camera access for calls
- ❌ Microphone access for calls

## Enabling Real WebRTC

To enable **real video and voice calls**, you must create a **development build**:

### Option 1: Local Development Build (Free)

#### Prerequisites:
- Xcode (for iOS)
- Android Studio (for Android)
- Node.js 18+

#### Steps:

1. **Prebuild the native projects:**
   ```bash
   npx expo prebuild
   ```

2. **Restore react-native-webrtc:**
   ```bash
   npm install react-native-webrtc@^124.0.7
   ```

3. **Replace the WebRTC service:**
   ```bash
   # Backup the Expo version
   mv src/services/webrtcService.ts src/services/webrtcService.expo.ts
   
   # Use the native version
   mv src/services/webrtcService.native.ts src/services/webrtcService.ts
   ```

4. **Update app.json** to include WebRTC permissions:
   ```json
   {
     "expo": {
       "ios": {
         "infoPlist": {
           "NSCameraUsageDescription": "This app needs camera access for video calls.",
           "NSMicrophoneUsageDescription": "This app needs microphone access for voice and video calls.",
           "NSLocationWhenInUseUsageDescription": "This app needs your location to show nearby events and users.",
           "NSLocationAlwaysAndWhenInUseUsageDescription": "This app needs your location to show nearby events and users."
         }
       },
       "android": {
         "permissions": [
           "ACCESS_COARSE_LOCATION",
           "ACCESS_FINE_LOCATION",
           "CAMERA",
           "RECORD_AUDIO",
           "MODIFY_AUDIO_SETTINGS"
         ]
       }
     }
   }
   ```

5. **Run on iOS:**
   ```bash
   npx expo run:ios
   ```

6. **Run on Android:**
   ```bash
   npx expo run:android
   ```

### Option 2: EAS Build (Recommended for Teams)

EAS Build is Expo's cloud build service. It's easier and more reliable.

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Configure EAS:**
   ```bash
   eas build:configure
   ```

4. **Follow steps 2-4 from Option 1** to restore react-native-webrtc

5. **Create a development build:**
   ```bash
   # For iOS
   eas build --profile development --platform ios
   
   # For Android
   eas build --profile development --platform android
   ```

6. **Install the build on your device:**
   - Download the build from the EAS dashboard
   - Install it on your physical device
   - Run `npx expo start --dev-client`

## Testing Video Calls

Once you have a development build:

1. **Start the server:**
   ```bash
   cd ../doAnCoSo4.1.server
   npm run dev
   ```

2. **Update .env** with your server URL:
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_IP:3000
   ```

3. **Start the development client:**
   ```bash
   npx expo start --dev-client
   ```

4. **Test calls:**
   - Both users must have mutual follows
   - Initiate a call from the chat screen
   - Accept on the other device

## Architecture

### Files Structure:

```
src/services/
├── webrtcService.ts          # Current: Expo mock (for Expo Go)
├── webrtcService.native.ts   # Native implementation (for dev builds)
├── webrtcService.expo.ts     # Mock implementation (backup)
├── callingService.ts         # Call management (works with both)
└── websocket.ts              # WebSocket signaling (works with both)
```

### How It Works:

1. **CallingService** manages call state and WebSocket signaling
2. **WebRTCService** handles media streams (mock in Expo Go, real in dev build)
3. **WebSocket** handles signaling (offer/answer/ICE candidates)
4. **CallContext** provides global call state to the app

## Troubleshooting

### "WebRTC native module not found" Error

This is expected in Expo Go. The mock service prevents this error from crashing the app.

### Calls Not Connecting in Development Build

1. Check that both devices are on the same network
2. Verify server is running and accessible
3. Check that both users have mutual follows
4. Check WebSocket connection in app (green dot = connected)
5. Check server logs for WebRTC signaling events

### Camera/Microphone Not Working

1. Check app permissions in device settings
2. Verify `app.json` has correct permission requests
3. Reinstall the app after permission changes

### ICE Connection Failed

1. Check firewall settings
2. If on different networks, configure TURN server in `webrtcService.ts`:
   ```typescript
   const configuration = {
     iceServers: [
       { urls: 'stun:stun.l.google.com:19302' },
       // Add TURN server for NAT traversal
       {
         urls: 'turn:your-turn-server.com:3478',
         username: 'username',
         credential: 'password'
       }
     ],
   };
   ```

## Resources

- [Expo Prebuild Docs](https://docs.expo.dev/workflow/prebuild/)
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [react-native-webrtc Docs](https://github.com/react-native-webrtc/react-native-webrtc)
- [WebRTC API Docs](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)

## FAQ

**Q: Can I use Expo Go for testing other features?**  
A: Yes! All features except video/voice calls work perfectly in Expo Go.

**Q: Do I need a Mac for iOS builds?**  
A: For local builds, yes. For EAS builds, no - EAS builds in the cloud.

**Q: Is there a free alternative to EAS Build?**  
A: Yes, you can build locally with `npx expo run:ios/android`, but you need the respective development environments installed.

**Q: Can I use a TURN server?**  
A: Yes, configure it in `webrtcService.ts` under `iceServers`.

**Q: Why not use Expo's built-in WebRTC?**  
A: Expo doesn't have a built-in WebRTC solution. You must use community packages like `react-native-webrtc` which require native modules.
