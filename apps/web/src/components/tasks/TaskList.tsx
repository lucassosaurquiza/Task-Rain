import type { Task } from "../../types/task";
import TaskCard from "./TaskCard";

type TaskListProps = {
  title: string;
  description: string;
  tasks: Task[];
  emptyMessage: string;
  onMoveToImportant: (taskId: string) => void;
  onMoveToToday: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
};

function TaskList({
  title,
  description,
  tasks,
  emptyMessage,
  onMoveToImportant,
  onMoveToToday,
  onCompleteTask,
}: TaskListProps) {
  return (
    <section>
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-200">
          {title}
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
          {description}
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onMoveToImportant={onMoveToImportant}
              onMoveToToday={onMoveToToday}
              onCompleteTask={onCompleteTask}
            />
          ))
        ) : (
          <p className="rounded-md border border-dashed border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-600">
            {emptyMessage}
          </p>
        )}
      </div>
    </section>
  );
}

export default TaskList;
