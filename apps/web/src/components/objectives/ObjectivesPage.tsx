import { useObjectives } from "../../hooks/useObjectives";
import ObjectiveForm from "../dashboard/ObjectiveForm";

const periodLabels = {
  weekly: "Semanal",
  monthly: "Mensual",
  yearly: "Anual",
};

const statusLabels = {
  in_progress: "En progreso",
  achieved: "Logrado",
};

function ObjectivesPage() {
  const { objectives, isLoading, error, addObjective } = useObjectives();

  return (
    <main className="flex flex-1 justify-center py-10">
      <section className="w-full max-w-5xl rounded-lg border border-zinc-800 bg-zinc-900/60 p-6 md:p-8">
        <h2 className="text-3xl font-semibold text-zinc-50">Objetivos</h2>

        <p className="mt-3 text-sm text-zinc-400">
          Las metas que querés alcanzar y cómo reconocerás que las lograste.
        </p>
        {!isLoading && !error && (
          <ObjectiveForm onCreateObjective={addObjective} />
        )}
        {isLoading && (
          <p role="status" className="mt-6 text-zinc-400">
            Cargando objetivos...
          </p>
        )}

        {error && (
          <p role="alert" className="mt-6 text-red-400">
            {error}
          </p>
        )}

        {!isLoading &&
          !error &&
          (objectives.length === 0 ? (
            <p className="mt-6 text-zinc-400">
              Todavía no agregaste objetivos.
            </p>
          ) : (
            <ul className="mt-6 space-y-3">
              {objectives.map((objective) => (
                <li
                  key={objective.id}
                  className="rounded-md border border-zinc-800 bg-zinc-950 p-4"
                >
                  <h3 className="font-semibold text-zinc-100">
                    {objective.title}
                  </h3>

                  <p className="mt-2 text-sm text-zinc-400">
                    Criterio de éxito: {objective.successCriterion}
                  </p>

                  <p className="mt-2 text-sm text-emerald-300">
                    {periodLabels[objective.period]}
                    {" · "}
                    {statusLabels[objective.status]}
                  </p>

                  {objective.targetDate && (
                    <p className="mt-2 text-sm text-zinc-400">
                      Fecha objetivo: {objective.targetDate}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ))}
      </section>
    </main>
  );
}

export default ObjectivesPage;
