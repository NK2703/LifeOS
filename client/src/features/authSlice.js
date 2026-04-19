import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services';

const storedUser = localStorage.getItem('lifeos_user');
const storedToken = localStorage.getItem('lifeos_token');

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await authService.register(data);
    return res.data.data;
  } catch (err) { return rejectWithValue(err.message || 'Registration failed'); }
});

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await authService.login(data);
    return res.data.data;
  } catch (err) { return rejectWithValue(err.message || 'Login failed'); }
});

export const fetchProfile = createAsyncThunk('auth/profile', async (_, { rejectWithValue }) => {
  try {
    const res = await authService.getProfile();
    return res.data.data.user;
  } catch (err) { return rejectWithValue(err.message); }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,
    loading: false,
    error: null,
    isAuthenticated: !!storedToken,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('lifeos_token');
      localStorage.removeItem('lifeos_user');
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => { state.loading = true; state.error = null; };
    const handleAuthFulfilled = (state, action) => {
      state.loading = false;
      // Normalize MongoDB _id to id for consistency
      const user = action.payload.user;
      if (user && user._id && !user.id) user.id = user._id;
      state.user = user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('lifeos_token', action.payload.token);
      localStorage.setItem('lifeos_user', JSON.stringify(user));
    };
    const handleRejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      .addCase(registerUser.pending, handlePending)
      .addCase(registerUser.fulfilled, handleAuthFulfilled)
      .addCase(registerUser.rejected, handleRejected)
      .addCase(loginUser.pending, handlePending)
      .addCase(loginUser.fulfilled, handleAuthFulfilled)
      .addCase(loginUser.rejected, handleRejected)
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem('lifeos_user', JSON.stringify(action.payload));
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
