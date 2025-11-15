import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  LiquidGlassCard,
  LiquidGlassBackground,
  LiquidGlassHeader,
  LiquidGlassModal,
  LiquidGlassButton,
} from '@/components/ios';

/**
 * iOS Liquid Glass UI Demo Screen
 * 
 * Demonstrates the liquid glass components with:
 * - Various blur intensities
 * - Different material types
 * - Interactive examples
 * - Light/Dark mode adaptation
 */
export default function LiquidGlassDemo() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  return (
    <LiquidGlassBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header with Liquid Glass */}
        <LiquidGlassHeader style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Liquid Glass UI</Text>
            <View style={{ width: 24 }} />
          </View>
        </LiquidGlassHeader>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Platform Info */}
          <LiquidGlassCard style={styles.card}>
            <View style={styles.cardContent}>
              <Ionicons name="information-circle" size={32} color="#007AFF" />
              <Text style={styles.cardTitle}>iOS Liquid Glass</Text>
              <Text style={styles.cardDescription}>
                {Platform.OS === 'ios'
                  ? 'Running on iOS with native blur effects'
                  : 'Running with cross-platform fallback'}
              </Text>
            </View>
          </LiquidGlassCard>

          {/* Material Types Demo */}
          <Text style={styles.sectionTitle}>Material Types</Text>
          
          <LiquidGlassCard
            style={styles.card}
            tint="systemThinMaterial"
            intensity={60}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Thin Material</Text>
              <Text style={styles.cardDescription}>
                Light, subtle blur effect
              </Text>
            </View>
          </LiquidGlassCard>

          <LiquidGlassCard
            style={styles.card}
            tint="systemMaterial"
            intensity={80}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Regular Material</Text>
              <Text style={styles.cardDescription}>
                Standard blur for cards and panels
              </Text>
            </View>
          </LiquidGlassCard>

          <LiquidGlassCard
            style={styles.card}
            tint="systemThickMaterial"
            intensity={95}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Thick Material</Text>
              <Text style={styles.cardDescription}>
                Strong blur for emphasis
              </Text>
            </View>
          </LiquidGlassCard>

          {/* Interactive Card */}
          <Text style={styles.sectionTitle}>Interactive Elements</Text>
          
          <TouchableOpacity
            onPress={() => setSelectedCard('interactive')}
            activeOpacity={0.8}
          >
            <LiquidGlassCard
              style={[
                styles.card,
                selectedCard === 'interactive' && styles.selectedCard,
              ]}
              intensity={selectedCard === 'interactive' ? 95 : 70}
            >
              <View style={styles.cardContent}>
                <Ionicons
                  name="hand-left"
                  size={32}
                  color="#007AFF"
                />
                <Text style={styles.cardTitle}>Tap Me</Text>
                <Text style={styles.cardDescription}>
                  {selectedCard === 'interactive'
                    ? 'Card is selected!'
                    : 'Tap to see the effect'}
                </Text>
              </View>
            </LiquidGlassCard>
          </TouchableOpacity>

          {/* Button Examples */}
          <Text style={styles.sectionTitle}>Buttons</Text>
          
          <View style={styles.buttonRow}>
            <LiquidGlassButton
              onPress={() => console.log('Primary pressed')}
              variant="primary"
              style={styles.button}
            >
              Primary
            </LiquidGlassButton>
            
            <LiquidGlassButton
              onPress={() => console.log('Secondary pressed')}
              variant="secondary"
              style={styles.button}
            >
              Secondary
            </LiquidGlassButton>
          </View>

          <View style={styles.buttonRow}>
            <LiquidGlassButton
              onPress={() => console.log('Tertiary pressed')}
              variant="tertiary"
              style={styles.button}
            >
              Tertiary
            </LiquidGlassButton>
            
            <LiquidGlassButton
              onPress={() => console.log('Disabled')}
              disabled
              style={styles.button}
            >
              Disabled
            </LiquidGlassButton>
          </View>

          {/* Modal Trigger */}
          <LiquidGlassButton
            onPress={() => setModalVisible(true)}
            variant="primary"
            style={styles.modalButton}
          >
            <View style={styles.modalButtonContent}>
              <Ionicons name="apps" size={20} color="#007AFF" />
              <Text style={styles.modalButtonText}>Show Modal</Text>
            </View>
          </LiquidGlassButton>

          {/* Feature List */}
          <Text style={styles.sectionTitle}>Features</Text>
          
          {[
            'Native iOS blur effects',
            'Adaptive to light/dark mode',
            'System material integration',
            'Cross-platform fallbacks',
            'Accessibility support',
            'Performance optimized',
          ].map((feature, index) => (
            <LiquidGlassCard key={index} style={styles.featureCard}>
              <View style={styles.featureContent}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#4CAF50"
                />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            </LiquidGlassCard>
          ))}

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Modal Demo */}
        <LiquidGlassModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          dismissible={true}
        >
          <View style={styles.modalContent}>
            <Ionicons name="sparkles" size={48} color="#FFB300" />
            <Text style={styles.modalTitle}>Liquid Glass Modal</Text>
            <Text style={styles.modalDescription}>
              This modal uses iOS system materials with blur effects for a
              beautiful, native appearance.
            </Text>
            <LiquidGlassButton
              onPress={() => setModalVisible(false)}
              variant="primary"
              style={styles.modalCloseButton}
            >
              Close
            </LiquidGlassButton>
          </View>
        </LiquidGlassModal>
      </SafeAreaView>
    </LiquidGlassBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  card: {
    marginBottom: 12,
  },
  selectedCard: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  cardContent: {
    padding: 20,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  button: {
    flex: 1,
  },
  modalButton: {
    marginTop: 8,
    marginBottom: 12,
  },
  modalButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  featureCard: {
    marginBottom: 8,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#333',
  },
  modalContent: {
    alignItems: 'center',
    padding: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalCloseButton: {
    width: '100%',
  },
});
