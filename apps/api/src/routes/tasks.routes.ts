import { Router } from "express";
import { pool } from "../db.js";

export const taskRouter = Router();

taskRouter.get("/", async (_req, res) => {
  try {
    const result = await pool.query(`
    SELECT id, title, created_at AS "createdAt"
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
      RETURNING id, title, created_at as "createdAt"`,
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
