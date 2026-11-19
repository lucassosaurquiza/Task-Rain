import { useEffect, useState } from "react";
import { listObjectives, createObjective } from "../api/objectives";
import type { ApiObjective, CreateObjectiveInput } from "../api/objectives";

export function useObjectives() {
  const [objectives, setObjectives] = useState<ApiObjective[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadObjectives() {
      try {
        const loadedObjectives = await listObjectives(controller.signal);

        if (!controller.signal.aborted) {
          setObjectives(loadedObjectives);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError("No se pudieron cargar los objetivos.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadObjectives();

    return () => controller.abort();
  }, []);

  async function addObjective(input: CreateObjectiveInput): Promise<void> {
    const createdObjective = await createObjective(input);

    setObjectives((currentObjectives) => [
      createdObjective,
      ...currentObjectives,
    ]);
  }
  return { objectives, isLoading, error, addObjective };
}
