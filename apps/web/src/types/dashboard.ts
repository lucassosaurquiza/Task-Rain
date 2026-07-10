export type WeeklyActivity = {
  day: string;
  completedTasks: number;
  pendingTasks: number;
  hasActivity: boolean;
};

export type MainObjective = {
  title: string;
  progress: number;
  completedTasks: number;
  totalTasks: number;
};

export type DashboardStats = {
  completedTasks: number;
  pendingTasks: number;
  totalFlowPercentage: number;
  activeDays: number;
  inactiveDays: number;
  weeklyActivity: WeeklyActivity[];
  mainObjective: MainObjective;
};
