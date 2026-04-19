/**
 * Performance Score Calculator
 * 
 * Formula:
 * Total = (tasks_weight * 40) + (goals_weight * 25) + (study_weight * 25) + (finance_weight * 10) - penalties
 * 
 * Max Score: 100 | Min Score: 0
 */

const calculateDailyScore = ({
  tasksCompleted = 0,
  tasksTotal = 0,
  goalsProgressToday = 0,
  studyHoursToday = 0,
  targetStudyHours = 4,
  financeEntriesLogged = 0,
  missedDeadlines = 0,
  overdueTasksCount = 0,
}) => {
  // --- Task Score (40 points max) ---
  const taskRatio = tasksTotal > 0 ? Math.min(tasksCompleted / tasksTotal, 1) : 0;
  const tasksScore = Math.round(taskRatio * 40 * 100) / 100;

  // --- Goals Score (25 points max) ---
  // goalsProgressToday = avg progress increment today (0-100 scale)
  const goalsScore = Math.round(Math.min(goalsProgressToday / 100, 1) * 25 * 100) / 100;

  // --- Study Score (25 points max) ---
  const studyRatio = targetStudyHours > 0
    ? Math.min(studyHoursToday / targetStudyHours, 1)
    : 0;
  const studyScore = Math.round(studyRatio * 25 * 100) / 100;

  // --- Finance Score (10 points max) ---
  // Award points for logging at least 1 finance entry today
  const financeScore = financeEntriesLogged > 0
    ? Math.min(financeEntriesLogged * 3.33, 10)
    : 0;

  // --- Penalties ---
  const missedDeadlinePenalty = missedDeadlines * 5;
  const overduePenalty = overdueTasksCount * 2;
  const totalPenalty = missedDeadlinePenalty + overduePenalty;

  // --- Total ---
  const rawTotal = tasksScore + goalsScore + studyScore + financeScore - totalPenalty;
  const totalScore = Math.max(0, Math.min(100, Math.round(rawTotal * 100) / 100));

  const breakdown = {
    tasks: { score: tasksScore, weight: '40%', detail: `${tasksCompleted}/${tasksTotal} tasks` },
    goals: { score: goalsScore, weight: '25%', detail: `${goalsProgressToday.toFixed(1)}% avg progress` },
    study: { score: studyScore, weight: '25%', detail: `${studyHoursToday}h / ${targetStudyHours}h target` },
    finance: { score: Math.round(financeScore * 100) / 100, weight: '10%', detail: `${financeEntriesLogged} entries logged` },
    penalties: {
      total: totalPenalty,
      missedDeadlines: missedDeadlinePenalty,
      overdue: overduePenalty,
    },
  };

  return {
    tasksScore,
    goalsScore,
    studyScore,
    financeScore: Math.round(financeScore * 100) / 100,
    totalScore,
    breakdown,
  };
};

const getScoreGrade = (score) => {
  if (score >= 90) return { grade: 'S', label: 'Exceptional', color: '#FFD700' };
  if (score >= 75) return { grade: 'A', label: 'Excellent', color: '#00D4AA' };
  if (score >= 60) return { grade: 'B', label: 'Good', color: '#4FACFE' };
  if (score >= 45) return { grade: 'C', label: 'Average', color: '#F7971E' };
  if (score >= 30) return { grade: 'D', label: 'Below Average', color: '#FF6B6B' };
  return { grade: 'F', label: 'Poor', color: '#FF0000' };
};

module.exports = { calculateDailyScore, getScoreGrade };
