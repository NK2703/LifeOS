const express = require('express');
const router = express.Router();
const { getRecords, getMonthlySummary, createRecord, updateRecord, deleteRecord } = require('../controllers/financeController');
const { protect } = require('../middlewares/auth');

router.use(protect);
router.get('/summary', getMonthlySummary);
router.get('/', getRecords);
router.post('/', createRecord);
router.put('/:id', updateRecord);
router.delete('/:id', deleteRecord);

module.exports = router;
