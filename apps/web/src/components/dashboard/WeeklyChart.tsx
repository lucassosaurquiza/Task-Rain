import type { WeeklyActivity } from "../../types/dashboard";

type WeeklyChartProps = {
  data: WeeklyActivity[];
};

function WeeklyChart({ data }: WeeklyChartProps) {
  const maxTasks = Math.max(
    ...data.map((day) => day.completedTasks + day.pendingTasks),
    1,
  );
  return (
    <>
      <article className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-zinc-50">
              Porcentaje general
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Rendimiento semanal según actividad diaria.
            </p>
          </div>

          <div className="flex gap-2 text-xs">
            <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-emerald-300">
              Positivo
            </span>
            <span className="rounded-full bg-rose-400/10 px-2 py-1 text-rose-300">
              Inactivo
            </span>
          </div>
        </div>

        <div className="mt-8 flex h-52 items-end justify-between gap-3 border-b border-zinc-800 pb-3">
          {data.map((day) => {
            const completedHeight = day.hasActivity
              ? Math.max((day.completedTasks / maxTasks) * 100, 8)
              : 6;
            const pendingHeight = day.hasActivity
              ? (day.pendingTasks / maxTasks) * 100
              : 0;

            return (
              <div
                key={day.day}
                className="flex flex-1 flex-col items-center gap-3"
              >
                <div className="flex h-40 w-full max-w-8 items-end gap-1">
                  <div
                    className={
                      day.hasActivity
                        ? "w-full rounded-t bg-emerald-400"
                        : "w-full rounded-t bg-rose-400"
                    }
                    style={{ height: `${completedHeight}%` }}
                    title={`${day.completedTasks} completadas`}
                  />

                  {day.hasActivity ? (
                    <div
                      className="w-full rounded-t bg-zinc-600"
                      style={{ height: `${pendingHeight}%` }}
                      title={`${day.pendingTasks} pendientes`}
                    />
                  ) : null}
                </div>

                <span className="text-xs font-medium text-zinc-500">
                  {day.day}
                </span>
              </div>
            );
          })}
        </div>
      </article>
    </>
  );
}

export default WeeklyChart;
