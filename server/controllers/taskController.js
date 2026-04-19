const Task = require('../models/Task');

// GET /api/tasks
const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.findAll(req.user._id, {
      status: req.query.status,
      priority: req.query.priority,
      search: req.query.search,
      overdue: req.query.overdue === 'true',
    });
    res.json({ success: true, data: { tasks, total: tasks.length } });
  } catch (err) { next(err); }
};

// GET /api/tasks/stats
const getTaskStats = async (req, res, next) => {
  try {
    const stats = await Task.getTodayStats(req.user._id);
    res.json({ success: true, data: { stats } });
  } catch (err) { next(err); }
};

// GET /api/tasks/:id
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id }).lean();
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    res.json({ success: true, data: { task } });
  } catch (err) { next(err); }
};

// POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    if (!req.body.title) return res.status(400).json({ success: false, message: 'Title is required.' });

    const { title, description, priority, status, deadline, tags } = req.body;
    const task = await Task.create({
      user: req.user._id,
      title,
      description: description || null,
      priority: priority || 'medium',
      status: status || 'todo',
      deadline: deadline || null,
      tags: tags || [],
    });

    res.status(201).json({ success: true, message: 'Task created.', data: { task } });
  } catch (err) { next(err); }
};

// PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const updates = { ...req.body };

    // Auto-set completed_at timestamp
    if (updates.status === 'completed') {
      updates.completed_at = new Date();
    } else if (updates.status && updates.status !== 'completed') {
      updates.completed_at = null;
    }

    // Remove protected fields
    delete updates.user;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    res.json({ success: true, message: 'Task updated.', data: { task } });
  } catch (err) { next(err); }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    res.json({ success: true, message: 'Task deleted.' });
  } catch (err) { next(err); }
};

module.exports = { getTasks, getTask, getTaskStats, createTask, updateTask, deleteTask };
