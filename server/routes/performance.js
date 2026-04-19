const express = require('express');
const router = express.Router();
const { calculateScore, getHistory, getTodayScore } = require('../controllers/performanceController');
const { protect } = require('../middlewares/auth');

router.use(protect);
router.post('/calculate', calculateScore);
router.get('/history', getHistory);
router.get('/today', getTodayScore);

module.exports = router;
