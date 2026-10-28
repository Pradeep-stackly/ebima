import { AccountStatus, ManagedUser, NewUser, UserRole } from '../types/auth';
import { Page } from '../types';
import { apiGet, apiPatch, apiPost } from './apiClient';

export function getUsers(limit: number, offset: number): Promise<Page<ManagedUser>> {
  return apiGet<Page<ManagedUser>>(`/api/users?limit=${limit}&offset=${offset}`);
}

export function createUser(user: NewUser): Promise<ManagedUser> {
  return apiPost<ManagedUser>('/api/users', user);
}

export function updateUserRole(userId: number, role: UserRole): Promise<ManagedUser> {
  return apiPatch<ManagedUser>(`/api/users/${userId}/role`, { role });
}

export function updateUserStatus(userId: number, status: AccountStatus): Promise<ManagedUser> {
  return apiPatch<ManagedUser>(`/api/users/${userId}/status`, { status });
}
