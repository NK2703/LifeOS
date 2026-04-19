const mongoose = require('mongoose');

/**
 * Roadmap — caches career milestone arrays per degree key.
 * Seeded automatically from server/data/roadmaps.js on first GET request.
 */

const milestoneSchema = new mongoose.Schema(
  {
    label:   { type: String, required: true },
    t:       { type: Number, required: true, min: 0, max: 1 },
    color:   { type: String, default: '#a78bfa' },
    subtext: { type: String, default: '' },
  },
  { _id: false }
);

const roadmapSchema = new mongoose.Schema(
  {
    degreeKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    milestones: {
      type: [milestoneSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Roadmap', roadmapSchema);
