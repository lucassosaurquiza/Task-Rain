import { Router } from "express";
import { pool } from "../db.js";
import { isValidDateOnly } from "../validation/date.js";

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
  const targetDate: unknown = req.body?.targetDate;
  const reward: unknown = req.body?.reward;
  const motivation: unknown = req.body?.motivation;
  const title: unknown = req.body?.title;
  const successCriterion: unknown = req.body?.successCriterion;
  const period: unknown = req.body?.period;

  if (typeof title !== "string" || title.trim().length === 0) {
    res.status(400).json({
      error: "El titulo debe ser un texto no vacio",
    });
    return;
  }

  if (
    typeof successCriterion !== "string" ||
    successCriterion.trim().length === 0
  ) {
    res.status(400).json({
      error: "El criterio de logro debe ser un texto no vacio",
    });
    return;
  }

  if (
    typeof period !== "string" ||
    !["weekly", "monthly", "yearly"].includes(period)
  ) {
    res.status(400).json({
      error: "El periodo debe ser semanal, mensual o anual",
    });
    return;
  }

  if (
    motivation !== undefined &&
    motivation !== null &&
    typeof motivation !== "string"
  ) {
    res.status(400).json({
      error: "La motivacion debe ser un texto",
    });
    return;
  }

  let normalizedMotivation: string | null = null;
  if (typeof motivation === "string") {
    const trimmedMotivation = motivation.trim();

    if (trimmedMotivation.length > 0) {
      normalizedMotivation = trimmedMotivation;
    }
  }

  if (reward !== undefined && reward !== null && typeof reward !== "string") {
    res.status(400).json({
      error: "La recompensa debe ser un texto",
    });
    return;
  }

  let normalizedReward: string | null = null;

  if (typeof reward === "string") {
    const trimmedReward = reward.trim();

    if (trimmedReward.length > 0) {
      normalizedReward = trimmedReward;
    }
  }

  let normalizedTargetDate: string | null = null;

  if (targetDate !== undefined && targetDate !== null) {
    if (typeof targetDate !== "string" || !isValidDateOnly(targetDate)) {
      res.status(400).json({
        error: "La fecha objetivo debe ser una fecha valida YYYY-MM-DD",
      });
      return;
    }

    normalizedTargetDate = targetDate;
  }

  try {
    const result = await pool.query(
      `INSERT INTO public.objectives (
     title, success_criterion, period, motivation, reward, target_date
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
        title.trim(),
        successCriterion.trim(),
        period,
        normalizedMotivation,
        normalizedReward,
        normalizedTargetDate,
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
