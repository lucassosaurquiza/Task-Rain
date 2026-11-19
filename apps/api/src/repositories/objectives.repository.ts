import { pool } from "../db.js";
import type { CreateObjectiveData } from "../validation/objective.js";

export async function listObjectives() {
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

  return result.rows;
}

export async function createObjective(data: CreateObjectiveData) {
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

  return result.rows[0];
}
