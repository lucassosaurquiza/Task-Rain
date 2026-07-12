import type { Task } from "../../types/task";

type TaskCardProps = {
  task: Task;
  onMoveToImportant: (taskId: string) => void;
  onMoveToToday: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
};

function TaskCard({
  task,
  onMoveToImportant,
  onMoveToToday,
  onCompleteTask,
}: TaskCardProps) {
  const isCompleted = task.status === "completed";
  const isToday = task.status === "today";

  return (
    <article className="rounded-md border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex items-start gap-3">
        {isToday || isCompleted ? (
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={() => onCompleteTask(task.id)}
            className="mt-1 size-4 rounded border-zinc-700 bg-zinc-900 accent-emerald-400"
          />
        ) : null}

        <div className="flex-1">
          <p
            className={
              isCompleted
                ? "text-sm text-zinc-500 line-through"
                : "text-sm text-zinc-100"
            }
          >
            {task.title}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {task.status === "brain_dump" ? (
              <button
                type="button"
                onClick={() => onMoveToImportant(task.id)}
                className="rounded-md border border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-300 transition hover:border-emerald-400 hover:text-emerald-300"
              >
                Marcar importante
              </button>
            ) : null}

            {task.status === "important" ? (
              <button
                type="button"
                onClick={() => onMoveToToday(task.id)}
                className="rounded-md border border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-300 transition hover:border-emerald-400 hover:text-emerald-300"
              >
                Pasar a hoy
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

export default TaskCard;
