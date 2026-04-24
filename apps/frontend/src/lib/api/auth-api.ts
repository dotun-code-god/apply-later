import { apiClient } from './client';

export interface AuthUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
  emailVerified: boolean;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export const authApi = {
  async csrfToken() {
    const { data } = await apiClient.get<{ csrfToken: string }>('/auth/csrf-token');
    return data;
  },

  async signup(payload: { email: string; password: string; name?: string }) {
    const { data } = await apiClient.post<AuthResponse>('/auth/signup', payload);
    return data;
  },

  async login(payload: { email: string; password: string }) {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
    return data;
  },

  async me() {
    const { data } = await apiClient.get<{ user: AuthUser }>('/auth/me');
    return data.user;
  },

  async refresh() {
    const { data } = await apiClient.post<AuthResponse>('/auth/refresh');
    return data;
  },

  async logout() {
    const { data } = await apiClient.post<{ ok: boolean }>('/auth/logout');
    return data;
  },

  async verifyEmail(token: string) {
    const { data } = await apiClient.post<{ verified: boolean }>('/auth/verify-email', {
      token,
    });
    return data;
  },

  async resendVerification() {
    const { data } = await apiClient.post<{ ok: boolean }>('/auth/resend-verification');
    return data;
  },

  async forgotPassword(email: string) {
    const { data } = await apiClient.post<{ ok: boolean }>('/auth/forgot-password', {
      email,
    });
    return data;
  },

  async resetPassword(token: string, newPassword: string) {
    const { data } = await apiClient.post<{ ok: boolean }>('/auth/reset-password', {
      token,
      newPassword,
    });
    return data;
  },

  async googleIdentity(credential: string) {
    const { data } = await apiClient.post<AuthResponse>('/auth/google/identity', {
      credential,
    });
    return data;
  },
};
