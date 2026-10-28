import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'ebima.accessToken';

// SecureStore uses the iOS Keychain / Android Keystore. It does not exist on web,
// so in the browser the token is only kept in memory and you log in again after a reload.
const useSecureStore = Platform.OS !== 'web';
let webToken: string | null = null;

export async function getToken(): Promise<string | null> {
  return useSecureStore ? SecureStore.getItemAsync(TOKEN_KEY) : webToken;
}

export async function saveToken(token: string): Promise<void> {
  if (useSecureStore) await SecureStore.setItemAsync(TOKEN_KEY, token);
  else webToken = token;
}

export async function deleteToken(): Promise<void> {
  if (useSecureStore) await SecureStore.deleteItemAsync(TOKEN_KEY);
  else webToken = null;
}
