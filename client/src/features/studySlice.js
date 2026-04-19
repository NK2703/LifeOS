import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { studyService } from '../services';

export const fetchPlans = createAsyncThunk('study/fetchAll', async (params, { rejectWithValue }) => {
  try { const res = await studyService.getAll(params); return res.data.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const fetchStudyStats = createAsyncThunk('study/fetchStats', async (_, { rejectWithValue }) => {
  try { const res = await studyService.getStats(); return res.data.data.stats; }
  catch (err) { return rejectWithValue(err.message); }
});

export const createPlan = createAsyncThunk('study/create', async (data, { rejectWithValue }) => {
  try { const res = await studyService.create(data); return res.data.data.plan; }
  catch (err) { return rejectWithValue(err.message); }
});

export const updatePlan = createAsyncThunk('study/update', async ({ id, data }, { rejectWithValue }) => {
  try { const res = await studyService.update(id, data); return res.data.data.plan; }
  catch (err) { return rejectWithValue(err.message); }
});

export const deletePlan = createAsyncThunk('study/delete', async (id, { rejectWithValue }) => {
  try { await studyService.delete(id); return id; }
  catch (err) { return rejectWithValue(err.message); }
});

const studySlice = createSlice({
  name: 'study',
  initialState: { plans: [], stats: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.pending, (state) => { state.loading = true; })
      .addCase(fetchPlans.fulfilled, (state, action) => { state.loading = false; state.plans = action.payload.plans; })
      .addCase(fetchPlans.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchStudyStats.fulfilled, (state, action) => { state.stats = action.payload; })
      .addCase(createPlan.fulfilled, (state, action) => { state.plans.push(action.payload); })
      .addCase(updatePlan.fulfilled, (state, action) => {
        const idx = state.plans.findIndex(p => (p._id || p.id) === (action.payload._id || action.payload.id));
        if (idx !== -1) state.plans[idx] = action.payload;
      })
      .addCase(deletePlan.fulfilled, (state, action) => {
        state.plans = state.plans.filter(p => (p._id || p.id) !== action.payload);
      });
  },
});

export default studySlice.reducer;
