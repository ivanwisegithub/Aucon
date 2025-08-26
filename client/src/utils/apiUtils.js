import { signoutSuccess } from '../redux/user/userSlice';

export const createAuthenticatedFetch = (dispatch) => {
  return async (url, options = {}) => {
    const token = localStorage.getItem('token') || getCookieToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Include cookies
      });

      // Handle authentication errors
      if (response.status === 401) {
        // Clear invalid token
        localStorage.removeItem('token');
        document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        dispatch(signoutSuccess());
        
        // Redirect to login
        window.location.href = '/sign-in';
        throw new Error('Authentication token expired. Please login again.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Request failed');
      }

      return response;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  };
};

// Helper function to get token from cookies
const getCookieToken = () => {
  const name = 'access_token=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
};