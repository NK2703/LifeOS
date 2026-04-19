const Task = require('../models/Task');
const Goal = require('../models/Goal');
const StudyPlan = require('../models/StudyPlan');
const Finance = require('../models/Finance');
const Performance = require('../models/Performance');
const { calculateDailyScore, getScoreGrade } = require('../utils/scoreCalculator');

// POST /api/performance/calculate
const calculateScore = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch all data in parallel
    const [taskStats, goals, studyHours, financeCount] = await Promise.all([
      Task.getTodayStats(userId),
      Goal.find({ user: userId, status: 'active' }).lean(),
      StudyPlan.getTodayHours(userId),
      Finance.getTodayCount(userId),
    ]);

    const avgGoalProgress = goals.length > 0
      ? goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length
      : 0;

    const scores = calculateDailyScore({
      tasksCompleted: parseInt(taskStats.completed_today || 0),
      tasksTotal: Math.max(parseInt(taskStats.total || 0), 1),
      goalsProgressToday: avgGoalProgress,
      studyHoursToday: parseFloat(studyHours || 0),
      targetStudyHours: req.user.preferences?.target_study_hours || 4,
      financeEntriesLogged: parseInt(financeCount || 0),
      missedDeadlines: parseInt(taskStats.overdue || 0),
    });

    const saved = await Performance.upsert(userId, today, scores);
    const grade = getScoreGrade(scores.totalScore);

    res.json({ success: true, data: { score: saved, grade, breakdown: scores.breakdown } });
  } catch (err) { next(err); }
};

// GET /api/performance/history
const getHistory = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const [history, streak] = await Promise.all([
      Performance.getHistory(req.user._id, days),
      Performance.getStreak(req.user._id),
    ]);
    res.json({ success: true, data: { history, streak } });
  } catch (err) { next(err); }
};

// GET /api/performance/today
const getTodayScore = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const score = await Performance.findOrCreate(req.user._id, today);
    const grade = getScoreGrade(score.total_score || 0);
    res.json({ success: true, data: { score, grade } });
  } catch (err) { next(err); }
};

module.exports = { calculateScore, getHistory, getTodayScore };
