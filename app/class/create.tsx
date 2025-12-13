import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/src/context/LanguageContext';
import ExamService from '@/src/services/examService';

export default function CreateClassScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const [className, setClassName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [classDescription, setClassDescription] = useState('');

  const validateForm = useCallback(() => {
    if (!className.trim()) {
      Alert.alert(t.common.error, t.class.classNameRequired);
      return false;
    }
    if (!classCode.trim()) {
      Alert.alert(t.common.error, t.class.classCodeRequired);
      return false;
    }
    return true;
  }, [className, classCode, t]);

  const handleCreateClass = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const newClass = await ExamService.createClass({
        name: className.trim(),
        code: classCode.trim().toUpperCase(),
        description: classDescription.trim() || undefined,
      });

      Alert.alert(t.common.success, t.class.classCreatedSuccess, [
        {
          text: t.common.ok,
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Create class error:', error);
      Alert.alert(t.common.error, error.message || 'Failed to create class');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t.class.createClass,
          headerBackTitle: t.common.back,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="school" size={48} color="#007AFF" />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.class.className} *</Text>
              <TextInput
                style={styles.input}
                value={className}
                onChangeText={setClassName}
                placeholder={t.class.enterClassName}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.class.classCode} *</Text>
              <TextInput
                style={styles.input}
                value={classCode}
                onChangeText={(text) => setClassCode(text.toUpperCase())}
                placeholder={t.class.enterClassCode}
                placeholderTextColor="#999"
                autoCapitalize="characters"
              />
              <Text style={styles.hint}>
                {t.class.classCode} is a unique identifier for the class (e.g., CS101, MATH201)
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.class.classDescription} ({t.common.optional})</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={classDescription}
                onChangeText={setClassDescription}
                placeholder={t.class.enterClassDescription}
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
              />
            </View>

            <TouchableOpacity
              style={[styles.createButton, isLoading && styles.disabledButton]}
              onPress={handleCreateClass}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="add-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.createButtonText}>{t.class.createClass}</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  form: {
    flex: 1,
    padding: 16,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#e8f4fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
