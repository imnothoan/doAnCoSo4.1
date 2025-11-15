# iOS 26 Liquid Glass UI Implementation Guide

## Overview
This project has been upgraded to use iOS 26's Liquid Glass effects and system materials for a modern, translucent UI experience on iOS devices while maintaining compatibility with Android and web platforms.

## Key Technologies

### 1. @expo/ui Package
- **Version**: 0.2.0-beta.7
- **Purpose**: Provides SwiftUI-like components for React Native
- **Key Features**:
  - `GlassEffectContainer`: Container for glass effect elements
  - SwiftUI-style modifiers: `blur()`, `glassEffect()`, `background()`, etc.
  - Native iOS 18+ support

### 2. expo-blur
- **Purpose**: Cross-platform blur effects with iOS-specific materials
- **iOS Materials Used**:
  - `systemChromeMaterial`: For navigation bars and tab bars
  - `systemMaterial`: For general UI elements
  - `systemThinMaterial`: For message bubbles and cards
  - `systemThickMaterial`: For prominent UI elements

## Platform-Specific File Structure

The app uses React Native's platform-specific file extensions to provide enhanced experiences on iOS while maintaining functionality on other platforms:

```
app/
├── chat.tsx                    # Base implementation (Android/Web)
├── chat.ios.tsx                # iOS-enhanced with Liquid Glass
├── (tabs)/
    ├── _layout.tsx             # Base tab layout
    ├── _layout.ios.tsx         # iOS with translucent tab bar
    ├── inbox.tsx               # Base inbox
    ├── inbox.ios.tsx           # iOS with glass chat cards
    └── ...
```

## iOS-Specific Implementations

### 1. Chat Screen (`app/chat.ios.tsx`)

#### Features
- **Liquid Glass Message Bubbles**
  - Blurred background with gradient overlays
  - Different tints for own messages (dark) vs received (light)
  - Adaptive opacity based on message content

- **Translucent Input Bar**
  - System chrome material blur
  - Glass-effect text input field
  - Floating send button with blur

- **Header & Navigation**
  - Transparent header with blur
  - Integrated with iOS safe areas
  - Native-feeling controls

#### Code Example
```tsx
<BlurView
  intensity={80}
  tint={isOwnMessage ? 'systemThinMaterialDark' : 'systemThinMaterialLight'}
  style={styles.glassBubble}
>
  <LinearGradient
    colors={
      isOwnMessage
        ? ['rgba(0, 122, 255, 0.3)', 'rgba(0, 122, 255, 0.15)']
        : ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.15)']
    }
  >
    {/* Message content */}
  </LinearGradient>
</BlurView>
```

### 2. Inbox Screen (`app/(tabs)/inbox.ios.tsx`)

#### Features
- **Glass Chat Cards**
  - Each conversation in a translucent container
  - Adaptive blur intensity (90 for unread, 70 for read)
  - Gradient tints indicating read status

- **Blurred Navigation**
  - Header with system chrome material
  - Tab switcher with material background
  - Active tab visual indicators

#### Code Example
```tsx
<BlurView
  intensity={isUnread ? 90 : 70}
  tint="systemThinMaterial"
  style={styles.glassChatItem}
>
  <LinearGradient
    colors={
      isUnread
        ? ['rgba(0, 122, 255, 0.15)', 'rgba(0, 122, 255, 0.05)']
        : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
    }
  >
    {/* Chat preview */}
  </LinearGradient>
</BlurView>
```

### 3. Tab Layout (`app/(tabs)/_layout.ios.tsx`)

#### Features
- **Translucent Tab Bar**
  - Positioned absolutely at bottom
  - System chrome material blur
  - Proper safe area insets for home indicator

- **Header Configuration**
  - Transparent headers throughout
  - Blur effect integration
  - Native iOS animations

