// client/src/utils/authUtils.js

// Get token from localStorage or cookies
export const getAuthToken = () => {
  let token = localStorage.getItem('access_token');
  if (!token) {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('access_token='));
    token = cookie?.split('=')[1] || null;
  }
  return token;
};

// Set token in both localStorage and cookie
export const setAuthToken = (token) => {
  localStorage.setItem('access_token', token);
  const isProd = import.meta.env.PROD;
  document.cookie = `access_token=${token}; path=/; ${isProd ? 'secure; ' : ''}samesite=strict; max-age=604800`;
};

// Remove token from both
export const removeAuthToken = () => {
  localStorage.removeItem('access_token');
  document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

// Check if token is valid
export const isAuthenticated = () => {
  const token = getAuthToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp > Date.now() / 1000;
  } catch {
    removeAuthToken();
    return false;
  }
};

// Get user info from token
export const getUserFromToken = () => {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.id,
      email: payload.email,
      username: payload.username,
      isAdmin: payload.isAdmin || false
    };
  } catch {
    return null;
  }
};

// Authenticated fetch wrapper
export const authenticatedFetch = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && {
      Authorization: `Bearer ${token}`,
      'x-access-token': token
    }),
    ...options.headers
  };

  const config = {
    ...options,
    headers,
    credentials: 'include'
  };

  const response = await fetch(url, config);

  if (response.status === 401 || response.status === 403) {
    removeAuthToken();
    window.location.href = '/sign-in';
    throw new Error('Session expired. Please log in again.');
  }

  return response;
};

// Login helper
export const login = async (credentials) => {
  try {
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials)
    });

    const data = await res.json();
    if (res.ok && data.accessToken) {
      setAuthToken(data.accessToken);
      return { success: true, user: data.user };
    } else {
      return { success: false, message: data.message || 'Login failed' };
    }
  } catch (err) {
    return { success: false, message: 'Network error. Please try again.' };
  }
};

// Logout helper
export const logout = async () => {
  try {
    await fetch('/api/auth/signout', {
      method: 'POST',
      credentials: 'include'
    });
  } catch {}
  removeAuthToken();
  window.location.href = '/sign-in';
};
