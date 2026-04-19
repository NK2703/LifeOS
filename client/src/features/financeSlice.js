import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { financeService } from '../services';

export const fetchRecords = createAsyncThunk('finance/fetchAll', async (params, { rejectWithValue }) => {
  try { const res = await financeService.getAll(params); return res.data.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const fetchSummary = createAsyncThunk('finance/fetchSummary', async (params, { rejectWithValue }) => {
  try { const res = await financeService.getSummary(params); return res.data.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const createRecord = createAsyncThunk('finance/create', async (data, { rejectWithValue }) => {
  try { const res = await financeService.create(data); return res.data.data.record; }
  catch (err) { return rejectWithValue(err.message); }
});

export const updateRecord = createAsyncThunk('finance/update', async ({ id, data }, { rejectWithValue }) => {
  try { const res = await financeService.update(id, data); return res.data.data.record; }
  catch (err) { return rejectWithValue(err.message); }
});

export const deleteRecord = createAsyncThunk('finance/delete', async (id, { rejectWithValue }) => {
  try { await financeService.delete(id); return id; }
  catch (err) { return rejectWithValue(err.message); }
});

const financeSlice = createSlice({
  name: 'finance',
  initialState: {
    records: [],
    summary: null,
    monthlyTotals: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecords.pending, (state) => { state.loading = true; })
      .addCase(fetchRecords.fulfilled, (state, action) => { state.loading = false; state.records = action.payload.records; })
      .addCase(fetchRecords.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.summary = action.payload.summary;
        state.monthlyTotals = action.payload.totals;
      })
      .addCase(createRecord.fulfilled, (state, action) => { state.records.unshift(action.payload); })
      .addCase(updateRecord.fulfilled, (state, action) => {
        const idx = state.records.findIndex(r => (r._id || r.id) === (action.payload._id || action.payload.id));
        if (idx !== -1) state.records[idx] = action.payload;
      })
      .addCase(deleteRecord.fulfilled, (state, action) => {
        state.records = state.records.filter(r => (r._id || r.id) !== action.payload);
      });
  },
});

export default financeSlice.reducer;
