import type { Task } from "../../types/task";
import ProgressRing from "./ProgressRing";
import StatCard from "./StatCard";
import WeeklyChart from "./WeeklyChart";
import type { DashboardStats } from "../../types/dashboard";

type HomeDashboardProps = {
  unorganizedTaskCount: number;
  onCreateTask: (title: string) => Task;
  onUndoCreateTask: (taskId: string) => void;
  onOpenTasks: () => void;
  dashboardStats: DashboardStats;
};

function HomeDashboard({ dashboardStats }: HomeDashboardProps) {
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

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="Completadas"
            value={dashboardStats.completedTasks}
            helperText="Tareas cerradas esta semana."
            tone="positive"
          />

          <StatCard
            label="Pendientes"
            value={dashboardStats.pendingTasks}
            helperText="Tareas que todavía requieren acción."
            tone="negative"
          />

          <ProgressRing
            value={dashboardStats.totalFlowPercentage}
            label="Flujo total"
          />
        </div>

        <WeeklyChart data={dashboardStats.weeklyActivity} />

        <article className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-5">
          <p className="text-sm font-semibold text-emerald-300">
            Lectura rápida
          </p>
          <p className="mt-3 text-sm leading-6 text-emerald-50/80">
            Venís con buena constancia, pero los días inactivos están bajando tu
            rendimiento semanal. El foco debería estar en no cortar el registro
            diario.
          </p>
        </article>
      </section>
    </main>
  );
}

export default HomeDashboard;
