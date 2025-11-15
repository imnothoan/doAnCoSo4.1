import React from 'react';
import { StyleSheet, View, Platform, ViewStyle, Modal as RNModal, TouchableOpacity, Animated } from 'react-native';
import { BlurView } from 'expo-blur';

interface LiquidGlassModalProps {
  children: React.ReactNode;
  visible: boolean;
  onClose?: () => void;
  intensity?: number;
  style?: ViewStyle;
  dismissible?: boolean;
}

/**
 * LiquidGlassModal - iOS-style Modal with Liquid Glass Effect
 * 
 * Features:
 * - Full-screen blur backdrop
 * - Translucent modal content
 * - Smooth animations
 * - System material effects
 * - Dismissible by tapping outside
 * 
 * Perfect for:
 * - Alert dialogs
 * - Action sheets
 * - Bottom sheets
 * - Overlays
 */
export const LiquidGlassModal: React.FC<LiquidGlassModalProps> = ({
  children,
  visible,
  onClose,
  intensity = 90,
  style,
  dismissible = true,
}) => {
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim]);

  if (!visible) return null;

  return (
    <RNModal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {Platform.OS === 'ios' ? (
          <>
            <BlurView
              intensity={intensity}
              tint="dark"
              style={styles.backdrop}
            >
              {dismissible && (
                <TouchableOpacity
                  style={styles.backdropTouchable}
                  activeOpacity={1}
                  onPress={onClose}
                />
              )}
            </BlurView>
            <Animated.View
              style={[
                styles.modalContent,
                style,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      scale: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <BlurView
                intensity={95}
                tint="systemThickMaterial"
                style={styles.contentBlur}
              >
                {children}
              </BlurView>
            </Animated.View>
          </>
        ) : (
          <>
            {dismissible && (
              <TouchableOpacity
                style={[styles.backdrop, styles.fallbackBackdrop]}
                activeOpacity={1}
                onPress={onClose}
              />
            )}
            <Animated.View
              style={[
                styles.modalContent,
                styles.fallbackContent,
                style,
                {
                  opacity: fadeAnim,
                },
              ]}
            >
              {children}
            </Animated.View>
          </>
        )}
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropTouchable: {
    flex: 1,
  },
  fallbackBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    maxWidth: 500,
    borderRadius: 20,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  contentBlur: {
    padding: 20,
  },
  fallbackContent: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
});
