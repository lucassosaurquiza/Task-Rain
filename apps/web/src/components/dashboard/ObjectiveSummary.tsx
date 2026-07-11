import type { MainObjective } from "../../types/dashboard";

type ObjectiveSummaryProps = {
  objective: MainObjective;
};

function ObjectiveSummary({ objective }: ObjectiveSummaryProps) {
  return (
    <article className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-zinc-50">
            Objetivo principal
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            El avance más importante que estás empujando ahora.
          </p>
        </div>

        <span className="rounded-full bg-sky-400/10 px-3 py-1 text-sm font-medium text-sky-300">
          {objective.progress}%
        </span>
      </div>

      <div className="mt-6">
        <p className="text-lg font-semibold text-zinc-50">{objective.title}</p>

        <div className="mt-4 h-2 rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-emerald-400"
            style={{ width: `${objective.progress}%` }}
          />
        </div>

        <p className="mt-3 text-sm text-zinc-500">
          {objective.completedTasks} de {objective.totalTasks} tareas
          completadas.
        </p>
      </div>
    </article>
  );
}

export default ObjectiveSummary;
