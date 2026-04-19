import api from './api';

const careerService = {
  // Career progress
  getCareer: () => api.get('/career'),
  updatePosition: (data) => api.put('/career/position', data),
  getRoadmap: (degreeKey) => api.get(`/career/roadmap/${encodeURIComponent(degreeKey)}`),


  // Todos
  addTodo: (data) => api.post('/career/todos', data),
  updateTodo: (id, data) => api.put(`/career/todos/${id}`, data),
  deleteTodo: (id) => api.delete(`/career/todos/${id}`),

  // Expenses
  getExpenses: () => api.get('/career/expenses'),
  addExpense: (data) => api.post('/career/expenses', data),
  deleteExpense: (id) => api.delete(`/career/expenses/${id}`),
};

export default careerService;
