const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email: email.toLowerCase(), password_hash });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        user: { id: user._id, name: user.name, email: user.email },
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Must explicitly select password_hash since it's select: false
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password_hash');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = generateToken(user._id);
    const safeUser = user.toJSON(); // strips password_hash via toJSON override

    res.json({
      success: true,
      message: 'Login successful.',
      data: { user: safeUser, token },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getProfile = async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
};

// PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar_url, preferences } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (avatar_url) updates.avatar_url = avatar_url;
    if (preferences) updates.preferences = { ...req.user.preferences, ...preferences };

    const updated = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, data: { user: updated } });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getProfile, updateProfile };
