require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

// Routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const goalRoutes = require('./routes/goals');
const financeRoutes = require('./routes/finance');
const studyRoutes = require('./routes/study');
const performanceRoutes = require('./routes/performance');
const aiRoutes = require('./routes/ai');
const careerRoutes = require('./routes/career');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Logging
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check (no auth required)
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    success: true,
    message: 'LifeOS API is running',
    database: mongoose.connection.readyState === 1 ? 'MongoDB Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/career', careerRoutes);

// 404 & Error handling
app.use(notFound);
app.use(errorHandler);

// Start server — connect to MongoDB first, then listen
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`\n🚀 LifeOS API Server running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔐 JWT Enabled | 🍃 MongoDB Atlas Connected\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
