import { useState } from "react";

type WithdrawTaskButtonProps = {
  taskId: string;
  onWithdraw: (taskId: string) => Promise<void>;
};

function WithdrawTaskButton({ taskId, onWithdraw }: WithdrawTaskButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (isSaving) return;

    setIsSaving(true);
    setError(null);

    try {
      await onWithdraw(taskId);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo confirmar el retiro.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        disabled={isSaving}
        onClick={handleClick}
        className="rounded-md border border-zinc-600 px-3 py-2 text-sm text-zinc-200 disabled:cursor-wait disabled:opacity-50"
      >
        {isSaving ? "Retirando..." : "Retirar de Hoy"}
      </button>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export default WithdrawTaskButton;
