import Constants from 'expo-constants';

const API_PORT = 8000;
const REQUEST_TIMEOUT = 10000;

// on a real phone "localhost" is the phone itself, so use the IP of the machine running expo
function getBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${host ?? 'localhost'}:${API_PORT}`;
}

export const API_BASE_URL = getBaseUrl();

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string | null,
  ) {
    super(`Request failed with status ${status}`);
  }
}

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

async function readDetail(response: Response): Promise<string | null> {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === 'object' && 'detail' in body && typeof body.detail === 'string') {
      return body.detail;
    }
  } catch {
    // body was not JSON
  }
  return null;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(0, null);
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    if (response.status === 401 && authToken) {
      onUnauthorized?.();
    }
    throw new ApiError(response.status, await readDetail(response));
  }
  return (await response.json()) as T;
}

export const apiGet = <T>(path: string) => request<T>('GET', path);
export const apiPost = <T>(path: string, body: unknown) => request<T>('POST', path, body);
export const apiPatch = <T>(path: string, body: unknown) => request<T>('PATCH', path, body);

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.status === 0) return "Can't reach the server. Check your connection and try again.";
    if (error.status === 401) return 'Your session has expired. Please log in again.';
    if (error.status === 403) return "You don't have permission to do this.";
    // 400, 404 and 409 messages are written by our own API and are safe to show
    if ([400, 404, 409].includes(error.status) && error.detail) return error.detail;
  }
  return fallback;
}
