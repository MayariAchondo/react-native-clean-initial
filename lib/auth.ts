import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_ID_KEY = 'userId';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  userId: number;
}

function getStore() {
  if (Platform.OS === 'web') {
    return {
      getItem: (key: string) => localStorage.getItem(key),
      setItem: (key: string, value: string) => localStorage.setItem(key, value),
      removeItem: (key: string) => localStorage.removeItem(key),
    };
  }
  const SecureStore = require('expo-secure-store');
  return {
    getItem: (key: string) => SecureStore.getItemAsync(key),
    setItem: (key: string, value: string) =>
      SecureStore.setItemAsync(key, value),
    removeItem: (key: string) => SecureStore.deleteItemAsync(key),
  };
}

export async function saveTokens(tokens: Tokens): Promise<void> {
  const store = getStore();
  await store.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  await store.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  await store.setItem(USER_ID_KEY, tokens.userId.toString());
}

export async function getAccessToken(): Promise<string | null> {
  const store = getStore();
  return store.getItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  const store = getStore();
  return store.getItem(REFRESH_TOKEN_KEY);
}

export async function getUserId(): Promise<number | null> {
  const store = getStore();
  const id = await store.getItem(USER_ID_KEY);
  return id ? parseInt(id, 10) : null;
}

export async function clearTokens(): Promise<void> {
  const store = getStore();
  await store.removeItem(ACCESS_TOKEN_KEY);
  await store.removeItem(REFRESH_TOKEN_KEY);
  await store.removeItem(USER_ID_KEY);
}

export function decodeJWT(
  token: string,
): { userId: number; email: string; exp: number } | null {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export async function getUserEmail(): Promise<string | null> {
  const token = await getAccessToken();
  if (!token) return null;
  const decoded = decodeJWT(token);
  return decoded?.email ?? null;
}

