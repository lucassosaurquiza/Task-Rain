import { useState } from "react";
import { createTask } from "../../api/tasks";
import TaskInput from "../tasks/TaskInput";

function HomeTaskCapture() {
  const [createdTitle, setCreatedTitle] = useState<string | null>(null);

  async function handleCreateTask(title: string): Promise<void> {
    setCreatedTitle(null);

    const createdTask = await createTask(title);

    setCreatedTitle(createdTask.title);
  }

  return (
    <section>
      <h2 className="text-xl font-semibold text-zinc-100">Captura rápida</h2>

      <TaskInput onCreateTask={handleCreateTask} />

      {createdTitle !== null && (
        <p role="status" className="mt-3 text-sm text-emerald-300">
          Tarea guardada: {createdTitle}
        </p>
      )}
    </section>
  );
}

export default HomeTaskCapture;
