import { mockDashboardStats } from "../../data/mockDashboard";
import ActivitySummary from "./ActivitySummary";
import ObjectiveSummary from "./ObjectiveSummary";
import ProgressRing from "./ProgressRing";
import StatCard from "./StatCard";
import WeeklyChart from "./WeeklyChart";

function HomeDashboard() {
  return (
    <main className="flex flex-1 items-center justify-center py-10">
      <section className="grid w-full gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-emerald-400">Inicio</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50">
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
        </div>

        <div className="space-y-6">
          <ActivitySummary
            activeDays={mockDashboardStats.activeDays}
            inactiveDays={mockDashboardStats.inactiveDays}
          />

          <ObjectiveSummary objective={mockDashboardStats.mainObjective} />

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
        </div>
      </section>
    </main>
  );
}

export default HomeDashboard;
