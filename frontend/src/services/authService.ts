import { AuthUser, LoginResponse } from '../types/auth';
import { apiGet, apiPost } from './apiClient';

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiPost<LoginResponse>('/api/auth/login', { email, password });
}

export function getCurrentUser(): Promise<AuthUser> {
  return apiGet<AuthUser>('/api/auth/me');
}
