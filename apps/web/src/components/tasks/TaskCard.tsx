import type { DragEvent } from "react";
import type { Task, TaskStatus } from "../../types/task";

type TaskCardProps = {
  task: Task;
  showCompletionControl: boolean;
  isDragging: boolean;
  onChangeStatus: (taskId: string, status: TaskStatus) => void;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
};

function TaskCard({
  task,
  showCompletionControl,
  isDragging,
  onChangeStatus,
  onDragStart,
  onDragEnd,
}: TaskCardProps) {
  const isCompleted = task.status === "completed";
  const isToday = task.status === "today";

  function handleDragStart(event: DragEvent<HTMLElement>) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", task.id);
    onDragStart(task.id);
  }

  return (
    <article
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      className={`task-card-enter cursor-grab rounded-md border border-zinc-800 bg-zinc-950 p-4 transition active:cursor-grabbing ${
        isDragging ? "task-card-dragging" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {showCompletionControl && (isToday || isCompleted) ? (
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={() =>
              onChangeStatus(task.id, isCompleted ? "today" : "completed")
            }
            className="mt-1 size-4 rounded border-zinc-700 bg-zinc-900 accent-emerald-400"
          />
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
          <p
            className={
              isCompleted
                ? "text-sm text-zinc-500 line-through"
                : "text-sm text-zinc-100"
            }
          >
            {task.title}
          </p>
            <span
              className="select-none text-base leading-none text-zinc-600"
              title="Arrastrar tarea"
              aria-hidden="true"
            >
              ⠿
            </span>
          </div>

        </div>
      </div>
    </article>
  );
}

export default TaskCard;
