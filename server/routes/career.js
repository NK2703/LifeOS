const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getCareer,
  updatePosition,
  getRoadmap,
  addTodo,
  updateTodo,
  deleteTodo,
  getExpenses,
  addExpense,
  deleteExpense,
} = require('../controllers/careerController');


// All routes protected
router.use(protect);

// Career progress
router.get('/', getCareer);
router.put('/position', updatePosition);

// Roadmap (milestones per degree)
router.get('/roadmap/:degreeKey', getRoadmap);


// Todos
router.post('/todos', addTodo);
router.put('/todos/:todoId', updateTodo);
router.delete('/todos/:todoId', deleteTodo);

// Expenses
router.get('/expenses', getExpenses);
router.post('/expenses', addExpense);
router.delete('/expenses/:id', deleteExpense);

module.exports = router;
