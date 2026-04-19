const Goal = require('../models/Goal');

const getGoals = async (req, res, next) => {
  try {
    const query = { user: req.user._id };
    if (req.query.status) query.status = req.query.status;
    if (req.query.type) query.type = req.query.type;

    const goals = await Goal.find(query)
      .sort({ status: 1, target_date: 1, createdAt: -1 })
      .lean();
    res.json({ success: true, data: { goals, total: goals.length } });
  } catch (err) { next(err); }
};

const getGoalStats = async (req, res, next) => {
  try {
    const stats = await Goal.getStats(req.user._id);
    res.json({ success: true, data: { stats } });
  } catch (err) { next(err); }
};

const getGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id }).lean();
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found.' });
    res.json({ success: true, data: { goal } });
  } catch (err) { next(err); }
};

const createGoal = async (req, res, next) => {
  try {
    if (!req.body.title) return res.status(400).json({ success: false, message: 'Title is required.' });

    const goal = await Goal.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, message: 'Goal created.', data: { goal } });
  } catch (err) { next(err); }
};

const updateGoal = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    delete updates.user;

    // Clamp progress
    if (updates.progress !== undefined) {
      updates.progress = Math.min(100, Math.max(0, parseFloat(updates.progress)));
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found.' });
    res.json({ success: true, message: 'Goal updated.', data: { goal } });
  } catch (err) { next(err); }
};

const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found.' });
    res.json({ success: true, message: 'Goal deleted.' });
  } catch (err) { next(err); }
};

module.exports = { getGoals, getGoal, getGoalStats, createGoal, updateGoal, deleteGoal };
