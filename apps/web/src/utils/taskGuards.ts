import type { Task, TaskStatus } from "../types/task";

const validTaskStatuses: TaskStatus[] = [
  "brain_dump",
  "important",
  "today",
  "completed",
];

function isTaskStatus(value: unknown): value is TaskStatus {
  return (
    typeof value === "string" && validTaskStatuses.includes(value as TaskStatus)
  );
}

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== "object") {
    return false;
  }

  const task = value as Partial<Task>;

  return (
    typeof task.id === "string" &&
    typeof task.title === "string" &&
    isTaskStatus(task.status) &&
    typeof task.createdAt === "string" &&
    (task.completedAt === undefined || typeof task.completedAt === "string")
  );
}

export function isTaskArray(value: unknown): value is Task[] {
  return Array.isArray(value) && value.every(isTask);
}
