const StudyPlan = require('../models/StudyPlan');

const getPlans = async (req, res, next) => {
  try {
    const query = { user: req.user._id };
    if (req.query.subject) query.subject = req.query.subject;
    if (req.query.date) {
      const d = new Date(req.query.date);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      query.scheduled_date = { $gte: d, $lt: next };
    }
    if (req.query.from || req.query.to) {
      query.scheduled_date = {};
      if (req.query.from) query.scheduled_date.$gte = new Date(req.query.from);
      if (req.query.to) query.scheduled_date.$lte = new Date(req.query.to);
    }
    if (req.query.completed !== undefined) {
      query.completed = req.query.completed === 'true';
    }

    const plans = await StudyPlan.find(query).sort({ scheduled_date: 1, start_time: 1 }).lean();
    res.json({ success: true, data: { plans, total: plans.length } });
  } catch (err) { next(err); }
};

const getWeeklyStats = async (req, res, next) => {
  try {
    const stats = await StudyPlan.getWeeklyStats(req.user._id);
    res.json({ success: true, data: { stats } });
  } catch (err) { next(err); }
};

const createPlan = async (req, res, next) => {
  try {
    const { subject, topic, scheduled_date } = req.body;
    if (!subject || !topic || !scheduled_date) {
      return res.status(400).json({
        success: false,
        message: 'subject, topic, and scheduled_date are required.',
      });
    }
    const plan = await StudyPlan.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, message: 'Study session created.', data: { plan } });
  } catch (err) { next(err); }
};

const updatePlan = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    delete updates.user;

    const plan = await StudyPlan.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );
    if (!plan) return res.status(404).json({ success: false, message: 'Study plan not found.' });
    res.json({ success: true, message: 'Study plan updated.', data: { plan } });
  } catch (err) { next(err); }
};

const deletePlan = async (req, res, next) => {
  try {
    const plan = await StudyPlan.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!plan) return res.status(404).json({ success: false, message: 'Study plan not found.' });
    res.json({ success: true, message: 'Study plan deleted.' });
  } catch (err) { next(err); }
};

module.exports = { getPlans, getWeeklyStats, createPlan, updatePlan, deletePlan };
