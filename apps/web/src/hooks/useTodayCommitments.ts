import { useEffect, useState } from "react";
import { listTodayCommitments, withdrawTask } from "../api/weeklyCommitments";
import { completeTask } from "../api/tasks";
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

  async function withdrawFromToday(taskId: string): Promise<void> {
    const withdrawnCommitment = await withdrawTask(taskId);

    setCommitments((currentCommitments) =>
      currentCommitments.filter(
        (commitment) => commitment.id !== withdrawnCommitment.id,
      ),
    );
  }

  async function completeFromToday(taskId: string): Promise<void> {
    const completedTask = await completeTask(taskId);

    setCommitments((currentCommitments) =>
      currentCommitments.filter(
        (commitment) => commitment.taskId !== completedTask.id,
      ),
    );
  }

  return {
    commitments,
    isLoading,
    error,
    withdrawFromToday,
    completeFromToday,
  };
}
