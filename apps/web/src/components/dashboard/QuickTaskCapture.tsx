import { useEffect, useRef, useState } from "react";
import type { Task } from "../../types/task";

type QuickTaskCaptureProps = {
  onCreateTask: (title: string) => Task;
  onUndoCreateTask: (taskId: string) => void;
  description?: string;
};

function QuickTaskCapture({
  onCreateTask,
  onUndoCreateTask,
  description = "Anotá lo que tenés en mente. Después vas a poder organizarlo desde Tareas.",
}: QuickTaskCaptureProps) {
  const [taskTitle, setTaskTitle] = useState("");
  const [createdTask, setCreatedTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const submissionTimerRef = useRef<number | null>(null);
  const confirmationTimerRef = useRef<number | null>(null);
  const feedbackTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (submissionTimerRef.current) {
        window.clearTimeout(submissionTimerRef.current);
      }

      if (confirmationTimerRef.current) {
        window.clearTimeout(confirmationTimerRef.current);
      }

      if (feedbackTimerRef.current) {
        window.clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedTitle = taskTitle.trim();

    if (!normalizedTitle || isSubmitting) {
      return;
    }

    if (confirmationTimerRef.current) {
      window.clearTimeout(confirmationTimerRef.current);
    }

    if (feedbackTimerRef.current) {
      window.clearTimeout(feedbackTimerRef.current);
    }

    setCreatedTask(null);
    setIsConfirmed(false);
    setIsSubmitting(true);

    submissionTimerRef.current = window.setTimeout(() => {
      const task = onCreateTask(normalizedTitle);

      setCreatedTask(task);
      setIsSubmitting(false);
      setIsConfirmed(true);
      setTaskTitle("");
      window.requestAnimationFrame(() => inputRef.current?.focus());

      confirmationTimerRef.current = window.setTimeout(() => {
        setIsConfirmed(false);
      }, 1400);

      feedbackTimerRef.current = window.setTimeout(() => {
        setCreatedTask(null);
      }, 5000);
    }, 600);
  }

  function handleUndo() {
    if (!createdTask) {
      return;
    }

    if (confirmationTimerRef.current) {
      window.clearTimeout(confirmationTimerRef.current);
    }

    if (feedbackTimerRef.current) {
      window.clearTimeout(feedbackTimerRef.current);
    }

    onUndoCreateTask(createdTask.id);
    setTaskTitle(createdTask.title);
    setCreatedTask(null);
    setIsConfirmed(false);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
      <div>
        <p className="text-sm font-semibold text-zinc-100">
          Captura rápida
        </p>
        <p className="mt-1 text-sm leading-6 text-zinc-500">
          {description}
        </p>
      </div>

      <form
        className="mt-4 flex flex-col gap-3 sm:flex-row"
        onSubmit={handleSubmit}
      >
        <label htmlFor="quick-task-title" className="sr-only">
          Nueva tarea
        </label>
        <input
          ref={inputRef}
          id="quick-task-title"
          type="text"
          value={taskTitle}
          disabled={isSubmitting}
          onChange={(event) => setTaskTitle(event.target.value)}
          placeholder="¿Qué tenés en mente?"
          className="min-w-0 flex-1 rounded-md border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 disabled:cursor-wait disabled:opacity-70"
        />
        <button
          type="submit"
          disabled={isSubmitting || !taskTitle.trim()}
          className="min-w-44 rounded-md bg-emerald-400 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-500"
        >
          <span
            className="flex items-center justify-center gap-2"
            aria-live="polite"
          >
            {isSubmitting ? (
              <span className="task-spinner size-4 rounded-full border-2 border-zinc-500 border-t-zinc-100" />
            ) : null}
            {isSubmitting
              ? "Agregando..."
              : isConfirmed
                ? "✓ Tarea agregada"
                : "Agregar a la lluvia"}
          </span>
        </button>
      </form>

      {createdTask ? (
        <div
          className="task-feedback-enter mt-4 flex flex-col gap-3 rounded-md border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          role="status"
        >
          <p className="text-sm text-emerald-100">
            <span className="font-semibold">Tarea agregada a la lluvia:</span>{" "}
            {createdTask.title}
          </p>
          <button
            type="button"
            onClick={handleUndo}
            className="self-start text-sm font-semibold text-emerald-300 underline decoration-emerald-300/40 underline-offset-4 transition hover:text-emerald-200 sm:self-auto"
          >
            Deshacer
          </button>
        </div>
      ) : null}
    </section>
  );
}

export default QuickTaskCapture;
