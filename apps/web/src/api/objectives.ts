import type { ObjectivePeriod, ObjectiveStatus } from "../types/objective";

export type ApiObjective = {
  id: string;
  title: string;
  successCriterion: string;
  period: ObjectivePeriod;
  status: ObjectiveStatus;
  motivation: string | null;
  reward: string | null;
  targetDate: string | null;
  createdAt: string;
};

export async function listObjectives(
  signal?: AbortSignal,
): Promise<ApiObjective[]> {
  const response = await fetch("/api/objectives", { signal });

  if (!response.ok) {
    throw new Error("No se pudieron cargar los objetivos.");
  }

  return response.json();
}

export type CreateObjectiveInput = {
  title: string;
  successCriterion: string;
  period: ObjectivePeriod;
  motivation?: string | null;
  reward?: string | null;
  targetDate?: string | null;
};

export async function createObjective(
  input: CreateObjectiveInput,
): Promise<ApiObjective> {
  const response = await fetch("/api/objectives", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("No se pudo crear el objetivo.");
  }

  return response.json();
}
