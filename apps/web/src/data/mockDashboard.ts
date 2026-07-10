import type { DashboardStats } from "../types/dashboard";
export const mockDashboardStats: DashboardStats = {
  completedTasks: 18,
  pendingTasks: 7,
  totalFlowPercentage: 5,
  activeDays: 5,
  inactiveDays: 2,
  weeklyActivity: [
    {
      day: "Lun",
      completedTasks: 4,
      pendingTasks: 1,
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
  ],
  mainObjective: {
    title: "Terminar la pantalla inicial de Task Rain",
    progress: 65,
    completedTasks: 4,
    totalTasks: 6,
  },
};
