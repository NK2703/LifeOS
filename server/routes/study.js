const express = require('express');
const router = express.Router();
const { getPlans, getWeeklyStats, createPlan, updatePlan, deletePlan } = require('../controllers/studyController');
const { protect } = require('../middlewares/auth');

router.use(protect);
router.get('/stats', getWeeklyStats);
router.get('/', getPlans);
router.post('/', createPlan);
router.put('/:id', updatePlan);
router.delete('/:id', deletePlan);

module.exports = router;
