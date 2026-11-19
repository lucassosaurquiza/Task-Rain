import type { DragEvent } from "react";
import type { Task, TaskStatus } from "../../types/task";
import TaskCard from "./TaskCard";

type TaskListProps = {
  status: TaskStatus;
  title: string;
  description: string;
  tasks: Task[];
  emptyMessage: string;
  showCompletionControl: boolean;
  draggedTaskId: string | null;
  isDragTarget: boolean;
  onChangeStatus: (taskId: string, status: TaskStatus) => void;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
  onDragEnter: (status: TaskStatus) => void;
  onDragLeave: () => void;
  onDrop: (status: TaskStatus) => void;
};

function TaskList({
  status,
  title,
  description,
  tasks,
  emptyMessage,
  showCompletionControl,
  draggedTaskId,
  isDragTarget,
  onChangeStatus,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDragLeave,
  onDrop,
}: TaskListProps) {
  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    onDragEnter(status);
  }

  function handleDragLeave(event: DragEvent<HTMLElement>) {
    const nextTarget = event.relatedTarget;

    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return;
    }

    onDragLeave();
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    onDrop(status);
  }

  return (
    <section
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`min-h-80 rounded-lg border p-4 transition duration-200 ${
        isDragTarget
          ? "task-list-drop-target border-emerald-400 bg-emerald-400/10"
          : "border-zinc-800 bg-zinc-900/70"
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-200">
            {title}
          </h3>
          <span className="shrink-0 rounded-full border border-zinc-700 bg-zinc-950 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            Soltar aquí
          </span>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
          {description}
        </p>
      </div>

      <p
        className={`mt-4 rounded-md border border-dashed px-3 py-2 text-center text-xs font-medium transition ${
          isDragTarget
            ? "border-emerald-400 bg-emerald-400/10 text-emerald-200"
            : "border-zinc-700 text-zinc-600"
        }`}
        role={isDragTarget ? "status" : undefined}
      >
        {isDragTarget
          ? `Soltá la tarea en ${title.toLowerCase()}`
          : "Arrastrá y soltá tareas en esta lista"}
      </p>

      <div className="mt-4 min-h-40 space-y-3">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              showCompletionControl={showCompletionControl}
              isDragging={draggedTaskId === task.id}
              onChangeStatus={onChangeStatus}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))
        ) : (
          <p className="grid min-h-32 place-items-center rounded-md border border-dashed border-zinc-700 bg-zinc-950/70 p-4 text-center text-sm text-zinc-600">
            {emptyMessage}
          </p>
        )}
      </div>
    </section>
  );
}

export default TaskList;
