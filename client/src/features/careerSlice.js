import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import careerService from '../services/careerService';

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchCareer = createAsyncThunk(
  'career/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await careerService.getCareer();
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const savePositionAsync = createAsyncThunk(
  'career/savePosition',
  async (data, { rejectWithValue }) => {
    try {
      const res = await careerService.updatePosition(data);
      return res.data.data.career;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchRoadmap = createAsyncThunk(
  'career/fetchRoadmap',
  async (degreeKey, { rejectWithValue }) => {
    try {
      const res = await careerService.getRoadmap(degreeKey);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);


// ── Todos ─────────────────────────────────────────────────────────────────────

export const addTodoAsync = createAsyncThunk(
  'career/addTodo',
  async (data, { rejectWithValue }) => {
    try {
      const res = await careerService.addTodo(data);
      return res.data.data.todos;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateTodoAsync = createAsyncThunk(
  'career/updateTodo',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await careerService.updateTodo(id, data);
      return res.data.data.todos;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteTodoAsync = createAsyncThunk(
  'career/deleteTodo',
  async (id, { rejectWithValue }) => {
    try {
      const res = await careerService.deleteTodo(id);
      return res.data.data.todos;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Expenses ──────────────────────────────────────────────────────────────────

export const addExpenseAsync = createAsyncThunk(
  'career/addExpense',
  async (data, { rejectWithValue }) => {
    try {
      const res = await careerService.addExpense(data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteExpenseAsync = createAsyncThunk(
  'career/deleteExpense',
  async (id, { rejectWithValue }) => {
    try {
      await careerService.deleteExpense(id);
      const res = await careerService.getExpenses();
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const careerSlice = createSlice({
  name: 'career',
  initialState: {
    loading: false,
    error: null,
    scrollPosition: 0,
    chosenPath: 'Unselected',
    unlockedMilestones: [],
    milestones: [],

    todos: [],
    expenses: [],
    totalSpent: 0,
    byCategory: [],
  },
  reducers: {
    // Optimistically set local scroll position (not debounced to API)
    setLocalScroll: (state, action) => {
      state.scrollPosition = action.payload;
    },
    setChosenPath: (state, action) => {
      state.chosenPath = action.payload;
    },
    addMilestone: (state, action) => {
      if (!state.unlockedMilestones.includes(action.payload)) {
        state.unlockedMilestones.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch career
      .addCase(fetchCareer.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCareer.fulfilled, (state, action) => {
        state.loading = false;
        const { career, expenses } = action.payload;
        state.scrollPosition       = career.scrollPosition ?? 0;
        state.chosenPath           = career.chosenPath;
        state.unlockedMilestones   = career.unlockedMilestones;
        state.todos                = career.todos;
        state.totalSpent           = expenses.totalSpent ?? 0;
        state.byCategory           = expenses.byCategory ?? [];
      })
      .addCase(fetchCareer.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // Save position
      .addCase(savePositionAsync.fulfilled, (state, action) => {
        state.scrollPosition     = action.payload.scrollPosition;
        state.unlockedMilestones = action.payload.unlockedMilestones;
      })

      // Fetch roadmap
      .addCase(fetchRoadmap.fulfilled, (state, action) => {
        state.milestones = action.payload.milestones;
      })


      // Todos
      .addCase(addTodoAsync.fulfilled,    (state, a) => { state.todos = a.payload; })
      .addCase(updateTodoAsync.fulfilled, (state, a) => { state.todos = a.payload; })
      .addCase(deleteTodoAsync.fulfilled, (state, a) => { state.todos = a.payload; })

      // Expenses
      .addCase(addExpenseAsync.fulfilled, (state, a) => {
        state.expenses    = [a.payload.expense, ...state.expenses];
        state.totalSpent  = a.payload.totalSpent;
        state.byCategory  = a.payload.byCategory;
      })
      .addCase(deleteExpenseAsync.fulfilled, (state, a) => {
        state.expenses   = a.payload.expenses   ?? state.expenses;
        state.totalSpent = a.payload.totalSpent ?? state.totalSpent;
        state.byCategory = a.payload.byCategory ?? state.byCategory;
      });
  },
});

export const { setLocalScroll, setChosenPath, addMilestone } = careerSlice.actions;
export default careerSlice.reducer;
