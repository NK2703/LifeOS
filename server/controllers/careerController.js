const CareerPath = require('../models/CareerPath');
const CareerExpense = require('../models/CareerExpense');
const Roadmap = require('../models/Roadmap');
const STATIC_ROADMAPS = require('../data/roadmaps');


// ── Career Progress ───────────────────────────────────────────────────────────

/**
 * GET /api/career
 * Returns the user's career doc (upserts on first visit).
 */
const getCareer = async (req, res, next) => {
  try {
    let career = await CareerPath.findOne({ user: req.user._id });

    if (!career) {
      career = await CareerPath.create({ user: req.user._id });
    } else {
      career.lastVisited = new Date();
      await career.save();
    }

    // Attach expense summary
    const [totalSpent, byCategory] = await Promise.all([
      CareerExpense.getTotalByUser(req.user._id),
      CareerExpense.getByCategory(req.user._id),
    ]);

    res.json({
      success: true,
      data: {
        career,
        expenses: { totalSpent, byCategory },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/career/position
 * Saves the user's current scroll position and unlocked milestones.
 */
const updatePosition = async (req, res, next) => {
  try {
    const { scrollPosition, unlockedMilestones, chosenPath } = req.body;

    const career = await CareerPath.findOneAndUpdate(
      { user: req.user._id },
      {
        ...(scrollPosition !== undefined && { scrollPosition }),
        ...(unlockedMilestones && { unlockedMilestones }),
        ...(chosenPath && { chosenPath }),
        lastVisited: new Date(),
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, data: { career } });
  } catch (err) {
    next(err);
  }
};

// ── Roadmap ──────────────────────────────────────────────────────────────────

/**
 * GET /api/career/roadmap/:degreeKey
 * Returns milestone array for the given degree.
 * Auto-seeds from static data if the degree isn't in MongoDB yet.
 */
const getRoadmap = async (req, res, next) => {
  try {
    const { degreeKey } = req.params;
    const staticData = STATIC_ROADMAPS[degreeKey];

    if (!staticData) {
      return res.status(404).json({
        success: false,
        message: `No roadmap found for degree: ${degreeKey}`,
      });
    }

    // Upsert — seed on first access, return existing on subsequent calls
    const roadmap = await Roadmap.findOneAndUpdate(
      { degreeKey },
      { $setOnInsert: { degreeKey, milestones: staticData } },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      data: { degreeKey, milestones: roadmap.milestones },
    });
  } catch (err) {
    next(err);
  }
};



/**
 * POST /api/career/todos
 */
const addTodo = async (req, res, next) => {
  try {
    const { text, priority } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ success: false, message: 'Todo text is required.' });
    }

    const career = await CareerPath.findOneAndUpdate(
      { user: req.user._id },
      { $push: { todos: { text: text.trim(), priority: priority || 'medium' } } },
      { new: true, upsert: true }
    );

    res.status(201).json({ success: true, data: { todos: career.todos } });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/career/todos/:todoId
 */
const updateTodo = async (req, res, next) => {
  try {
    const { done, text, priority } = req.body;
    const career = await CareerPath.findOne({ user: req.user._id });
    if (!career) return res.status(404).json({ success: false, message: 'Career not found.' });

    const todo = career.todos.id(req.params.todoId);
    if (!todo) return res.status(404).json({ success: false, message: 'Todo not found.' });

    if (done !== undefined) todo.done = done;
    if (text) todo.text = text.trim();
    if (priority) todo.priority = priority;

    await career.save();
    res.json({ success: true, data: { todos: career.todos } });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/career/todos/:todoId
 */
const deleteTodo = async (req, res, next) => {
  try {
    const career = await CareerPath.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { todos: { _id: req.params.todoId } } },
      { new: true }
    );
    res.json({ success: true, data: { todos: career?.todos ?? [] } });
  } catch (err) {
    next(err);
  }
};

// ── Expenses ──────────────────────────────────────────────────────────────────

/**
 * GET /api/career/expenses
 */
const getExpenses = async (req, res, next) => {
  try {
    const [expenses, totalSpent, byCategory] = await Promise.all([
      CareerExpense.find({ user: req.user._id }).sort({ date: -1 }).limit(50),
      CareerExpense.getTotalByUser(req.user._id),
      CareerExpense.getByCategory(req.user._id),
    ]);

    res.json({ success: true, data: { expenses, totalSpent, byCategory } });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/career/expenses
 */
const addExpense = async (req, res, next) => {
  try {
    const { category, amount, note, date } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required.' });
    }

    const expense = await CareerExpense.create({
      user: req.user._id,
      category: category || 'Miscellaneous',
      amount,
      note: note || '',
      date: date ? new Date(date) : new Date(),
    });

    const [totalSpent, byCategory] = await Promise.all([
      CareerExpense.getTotalByUser(req.user._id),
      CareerExpense.getByCategory(req.user._id),
    ]);

    res.status(201).json({ success: true, data: { expense, totalSpent, byCategory } });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/career/expenses/:id
 */
const deleteExpense = async (req, res, next) => {
  try {
    await CareerExpense.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    const [totalSpent, byCategory] = await Promise.all([
      CareerExpense.getTotalByUser(req.user._id),
      CareerExpense.getByCategory(req.user._id),
    ]);

    res.json({ success: true, data: { totalSpent, byCategory } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCareer,
  updatePosition,
  getRoadmap,
  addTodo,
  updateTodo,
  deleteTodo,
  getExpenses,
  addExpense,
  deleteExpense,
};

