type ActivitySummaryProps = {
  activeDays: number;
  inactiveDays: number;
};

function ActivitySummary({ activeDays, inactiveDays }: ActivitySummaryProps) {
  const totalDays = activeDays + inactiveDays;
  const activePercentage =
    totalDays > 0 ? Math.round((activeDays / totalDays) * 100) : 0;

  return (
    <>
      <article className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-zinc-50">
              Constancia semanal
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Días con actividad registrada frente a días sin tareas cargadas.
            </p>
          </div>

          <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-300">
            {activePercentage}%
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-md border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-sm text-zinc-500">Días activos</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-400">
              {activeDays}
            </p>
          </div>

          <div className="rounded-md border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-sm text-zinc-500">Días inactivos</p>
            <p className="mt-2 text-2xl font-semibold text-rose-400">
              {inactiveDays}
            </p>
          </div>
        </div>
      </article>
    </>
  );
}

export default ActivitySummary;
