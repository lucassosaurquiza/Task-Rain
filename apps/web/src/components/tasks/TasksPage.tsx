import { useMemo, useState } from "react";
import QuickTaskCapture from "../dashboard/QuickTaskCapture";
import type { Task, TaskStatus } from "../../types/task";
import TaskList from "./TaskList";

type TasksPageProps = {
  tasks: Task[];
  onCreateTask: (title: string) => Task;
  onUndoCreateTask: (taskId: string) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
};

function TasksPage({
  tasks,
  onCreateTask,
  onUndoCreateTask,
  onUpdateTaskStatus,
}: TasksPageProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragTargetStatus, setDragTargetStatus] =
    useState<TaskStatus | null>(null);

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

  function handleDragStart(taskId: string) {
    setDraggedTaskId(taskId);
  }

  function handleDragEnd() {
    setDraggedTaskId(null);
    setDragTargetStatus(null);
  }

  function handleDrop(targetStatus: TaskStatus) {
    if (!draggedTaskId) {
      return;
    }

    const draggedTask = tasks.find((task) => task.id === draggedTaskId);

    if (draggedTask && draggedTask.status !== targetStatus) {
      onUpdateTaskStatus(draggedTaskId, targetStatus);
    }

    handleDragEnd();
  }

  return (
    <main className="flex flex-1 items-center justify-center py-10">
      <section className="w-full max-w-5xl rounded-lg border border-zinc-800 bg-zinc-900/60 p-6 md:p-8">
        <div>
          <p className="text-sm font-medium text-emerald-400">Tareas</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50">
            Organizá tu día
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            La lista general conserva todo lo que tenés en mente. Arrastrá cada
            tarea para marcarla como importante o elegirla para hoy.
          </p>
        </div>

        <div className="mt-8">
          <QuickTaskCapture
            onCreateTask={onCreateTask}
            onUndoCreateTask={onUndoCreateTask}
            description="Todo lo que agregues aparece en la lista general. Después podés arrastrarlo hacia Importantes o Hoy."
          />
        </div>

        <div
          className="mt-6 flex gap-3 rounded-lg border border-sky-400/20 bg-sky-400/10 px-4 py-3"
          role="note"
        >
          <span className="text-lg text-sky-300" aria-hidden="true">
            ↔
          </span>
          <div>
            <p className="text-sm font-semibold text-sky-200">
              Organizá usando drag and drop
            </p>
            <p className="mt-1 text-sm leading-6 text-sky-100/70">
              Mantené presionada una tarjeta, arrastrala hacia otra columna y
              soltala cuando la columna se ilumine.
            </p>
          </div>
        </div>

        <div className="mt-4 grid items-start gap-4 xl:grid-cols-3">
          <TaskList
            status="brain_dump"
            title="Lista de tareas"
            description="Paneo general de todas tus tareas. Soltar una tarjeta acá quita su clasificación actual."
            tasks={tasks}
            emptyMessage="Todavía no agregaste tareas."
            showCompletionControl={false}
            draggedTaskId={draggedTaskId}
            isDragTarget={dragTargetStatus === "brain_dump"}
            onChangeStatus={onUpdateTaskStatus}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragEnter={setDragTargetStatus}
            onDragLeave={() => setDragTargetStatus(null)}
            onDrop={handleDrop}
          />

          <TaskList
            status="important"
            title="Tareas importantes"
            description="Marcá desde la lluvia las tareas que realmente importan para tu día o tus objetivos."
            tasks={importantTasks}
            emptyMessage="Todavía no marcaste tareas importantes."
            showCompletionControl={false}
            draggedTaskId={draggedTaskId}
            isDragTarget={dragTargetStatus === "important"}
            onChangeStatus={onUpdateTaskStatus}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragEnter={setDragTargetStatus}
            onDragLeave={() => setDragTargetStatus(null)}
            onDrop={handleDrop}
          />

          <TaskList
            status="today"
            title="Tareas diarias"
            description="Estas son las tareas que elegiste trabajar hoy. Al completarlas, impactan en tu rendimiento."
            tasks={todayTasks}
            emptyMessage="Todavía no elegiste tareas para hoy."
            showCompletionControl
            draggedTaskId={draggedTaskId}
            isDragTarget={dragTargetStatus === "today"}
            onChangeStatus={onUpdateTaskStatus}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragEnter={setDragTargetStatus}
            onDragLeave={() => setDragTargetStatus(null)}
            onDrop={handleDrop}
          />
        </div>
      </section>
    </main>
  );
}

export default TasksPage;
