import { useEffect, useState } from "react";
import {
  createTask,
  listTasks,
  updateTaskImportance,
  updateTaskObjective,
} from "../api/tasks";
import type { ApiTask } from "../api/tasks";

export function useTasks() {
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTasks() {
      try {
        const loadedTasks = await listTasks(controller.signal);

        if (!controller.signal.aborted) {
          setTasks(loadedTasks);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError("No se pudieron cargar las tareas. Intentá nuevamente.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadTasks();

    return () => controller.abort();
  }, []);

  async function addTask(title: string): Promise<void> {
    const createdTask = await createTask(title);

    setTasks((currentTasks) => [createdTask, ...currentTasks]);
  }

  async function changeTaskImportance(
    taskId: string,
    isImportant: boolean,
  ): Promise<void> {
    const updatedTask = await updateTaskImportance(taskId, isImportant);

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === updatedTask.id
          ? { ...task, isImportant: updatedTask.isImportant }
          : task,
      ),
    );
  }

  async function changeTaskObjective(
    taskId: string,
    objectiveId: string | null,
  ): Promise<void> {
    const updatedTask = await updateTaskObjective(taskId, objectiveId);

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === updatedTask.id
          ? { ...task, objectiveId: updatedTask.objectiveId }
          : task,
      ),
    );
  }

  return {
    tasks,
    isLoading,
    error,
    addTask,
    changeTaskImportance,
    changeTaskObjective,
  };
}
