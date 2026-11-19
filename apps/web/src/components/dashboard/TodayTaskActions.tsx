import { useState } from "react";

type TodayTaskActionsProps = {
  taskId: string;
  onComplete: (taskId: string) => Promise<void>;
  onWithdraw: (taskId: string) => Promise<void>;
};

type Action = "complete" | "withdraw";

function TodayTaskActions({
  taskId,
  onComplete,
  onWithdraw,
}: TodayTaskActionsProps) {
  const [pendingAction, setPendingAction] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAction(action: Action) {
    if (pendingAction !== null) return;

    setPendingAction(action);
    setError(null);

    try {
      if (action === "complete") {
        await onComplete(taskId);
      } else {
        await onWithdraw(taskId);
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo confirmar la operación.",
      );
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pendingAction !== null}
          onClick={() => void handleAction("complete")}
          className="rounded-md bg-emerald-400 px-3 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-50"
        >
          {pendingAction === "complete" ? "Completando..." : "Completar"}
        </button>

        <button
          type="button"
          disabled={pendingAction !== null}
          onClick={() => void handleAction("withdraw")}
          className="rounded-md border border-zinc-600 px-3 py-2 text-sm text-zinc-200 disabled:opacity-50"
        >
          {pendingAction === "withdraw" ? "Retirando..." : "Retirar de Hoy"}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export default TodayTaskActions;
