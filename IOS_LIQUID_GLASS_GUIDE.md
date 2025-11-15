# iOS Liquid Glass UI Implementation Guide

## Overview

This document describes the implementation of iOS Liquid Glass UI effects in the ConnectSphere app, utilizing Apple's latest design language for iOS 26 with native blur effects and material design.

## What is Liquid Glass?

Liquid Glass is Apple's design language that creates depth and hierarchy through:
- **Native blur effects** using `UIVisualEffectView`
- **Translucent materials** that adapt to light/dark mode
- **System-integrated styling** that respects user preferences
- **Layered depth** with subtle shadows and borders
- **Accessibility support** built-in

## Packages Installed

### @expo/ui (v0.2.0-beta.7)
Official Expo UI component library with SwiftUI integration support.

```json
"@expo/ui": "^0.2.0-beta.7"
```

**Features:**
- SwiftUI-style components
- SF Symbols TypeScript bindings
- Native iOS integration
- Jetpack Compose support for Android

### expo-blur (v15.0.7)
Native blur view component for iOS with Android fallback.

```json
"expo-blur": "^15.0.7"
```

**Features:**
- Native iOS `UIVisualEffectView`
- Multiple material types (thin, regular, thick, ultra-thin, chrome)
- Dynamic blur intensity
- Light/dark mode adaptation
- Android semi-transparent fallback

## Components Created

### 1. LiquidGlassCard
**File:** `components/ios/LiquidGlassCard.tsx`

A card component with translucent blur background.

**Usage:**
```tsx
import { LiquidGlassCard } from '@/components/ios';

<LiquidGlassCard 
  intensity={80}
  tint="systemMaterial"
  borderRadius={16}
>
  <Text>Card Content</Text>
</LiquidGlassCard>
```

**Props:**
- `children`: React nodes to render inside
- `intensity`: Blur intensity (0-100, default: 80)
- `tint`: Material type (see Material Types below)
- `style`: Additional styles
- `borderRadius`: Corner radius (default: 16)

**Best for:**
- User cards
- Event cards
- Content panels
- Information displays

---

### 2. LiquidGlassBackground
**File:** `components/ios/LiquidGlassBackground.tsx`

Full-screen translucent background.

**Usage:**
```tsx
import { LiquidGlassBackground } from '@/components/ios';

<LiquidGlassBackground 
  intensity={90}
  tint="systemThickMaterial"
>
  <YourScreenContent />
</LiquidGlassBackground>
```

**Props:**
- `children`: Screen content
- `intensity`: Blur intensity (default: 90)
- `tint`: Material type (default: systemThickMaterial)
- `style`: Additional styles

**Best for:**
- Screen backgrounds
- Modal backdrops
- Full-screen overlays

---

### 3. LiquidGlassHeader
**File:** `components/ios/LiquidGlassHeader.tsx`

Navigation header with blur effect.

**Usage:**
```tsx
import { LiquidGlassHeader } from '@/components/ios';

<LiquidGlassHeader intensity={95} translucent={true}>
  <View style={styles.headerContent}>
    <Text>Header Title</Text>
  </View>
</LiquidGlassHeader>
```

**Props:**
- `children`: Header content
- `intensity`: Blur intensity (default: 95)
- `style`: Additional styles
- `translucent`: Enable blur effect (default: true)

**Best for:**
- Navigation bars
- Tab bars
- Headers overlaying scrollable content

---

### 4. LiquidGlassModal
**File:** `components/ios/LiquidGlassModal.tsx`

Modal with blurred backdrop and content.

**Usage:**
```tsx
import { LiquidGlassModal } from '@/components/ios';

const [visible, setVisible] = useState(false);

<LiquidGlassModal
  visible={visible}
  onClose={() => setVisible(false)}
  intensity={90}
  dismissible={true}
>
  <Text>Modal Content</Text>
</LiquidGlassModal>
```

**Props:**
- `children`: Modal content
- `visible`: Visibility state
- `onClose`: Close handler
- `intensity`: Blur intensity (default: 90)
- `style`: Additional styles
- `dismissible`: Allow dismiss by tapping outside (default: true)

