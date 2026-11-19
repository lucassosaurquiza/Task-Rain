import { useState } from "react";
import type { FormEvent } from "react";
import type { CreateObjectiveInput } from "../../api/objectives";
import type { ObjectivePeriod } from "../../types/objective";

type ObjectiveFormProps = {
  onCreateObjective: (input: CreateObjectiveInput) => Promise<void>;
};

function ObjectiveForm({ onCreateObjective }: ObjectiveFormProps) {
  const [title, setTitle] = useState("");
  const [successCriterion, setSuccessCriterion] = useState("");
  const [period, setPeriod] = useState<ObjectivePeriod>("weekly");
  const [motivation, setMotivation] = useState("");
  const [reward, setReward] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || !title.trim() || !successCriterion.trim()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onCreateObjective({
        title: title.trim(),
        successCriterion: successCriterion.trim(),
        period,
        motivation: motivation.trim() || null,
        reward: reward.trim() || null,
        targetDate: targetDate || null,
      });

      setTitle("");
      setSuccessCriterion("");
      setPeriod("weekly");
      setMotivation("");
      setReward("");
      setTargetDate("");
    } catch {
      setError(
        "No pudimos confirmar que se guardó. Recargá para verificar antes de reintentar.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <fieldset disabled={isSubmitting} className="space-y-4">
        <legend className="mb-4 font-semibold text-zinc-100">
          Nuevo objetivo
        </legend>

        <label className="block text-sm text-zinc-300">
          Título
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-2 block w-full rounded-md border border-zinc-700 bg-zinc-950 p-3"
          />
        </label>

        <label className="block text-sm text-zinc-300">
          ¿Cómo sabrás que lo lograste?
          <textarea
            required
            value={successCriterion}
            onChange={(event) => setSuccessCriterion(event.target.value)}
            className="mt-2 block min-h-24 w-full rounded-md border border-zinc-700 bg-zinc-950 p-3"
          />
        </label>

        <label className="block text-sm text-zinc-300">
          Período
          <select
            value={period}
            onChange={(event) => {
              const value = event.target.value;

              if (
                value === "weekly" ||
                value === "monthly" ||
                value === "yearly"
              ) {
                setPeriod(value);
              }
            }}
            className="mt-2 block w-full rounded-md border border-zinc-700 bg-zinc-950 p-3"
          >
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensual</option>
            <option value="yearly">Anual</option>
          </select>
        </label>

        <label className="block text-sm text-zinc-300">
          Motivación (opcional)
          <textarea
            value={motivation}
            onChange={(event) => setMotivation(event.target.value)}
            className="mt-2 block w-full rounded-md border border-zinc-700 bg-zinc-950 p-3"
          />
        </label>

        <label className="block text-sm text-zinc-300">
          Recompensa (opcional)
          <input
            value={reward}
            onChange={(event) => setReward(event.target.value)}
            className="mt-2 block w-full rounded-md border border-zinc-700 bg-zinc-950 p-3"
          />
        </label>

        <label className="block text-sm text-zinc-300">
          Fecha objetivo (opcional)
          <input
            type="date"
            min="0001-01-01"
            max="9999-12-31"
            value={targetDate}
            onChange={(event) => setTargetDate(event.target.value)}
            className="mt-2 block w-full rounded-md border border-zinc-700 bg-zinc-950 p-3"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting || !title.trim() || !successCriterion.trim()}
          className="rounded-md bg-emerald-400 px-4 py-2 font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Guardando..." : "Crear objetivo"}
        </button>
      </fieldset>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}
    </form>
  );
}

export default ObjectiveForm;
