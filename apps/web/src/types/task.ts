export type TaskStatus = "brain_dump" | "important" | "today" | "completed";

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
};
