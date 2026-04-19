const Finance = require('../models/Finance');

const getRecords = async (req, res, next) => {
  try {
    const query = { user: req.user._id };
    if (req.query.type) query.type = req.query.type;
    if (req.query.category) query.category = req.query.category;
    if (req.query.from || req.query.to) {
      query.date = {};
      if (req.query.from) query.date.$gte = new Date(req.query.from);
      if (req.query.to) query.date.$lte = new Date(req.query.to);
    }

    const limit = req.query.limit ? parseInt(req.query.limit) : 0;
    const records = await Finance.find(query).sort({ date: -1, createdAt: -1 }).limit(limit).lean();
    res.json({ success: true, data: { records, total: records.length } });
  } catch (err) { next(err); }
};

const getMonthlySummary = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;

    const [summary, totals] = await Promise.all([
      Finance.getMonthlySummary(req.user._id, year, month),
      Finance.getMonthlyTotals(req.user._id, 6),
    ]);

    res.json({ success: true, data: { summary, totals, year, month } });
  } catch (err) { next(err); }
};

const createRecord = async (req, res, next) => {
  try {
    const { type, amount, category, date } = req.body;
    if (!type || !amount || !category || !date) {
      return res.status(400).json({
        success: false,
        message: 'type, amount, category, and date are required.',
      });
    }

    const record = await Finance.create({ ...req.body, user: req.user._id, amount: parseFloat(amount) });
    res.status(201).json({ success: true, message: 'Record added.', data: { record } });
  } catch (err) { next(err); }
};

const updateRecord = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    delete updates.user;
    if (updates.amount) updates.amount = parseFloat(updates.amount);

    const record = await Finance.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );
    if (!record) return res.status(404).json({ success: false, message: 'Record not found.' });
    res.json({ success: true, message: 'Record updated.', data: { record } });
  } catch (err) { next(err); }
};

const deleteRecord = async (req, res, next) => {
  try {
    const record = await Finance.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found.' });
    res.json({ success: true, message: 'Record deleted.' });
  } catch (err) { next(err); }
};

module.exports = { getRecords, getMonthlySummary, createRecord, updateRecord, deleteRecord };