**Best for:**
- Alerts
- Action sheets
- Bottom sheets
- Confirmations

---

### 5. LiquidGlassButton
**File:** `components/ios/LiquidGlassButton.tsx`

Button with translucent blur effect.

**Usage:**
```tsx
import { LiquidGlassButton } from '@/components/ios';

<LiquidGlassButton
  onPress={() => console.log('Pressed')}
  variant="primary"
  intensity={70}
>
  Button Text
</LiquidGlassButton>
```

**Props:**
- `children`: Button content (string or React node)
- `onPress`: Press handler
- `intensity`: Blur intensity (default: 70)
- `style`: Additional styles
- `textStyle`: Text style overrides
- `variant`: Style variant (primary | secondary | tertiary)
- `disabled`: Disable state

**Variants:**
- **primary**: `systemMaterial` - Prominent buttons
- **secondary**: `systemThinMaterial` - Secondary actions
- **tertiary**: `systemUltraThinMaterial` - Minimal actions

**Best for:**
- Call-to-action buttons
- Secondary actions
- Toolbar buttons

## Material Types

iOS provides several system material types that automatically adapt to the system appearance:

### Standard Materials
- `systemMaterial` - Regular thickness, general use
- `systemThinMaterial` - Subtle, lightweight
- `systemThickMaterial` - Prominent, strong blur
- `systemUltraThinMaterial` - Minimal, ultra-light

### Chrome Materials (iOS 15+)
- `systemChromeMaterial` - Navigation bars, tab bars
- `systemChromeMaterialLight` - Light chrome variant
- `systemChromeMaterialDark` - Dark chrome variant

### Legacy Materials
- `light` - Light appearance
- `dark` - Dark appearance
- `default` - System default
- `extraLight` - Extra light
- `regular` - Regular
- `prominent` - Prominent

**Recommendation:** Use `system*Material` types for iOS 13+ compatibility and automatic adaptation.

## Demo Screen

**File:** `app/liquid-glass-demo.tsx`

A comprehensive demo screen showcasing all liquid glass components with:
- Interactive examples
- Material type comparisons
- Button variants
- Modal demonstration
- Feature list
- Platform detection

**Access:** Settings → App Settings → iOS Liquid Glass UI Demo

## Integration Examples

### Example 1: User Profile Card
```tsx
import { LiquidGlassCard } from '@/components/ios';

<LiquidGlassCard 
  intensity={80}
  tint="systemMaterial"
  borderRadius={16}
  style={styles.profileCard}
>
  <Image source={{ uri: user.avatar }} style={styles.avatar} />
  <Text style={styles.name}>{user.name}</Text>
  <Text style={styles.bio}>{user.bio}</Text>
</LiquidGlassCard>
```

### Example 2: Navigation Header
```tsx
import { LiquidGlassHeader } from '@/components/ios';

<LiquidGlassHeader>
  <View style={styles.header}>
    <TouchableOpacity onPress={goBack}>
      <Ionicons name="arrow-back" size={24} />
    </TouchableOpacity>
    <Text style={styles.title}>Screen Title</Text>
    <TouchableOpacity onPress={showMenu}>
      <Ionicons name="menu" size={24} />
    </TouchableOpacity>
  </View>
</LiquidGlassHeader>
```

### Example 3: Confirmation Modal
```tsx
import { LiquidGlassModal, LiquidGlassButton } from '@/components/ios';

<LiquidGlassModal
  visible={showConfirm}
  onClose={() => setShowConfirm(false)}
>
  <View style={styles.modalContent}>
    <Ionicons name="warning" size={48} color="#FF9500" />
    <Text style={styles.modalTitle}>Confirm Action</Text>
    <Text style={styles.modalText}>
      Are you sure you want to proceed?
    </Text>
    <View style={styles.buttonRow}>
      <LiquidGlassButton
        onPress={() => setShowConfirm(false)}
        variant="secondary"
        style={styles.button}
      >
        Cancel
      </LiquidGlassButton>
      <LiquidGlassButton
        onPress={handleConfirm}
        variant="primary"
        style={styles.button}
      >
        Confirm
      </LiquidGlassButton>
    </View>
  </View>
</LiquidGlassModal>
```

