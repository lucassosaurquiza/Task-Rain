import type { DashboardStats, WeeklyActivity } from "../types/dashboard";
import {
  calculateActiveDays,
  calculateCompletedTasks,
  calculateFlowPercentage,
  calculateInactiveDays,
  calculatePendingTasks,
} from "../utils/dashboardStats";

const weeklyActivity: WeeklyActivity[] = [
  {
    day: "Lun",
    completedTasks: 4,
    pendingTasks: 1,
    hasActivity: true,
  },
  {
    day: "Mar",
    completedTasks: 3,
    pendingTasks: 2,
    hasActivity: true,
  },
  {
    day: "Mié",
    completedTasks: 0,
    pendingTasks: 0,
    hasActivity: false,
  },
  {
    day: "Jue",
    completedTasks: 5,
    pendingTasks: 1,
    hasActivity: true,
  },
  {
    day: "Vie",
    completedTasks: 2,
    pendingTasks: 3,
    hasActivity: true,
  },
  {
    day: "Sáb",
    completedTasks: 0,
    pendingTasks: 0,
    hasActivity: false,
  },
  {
    day: "Dom",
    completedTasks: 4,
    pendingTasks: 0,
    hasActivity: true,
  },
];

export const mockDashboardStats: DashboardStats = {
  completedTasks: calculateCompletedTasks(weeklyActivity),
  pendingTasks: calculatePendingTasks(weeklyActivity),
  totalFlowPercentage: calculateFlowPercentage(weeklyActivity),
  activeDays: calculateActiveDays(weeklyActivity),
  inactiveDays: calculateInactiveDays(weeklyActivity),
  weeklyActivity,
  mainObjective: {
    title: "Terminar la pantalla inicial de Task Rain",
    progress: 65,
    completedTasks: 4,
    totalTasks: 6,
  },
};
