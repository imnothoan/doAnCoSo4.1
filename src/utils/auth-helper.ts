/**
 * Authentication Helper Utilities
 * 
 * These utilities help diagnose and fix common authentication issues
 */

import { supabase } from '../lib/supabase';
import ApiService from '../services/api';

/**
 * Check if current session user matches the given email
 * Note: This only checks the currently logged-in user, not if a user exists in the system
 */
export async function checkCurrentUserEmail(email: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email === email;
  } catch {
    return false;
  }
}

/**
 * Check if a user exists in the backend database
 */
export async function checkBackendUser(username: string): Promise<boolean> {
  try {
    const user = await ApiService.getUserByUsername(username);
    return !!user;
  } catch {
    return false;
  }
}

/**
 * Sync Supabase user with backend (for cases where backend sync failed during signup)
 * 
 * Note: The password field is a placeholder since actual authentication is handled by Supabase.
 * The backend should not validate or use this password field.
 */
export async function syncUserWithBackend(
  supabaseUserId: string,
  email: string,
  username: string,
  name?: string
): Promise<void> {
  try {
    console.log('🔄 Syncing user with backend...');
    
    // Password is a placeholder - backend should use Supabase ID for authentication
    const PLACEHOLDER_PASSWORD = 'supabase-auth-managed';
    
    await ApiService.signup({
      id: supabaseUserId,
      username,
      name: name || username,
      email,
      password: PLACEHOLDER_PASSWORD, // Not used for authentication
      country: '',
      city: '',
      gender: 'Male',
    });
    
    console.log('✅ Backend sync successful');
  } catch (error) {
    console.error('❌ Backend sync failed:', error);
    throw error;
  }
}

/**
 * Auth status result interface
 */
interface AuthStatus {
  hasSupabaseSession: boolean;
  supabaseUser: {
    id: string;
    email?: string;
    [key: string]: any;
  } | null;
  backendReachable: boolean;
  backendUser: any | null; // Type depends on backend User model
  issue?: string;
}

/**
 * Get detailed auth status for debugging
 */
export async function getAuthStatus(): Promise<AuthStatus> {
  const status: AuthStatus = {
    hasSupabaseSession: false,
    supabaseUser: null,
    backendReachable: false,
    backendUser: null,
    issue: undefined,
  };

  try {
    // Check Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    status.hasSupabaseSession = !!session;
    status.supabaseUser = session?.user || null;

    if (!session) {
      status.issue = 'No active Supabase session. Please login.';
      return status;
    }

    // Check backend connection
    try {
      const user = await ApiService.getCurrentUser();
      status.backendReachable = true;
      status.backendUser = user;
    } catch (error: any) {
      status.backendReachable = error?.response?.status !== undefined;
      
      if (error?.response?.status === 401 || error?.response?.status === 404) {
        status.issue = 'User exists in Supabase but not in backend. Backend sync may have failed.';
      } else if (!status.backendReachable) {
        status.issue = 'Cannot reach backend server. Please check your network connection and server status.';
      } else {
        status.issue = `Backend error: ${error?.message || 'Unknown error'}`;
      }
    }

    return status;
  } catch (error: any) {
    status.issue = `Error checking auth status: ${error?.message || 'Unknown error'}`;
    return status;
  }
}

/**
 * Format error message for user display (Bilingual: Vietnamese & English)
 */
