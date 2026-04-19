# LifeOS — Personal Life Management Dashboard (MongoDB Edition)

A production-grade full-stack web app with Task Management, Goal Tracking, Study Planner, Finance Tracker, Performance Scoring, and AI Recommendations.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MySQL Server

### 1. Configure Database

Update `server/.env` with your MySQL credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lifeos_db
```

### 2. Create MySQL Database
```sql
CREATE DATABASE lifeos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Install Dependencies
```bash
# Install root (concurrently)
npm install

# Install backend
cd server && npm install

# Install frontend
cd ../client && npm install
```

### 4. Start Development
```bash
# Run both server + client
npm run dev

# Or separately:
npm run dev:server   # Backend → http://localhost:5000
npm run dev:client   # Frontend → http://localhost:5173
```

## 📁 Project Structure

```
LifeOS/
├── server/                    # Node.js + Express Backend
│   ├── config/db.js           # MySQL pool + schema init
│   ├── controllers/           # Business logic handlers
│   ├── models/                # Database query abstraction
│   ├── routes/                # Express route definitions
│   ├── middlewares/           # JWT auth + error handler
│   ├── utils/
│   │   ├── scoreCalculator.js # Performance scoring formula
│   │   └── aiEngine.js        # Rule-based AI engine
│   └── server.js              # Express app entry point
│
└── client/                    # React + Vite Frontend
    └── src/
        ├── animations/        # Framer Motion variants
        ├── components/        # Reusable UI components
        ├── features/          # Redux slices
        ├── pages/             # Full page components
        ├── services/          # Axios API calls
        ├── App.jsx            # Routes + layout
        └── main.jsx           # React entry point
```

## 🔌 API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login and get JWT
- `GET /api/auth/me` — Get current user profile

### Tasks
- `GET /api/tasks` — Get all tasks (supports ?status=, ?priority=, ?search=)
- `POST /api/tasks` — Create task
- `PUT /api/tasks/:id` — Update task
- `DELETE /api/tasks/:id` — Delete task
- `GET /api/tasks/stats` — Today's task statistics

### Goals
- `GET /api/goals` — Get all goals
- `POST /api/goals` — Create goal
- `PUT /api/goals/:id` — Update goal (including progress)
- `DELETE /api/goals/:id` — Delete goal

### Finance
- `GET /api/finance` — Get records (supports filters)
- `POST /api/finance` — Add income/expense
- `GET /api/finance/summary` — Monthly summary + 6-month trends
- `DELETE /api/finance/:id` — Delete record

### Study
- `GET /api/study` — Get study plans
- `POST /api/study` — Create session
- `PUT /api/study/:id` — Update/complete session
- `GET /api/study/stats` — Weekly subject stats

### Performance
- `GET /api/performance/today` — Today's score
- `POST /api/performance/calculate` — Recalculate score
- `GET /api/performance/history?days=30` — Score history

### AI
- `GET /api/ai/recommendations` — Get personalized recommendations

## 🧪 Performance Score Formula

```
Total Score = 
  (tasks_completed / tasks_total) × 40  +  // Task completion (40 pts max)
  (avg_goal_progress / 100) × 25         +  // Goal progress (25 pts max)
  (study_hours / target_hours) × 25      +  // Study time (25 pts max)
  min(finance_entries × 3.33, 10)        -  // Finance logging (10 pts max)
  (overdue_tasks × 5)                    -  // Penalties
  (missed_deadlines × 2)                    // More penalties
```

**Grades:** S (90+) | A (75+) | B (60+) | C (45+) | D (30+) | F (<30)
