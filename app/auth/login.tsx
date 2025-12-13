import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { formatAuthError } from '@/src/utils/auth-helper';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // Validate with specific field messages
    if (!email.trim()) {
      Alert.alert(t.common.error, t.auth.emailRequired);
      return;
    }
    if (!password) {
      Alert.alert(t.common.error, t.auth.passwordRequired);
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)/hangout');
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = formatAuthError(error, language);
      Alert.alert(t.auth.loginFailed, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Language Toggle */}
            <TouchableOpacity style={styles.languageToggle} onPress={toggleLanguage}>
              <Ionicons name="language" size={20} color="#007AFF" />
              <Text style={styles.languageText}>
                {language === 'vi' ? 'English' : 'Tiếng Việt'}
              </Text>
            </TouchableOpacity>

            {/* Logo/Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Ionicons name="school" size={80} color="#007AFF" />
              </View>
              <Text style={styles.appName}>Smart Exam</Text>
              <Text style={styles.tagline}>
                {language === 'vi' 
                  ? 'Nền tảng khảo thí thông minh' 
                  : 'Smart Examination Platform'}
              </Text>
            </View>

            {/* Login Form */}
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>{t.auth.welcomeBack}</Text>
              <Text style={styles.formSubtitle}>{t.auth.signInToContinue}</Text>

              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t.auth.email}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t.auth.password}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>{t.auth.forgotPassword}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? t.auth.signingIn : t.auth.login}
                </Text>
              </TouchableOpacity>

              {/* Social Login Options */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{language === 'vi' ? 'HOẶC' : 'OR'}</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialButtons}>
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-google" size={24} color="#DB4437" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-facebook" size={24} color="#4267B2" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-apple" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              {/* Sign Up Link */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>{t.auth.dontHaveAccount} </Text>
                <TouchableOpacity onPress={() => router.push('/auth/signup')}>
                  <Text style={styles.signupLink}>{t.auth.signup}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 20,
    marginBottom: 8,
  },
  languageText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 6,
    fontWeight: '500',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#999',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 15,
    color: '#666',
  },
  signupLink: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: 'bold',
  },
});
