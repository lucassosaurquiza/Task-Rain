import { useTodayCommitments } from "../../hooks/useTodayCommitments";

import TodayTaskActions from "./TodayTaskActions";

function TodayPage() {
  const {
    commitments,
    isLoading,
    error,
    withdrawFromToday,
    completeFromToday,
  } = useTodayCommitments();

  return (
    <main className="flex flex-1 justify-center py-10">
      <section className="w-full max-w-5xl rounded-lg border border-zinc-800 bg-zinc-900/60 p-6 md:p-8">
        <h2 className="text-3xl font-semibold text-zinc-50">Hoy</h2>

        <p className="mt-3 text-sm text-zinc-400">
          Tus compromisos pendientes de la semana actual.
        </p>

        {isLoading ? (
          <p role="status" className="mt-6 text-zinc-400">
            Cargando tareas de Hoy...
          </p>
        ) : error ? (
          <p role="alert" className="mt-6 text-red-400">
            {error}
          </p>
        ) : commitments.length === 0 ? (
          <p className="mt-6 text-zinc-400">
            No tenés compromisos pendientes en Hoy.
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
            {commitments.map((commitment) => (
              <li
                key={commitment.id}
                className="rounded-md border border-zinc-800 bg-zinc-950 p-4"
              >
                <h3 className="font-semibold text-zinc-100">
                  {commitment.taskTitle}
                </h3>

                <p className="mt-2 text-sm text-zinc-400">
                  Objetivo: {commitment.objectiveTitle}
                </p>
                <TodayTaskActions
                  taskId={commitment.taskId}
                  onComplete={completeFromToday}
                  onWithdraw={withdrawFromToday}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default TodayPage;
