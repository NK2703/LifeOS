/**
 * AI Recommendation Engine (Rule-Based + ML-Ready Structure)
 * 
 * Analyzes user behavior patterns and generates actionable recommendations.
 * Designed to be extended with ML models (TensorFlow.js, Python microservice, etc.)
 */

const generateRecommendations = ({
  tasks = [],
  goals = [],
  studyPlans = [],
  financeRecords = [],
  performanceHistory = [],
  todayScore = null,
}) => {
  const recommendations = [];
  const insights = {};

  // ============================================
  // TASK ANALYSIS
  // ============================================
  const pendingTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'archived');
  const criticalTasks = pendingTasks.filter(t => t.priority === 'critical');
  const highPriorityTasks = pendingTasks.filter(t => t.priority === 'high');
  const overdueTasks = pendingTasks.filter(t => t.deadline && new Date(t.deadline) < new Date());
  const completedToday = tasks.filter(t => {
    if (!t.completed_at) return false;
    const today = new Date().toDateString();
    return new Date(t.completed_at).toDateString() === today;
  });

  const completionRate = tasks.length > 0
    ? (tasks.filter(t => t.status === 'completed').length / tasks.length)
    : 0;

  insights.taskCompletionRate = Math.round(completionRate * 100);

  if (overdueTasks.length > 0) {
    recommendations.push({
      type: 'task',
      priority: 'critical',
      icon: '🚨',
      title: 'Overdue Tasks Require Immediate Attention',
      message: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}. Address "${overdueTasks[0].title}" first to stop the penalty cascade.`,
      action: 'View Overdue Tasks',
      actionRoute: '/tasks?filter=overdue',
    });
  }

  if (criticalTasks.length > 0) {
    recommendations.push({
      type: 'task',
      priority: 'high',
      icon: '⚡',
      title: 'Critical Tasks Need Your Focus',
      message: `"${criticalTasks[0].title}" is marked critical. Block 90 minutes today to make progress.`,
      action: 'Start Task',
      actionRoute: `/tasks?id=${criticalTasks[0].id}`,
    });
  }

  if (completionRate < 0.5 && tasks.length > 5) {
    recommendations.push({
      type: 'task',
      priority: 'medium',
      icon: '📋',
      title: 'Task Completion Rate is Low',
      message: `Only ${Math.round(completionRate * 100)}% of your tasks are complete. Consider breaking large tasks into smaller steps or rescheduling less critical ones.`,
      action: 'Review Tasks',
      actionRoute: '/tasks',
    });
  }

  if (pendingTasks.length > 20) {
    recommendations.push({
      type: 'task',
      priority: 'medium',
      icon: '🔄',
      title: 'Task Overload Detected',
      message: `You have ${pendingTasks.length} pending tasks. Use the Eisenhower Matrix — delegate or archive tasks that aren't urgent and not important.`,
      action: 'Manage Tasks',
      actionRoute: '/tasks',
    });
  }

  // ============================================
  // GOAL ANALYSIS
  // ============================================
  const activeGoals = goals.filter(g => g.status === 'active');
  const stagnantGoals = activeGoals.filter(g => {
    return g.progress < 10 && g.created_at &&
      (new Date() - new Date(g.created_at)) > 7 * 24 * 60 * 60 * 1000;
  });

  const nearDeadlineGoals = activeGoals.filter(g => {
    if (!g.target_date) return false;
    const daysLeft = Math.ceil((new Date(g.target_date) - new Date()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 7 && daysLeft > 0 && g.progress < 80;
  });

  if (stagnantGoals.length > 0) {
    recommendations.push({
      type: 'goal',
      priority: 'high',
      icon: '🎯',
      title: 'Goals Showing No Progress',
      message: `"${stagnantGoals[0].title}" hasn't progressed in over a week. Add a milestone today or break it into sub-tasks.`,
      action: 'Update Goal',
      actionRoute: `/goals?id=${stagnantGoals[0].id}`,
    });
  }

  if (nearDeadlineGoals.length > 0) {
    recommendations.push({
      type: 'goal',
      priority: 'critical',
      icon: '⏰',
      title: 'Goal Deadline Approaching',
      message: `"${nearDeadlineGoals[0].title}" is due in 7 days but only ${nearDeadlineGoals[0].progress}% complete. Dedicate focused time today.`,
      action: 'View Goal',
      actionRoute: `/goals?id=${nearDeadlineGoals[0].id}`,
    });
  }

  // ============================================
  // STUDY ANALYSIS
  // ============================================
  const last7Days = studyPlans.filter(s => {
    const daysDiff = Math.ceil((new Date() - new Date(s.scheduled_date)) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7;
  });

  const completedSessions = last7Days.filter(s => s.completed);
  const weeklyStudyHours = completedSessions.reduce((sum, s) => sum + (s.actual_duration || s.duration_minutes) / 60, 0);

  const subjectFrequency = {};
  last7Days.forEach(s => {
    subjectFrequency[s.subject] = (subjectFrequency[s.subject] || 0) + 1;
  });

  const leastStudiedSubject = Object.entries(subjectFrequency)
    .sort(([, a], [, b]) => a - b)[0]?.[0];

  insights.weeklyStudyHours = Math.round(weeklyStudyHours * 10) / 10;

  if (completedSessions.length < 3) {
    recommendations.push({
      type: 'study',
      priority: 'high',
      icon: '📚',
      title: 'Study Consistency Needs Improvement',
      message: `You've only completed ${completedSessions.length} study sessions this week. Aim for at least 5 sessions. Schedule tomorrow's session now.`,
      action: 'Add Study Block',
      actionRoute: '/study?action=add',
    });
  }

  if (leastStudiedSubject) {
    recommendations.push({
      type: 'study',
      priority: 'medium',
      icon: '🔬',
      title: `Focus More on ${leastStudiedSubject}`,
      message: `${leastStudiedSubject} has the fewest study sessions this week. Allocate 2 extra hours to maintain balance.`,
      action: 'Schedule Session',
      actionRoute: '/study?action=add',
    });
  }

  // ============================================
  // FINANCE ANALYSIS
  // ============================================
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyRecords = financeRecords.filter(r => {
    const d = new Date(r.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const monthlyIncome = monthlyRecords
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + parseFloat(r.amount), 0);

  const monthlyExpense = monthlyRecords
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + parseFloat(r.amount), 0);

  const expenseRatio = monthlyIncome > 0 ? monthlyExpense / monthlyIncome : 0;

  insights.expenseRatio = Math.round(expenseRatio * 100);
  insights.monthlySavings = Math.round((monthlyIncome - monthlyExpense) * 100) / 100;

  if (expenseRatio > 0.9) {
    recommendations.push({
      type: 'finance',
      priority: 'critical',
      icon: '💸',
      title: 'Spending Alert: 90%+ of Income Used',
      message: `You've spent ${Math.round(expenseRatio * 100)}% of your income this month. Cut discretionary spending immediately to avoid month-end deficit.`,
      action: 'View Finance',
      actionRoute: '/finance',
    });
  } else if (expenseRatio > 0.75) {
    recommendations.push({
      type: 'finance',
      priority: 'high',
      icon: '💰',
      title: 'High Expense Ratio Detected',
      message: `You've spent ${Math.round(expenseRatio * 100)}% of this month's income. Consider the 50/30/20 rule: 50% needs, 30% wants, 20% savings.`,
      action: 'Analyze Spending',
      actionRoute: '/finance',
    });
  }

  // Category analysis
  const expenseByCategory = {};
  monthlyRecords.filter(r => r.type === 'expense').forEach(r => {
    expenseByCategory[r.category] = (expenseByCategory[r.category] || 0) + parseFloat(r.amount);
  });

  const topCategory = Object.entries(expenseByCategory)
    .sort(([, a], [, b]) => b - a)[0];

  if (topCategory && topCategory[1] > monthlyIncome * 0.4) {
    recommendations.push({
      type: 'finance',
      priority: 'medium',
      icon: '📊',
      title: `High Spending in ${topCategory[0]}`,
      message: `${topCategory[0]} accounts for ₹${topCategory[1].toFixed(0)} (${Math.round(topCategory[1] / monthlyIncome * 100)}% of income). Review and set a budget cap.`,
      action: 'Set Budget',
      actionRoute: '/finance?tab=budget',
    });
  }

  // ============================================
  // PERFORMANCE TREND ANALYSIS
  // ============================================
  if (performanceHistory.length >= 3) {
    const recentScores = performanceHistory.slice(-7).map(p => p.total_score);
    const avgScore = recentScores.reduce((s, v) => s + v, 0) / recentScores.length;
    const trend = recentScores[recentScores.length - 1] - recentScores[0];

    insights.weeklyAvgScore = Math.round(avgScore * 10) / 10;
    insights.scoreTrend = trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable';

    if (trend < -10) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        icon: '📉',
        title: 'Performance Declining This Week',
        message: `Your score dropped by ${Math.abs(Math.round(trend))} points over the last 7 days. Review your task and study habits.`,
        action: 'View Performance',
        actionRoute: '/performance',
      });
    } else if (trend > 10) {
      recommendations.push({
        type: 'performance',
        priority: 'low',
        icon: '📈',
        title: 'Great Progress This Week!',
        message: `Your score improved by ${Math.round(trend)} points. Keep the momentum going by maintaining your current routine.`,
        action: 'View Stats',
        actionRoute: '/performance',
      });
    }
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return {
    recommendations: recommendations.slice(0, 8), // Top 8 recommendations
    insights,
    generatedAt: new Date().toISOString(),
  };
};

module.exports = { generateRecommendations };