## Platform Compatibility

### iOS (Native Support)
- ✅ Full native blur effects using `UIVisualEffectView`
- ✅ All material types supported
- ✅ Dynamic intensity control
- ✅ Automatic light/dark mode adaptation
- ✅ Accessibility support

### Android (Fallback)
- ✅ Semi-transparent backgrounds
- ✅ Elevation and shadows
- ✅ Graceful degradation
- ⚠️ No native blur (uses opacity)

### Web (Fallback)
- ✅ CSS backdrop-filter where supported
- ✅ Opacity fallback for older browsers
- ⚠️ Limited material type support

## Performance Considerations

### Best Practices
1. **Use appropriate intensity**: Lower values (60-80) for better performance
2. **Limit nesting**: Avoid multiple blurred layers
3. **Optimize renders**: Memoize components when possible
4. **Test on device**: Simulators may not show true performance

### Intensity Guidelines
- **60-70**: Subtle blur, good for buttons and small elements
- **75-85**: Standard blur, cards and panels
- **90-95**: Strong blur, headers and navigation
- **95-100**: Maximum blur, modals and overlays

## Accessibility

All components support:
- ✅ VoiceOver/TalkBack
- ✅ Dynamic Type
- ✅ Reduce Transparency settings
- ✅ Increase Contrast settings
- ✅ Dark Mode

The components automatically respect iOS accessibility settings and will disable blur effects when "Reduce Transparency" is enabled.

## Testing

### Manual Testing
1. Open the app on iOS device or simulator
2. Navigate to Settings → App Settings
3. Tap "iOS Liquid Glass UI Demo"
4. Test all components and interactions
5. Toggle light/dark mode
6. Test with accessibility settings enabled

### Automated Testing
Consider testing:
- Component rendering
- Platform detection
- Fallback behavior
- Accessibility features

## Future Enhancements

### Planned Features
- [ ] Dark mode auto-adaptation
- [ ] Custom material definitions
- [ ] Animation support
- [ ] Dynamic blur intensity based on scroll
- [ ] Advanced compositing effects
- [ ] SwiftUI bridge for native modules

### iOS 26 Specific Features
- [ ] Enhanced material vibrancy
- [ ] Adaptive color sampling
- [ ] Advanced depth effects
- [ ] Neural rendering optimizations

## Resources

### Apple Documentation
- [UIVisualEffectView](https://developer.apple.com/documentation/uikit/uivisualeffectview)
- [UIBlurEffect](https://developer.apple.com/documentation/uikit/uiblureffect)
- [iOS Design Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios)

### Expo Documentation
- [expo-blur](https://docs.expo.dev/versions/latest/sdk/blur-view/)
- [@expo/ui](https://docs.expo.dev/versions/latest/sdk/ui/)
- [Platform-specific code](https://docs.expo.dev/workflow/platform-specific-code/)

## Troubleshooting

### Common Issues

**Blur not showing on iOS:**
- Ensure you're testing on a physical device or iOS 13+ simulator
- Check that "Reduce Transparency" is disabled in Settings
- Verify intensity value is > 0

**Performance issues:**
- Reduce blur intensity
- Limit number of blurred components on screen
- Use memoization for complex child components

**Android fallback not working:**
- Check that fallback styles are applied
- Verify Platform.OS detection
- Ensure elevation values are set

## Contributing

When adding new iOS-specific features:
1. Follow the existing component structure
2. Always provide Android/Web fallbacks
3. Document all props and use cases
4. Test on both iOS and Android
5. Update this documentation

## License

Part of the ConnectSphere project. See main LICENSE file.

---

**Created:** November 2025
**Last Updated:** November 2025
**Version:** 1.0.0
**Compatibility:** iOS 13+, Expo SDK 54+
