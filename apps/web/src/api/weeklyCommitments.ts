import type { WeeklyCommitment } from "../types/weeklyCommitment";

export async function incorporateTask(
  taskId: string,
): Promise<WeeklyCommitment> {
  const response = await fetch(
    `/api/tasks/${encodeURIComponent(taskId)}/commitments`,
    {
      method: "POST",
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

    throw new Error("No se pudo incorporar la tarea a Hoy.");
  }

  return response.json();
}

export type WeeklyCommitmentListItem = WeeklyCommitment & {
  taskTitle: string;
  objectiveTitle: string;
};

export async function listTodayCommitments(
  signal?: AbortSignal,
): Promise<WeeklyCommitmentListItem[]> {
  const response = await fetch("/api/weekly-commitments/current?active=true", {
    signal,
  });

  if (!response.ok) {
    throw new Error("No se pudieron cargar las tareas de Hoy.");
  }

  return response.json();
}

export async function withdrawTask(taskId: string): Promise<WeeklyCommitment> {
  const response = await fetch(
    `/api/tasks/${encodeURIComponent(taskId)}/commitments/current/withdraw`,
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

    throw new Error("No se pudo retirar la tarea de Hoy.");
  }

  return response.json();
}
