import type { WeeklyActivity } from "../types/dashboard";

export function calculateCompletedTasks(activity: WeeklyActivity[]) {
  return activity.reduce((total, day) => total + day.completedTasks, 0);
}

export function calculatePendingTasks(activity: WeeklyActivity[]) {
  return activity.reduce((total, day) => total + day.pendingTasks, 0);
}

export function calculateActiveDays(activity: WeeklyActivity[]) {
  return activity.filter((day) => day.hasActivity).length;
}

export function calculateInactiveDays(activity: WeeklyActivity[]) {
  return activity.filter((day) => !day.hasActivity).length;
}

export function calculateFlowPercentage(activity: WeeklyActivity[]) {
  const completedTasks = calculateCompletedTasks(activity);
  const pendingTasks = calculatePendingTasks(activity);
  const totalTasks = completedTasks + pendingTasks;
  const inactiveDays = calculateInactiveDays(activity);

  if (totalTasks === 0) {
    return 0;
  }

  const basePercentage = Math.round((completedTasks / totalTasks) * 100);
  const inactivityPenalty = inactiveDays * 5;

  return Math.max(basePercentage - inactivityPenalty, 0);
}
