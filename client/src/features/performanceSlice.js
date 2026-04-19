import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { performanceService } from '../services';

export const calculateScore = createAsyncThunk('performance/calculate', async (_, { rejectWithValue }) => {
  try { const res = await performanceService.calculate(); return res.data.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const fetchHistory = createAsyncThunk('performance/history', async (params, { rejectWithValue }) => {
  try { const res = await performanceService.getHistory(params); return res.data.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const fetchTodayScore = createAsyncThunk('performance/today', async (_, { rejectWithValue }) => {
  try { const res = await performanceService.getToday(); return res.data.data; }
  catch (err) { return rejectWithValue(err.message); }
});

const performanceSlice = createSlice({
  name: 'performance',
  initialState: {
    today: null,
    history: [],
    streak: 0,
    grade: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(calculateScore.pending, (state) => { state.loading = true; })
      .addCase(calculateScore.fulfilled, (state, action) => {
        state.loading = false;
        state.today = action.payload.score;
        state.grade = action.payload.grade;
      })
      .addCase(calculateScore.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.history = action.payload.history;
        state.streak = action.payload.streak;
      })
      .addCase(fetchTodayScore.fulfilled, (state, action) => {
        state.today = action.payload.score;
        state.grade = action.payload.grade;
      });
  },
});

export default performanceSlice.reducer;
