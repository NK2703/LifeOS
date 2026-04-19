import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const taskService = {
  getAll: (params) => api.get('/tasks', { params }),
  getStats: () => api.get('/tasks/stats'),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

export const goalService = {
  getAll: (params) => api.get('/goals', { params }),
  getStats: () => api.get('/goals/stats'),
  getById: (id) => api.get(`/goals/${id}`),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
};

export const financeService = {
  getAll: (params) => api.get('/finance', { params }),
  getSummary: (params) => api.get('/finance/summary', { params }),
  create: (data) => api.post('/finance', data),
  update: (id, data) => api.put(`/finance/${id}`, data),
  delete: (id) => api.delete(`/finance/${id}`),
};

export const studyService = {
  getAll: (params) => api.get('/study', { params }),
  getStats: () => api.get('/study/stats'),
  create: (data) => api.post('/study', data),
  update: (id, data) => api.put(`/study/${id}`, data),
  delete: (id) => api.delete(`/study/${id}`),
};

export const performanceService = {
  calculate: () => api.post('/performance/calculate'),
  getHistory: (params) => api.get('/performance/history', { params }),
  getToday: () => api.get('/performance/today'),
};

export const aiService = {
  getRecommendations: () => api.get('/ai/recommendations'),
};
