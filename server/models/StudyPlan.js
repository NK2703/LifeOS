const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
    },
    scheduled_date: {
      type: Date,
      required: true,
      index: true,
    },
    start_time: { type: String, default: null }, // "HH:MM" string
    duration_minutes: { type: Number, default: 60, min: 15 },
    actual_duration: { type: Number, default: null },
    completed: { type: Boolean, default: false },
    notes: { type: String, default: null },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  { timestamps: true }
);

studyPlanSchema.statics.getWeeklyStats = async function (userId) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  return this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        scheduled_date: { $gte: weekAgo },
      },
    },
    {
      $group: {
        _id: '$subject',
        sessions: { $sum: 1 },
        completed_sessions: { $sum: { $cond: ['$completed', 1, 0] } },
        total_minutes: {
          $sum: {
            $cond: [
              '$actual_duration',
              '$actual_duration',
              '$duration_minutes',
            ],
          },
        },
      },
    },
    {
      $project: {
        subject: '$_id',
        sessions: 1,
        completed_sessions: 1,
        total_minutes: 1,
        _id: 0,
      },
    },
    { $sort: { total_minutes: -1 } },
  ]);
};

studyPlanSchema.statics.getTodayHours = async function (userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const result = await this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        scheduled_date: { $gte: today, $lt: tomorrow },
      },
    },
    {
      $group: {
        _id: null,
        hours: {
          $sum: {
            $cond: [
              '$completed',
              {
                $divide: [
                  { $ifNull: ['$actual_duration', '$duration_minutes'] },
                  60,
                ],
              },
              0,
            ],
          },
        },
      },
    },
  ]);

  return result[0]?.hours || 0;
};

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
