import api from './axios';
import { AuthUser, LoginPayload } from '@/types';

export async function loginUser(payload: LoginPayload): Promise<AuthUser> {
  const response = await api.post<AuthUser>('/auth/login', {
    username: payload.username,
    password: payload.password,
    expiresInMins: 60,
  });
  return response.data;
}

export function saveAuth(user: AuthUser): void {
  localStorage.setItem('auth_token', user.token);
  localStorage.setItem('auth_user', JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  // Clear the cookie that the proxy middleware reads for route protection
  document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Lax';
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('auth_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('auth_token');
}
