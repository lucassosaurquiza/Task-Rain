import { pool } from "../db.js";

export async function listTasks() {
  const result = await pool.query(`
    SELECT
      id,
      title,
     is_important as "isImportant",
     objective_id AS "objectiveId",
     created_at as "createdAt"
     FROM public.tasks
     ORDER BY created_at DESC, id DESC
  `);

  return result.rows;
}

export async function createTask(title: string) {
  const result = await pool.query(
    `INSERT INTO public.tasks (title)
     VALUES ($1)
     RETURNING id, title, is_important AS "isImportant",
     objective_id AS "objectiveId",
               created_at AS "createdAt"`,
    [title],
  );

  return result.rows[0];
}

export async function updateTaskTitle(id: string, title: string) {
  const result = await pool.query(
    `UPDATE public.tasks
     SET title = $1
     WHERE id = $2
     RETURNING id, title, is_important AS "isImportant",
     objective_id AS "objectiveId",
               created_at AS "createdAt"`,
    [title, id],
  );

  return result.rows[0] ?? null;
}

export async function updateTaskImportance(id: string, isImportant: boolean) {
  const result = await pool.query(
    `UPDATE public.tasks
     SET is_important = $1
     WHERE id = $2
     RETURNING id, title, is_important AS "isImportant",
     objective_id AS "objectiveId",
               created_at AS "createdAt"`,
    [isImportant, id],
  );

  return result.rows[0] ?? null;
}

export async function updateTaskObjective(
  id: string,
  objectiveId: string | null,
) {
  const result = await pool.query(
    `UPDATE public.tasks
     SET objective_id = $1
     WHERE id = $2
     RETURNING id, title, is_important AS "isImportant",
               objective_id AS "objectiveId",
               created_at AS "createdAt"`,
    [objectiveId, id],
  );

  return result.rows[0] ?? null;
}
