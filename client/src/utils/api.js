// client/src/utils/api.js
import { getAuthToken, removeAuthToken } from './authUtils';

const API_BASE_URL = '/api';

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
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

  try {
    const response = await fetch(url, config);

    if (response.status === 401 || response.status === 403) {
      console.warn('🔒 Session expired or unauthorized. Redirecting to login...');
      removeAuthToken();
      window.location.href = '/sign-in';
      return null;
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('❌ API call failed:', error);
    throw error;
  }
};
