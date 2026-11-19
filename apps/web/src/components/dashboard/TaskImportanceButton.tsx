import { useState } from "react";

type TaskImportanceButtonProps = {
  taskId: string;
  isImportant: boolean;
  onChangeImportance: (taskId: string, isImportant: boolean) => Promise<void>;
};

function TaskImportanceButton({
  taskId,
  isImportant,
  onChangeImportance,
}: TaskImportanceButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (isSaving) return;

    setIsSaving(true);
    setError(null);

    try {
      await onChangeImportance(taskId, !isImportant);
    } catch {
      setError("No pudimos confirmar el cambio. Recargá para verificar.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        aria-pressed={isImportant}
        disabled={isSaving}
        onClick={handleClick}
        className="rounded-md border border-emerald-400 px-3 py-2 text-sm text-emerald-300 disabled:cursor-wait disabled:opacity-50"
      >
        {isSaving
          ? "Guardando..."
          : isImportant
            ? "Quitar importancia"
            : "Marcar como importante"}
      </button>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export default TaskImportanceButton;
