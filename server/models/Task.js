const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [255, 'Title too long'],
    },
    description: {
      type: String,
      default: null,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'completed', 'archived'],
      default: 'todo',
      index: true,
    },
    deadline: {
      type: Date,
      default: null,
    },
    completed_at: {
      type: Date,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Priority sort order helper
const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

// Static methods mirroring the previous SQL model API
taskSchema.statics.findAll = async function (userId, filters = {}) {
  const query = { user: userId };

  if (filters.status && filters.status !== 'all') query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.overdue) {
    query.deadline = { $lt: new Date() };
    query.status = { $ne: 'completed' };
  }
  if (filters.search) {
    query.title = { $regex: filters.search, $options: 'i' };
  }

  const tasks = await this.find(query).lean();

  // Sort by priority then deadline
  return tasks.sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority] ?? 3;
    const pb = PRIORITY_ORDER[b.priority] ?? 3;
    if (pa !== pb) return pa - pb;
    if (a.deadline && b.deadline) return new Date(a.deadline) - new Date(b.deadline);
    return 0;
  });
};

taskSchema.statics.getTodayStats = async function (userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [total, completed, overdue, completedToday] = await Promise.all([
    this.countDocuments({ user: userId }),
    this.countDocuments({ user: userId, status: 'completed' }),
    this.countDocuments({
      user: userId,
      deadline: { $lt: new Date() },
      status: { $ne: 'completed' },
    }),
    this.countDocuments({
      user: userId,
      completed_at: { $gte: today, $lt: tomorrow },
    }),
  ]);

  return { total, completed, overdue, completed_today: completedToday };
};

module.exports = mongoose.model('Task', taskSchema);
