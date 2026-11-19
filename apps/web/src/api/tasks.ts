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

export async function updateTaskImportance(
  taskId: string,
  isImportant: boolean,
): Promise<ApiTask> {
  const response = await fetch(
    `/api/tasks/${encodeURIComponent(taskId)}/importance`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isImportant }),
    },
  );

  if (!response.ok) {
    throw new Error("No se pudo actualizar la importancia.");
  }

  return response.json();
}

export async function updateTaskObjective(
  taskId: string,
  objectiveId: string | null,
): Promise<ApiTask> {
  const response = await fetch(
    `/api/tasks/${encodeURIComponent(taskId)}/objective`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ objectiveId }),
    },
  );

  if (!response.ok) {
    throw new Error("No se pudo actualizar el objetivo de la tarea.");
  }

  return response.json();
}

export async function completeTask(taskId: string): Promise<ApiTask> {
  const response = await fetch(
    `/api/tasks/${encodeURIComponent(taskId)}/complete`,
    {
      method: "PATCH",
    },
  );

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);

    if (
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof body.error === "string"
    ) {
      throw new Error(body.error);
    }

    throw new Error("No se pudo completar la tarea.");
  }

  return response.json();
}
