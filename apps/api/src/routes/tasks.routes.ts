import { Router } from "express";
import {
  listTasks,
  createTask,
  updateTaskTitle,
  updateTaskImportance,
  updateTaskObjective,
} from "../repositories/tasks.repository.js";
import { isValidUuid } from "../validation/uuid.js";
import {
  validateTaskTitle,
  validateTaskObjective,
} from "../validation/task.js";

export const taskRouter = Router();

taskRouter.get("/", async (_req, res) => {
  try {
    const tasks = await listTasks();
    res.json(tasks);
  } catch (error) {
    console.error("Error al listar tareas:", error);

    res.status(500).json({
      error: "No se pudieron obtener las tareas",
    });
  }
});

taskRouter.post("/", async (req, res) => {
  const validation = validateTaskTitle(req.body?.title);

  if (!validation.ok) {
    res.status(400).json({
      error: validation.error,
    });
    return;
  }
  try {
    const task = await createTask(validation.data);
    res.status(201).json(task);
  } catch (error) {
    console.error("Error al crear tarea:", error);
    res.status(500).json({
      error: "No se pudo crear la tarea",
    });
  }
});

taskRouter.patch("/:id", async (req, res) => {
  const { id } = req.params;

  if (!isValidUuid(id)) {
    res.status(400).json({
      error: "El identificador debe ser un UUID valido",
    });
    return;
  }

  const validation = validateTaskTitle(req.body?.title);

  if (!validation.ok) {
    res.status(400).json({
      error: validation.error,
    });
    return;
  }

  try {
    const task = await updateTaskTitle(id, validation.data);

    if (task === null) {
      res.status(404).json({
        error: "La tarea no existe",
      });
      return;
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Error al editar tarea:", error);

    res.status(500).json({
      error: "No se pudo editar la tarea",
    });
  }
});

taskRouter.patch("/:id/importance", async (req, res) => {
  const { id } = req.params;
  const isImportant: unknown = req.body?.isImportant;

  if (!isValidUuid(id)) {
    res.status(400).json({
      error: "El identificador debe ser un UUID valido",
    });
    return;
  }

  if (typeof isImportant !== "boolean") {
    res.status(400).json({
      error: "isImportant debe ser un booleano",
    });
    return;
  }

  try {
    const task = await updateTaskImportance(id, isImportant);

    if (task === null) {
      res.status(404).json({
        error: "La tarea no existe",
      });
      return;
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Error al cambiar importancia:", error);

    res.status(500).json({
      error: "No se pudo cambiar la importancia de la tarea",
    });
  }
});

taskRouter.patch("/:id/objective", async (req, res) => {
  const { id } = req.params;

  if (!isValidUuid(id)) {
    res.status(400).json({
      error: "El identificador debe ser un UUID valido",
    });
    return;
  }

  const validation = validateTaskObjective(req.body?.objectiveId);

  if (!validation.ok) {
    res.status(400).json({
      error: validation.error,
    });
    return;
  }

  try {
    const task = await updateTaskObjective(id, validation.data);

    if (task === null) {
      res.status(404).json({
        error: "La tarea no existe",
      });
      return;
    }

    res.status(200).json(task);
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "23503" &&
      "constraint" in error &&
      error.constraint === "tasks_objective_id_fkey"
    ) {
      res.status(404).json({
        error: "El objetivo no existe",
      });
      return;
    }

    console.error("Error al cambiar objetivo:", error);

    res.status(500).json({
      error: "No se pudo cambiar el objetivo de la tarea",
    });
  }
});
