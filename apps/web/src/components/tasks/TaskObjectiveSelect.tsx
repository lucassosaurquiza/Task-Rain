import { useState } from "react";
import type { ApiObjective } from "../../api/objectives";

type TaskObjectiveSelectProps = {
  taskId: string;
  objectiveId: string | null;
  objectives: ApiObjective[];
  onChangeObjective: (
    taskId: string,
    objectiveId: string | null,
  ) => Promise<void>;
};

function TaskObjectiveSelect({
  taskId,
  objectiveId,
  objectives,
  onChangeObjective,
}: TaskObjectiveSelectProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasMissingObjective =
    objectiveId !== null &&
    !objectives.some((objective) => objective.id === objectiveId);

  async function handleChange(value: string) {
    const nextObjectiveId = value === "" ? null : value;

    if (isSaving || nextObjectiveId === objectiveId) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onChangeObjective(taskId, nextObjectiveId);
    } catch {
      setError("No pudimos confirmar el cambio. Recargá para verificar.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mt-3">
      <label className="block text-sm text-zinc-300">
        Objetivo
        <select
          value={objectiveId ?? ""}
          disabled={isSaving}
          onChange={(event) => {
            void handleChange(event.target.value);
          }}
          className="mt-2 block w-full rounded-md border border-zinc-700 bg-zinc-950 p-3 disabled:opacity-50"
        >
          <option value="">Sin objetivo</option>

          {hasMissingObjective && (
            <option value={objectiveId!} disabled>
              Objetivo actual no disponible
            </option>
          )}

          {objectives.map((objective) => (
            <option key={objective.id} value={objective.id}>
              {objective.title}
              {objective.status === "achieved" ? " (Logrado)" : ""}
            </option>
          ))}
        </select>
      </label>

      {isSaving && (
        <p role="status" className="mt-2 text-sm text-zinc-400">
          Guardando...
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

export default TaskObjectiveSelect;
