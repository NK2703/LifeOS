const mongoose = require('mongoose');

const financeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount must be positive'],
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: { type: String, default: null },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    recurring: { type: Boolean, default: false },
    recurring_interval: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly', null],
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index for efficient user + date queries
financeSchema.index({ user: 1, date: -1 });

financeSchema.statics.getMonthlySummary = async function (userId, year, month) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  return this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: start, $lt: end },
      },
    },
    {
      $group: {
        _id: { type: '$type', category: '$category' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        type: '$_id.type',
        category: '$_id.category',
        total: 1,
        count: 1,
        _id: 0,
      },
    },
    { $sort: { total: -1 } },
  ]);
};

financeSchema.statics.getMonthlyTotals = async function (userId, months = 6) {
  const since = new Date();
  since.setMonth(since.getMonth() - months);

  return this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: since },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
        },
        income: {
          $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
        },
        expense: {
          $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
        },
        transactions: { $sum: 1 },
      },
    },
    {
      $project: {
        month: {
          $concat: [
            { $toString: '$_id.year' },
            '-',
            {
              $cond: [
                { $lt: ['$_id.month', 10] },
                { $concat: ['0', { $toString: '$_id.month' }] },
                { $toString: '$_id.month' },
              ],
            },
          ],
        },
        income: 1,
        expense: 1,
        transactions: 1,
        _id: 0,
      },
    },
    { $sort: { month: 1 } },
  ]);
};

financeSchema.statics.getTodayCount = async function (userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return this.countDocuments({ user: userId, date: { $gte: today, $lt: tomorrow } });
};

module.exports = mongoose.model('Finance', financeSchema);
