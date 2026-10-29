export type WeeklyCommitment = {
  id: string;
  taskId: string;
  objectiveId: string;
  weekId: string;
  addedAt: string;
  completedAt: string | null;
  withdrawnAt: string | null;
};