export function formatAuthError(
  error: Error | { message?: string } | string | unknown,
  language: 'vi' | 'en' = 'en'
): string {
  if (!error) {
    return language === 'vi' ? 'Đã xảy ra lỗi không xác định' : 'An unknown error occurred';
  }

  const message = typeof error === 'string' 
    ? error 
    : (error as any).message || String(error);

  // Error message mappings for Vietnamese and English
  const errorMappings: Record<string, { vi: string; en: string }> = {
    'Invalid login credentials': {
      vi: 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại thông tin đăng nhập.\n\nNếu bạn chưa có tài khoản, vui lòng đăng ký.',
      en: 'Invalid email or password. Please check your credentials and try again.\n\nIf you don\'t have an account yet, please sign up first.',
    },
    'Email not confirmed': {
      vi: 'Vui lòng xác nhận địa chỉ email trước khi đăng nhập. Kiểm tra hộp thư của bạn để nhận liên kết xác nhận.',
      en: 'Please confirm your email address before logging in. Check your inbox for a confirmation link.',
    },
    'User already registered': {
      vi: 'Email này đã được đăng ký. Vui lòng đăng nhập hoặc sử dụng email khác.',
      en: 'This email is already registered. Please try logging in instead.',
    },
    'Password should be at least': {
      vi: 'Mật khẩu phải có ít nhất 6 ký tự.',
      en: 'Password must be at least 6 characters long.',
    },
    'network': {
      vi: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.',
      en: 'Network error. Please check your internet connection and try again.',
    },
    'Network': {
      vi: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.',
      en: 'Network error. Please check your internet connection and try again.',
    },
    'timeout': {
      vi: 'Yêu cầu đã hết thời gian chờ. Vui lòng kiểm tra kết nối internet và thử lại.',
      en: 'Request timed out. Please check your internet connection and try again.',
    },
    'Invalid email': {
      vi: 'Địa chỉ email không hợp lệ.',
      en: 'Invalid email address.',
    },
    'Email address is invalid': {
      vi: 'Địa chỉ email không hợp lệ.',
      en: 'Invalid email address.',
    },
    'User not found': {
      vi: 'Không tìm thấy tài khoản với email này. Vui lòng kiểm tra lại hoặc đăng ký tài khoản mới.',
      en: 'No account found with this email. Please check again or sign up for a new account.',
    },
    'Too many requests': {
      vi: 'Quá nhiều yêu cầu. Vui lòng đợi một lát rồi thử lại.',
      en: 'Too many requests. Please wait a moment and try again.',
    },
    'rate limit': {
      vi: 'Quá nhiều yêu cầu. Vui lòng đợi một lát rồi thử lại.',
      en: 'Too many requests. Please wait a moment and try again.',
    },
    'Session expired': {
      vi: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      en: 'Session expired. Please log in again.',
    },
    'Unauthorized': {
      vi: 'Bạn không có quyền thực hiện thao tác này.',
      en: 'You are not authorized to perform this action.',
    },
    'Server error': {
      vi: 'Lỗi máy chủ. Vui lòng thử lại sau.',
      en: 'Server error. Please try again later.',
    },
    'Internal server error': {
      vi: 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.',
      en: 'Internal server error. Please try again later.',
    },
  };

  // Check for matching error patterns
  for (const [pattern, translations] of Object.entries(errorMappings)) {
    if (message.toLowerCase().includes(pattern.toLowerCase())) {
      return translations[language];
    }
  }

  // For unrecognized errors, provide a generic user-friendly message
  // instead of exposing raw error messages
  if (message.includes('Error') || message.includes('error') || message.includes('Exception')) {
    return language === 'vi'
      ? 'Đã xảy ra lỗi. Vui lòng thử lại sau.'
      : 'An error occurred. Please try again later.';
  }

  // Return original message if it seems user-friendly enough
  return message;
}

/**
 * Get validation error message
 */
export function getValidationError(
  field: 'email' | 'password' | 'username' | 'name',
  language: 'vi' | 'en' = 'en'
): string {
  const validationMessages: Record<string, { vi: string; en: string }> = {
    email: {
      vi: 'Vui lòng nhập địa chỉ email hợp lệ',
      en: 'Please enter a valid email address',
    },
    password: {
      vi: 'Vui lòng nhập mật khẩu (ít nhất 6 ký tự)',
      en: 'Please enter a password (at least 6 characters)',
    },
    username: {
      vi: 'Vui lòng nhập tên đăng nhập',
      en: 'Please enter a username',
    },
    name: {
      vi: 'Vui lòng nhập họ và tên',
      en: 'Please enter your full name',
    },
  };

  return validationMessages[field]?.[language] || '';
}