#### Code Example
```tsx
<Tabs
  screenOptions={{
    tabBarStyle: {
      position: 'absolute',
      backgroundColor: 'transparent',
    },
    tabBarBackground: () => (
      <BlurView
        tint="systemChromeMaterial"
        intensity={100}
        style={StyleSheet.absoluteFill}
      />
    ),
    headerTransparent: true,
    headerBlurEffect: 'systemChromeMaterial',
  }}
>
```

## Reusable Components

### GlassCard Component

**Files**: 
- `components/ui/glass-card.ios.tsx` (iOS implementation)
- `components/ui/glass-card.tsx` (fallback)

**Usage**:
```tsx
import { GlassCard } from '@/components/ui/glass-card';

<GlassCard 
  intensity={80} 
  tint="systemChromeMaterial"
  style={{ padding: 20 }}
>
  <Text>Your content here</Text>
</GlassCard>
```

**Props**:
- `intensity`: Blur intensity (0-100)
- `tint`: Material type (iOS only)
- `style`: Additional styles

### BlurTabBar Component

**File**: `components/ui/blur-tab-bar.tsx`

**Usage**:
```tsx
import { BlurTabBar } from '@/components/ui/blur-tab-bar';

<BlurTabBar>
  {/* Tab bar content */}
</BlurTabBar>
```

## Configuration

### app.json Updates

```json
{
  "expo": {
    "ios": {
      "deploymentTarget": "18.0",
      "infoPlist": {
        "UIUserInterfaceStyle": "Automatic"
      }
    }
  }
}
```

This ensures:
- Minimum iOS version supports new blur effects
- Automatic light/dark mode switching
- Native appearance adaptation

## Best Practices

### 1. Blur Intensity Guidelines
- **Light blur (40-60)**: Subtle backgrounds
- **Medium blur (70-80)**: Content cards, panels
- **Strong blur (90-100)**: Navigation bars, critical UI

### 2. Performance Optimization
- Limit nested BlurViews (max 2-3 levels)
- Use `intensity` prop judiciously
- Test on physical devices for performance

### 3. Accessibility
- Ensure text contrast on blurred backgrounds
- Provide high-contrast alternatives
- Test with VoiceOver enabled

### 4. Platform Consistency
- Always provide `.tsx` fallback files
- Test on both iOS and Android
- Maintain feature parity where possible

## Testing

### iOS Simulator
```bash
npm run ios
```

### Physical Device
1. Build with EAS or Xcode
2. Test on iOS 18+ device
3. Verify blur effects under different lighting
4. Check performance and battery impact

## Troubleshooting

### Blur Not Showing
- Ensure iOS deployment target is 18.0+
- Check that BlurView has proper dimensions
- Verify tint property is valid iOS material

### Performance Issues
- Reduce blur intensity
- Limit number of BlurView components
- Use React.memo for complex blurred components

### Android/Web Fallback
- Ensure base `.tsx` files exist
- Test gradient fallbacks
- Verify visual consistency

## Future Enhancements

### Planned Features
- [ ] Adaptive blur based on ambient light
- [ ] Dynamic island-aware layouts
- [ ] Focus mode integration
- [ ] Lock screen widgets with blur

### Additional Screens to Convert
- [ ] hangout.ios.tsx
- [ ] account.ios.tsx
- [ ] discussion.ios.tsx
- [ ] connection.ios.tsx
- [ ] my-events.ios.tsx

## Resources

- [Expo BlurView Documentation](https://docs.expo.dev/versions/latest/sdk/blur-view/)
- [@expo/ui Documentation](https://www.npmjs.com/package/@expo/ui)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [iOS 18 Design Resources](https://developer.apple.com/design/resources/)

## Support

For issues or questions:
1. Check this documentation
2. Review example implementations in `app/chat.ios.tsx` and `app/(tabs)/inbox.ios.tsx`
3. Create an issue in the repository
4. Consult Expo and React Native documentation

---

**Note**: This implementation is designed for iOS 18+ (iOS 26 in the future). Earlier iOS versions will fall back to standard implementations or show solid backgrounds instead of blur effects.
