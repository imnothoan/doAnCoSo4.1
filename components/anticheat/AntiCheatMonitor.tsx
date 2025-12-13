import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { useLanguage } from '@/src/context/LanguageContext';
import { ViolationType } from '@/src/types/exam';

interface AntiCheatMonitorProps {
  isActive: boolean;
  onViolation: (type: ViolationType, description: string) => void;
  onWarningCountChange: (count: number) => void;
  maxWarnings?: number;
  onMaxWarningsReached?: () => void;
  showOverlay?: boolean;
}

interface Detection {
  type: ViolationType;
  confidence: number;
  timestamp: number;
  description: string;
}

// Target classes from the trained YOLO model
const TARGET_CLASSES = ['person', 'phone', 'material', 'headphones'];
const DETECTION_INTERVAL = 2000; // Check every 2 seconds
const FACE_DETECTION_COOLDOWN = 5000; // 5 seconds cooldown between same type warnings

/**
 * AntiCheat Monitor Component
 * 
 * This component handles real-time monitoring during exams using:
 * 1. MediaPipe Face Mesh for face detection and gaze tracking
 * 2. Custom YOLO model for detecting phones, headphones, and other materials
 * 
 * Note: For React Native, we need to use react-native-webview or 
 * a native module to run TensorFlow.js or ONNX models.
 * This is a simplified implementation that demonstrates the architecture.
 */
