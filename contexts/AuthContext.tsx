import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react';
import { apiRequest } from '@/lib/api';
import { saveTokens, getAccessToken, clearTokens, decodeJWT } from '@/lib/auth';

interface User {
  userId: number;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          const decoded = decodeJWT(token);
          if (decoded) {
            setUser({ userId: decoded.userId, email: decoded.email });
          }
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const data = await apiRequest<{ accessToken: string; refreshToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const decoded = decodeJWT(data.accessToken);
      if (!decoded) {
        throw new Error('Token inválido');
      }

      await saveTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        userId: decoded.userId,
      });

      setUser({ userId: decoded.userId, email: decoded.email });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
      if (message === 'UNAUTHORIZED') {
        setError('Credenciales incorrectas');
      } else if (message.includes('validation')) {
        setError('Email y contraseña son requeridos');
      } else {
        setError(message);
      }
      throw err;
    }
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const data = await apiRequest<{ accessToken: string; refreshToken: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const decoded = decodeJWT(data.accessToken);
      if (!decoded) {
        throw new Error('Token inválido');
      }

      await saveTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        userId: decoded.userId,
      });

      setUser({ userId: decoded.userId, email: decoded.email });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al registrar';
      if (message.includes('already exists') || message.includes('ya existe')) {
        setError('El email ya está registrado');
      } else if (message.includes('validation')) {
        setError('Email y contraseña son requeridos');
      } else {
        setError(message);
      }
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const { getRefreshToken } = await import('@/lib/auth');
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        await apiRequest('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch {
      // Ignorar errores del logout en el servidor
    } finally {
      await clearTokens();
      setUser(null);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      error,
      login,
      register,
      logout,
      clearError,
    }),
    [user, isLoading, error, login, register, logout, clearError],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
