import { setAuthToken } from './apiClient';
import { deleteToken, getToken, saveToken } from './tokenStorage';

export async function storeSession(token: string): Promise<void> {
  await saveToken(token);
  setAuthToken(token);
}

export async function clearSession(): Promise<void> {
  setAuthToken(null);
  await deleteToken();
}

export async function loadStoredToken(): Promise<string | null> {
  return getToken();
}
