import { useState } from "react";
import { mockDashboardStats } from "../../data/mockDashboard";
import type { Task } from "../../types/task";
import ProgressRing from "./ProgressRing";
import QuickTaskCapture from "./QuickTaskCapture";
import StatCard from "./StatCard";
import WeeklyChart from "./WeeklyChart";

type HomeDashboardProps = {
  unorganizedTaskCount: number;
  onCreateTask: (title: string) => Task;
  onUndoCreateTask: (taskId: string) => void;
  onOpenTasks: () => void;
};

function HomeDashboard({
  unorganizedTaskCount,
  onCreateTask,
  onUndoCreateTask,
  onOpenTasks,
}: HomeDashboardProps) {
  const hasUnorganizedTasks = unorganizedTaskCount > 0;
  const [highlightVersion, setHighlightVersion] = useState(0);

  function handleQuickCreateTask(title: string) {
    const task = onCreateTask(title);

    setHighlightVersion((currentVersion) => currentVersion + 1);

    return task;
  }

  return (
    <main className="flex flex-1 items-center justify-center py-10">
      <section className="w-full space-y-6">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-50">
            Rendimiento general
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            Un paneo rápido para entender si estás siendo constante y si tus
            tareas están empujando tus objetivos.
          </p>
        </div>

        <QuickTaskCapture
          onCreateTask={handleQuickCreateTask}
          onUndoCreateTask={onUndoCreateTask}
        />

        <article
          key={highlightVersion}
          className={`flex flex-col gap-4 rounded-lg border bg-zinc-900/60 p-5 sm:flex-row sm:items-center sm:justify-between ${
            highlightVersion > 0
              ? "organizer-highlight border-emerald-400/40"
              : "border-zinc-800"
          }`}
        >
          <div>
            <p className="text-sm font-semibold text-zinc-100">
              {hasUnorganizedTasks ? (
                <>
                  <span
                    key={unorganizedTaskCount}
                    className="task-count-bump inline-block text-emerald-300"
                  >
                    {unorganizedTaskCount}
                  </span>{" "}
                  {unorganizedTaskCount === 1
                    ? "tarea espera"
                    : "tareas esperan"}{" "}
                  ser organizadas
                </>
              ) : (
                "Tu lluvia de tareas está organizada"
              )}
            </p>
            <p className="mt-1 text-sm leading-6 text-zinc-500">
              {hasUnorganizedTasks
                ? "Revisalas para decidir cuáles son importantes y cuáles vas a realizar hoy."
                : "Podés revisar tus tareas del día o capturar una nueva idea."}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenTasks}
            className="shrink-0 rounded-md border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-300"
          >
            Organizar tareas
          </button>
        </article>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="Completadas"
            value={mockDashboardStats.completedTasks}
            helperText="Tareas cerradas esta semana."
            tone="positive"
          />

          <StatCard
            label="Pendientes"
            value={mockDashboardStats.pendingTasks}
            helperText="Tareas que todavía requieren acción."
            tone="negative"
          />

          <ProgressRing
            value={mockDashboardStats.totalFlowPercentage}
            label="Flujo total"
          />
        </div>

        <WeeklyChart data={mockDashboardStats.weeklyActivity} />

        <article className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-5">
          <p className="text-sm font-semibold text-emerald-300">
            Lectura rápida
          </p>
          <p className="mt-3 text-sm leading-6 text-emerald-50/80">
            Venís con buena constancia, pero los días inactivos están bajando
            tu rendimiento semanal. El foco debería estar en no cortar el
            registro diario.
          </p>
        </article>
      </section>
    </main>
  );
}

export default HomeDashboard;
