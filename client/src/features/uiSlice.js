import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: true,
    theme: 'dark',
    activeModal: null,
    notifications: [],
    recommendations: [],
    recommendationsLoading: false,
  },
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    setTheme: (state, action) => { state.theme = action.payload; },
    openModal: (state, action) => { state.activeModal = action.payload; },
    closeModal: (state) => { state.activeModal = null; },
    addNotification: (state, action) => {
      state.notifications.unshift({ ...action.payload, id: Date.now() });
      if (state.notifications.length > 10) state.notifications.pop();
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    setRecommendations: (state, action) => {
      state.recommendations = action.payload;
      state.recommendationsLoading = false;
    },
    setRecommendationsLoading: (state, action) => {
      state.recommendationsLoading = action.payload;
    },
  },
});

export const {
  toggleSidebar, setTheme, openModal, closeModal,
  addNotification, removeNotification, setRecommendations, setRecommendationsLoading,
} = uiSlice.actions;
export default uiSlice.reducer;
