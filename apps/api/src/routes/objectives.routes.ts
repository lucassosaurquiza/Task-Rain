import { Router } from "express";
import { pool } from "../db.js";
import { validateCreateObjective } from "../validation/objective.js";

export const objectiveRouter = Router();

objectiveRouter.get("/", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        title,
        success_criterion AS "successCriterion",
        period,
        status,
        motivation,
        reward,
        to_char(target_date, 'YYYY-MM-DD') AS "targetDate",
        created_at AS "createdAt"
      FROM public.objectives
      ORDER BY created_at DESC, id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error al listar objetivos:", error);

    res.status(500).json({
      error: "No se pudieron obtener los objetivos",
    });
  }
});

objectiveRouter.post("/", async (req, res) => {
  const validation = validateCreateObjective(req.body);

  if (!validation.ok) {
    res.status(400).json({
      error: validation.error,
    });
    return;
  }

  const data = validation.data;

  try {
    const result = await pool.query(
      `INSERT INTO public.objectives (
         title, success_criterion, period,
         motivation, reward, target_date
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING
         id,
         title,
         success_criterion AS "successCriterion",
         period,
         status,
         motivation,
         reward,
         to_char(target_date, 'YYYY-MM-DD') AS "targetDate",
         created_at AS "createdAt"`,
      [
        data.title,
        data.successCriterion,
        data.period,
        data.motivation,
        data.reward,
        data.targetDate,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear objetivo:", error);

    res.status(500).json({
      error: "No se pudo crear el objetivo",
    });
  }
});
