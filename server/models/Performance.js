const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    tasks_score: { type: Number, default: 0 },
    goals_score: { type: Number, default: 0 },
    study_score: { type: Number, default: 0 },
    finance_score: { type: Number, default: 0 },
    total_score: { type: Number, default: 0 },
    breakdown: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// One score document per user per day
performanceSchema.index({ user: 1, date: 1 }, { unique: true });

performanceSchema.statics.upsert = async function (userId, date, scores) {
  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);

  const doc = await this.findOneAndUpdate(
    { user: userId, date: dateOnly },
    {
      tasks_score: scores.tasksScore,
      goals_score: scores.goalsScore,
      study_score: scores.studyScore,
      finance_score: scores.financeScore,
      total_score: scores.totalScore,
      breakdown: scores.breakdown,
    },
    { upsert: true, new: true, runValidators: true }
  );
  return doc;
};

performanceSchema.statics.getHistory = async function (userId, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  return this.find({ user: userId, date: { $gte: since } })
    .sort({ date: 1 })
    .lean();
};

performanceSchema.statics.getStreak = async function (userId) {
  const records = await this.find({ user: userId, total_score: { $gt: 0 } })
    .sort({ date: -1 })
    .limit(60)
    .lean();

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const record of records) {
    const rowDate = new Date(record.date);
    rowDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round((currentDate - rowDate) / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) {
      streak++;
      currentDate = rowDate;
    } else {
      break;
    }
  }
  return streak;
};

performanceSchema.statics.findOrCreate = async function (userId, date) {
  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);

  const existing = await this.findOne({ user: userId, date: dateOnly }).lean();
  if (existing) return existing;

  const doc = await this.create({ user: userId, date: dateOnly });
  return doc.toObject();
};

module.exports = mongoose.model('Performance', performanceSchema);