export default function AntiCheatMonitor({
  isActive,
  onViolation,
  onWarningCountChange,
  maxWarnings = 3,
  onMaxWarningsReached,
  showOverlay = true,
}: AntiCheatMonitorProps) {
  const { t } = useLanguage();
  const [warningCount, setWarningCount] = useState(0);
  const [lastDetections, setLastDetections] = useState<Detection[]>([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isFaceVisible, setIsFaceVisible] = useState(true);
  
  const lastWarningTime = useRef<Record<ViolationType, number>>({} as Record<ViolationType, number>);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Report a violation with cooldown to prevent spam
  const reportViolation = useCallback((type: ViolationType, description: string) => {
    const now = Date.now();
    const lastTime = lastWarningTime.current[type] || 0;
    
    // Check cooldown
    if (now - lastTime < FACE_DETECTION_COOLDOWN) {
      return;
    }
    
    lastWarningTime.current[type] = now;
    
    const newCount = warningCount + 1;
    setWarningCount(newCount);
    onWarningCountChange(newCount);
    onViolation(type, description);
    
    setLastDetections(prev => [
      { type, confidence: 1, timestamp: now, description },
      ...prev.slice(0, 4),
    ]);

    if (newCount >= maxWarnings && onMaxWarningsReached) {
      onMaxWarningsReached();
    }
  }, [warningCount, maxWarnings, onViolation, onWarningCountChange, onMaxWarningsReached]);

  // Initialize detection models
  useEffect(() => {
    if (!isActive) return;

    const initializeModels = async () => {
      try {
        setStatusMessage(t.anticheat.modelLoading);
        
        // In a real implementation, we would load:
        // 1. MediaPipe Face Mesh model
        // 2. Custom YOLO ONNX model
        
        // For React Native, this would typically use:
        // - @mediapipe/face_mesh via react-native-webview
        // - onnxruntime-react-native for YOLO inference
        
        // Simulating model load time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setIsModelLoaded(true);
        setStatusMessage(t.anticheat.detectionActive);
        
      } catch (error) {
        console.error('Error loading anti-cheat models:', error);
        setStatusMessage(t.anticheat.modelLoadError);
      }
    };

    initializeModels();
  }, [isActive, t]);

  // Start/stop detection loop
  useEffect(() => {
    if (!isActive || !isModelLoaded) {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      return;
    }

    // In a real implementation, this would:
    // 1. Capture frames from the camera
    // 2. Run face detection with MediaPipe
    // 3. Run object detection with YOLO
    // 4. Analyze results and trigger violations
    
    detectionIntervalRef.current = setInterval(() => {
      performDetection();
    }, DETECTION_INTERVAL);

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [isActive, isModelLoaded]);

  // Perform detection (simulated for demonstration)
  const performDetection = useCallback(async () => {
    if (!isModelLoaded) return;

    try {
      // In a real implementation:
      // 1. Get camera frame
      // 2. Run MediaPipe Face Mesh
      //    - Check if face is detected
      //    - Check face count (should be 1)
      //    - Check gaze direction (looking at screen)
      // 3. Run YOLO model
      //    - Detect phones, headphones, materials
      
      // This is where the actual detection would happen
      // For now, we're providing the architecture
      
      // Example detection logic:
      /*
      const faceResults = await faceMesh.detect(frame);
      
      if (faceResults.length === 0) {
        reportViolation('no_face', t.anticheat.noFaceDetected);
        setIsFaceVisible(false);
      } else if (faceResults.length > 1) {
        reportViolation('multiple_faces', t.anticheat.multipleFaces);
      } else {
        setIsFaceVisible(true);
        
        // Check gaze direction
        const landmarks = faceResults[0].landmarks;
        const gazeDirection = calculateGazeDirection(landmarks);
        if (!isLookingAtScreen(gazeDirection)) {
          reportViolation('looking_away', t.anticheat.lookingAway);
        }
      }
      
      // Run YOLO detection
      const yoloResults = await yoloModel.detect(frame);
      
      for (const detection of yoloResults) {
        if (detection.class === 'phone' && detection.confidence > 0.7) {
          reportViolation('phone_detected', t.anticheat.phoneDetected);
        }
        if (detection.class === 'headphones' && detection.confidence > 0.7) {
          reportViolation('headphones_detected', t.anticheat.headphonesDetected);
        }
      }
      */
      
    } catch (error) {
      console.error('Detection error:', error);
    }
  }, [isModelLoaded, reportViolation, t]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  if (!isActive || !showOverlay) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Status indicator */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, isModelLoaded ? styles.statusActive : styles.statusLoading]} />
        <Text style={styles.statusText}>
          {statusMessage || (isModelLoaded ? t.anticheat.detectionActive : t.anticheat.modelLoading)}
        </Text>
      </View>

      {/* Warning counter */}
      {warningCount > 0 && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            {t.anticheat.warningCount}: {warningCount}/{maxWarnings}
          </Text>
        </View>
      )}

      {/* Face visibility indicator */}
      {!isFaceVisible && (
        <View style={styles.alertContainer}>
          <Text style={styles.alertText}>{t.anticheat.noFaceDetected}</Text>
        </View>
      )}

      {/* Recent violations */}
      {lastDetections.length > 0 && (
        <View style={styles.violationsContainer}>
          {lastDetections.slice(0, 2).map((detection, index) => (
            <View key={`${detection.type}-${detection.timestamp}`} style={styles.violationItem}>
              <Text style={styles.violationText}>
                ⚠️ {detection.description}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

/**
 * Helper functions for face mesh analysis
 * These would be used in a real implementation
 */

// Calculate gaze direction from face landmarks
function calculateGazeDirection(landmarks: any[]) {
  // In a real implementation:
  // 1. Get eye landmarks
  // 2. Calculate pupil position relative to eye corners
  // 3. Determine gaze vector
  return { x: 0, y: 0, z: 0 };
}

// Check if user is looking at the screen
function isLookingAtScreen(gazeDirection: { x: number; y: number; z: number }) {
  // Check if gaze is within acceptable range
  const threshold = 0.3; // 30% deviation allowed
  return Math.abs(gazeDirection.x) < threshold && Math.abs(gazeDirection.y) < threshold;
}

// Calculate head pose from face landmarks
function calculateHeadPose(landmarks: any[]) {
  // Using face mesh landmarks to estimate head rotation
  // Pitch (up/down), Yaw (left/right), Roll (tilt)
  return { pitch: 0, yaw: 0, roll: 0 };
}

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusActive: {
    backgroundColor: '#4CAF50',
  },
  statusLoading: {
    backgroundColor: '#FFC107',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  warningContainer: {
    backgroundColor: 'rgba(255, 152, 0, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  warningText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  alertContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'center',
    maxWidth: screenWidth - 32,
  },
  alertText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  violationsContainer: {
    marginTop: 8,
    maxWidth: screenWidth - 32,
  },
  violationItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 4,
  },
  violationText: {
    color: '#fff',
    fontSize: 12,
  },
});
