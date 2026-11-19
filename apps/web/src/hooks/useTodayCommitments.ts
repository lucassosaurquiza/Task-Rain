import { useEffect, useState } from "react";
import { listTodayCommitments } from "../api/weeklyCommitments";
import type { WeeklyCommitmentListItem } from "../api/weeklyCommitments";

export function useTodayCommitments() {
  const [commitments, setCommitments] = useState<WeeklyCommitmentListItem[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCommitments() {
      try {
        const loadedCommitments = await listTodayCommitments(controller.signal);

        if (!controller.signal.aborted) {
          setCommitments(loadedCommitments);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError("No se pudieron cargar las tareas de Hoy.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadCommitments();

    return () => controller.abort();
  }, []);

  return { commitments, isLoading, error };
}
