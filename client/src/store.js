import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import taskReducer from './features/taskSlice';
import goalReducer from './features/goalSlice';
import financeReducer from './features/financeSlice';
import studyReducer from './features/studySlice';
import performanceReducer from './features/performanceSlice';
import uiReducer from './features/uiSlice';
import careerReducer from './features/careerSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    goals: goalReducer,
    finance: financeReducer,
    study: studyReducer,
    performance: performanceReducer,
    ui: uiReducer,
    career: careerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;
