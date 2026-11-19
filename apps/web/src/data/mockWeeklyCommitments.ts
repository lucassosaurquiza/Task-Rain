import type { WeeklyCommitment } from "../types/weeklyCommitment";
import { mockWeek } from "./mockWeek";

export const mockWeeklyCommitments: WeeklyCommitment[] = [
  {
    id: "commitment-1",
    taskId: "task-2",
    objectiveId: "objective-portfolio",
    weekId: mockWeek.id,
    addedAt: "2026-10-26T13:00:00.000Z",
    completedAt: null,
    withdrawnAt: null,
  },
];
