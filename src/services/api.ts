import axios, { AxiosInstance } from 'axios';
import {
  User,
  Event,
  Hangout,
  Chat,
  Message,
  Community,
  Post,
  Notification,
  QuickMessage,
  LoginCredentials,
  SignupData,
  HangoutFilters,
  ConnectionFilters,
  EventFilters,
} from '../types';

// Base API configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com';


class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  setAuthToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response = await this.client.post('/auth/login', credentials);
    return response.data;
  }

  async signup(data: SignupData): Promise<{ user: User; token: string }> {
    const response = await this.client.post('/auth/signup', data);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
  }

  // User endpoints
  async getCurrentUser(): Promise<User> {
    const response = await this.client.get('/users/me');
    return response.data;
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    const response = await this.client.put(`/users/${userId}`, data);
    return response.data;
  }

  async getUsers(filters?: ConnectionFilters): Promise<User[]> {
    const response = await this.client.get('/users', { params: filters });
    return response.data;
  }

  async getUserById(userId: string): Promise<User> {
    const response = await this.client.get(`/users/${userId}`);
    return response.data;
  }

  async searchUsers(query: string): Promise<User[]> {
    const response = await this.client.get('/users/search', { params: { q: query } });
    return response.data;
  }

  async updateHangoutStatus(isAvailable: boolean, activities?: string[]): Promise<void> {
    await this.client.put('/users/me/hangout-status', {
      isAvailable,
      activities,
    });
  }

  // Event endpoints
  async getEvents(filters?: EventFilters): Promise<Event[]> {
    const response = await this.client.get('/events', { params: filters });
    return response.data;
  }

  async getMyEvents(): Promise<Event[]> {
    const response = await this.client.get('/events/my');
    return response.data;
  }

  async getEventById(eventId: string): Promise<Event> {
    const response = await this.client.get(`/events/${eventId}`);
    return response.data;
  }

  async joinEvent(eventId: string): Promise<void> {
    await this.client.post(`/events/${eventId}/join`);
  }

  async leaveEvent(eventId: string): Promise<void> {
    await this.client.delete(`/events/${eventId}/leave`);
  }

  async addEventComment(eventId: string, content: string, image?: string): Promise<void> {
    await this.client.post(`/events/${eventId}/comments`, { content, image });
  }

  async searchEvents(query: string): Promise<Event[]> {
    const response = await this.client.get('/events/search', { params: { q: query } });
    return response.data;
  }

  // Hangout endpoints
  async getOpenHangouts(filters?: HangoutFilters): Promise<User[]> {
    const response = await this.client.get('/hangouts/open', { params: filters });
    return response.data;
  }

  async getMyHangouts(): Promise<Hangout[]> {
    const response = await this.client.get('/hangouts/my');
    return response.data;
  }

  // Chat endpoints
  async getChats(): Promise<Chat[]> {
    const response = await this.client.get('/chats');
    return response.data;
  }

  async getChatMessages(chatId: string): Promise<Message[]> {
    const response = await this.client.get(`/chats/${chatId}/messages`);
    return response.data;
  }

  async sendMessage(chatId: string, content: string, image?: string): Promise<void> {
    await this.client.post(`/chats/${chatId}/messages`, { content, image });
  }

  async createUserChat(userId: string): Promise<Chat> {
    const response = await this.client.post('/chats/user', { userId });
    return response.data;
  }

  // Quick messages
  async getQuickMessages(): Promise<QuickMessage[]> {
    const response = await this.client.get('/quick-messages');
    return response.data;
  }

  async createQuickMessage(shortcut: string, message: string): Promise<QuickMessage> {
    const response = await this.client.post('/quick-messages', { shortcut, message });
    return response.data;
  }

  async updateQuickMessage(id: string, shortcut: string, message: string): Promise<QuickMessage> {
    const response = await this.client.put(`/quick-messages/${id}`, { shortcut, message });
    return response.data;
  }

  async deleteQuickMessage(id: string): Promise<void> {
    await this.client.delete(`/quick-messages/${id}`);
  }

  // Community/Discussion endpoints
  async getCommunities(): Promise<Community[]> {
    const response = await this.client.get('/communities');
    return response.data;
  }

  async searchCommunities(query: string): Promise<Community[]> {
    const response = await this.client.get('/communities/search', { params: { q: query } });
    return response.data;
  }

  async getCommunityPosts(communityId: string): Promise<Post[]> {
    const response = await this.client.get(`/communities/${communityId}/posts`);
    return response.data;
  }

  async createPost(communityId: string, content: string, image?: string): Promise<Post> {
    const response = await this.client.post(`/communities/${communityId}/posts`, {
      content,
      image,
    });
    return response.data;
  }

  async likePost(postId: string): Promise<void> {
    await this.client.post(`/posts/${postId}/like`);
  }

  async addPostComment(postId: string, content: string): Promise<void> {
    await this.client.post(`/posts/${postId}/comments`, { content });
  }

  // Notification endpoints
  async getNotifications(): Promise<Notification[]> {
    const response = await this.client.get('/notifications');
    return response.data;
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.client.put(`/notifications/${notificationId}/read`);
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await this.client.put('/notifications/read-all');
  }
}

export default new ApiService();
