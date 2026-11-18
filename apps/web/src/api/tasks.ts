export type ApiTask = {
  id: string;
  title: string;
  isImportant: boolean;
  objectiveId: string | null;
  createdAt: string;
  completedAt: string | null;
};

export async function listTasks(signal?: AbortSignal): Promise<ApiTask[]> {
  const response = await fetch("/api/tasks", { signal });

  if (!response.ok) {
    throw new Error("No se pudieron cargar las tareas.");
  }

  return response.json();
}

export async function createTask(title: string): Promise<ApiTask> {
  const response = await fetch("/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    throw new Error("No se pudo crear la tarea.");
  }

  return response.json();
}
