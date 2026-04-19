const Task = require('../models/Task');
const Goal = require('../models/Goal');
const StudyPlan = require('../models/StudyPlan');
const Finance = require('../models/Finance');
const Performance = require('../models/Performance');
const { generateRecommendations } = require('../utils/aiEngine');

// GET /api/ai/recommendations
const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    // Fetch all context data in parallel
    const [tasks, goals, studyPlans, financeRecords, performanceHistory] = await Promise.all([
      Task.find({ user: userId }).lean(),
      Goal.find({ user: userId }).lean(),
      StudyPlan.find({ user: userId, scheduled_date: { $gte: weekAgo } }).lean(),
      Finance.find({ user: userId, date: { $gte: monthStart } }).lean(),
      Performance.getHistory(userId, 14),
    ]);

    const result = generateRecommendations({
      tasks,
      goals,
      studyPlans,
      financeRecords,
      performanceHistory,
    });

    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

module.exports = { getRecommendations };
