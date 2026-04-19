const express = require('express');
const router = express.Router();
const { getGoals, getGoal, getGoalStats, createGoal, updateGoal, deleteGoal } = require('../controllers/goalController');
const { protect } = require('../middlewares/auth');

router.use(protect);
router.get('/stats', getGoalStats);
router.get('/', getGoals);
router.get('/:id', getGoal);
router.post('/', createGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);

module.exports = router;
