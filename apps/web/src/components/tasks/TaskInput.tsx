import { useState } from "react";
import type { FormEvent } from "react";

type TaskInputProps = {
  onCreateTask: (title: string) => Promise<void>;
};

function TaskInput({ onCreateTask }: TaskInputProps) {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedTitle = title.trim();

    if (!normalizedTitle || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onCreateTask(normalizedTitle);
      setTitle("");
    } catch {
      setError(
        "No pudimos confirmar que se guardó. Revisá la lista antes de reintentar.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <label
        htmlFor="task-title"
        className="text-sm font-semibold text-zinc-300"
      >
        ¿En que trabajamos hoy?
      </label>

      <textarea
        id="task-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        disabled={isSubmitting}
        className="mt-2 min-h-24 w-full rounded-md border border-zinc-700 bg-zinc-950 p-3 text-zinc-100 focus:border-emerald-400 disabled:opacity-60"
      />

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !title.trim()}
        className="mt-3 rounded-md bg-emerald-400 px-4 py-2 font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Guardando..." : "Agregar a la lluvia"}
      </button>
    </form>
  );
}

export default TaskInput;
