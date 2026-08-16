// === Create this new file: lib/auth.ts ===
// Small helper so every page talks to the backend the same way.

export const API_BASE = 'https://hvac-backend-production-c861.up.railway.app';
const TOKEN_KEY = 'hvac_token';

export function saveToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

// Wrapper around fetch that automatically adds the Authorization header.
// If the backend says the token is invalid/expired (401), it clears the
// token and sends the user back to /login.
export async function authFetch(path: string, options: RequestInit = {}) {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  return res;
}