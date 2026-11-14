import { Router } from "express";
import {
  listTasks,
  createTask,
  updateTaskTitle,
  updateTaskImportance,
} from "../repositories/tasks.repository.js";

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
  const title: unknown = req.body?.title;

  if (typeof title !== "string" || title.trim().length === 0) {
    res.status(400).json({
      error: "El titulo debe ser un texto no vacio",
    });
    return;
  }

  try {
    const task = await createTask(title.trim());
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
  const title: unknown = req.body?.title;

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(id)) {
    res.status(400).json({
      error: "El identificador debe ser un UUID valido",
    });
    return;
  }

  if (typeof title !== "string" || title.trim().length === 0) {
    res.status(400).json({
      error: "El titulo debe ser un texto no vacio",
    });
    return;
  }

  try {
    const task = await updateTaskTitle(id, title.trim());

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

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(id)) {
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
