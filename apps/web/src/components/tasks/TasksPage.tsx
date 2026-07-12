import { useMemo, useState } from "react";
import { mockTasks } from "../../data/mockTasks";
import type { Task, TaskStatus } from "../../types/task";
import TaskInput from "./TaskInput";
import TaskList from "./TaskList";

function createTask(title: string): Task {
  return {
    id: crypto.randomUUID(),
    title,
    status: "brain_dump",
    createdAt: new Date().toISOString(),
  };
}

function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);

  const brainDumpTasks = useMemo(
    () => tasks.filter((task) => task.status === "brain_dump"),
    [tasks],
  );

  const importantTasks = useMemo(
    () => tasks.filter((task) => task.status === "important"),
    [tasks],
  );

  const todayTasks = useMemo(
    () =>
      tasks.filter(
        (task) => task.status === "today" || task.status === "completed",
      ),
    [tasks],
  );

  function handleCreateTask(title: string) {
    setTasks((currentTasks) => [createTask(title), ...currentTasks]);
  }

  function updateTaskStatus(taskId: string, status: TaskStatus) {
    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        if (task.id !== taskId) {
          return task;
        }

        return {
          ...task,
          status,
          completedAt:
            status === "completed" ? new Date().toISOString() : undefined,
        };
      }),
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center py-10">
      <section className="w-full max-w-5xl rounded-lg border border-zinc-800 bg-zinc-900/60 p-6 md:p-8">
        <TaskInput onCreateTask={handleCreateTask} />

        <div className="mt-8 space-y-8">
          <TaskList
            title="Lluvia de tareas"
            description="Acá se van agregando automáticamente las tareas que colocás arriba, sin ordenarlas todavía."
            tasks={brainDumpTasks}
            emptyMessage="Todavía no volcaste tareas."
            onMoveToImportant={(taskId) =>
              updateTaskStatus(taskId, "important")
            }
            onMoveToToday={(taskId) => updateTaskStatus(taskId, "today")}
            onCompleteTask={(taskId) => updateTaskStatus(taskId, "completed")}
          />

          <TaskList
            title="Tareas importantes"
            description="Marcá desde la lluvia las tareas que realmente importan para tu día o tus objetivos."
            tasks={importantTasks}
            emptyMessage="Todavía no marcaste tareas importantes."
            onMoveToImportant={(taskId) =>
              updateTaskStatus(taskId, "important")
            }
            onMoveToToday={(taskId) => updateTaskStatus(taskId, "today")}
            onCompleteTask={(taskId) => updateTaskStatus(taskId, "completed")}
          />

          <TaskList
            title="Tareas diarias"
            description="Estas son las tareas que elegiste trabajar hoy. Al completarlas, impactan en tu rendimiento."
            tasks={todayTasks}
            emptyMessage="Todavía no elegiste tareas para hoy."
            onMoveToImportant={(taskId) =>
              updateTaskStatus(taskId, "important")
            }
            onMoveToToday={(taskId) => updateTaskStatus(taskId, "today")}
            onCompleteTask={(taskId) => updateTaskStatus(taskId, "completed")}
          />
        </div>
      </section>
    </main>
  );
}

export default TasksPage;
