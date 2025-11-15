/**
 * iOS Liquid Glass UI Components
 * 
 * This module provides iOS-specific UI components that implement Apple's
 * liquid glass design language using native blur effects and materials.
 * 
 * Components automatically fallback to cross-platform alternatives on Android/Web.
 * 
 * Features:
 * - Native iOS blur effects (UIVisualEffectView)
 * - System materials that adapt to light/dark mode
 * - Translucent backgrounds
 * - Enhanced depth and layering
 * - Accessibility support
 * 
 * Compatible with iOS 13+ design guidelines and iOS 26 enhancements.
 */

export { LiquidGlassCard } from './LiquidGlassCard';
export { LiquidGlassBackground } from './LiquidGlassBackground';
export { LiquidGlassHeader } from './LiquidGlassHeader';
export { LiquidGlassModal } from './LiquidGlassModal';
export { LiquidGlassButton } from './LiquidGlassButton';

// Re-export commonly used types
export type {
  BlurTint,
} from 'expo-blur';
