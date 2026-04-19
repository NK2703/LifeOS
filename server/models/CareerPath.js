const mongoose = require('mongoose');

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const todoSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 300 },
    done: { type: Boolean, default: false },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  { timestamps: true, _id: true }
);

// ── Main Schema ───────────────────────────────────────────────────────────────

const careerPathSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one career doc per user
      index: true,
    },

    // 0–1 normalised scroll depth (where the character is on the road)
    scrollPosition: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },

    // Which high-level career track the user selected
    chosenPath: {
      type: String,
      enum: [
        // Commerce / Finance
        'B.Com',
        'BBA',
        // Technology
        'B.Tech',
        'BSc',
        // Arts / Humanities
        'BA',
        'BFA',
        'LLB',
        // Architecture
        'B.Arch',
        // Medical / Science
        'MBBS',
        'BSc Agriculture',
        // Legacy (kept for backward compat)
        'Accountant',
        'CFA',
        'Banker',
        'CA',
        'MBA Finance',
        'Tax Consultant',
        'Financial Analyst',
        'Unselected',
      ],
      default: 'Unselected',
    },

    // Array of milestone labels the character has passed
    unlockedMilestones: {
      type: [String],
      default: [],
    },

    // Embedded to-do list for the career journey
    todos: {
      type: [todoSchema],
      default: [],
    },

    lastVisited: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CareerPath', careerPathSchema);
