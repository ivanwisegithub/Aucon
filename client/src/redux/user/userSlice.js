import { createSlice } from '@reduxjs/toolkit';

// Helper to extract token from cookies
const getTokenFromCookies = () => {
  try {
    const cookies = document.cookie.split('; ');
    const tokenCookie = cookies.find((row) => row.startsWith('access_token='));
    return tokenCookie ? decodeURIComponent(tokenCookie.split('=')[1]) : null;
  } catch (error) {
    console.warn('Error reading token from cookies:', error);
    return null;
  }
};

// Helper to get token from localStorage as fallback
const getTokenFromStorage = () => {
  try {
    return localStorage.getItem('access_token');
  } catch (error) {
    console.warn('Error reading token from localStorage:', error);
    return null;
  }
};

// Combined token retrieval function
const getValidToken = () => {
  return getTokenFromCookies() || getTokenFromStorage();
};

const initialState = {
  currentUser: null,
  error: null,
  loading: false
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    signInSuccess: (state, action) => {
      const token = action.payload.accessToken || getValidToken();
      const user = action.payload.user || action.payload;
      
      // Store token in localStorage for persistence
      if (token) {
        try {
          localStorage.setItem('access_token', token);
        } catch (error) {
          console.warn('Failed to store token in localStorage:', error);
        }
      }
      
      state.currentUser = {
        ...user,
        accessToken: token
      };
      state.loading = false;
      state.error = null;
    },
    signInFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateSuccess: (state, action) => {
      const user = action.payload.user || action.payload;
      const token = action.payload.accessToken || 
                   state.currentUser?.accessToken || 
                   getValidToken();
      
      state.currentUser = {
        ...user,
        accessToken: token
      };
      state.loading = false;
      state.error = null;
    },
    updateFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteUserStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteUserSuccess: (state) => {
      // Clear stored tokens
      try {
        localStorage.removeItem('access_token');
        document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      } catch (error) {
        console.warn('Error clearing tokens:', error);
      }
      
      state.currentUser = null;
      state.loading = false;
      state.error = null;
    },
    deleteUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    signoutSuccess: (state) => {
      // Clear stored tokens
      try {
        localStorage.removeItem('access_token');
        document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      } catch (error) {
        console.warn('Error clearing tokens:', error);
      }
      
      state.currentUser = null;
      state.error = null;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    refreshToken: (state) => {
      if (state.currentUser) {
        const token = getValidToken();
        if (token) {
          state.currentUser.accessToken = token;
        }
      }
    },
    // New action to restore user from storage on app init
    restoreUser: (state) => {
      const token = getValidToken();
      if (token && !state.currentUser) {
        // Try to restore basic user info from token or storage
        try {
          const userInfo = localStorage.getItem('user_info');
          if (userInfo) {
            const user = JSON.parse(userInfo);
            state.currentUser = {
              ...user,
              accessToken: token
            };
          }
        } catch (error) {
          console.warn('Failed to restore user from storage:', error);
        }
      }
    }
  }
});

export const {
  signInStart,
  signInSuccess,
  signInFailure,
  updateStart,
  updateSuccess,
  updateFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signoutSuccess,
  clearError,
  refreshToken,
  restoreUser
} = userSlice.actions;

export default userSlice.reducer;