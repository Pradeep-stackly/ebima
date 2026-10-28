import { beforeEach, expect, jest, test } from '@jest/globals';
import * as SecureStore from 'expo-secure-store';
import { ApiError, apiGet, getAuthToken, setUnauthorizedHandler } from '../services/apiClient';
import { clearSession, loadStoredToken, storeSession } from '../services/session';
import { getTokenExpiry } from '../utils/jwt';

const mockStore = new Map<string, string>();

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn((key: string) => Promise.resolve(mockStore.get(key) ?? null)),
  setItemAsync: jest.fn((key: string, value: string) => {
    mockStore.set(key, value);
    return Promise.resolve();
  }),
  deleteItemAsync: jest.fn((key: string) => {
    mockStore.delete(key);
    return Promise.resolve();
  }),
}));

function mockFetch(status: number, body: unknown) {
  const fetchMock = jest.fn<(url: string, init: RequestInit) => Promise<unknown>>().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

beforeEach(async () => {
  await clearSession();
  setUnauthorizedHandler(null);
  jest.clearAllMocks();
});

test('login stores the token in SecureStore and the api client', async () => {
  await storeSession('token-123');

  expect(SecureStore.setItemAsync).toHaveBeenCalledWith('ebima.accessToken', 'token-123');
  expect(await loadStoredToken()).toBe('token-123');
  expect(getAuthToken()).toBe('token-123');
});

test('logout clears the client-side session', async () => {
  await storeSession('token-123');

  await clearSession();

  expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('ebima.accessToken');
  expect(await loadStoredToken()).toBeNull();
  expect(getAuthToken()).toBeNull();
});

test('requests include the token only while logged in', async () => {
  const fetchMock = mockFetch(200, { ok: true });

  await storeSession('token-123');
  await apiGet('/api/dashboard');
  await clearSession();
  await apiGet('/api/dashboard');

  const headersFor = (call: number) => fetchMock.mock.calls[call][1].headers as Record<string, string>;
  expect(headersFor(0).Authorization).toBe('Bearer token-123');
  expect(headersFor(1).Authorization).toBeUndefined();
});

test('a 401 response ends the session and is never returned as data', async () => {
  const onUnauthorized = jest.fn();
  setUnauthorizedHandler(onUnauthorized);
  mockFetch(401, { detail: 'Token has expired' });
  await storeSession('expired-token');

  await expect(apiGet('/api/dashboard')).rejects.toMatchObject({ status: 401 });
  expect(onUnauthorized).toHaveBeenCalledTimes(1);
});

test('a 403 response is an error but does not log the user out', async () => {
  const onUnauthorized = jest.fn();
  setUnauthorizedHandler(onUnauthorized);
  mockFetch(403, { detail: 'You do not have permission to perform this action' });
  await storeSession('analyst-token');

  const error = await apiGet('/api/users').catch((e: unknown) => e);

  expect(error).toBeInstanceOf(ApiError);
  expect((error as ApiError).status).toBe(403);
  expect(onUnauthorized).not.toHaveBeenCalled();
});

test('reads the expiry time from a token', () => {
  const payload = btoa(JSON.stringify({ sub: '1', exp: 1800000000 })).replace(/=+$/, '');
  expect(getTokenExpiry(`header.${payload}.signature`)).toBe(1800000000 * 1000);
  expect(getTokenExpiry('not-a-token')).toBeNull();
});
