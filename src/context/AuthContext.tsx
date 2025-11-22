import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { User, AuthState } from '../types';
import ApiService from '../services/api';
import WebSocketService from '../services/websocket';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, name: string, email: string, password: string, country: string, city: string, gender?: 'Male' | 'Female' | 'Other') => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = '@auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Handle Supabase Auth State Changes
  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleSession(session);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        handleSession(session);
      } else {
        handleSignOut();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSession = async (session: any) => {
    try {
      const token = session.access_token;
      ApiService.setAuthToken(token);

      // Connect WebSocket
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      if (!WebSocketService.isConnected()) {
        WebSocketService.connect(apiUrl, token);
      }

      // Fetch user profile from our backend
      // We try to get the user from storage first to show something immediately
      const storedUserJson = await AsyncStorage.getItem(USER_KEY);
      let user = storedUserJson ? JSON.parse(storedUserJson) : null;

      // If we don't have a user or we want to refresh it
      try {
        const freshUser = await ApiService.getCurrentUser();
        user = freshUser;
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      } catch (err) {
        console.error('Error fetching user profile:', err);
        // If fetching fails but we have a session, we might be in a weird state
        // (e.g. user exists in Supabase but not in our DB yet)
      }

      setAuthState({
        isAuthenticated: true,
        user,
        token,
      });
    } catch (error) {
      console.error('Error handling session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await AsyncStorage.removeItem(USER_KEY);
    ApiService.removeAuthToken();
    WebSocketService.disconnect();
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
    });
    setIsLoading(false);
  };

  // Keep WebSocket connected when app comes to foreground
  useEffect(() => {
    if (!authState.isAuthenticated || !authState.token) {
      return;
    }

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('📱 App came to foreground - checking WebSocket connection');
        if (!WebSocketService.isConnected()) {
          const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
          WebSocketService.connect(apiUrl, authState.token || '');
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [authState.isAuthenticated, authState.token]);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // onAuthStateChange will handle the rest
  };

  const signup = async (username: string, name: string, email: string, password: string, country: string, city: string, gender?: 'Male' | 'Female' | 'Other') => {
    try {
      // 1. Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username, name }
        }
      });

      if (error) throw error;

      if (data.user) {
        // 2. Sync with our backend
        // We pass the Supabase ID so the backend can link them
        await ApiService.signup({
          id: data.user.id, // Pass the ID
          username,
          name,
          email,
          password: 'sb-password-placeholder', // Placeholder
          country,
          city,
          gender,
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
      // If backend sync fails, we might want to delete the supabase user?
      // For now, just throw
      throw error;
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Logout error:', error);
    // onAuthStateChange will handle state cleanup
  };

  const updateUser = async (data: Partial<User>) => {
    if (!authState.user?.username) return;

    try {
      let userId = authState.user.id;
      if (!userId) {
        const freshUser = await ApiService.getUserByUsername(authState.user.username);
        userId = freshUser.id;
      }

      const updatedUser = await ApiService.updateUser(userId, data);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    if (!authState.token) return;

    try {
      const freshUser = await ApiService.getCurrentUser();
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(freshUser));

      setAuthState(prev => ({
        ...prev,
        user: freshUser,
      }));
    } catch (error) {
      console.error('Refresh user error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        signup,
        logout,
        updateUser,
        refreshUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
