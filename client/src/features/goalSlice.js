import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { goalService } from '../services';

export const fetchGoals = createAsyncThunk('goals/fetchAll', async (params, { rejectWithValue }) => {
  try { const res = await goalService.getAll(params); return res.data.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const fetchGoalStats = createAsyncThunk('goals/fetchStats', async (_, { rejectWithValue }) => {
  try { const res = await goalService.getStats(); return res.data.data.stats; }
  catch (err) { return rejectWithValue(err.message); }
});

export const createGoal = createAsyncThunk('goals/create', async (data, { rejectWithValue }) => {
  try { const res = await goalService.create(data); return res.data.data.goal; }
  catch (err) { return rejectWithValue(err.message); }
});

export const updateGoal = createAsyncThunk('goals/update', async ({ id, data }, { rejectWithValue }) => {
  try { const res = await goalService.update(id, data); return res.data.data.goal; }
  catch (err) { return rejectWithValue(err.message); }
});

export const deleteGoal = createAsyncThunk('goals/delete', async (id, { rejectWithValue }) => {
  try { await goalService.delete(id); return id; }
  catch (err) { return rejectWithValue(err.message); }
});

const goalSlice = createSlice({
  name: 'goals',
  initialState: { items: [], stats: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => { state.loading = true; })
      .addCase(fetchGoals.fulfilled, (state, action) => { state.loading = false; state.items = action.payload.goals; })
      .addCase(fetchGoals.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchGoalStats.fulfilled, (state, action) => { state.stats = action.payload; })
      .addCase(createGoal.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(updateGoal.fulfilled, (state, action) => {
        const idx = state.items.findIndex(g => (g._id || g.id) === (action.payload._id || action.payload.id));
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.items = state.items.filter(g => (g._id || g.id) !== action.payload);
      });
  },
});

export default goalSlice.reducer;
