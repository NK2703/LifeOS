const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/aiController');
const { protect } = require('../middlewares/auth');

router.use(protect);
router.get('/recommendations', getRecommendations);

module.exports = router;
