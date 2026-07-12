import { useState } from "react";

type TaskInputProps = {
  onCreateTask: (title: string) => void;
};

function TaskInput({ onCreateTask }: TaskInputProps) {
  const [taskTitle, setTaskTitle] = useState("");

  function handleSubmit() {
    const normalizedTitle = taskTitle.trim();

    if (!normalizedTitle) {
      return;
    }

    onCreateTask(normalizedTitle);
    setTaskTitle("");
  }

  return (
    <section>
      <label
        htmlFor="task-title"
        className="text-sm font-semibold uppercase tracking-wide text-zinc-300"
      >
        Volcá tu mente
      </label>

      <div className="mt-4 rounded-lg border border-zinc-700 bg-zinc-950 p-3">
        <textarea
          id="task-title"
          value={taskTitle}
          onChange={(event) => setTaskTitle(event.target.value)}
          placeholder="¿Qué hay en tu cabeza?..."
          className="min-h-28 w-full resize-none bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
        />

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300"
          >
            Agregar tarea
          </button>
        </div>
      </div>
    </section>
  );
}

export default TaskInput;
