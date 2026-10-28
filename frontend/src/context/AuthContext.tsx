import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ApiError, setUnauthorizedHandler } from '../services/apiClient';
import { getCurrentUser, login } from '../services/authService';
import { clearSession, loadStoredToken, storeSession } from '../services/session';
import { AuthUser, Permission } from '../types/auth';
import { getTokenExpiry } from '../utils/jwt';

type AuthStatus = 'restoring' | 'signedOut' | 'signedIn';

const SESSION_EXPIRED = 'Your session has expired. Please log in again.';

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  notice: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('restoring');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const expiryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const endSession = useCallback(async (message: string | null) => {
    if (expiryTimer.current) clearTimeout(expiryTimer.current);
    await clearSession();
    setUser(null);
    setNotice(message);
    setStatus('signedOut');
  }, []);

  const startSession = useCallback(
    async (token: string) => {
      await storeSession(token);
      const currentUser = await getCurrentUser();

      const expiresAt = getTokenExpiry(token);
      if (expiresAt) {
        if (expiryTimer.current) clearTimeout(expiryTimer.current);
        expiryTimer.current = setTimeout(() => endSession(SESSION_EXPIRED), Math.max(expiresAt - Date.now(), 0));
      }

      setUser(currentUser);
      setNotice(null);
      setStatus('signedIn');
    },
    [endSession],
  );

  useEffect(() => {
    setUnauthorizedHandler(() => {
      endSession(SESSION_EXPIRED);
    });
    return () => setUnauthorizedHandler(null);
  }, [endSession]);

  useEffect(() => {
    async function restore() {
      const token = await loadStoredToken();
      const expiresAt = token ? getTokenExpiry(token) : null;

      if (!token || (expiresAt && expiresAt <= Date.now())) {
        await endSession(token ? SESSION_EXPIRED : null);
        return;
      }

      try {
        await startSession(token);
      } catch (error) {
        const offline = error instanceof ApiError && error.status === 0;
        await endSession(offline ? "Can't reach the server. Please log in again." : SESSION_EXPIRED);
      }
    }
    restore();
  }, [endSession, startSession]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const response = await login(email, password);
      try {
        await startSession(response.accessToken);
      } catch (error) {
        await endSession(null);
        throw error;
      }
    },
    [endSession, startSession],
  );

  const signOut = useCallback(() => endSession(null), [endSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      notice,
      signIn,
      signOut,
      hasPermission: (permission) => user?.permissions.includes(permission) ?? false,
    }),
    [status, user, notice, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
