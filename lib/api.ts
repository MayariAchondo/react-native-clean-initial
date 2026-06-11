import Constants from 'expo-constants';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from './auth';

const API_URL = Constants.expoConfig?.extra?.apiUrl ?? 'https://cashi-app.onrender.com';

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        return null;
      }

      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        await clearTokens();
        return null;
      }

      const data = await res.json();
      await saveTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        userId: data.userId ?? (await getUserId()),
      });
      return data.accessToken;
    } catch {
      await clearTokens();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function getUserId(): Promise<number | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId ?? null;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let res: Response;
  try {
    res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error('Error de conexión');
  }

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      const newHeaders: HeadersInit = {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      };
      try {
        res = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers: newHeaders,
        });
      } catch {
        throw new Error('Error de conexión');
      }
    } else {
      await clearTokens();
      throw new Error('UNAUTHORIZED');
    }
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error ?? errorData.errors?.[0]?.message ?? `HTTP ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

export async function apiUpload<T>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const token = await getAccessToken();
  const headers: HeadersInit = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let res: Response;
  try {
    res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });
  } catch {
    throw new Error('Error de conexión');
  }

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      const newHeaders: HeadersInit = {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      };
      try {
        res = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers: newHeaders,
          body: formData,
        });
      } catch {
        throw new Error('Error de conexión');
      }
    } else {
      await clearTokens();
      throw new Error('UNAUTHORIZED');
    }
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error ?? errorData.errors?.[0]?.message ?? `HTTP ${res.status}`);
  }

  return res.json();
}