const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: String,
  completed: { type: Boolean, default: false },
  target_date: Date,
}, { _id: false });

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
    },
    description: { type: String, default: null },
    type: {
      type: String,
      enum: ['short_term', 'long_term'],
      default: 'short_term',
    },
    category: {
      type: String,
      default: 'personal',
      enum: ['personal', 'career', 'health', 'education', 'finance', 'relationships', 'creative'],
    },
    target_date: { type: Date, default: null },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    milestones: { type: [milestoneSchema], default: [] },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused', 'cancelled'],
      default: 'active',
      index: true,
    },
  },
  { timestamps: true }
);

goalSchema.statics.getStats = async function (userId) {
  const [total, active, completed, avgArr] = await Promise.all([
    this.countDocuments({ user: userId }),
    this.countDocuments({ user: userId, status: 'active' }),
    this.countDocuments({ user: userId, status: 'completed' }),
    this.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, avg: { $avg: '$progress' } } },
    ]),
  ]);
  return { total, active, completed, avg_progress: avgArr[0]?.avg || 0 };
};

module.exports = mongoose.model('Goal', goalSchema);
