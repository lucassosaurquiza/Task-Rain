import { useState } from "react";
import type { WeeklyCommitment } from "../../types/weeklyCommitment";

type IncorporateTaskButtonProps = {
  taskId: string;
  onIncorporate: (taskId: string) => Promise<WeeklyCommitment>;
};

function IncorporateTaskButton({
  taskId,
  onIncorporate,
}: IncorporateTaskButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (isSaving) return;

    setIsSaving(true);
    setMessage(null);
    setError(null);

    try {
      const commitment = await onIncorporate(taskId);

      if (commitment.completedAt !== null) {
        setMessage("Este compromiso semanal ya está completado.");
      } else if (commitment.withdrawnAt !== null) {
        setMessage("El compromiso sigue retirado de Hoy.");
      } else {
        setMessage("La tarea quedó incorporada a Hoy.");
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo confirmar la incorporación.",
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
        className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:cursor-wait disabled:opacity-50"
      >
        {isSaving ? "Incorporando..." : "Incorporar a Hoy"}
      </button>

      {message && (
        <p role="status" className="mt-2 text-sm text-emerald-300">
          {message}
        </p>
      )}

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export default IncorporateTaskButton;
