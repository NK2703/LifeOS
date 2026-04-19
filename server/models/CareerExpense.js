const mongoose = require('mongoose');

const careerExpenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        'Course Fee',
        'Exam Fee',
        'Books & Materials',
        'Coaching',
        'Transport',
        'Software Tools',
        'Certification',
        'Miscellaneous',
      ],
      default: 'Miscellaneous',
    },

    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount must be positive'],
    },

    note: {
      type: String,
      default: '',
      trim: true,
      maxlength: 300,
    },

    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index: efficient per-user date-range queries
careerExpenseSchema.index({ user: 1, date: -1 });

// ── Statics ──────────────────────────────────────────────────────────────────

careerExpenseSchema.statics.getTotalByUser = async function (userId) {
  const result = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return result[0]?.total ?? 0;
};

careerExpenseSchema.statics.getByCategory = async function (userId) {
  return this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);
};

module.exports = mongoose.model('CareerExpense', careerExpenseSchema);
