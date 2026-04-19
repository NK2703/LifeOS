import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { taskService } from '../services';

export const fetchTasks = createAsyncThunk('tasks/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await taskService.getAll(params);
    return res.data.data;
  } catch (err) { return rejectWithValue(err.message); }
});

export const fetchTaskStats = createAsyncThunk('tasks/fetchStats', async (_, { rejectWithValue }) => {
  try {
    const res = await taskService.getStats();
    return res.data.data.stats;
  } catch (err) { return rejectWithValue(err.message); }
});

export const createTask = createAsyncThunk('tasks/create', async (data, { rejectWithValue }) => {
  try {
    const res = await taskService.create(data);
    return res.data.data.task;
  } catch (err) { return rejectWithValue(err.message); }
});

export const updateTask = createAsyncThunk('tasks/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await taskService.update(id, data);
    return res.data.data.task;
  } catch (err) { return rejectWithValue(err.message); }
});

export const deleteTask = createAsyncThunk('tasks/delete', async (id, { rejectWithValue }) => {
  try {
    await taskService.delete(id);
    return id; // return the _id string
  } catch (err) { return rejectWithValue(err.message); }
});

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    items: [],
    stats: null,
    loading: false,
    error: null,
    activeFilter: 'all',
  },
  reducers: {
    setFilter: (state, action) => { state.activeFilter = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => { state.loading = true; })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.tasks;
      })
      .addCase(fetchTasks.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchTaskStats.fulfilled, (state, action) => { state.stats = action.payload; })
      .addCase(createTask.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.items.findIndex(t => (t._id || t.id) === (action.payload._id || action.payload.id));
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter(t => (t._id || t.id) !== action.payload);
      });
  },
});

export const { setFilter } = taskSlice.actions;
export default taskSlice.reducer;
