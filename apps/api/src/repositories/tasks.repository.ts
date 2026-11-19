import { pool } from "../db.js";
import type { PoolClient } from "pg";

export async function listTasks() {
  const result = await pool.query(`
    SELECT
      id,
      title,
     is_important as "isImportant",
     objective_id AS "objectiveId",
      created_at AS "createdAt",
               completed_at AS "completedAt"
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
               created_at AS "createdAt",
               completed_at AS "completedAt"`,
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
               created_at AS "createdAt",
               completed_at AS "completedAt"`,
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
                created_at AS "createdAt",
               completed_at AS "completedAt"`,
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
                created_at AS "createdAt",
               completed_at AS "completedAt"`,
    [objectiveId, id],
  );

  return result.rows[0] ?? null;
}

type TaskForCommitment = {
  id: string;
  isImportant: boolean;
  objectiveId: string | null;
  objectiveStatus: "in_progress" | "achieved" | null;
  completedAt: Date | null;
};

export async function findTaskForCommitment(
  client: PoolClient,
  id: string,
): Promise<TaskForCommitment | null> {
  const result = await client.query<TaskForCommitment>(
    `SELECT
       t.id,
       t.completed_at AS "completedAt",
       t.is_important AS "isImportant",
       t.objective_id AS "objectiveId",
       o.status AS "objectiveStatus"
     FROM public.tasks AS t
     LEFT JOIN public.objectives AS o ON o.id = t.objective_id
     WHERE t.id = $1
     FOR UPDATE OF t`,
    [id],
  );

  return result.rows[0] ?? null;
}

export async function completeTask(
  client: PoolClient,
  taskId: string,
  completedAt: Date,
) {
  const result = await client.query(
    `UPDATE public.tasks
     SET completed_at = COALESCE(completed_at, $2)
     WHERE id = $1
     RETURNING
       id,
       title,
       is_important AS "isImportant",
       objective_id AS "objectiveId",
       created_at AS "createdAt",
       completed_at AS "completedAt"`,
    [taskId, completedAt],
  );

  return result.rows[0] ?? null;
}
