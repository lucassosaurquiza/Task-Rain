import { Router } from "express";
import { pool } from "../db.js";

export const taskRouter = Router();

taskRouter.get("/", async (_req, res) => {
  try {
    const result = await pool.query(`
    SELECT id, title, is_important AS "isImportant",
       created_at AS "createdAt"
    FROM public.tasks
    ORDER BY created_at DESC, id DESC
    `);
    res.json(result.rows);
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
    const result = await pool.query(
      `INSERT INTO public.tasks (title)
      VALUES ($1)
     RETURNING id, title, is_important AS "isImportant",
          created_at AS "createdAt"`,
      [title.trim()],
    );
    res.status(201).json(result.rows[0]);
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
    const result = await pool.query(
      `UPDATE public.tasks
       SET title = $1
       WHERE id = $2
       RETURNING id, title, is_important AS "isImportant",
          created_at AS "createdAt"`,
      [title.trim(), id],
    );

    if (result.rowCount === 0) {
      res.status(404).json({
        error: "La tarea no existe",
      });
      return;
    }

    res.status(200).json(result.rows[0]);
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
    const result = await pool.query(
      `UPDATE public.tasks
       SET is_important = $1
       WHERE id = $2
       RETURNING id, title, is_important AS "isImportant",
                 created_at AS "createdAt"`,
      [isImportant, id],
    );

    if (result.rowCount === 0) {
      res.status(404).json({
        error: "La tarea no existe",
      });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error al cambiar importancia:", error);

    res.status(500).json({
      error: "No se pudo cambiar la importancia de la tarea",
    });
  }
});
