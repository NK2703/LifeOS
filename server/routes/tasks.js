const express = require('express');
const router = express.Router();
const { getTasks, getTask, getTaskStats, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middlewares/auth');

router.use(protect);
router.get('/stats', getTaskStats);
router.get('/', getTasks);
router.get('/:id', getTask);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
