import type { PoolClient } from "pg";

type CommitmentData = {
  taskId: string;
  objectiveId: string;
  weekId: string;
  addedAt: Date;
};

type WeeklyCommitment = CommitmentData & {
  id: string;
  withdrawnAt: Date | null;
  completedAt: Date | null;
};

export async function getOrCreateWeeklyCommitment(
  client: PoolClient,
  data: CommitmentData,
) {
  const inserted = await client.query<WeeklyCommitment>(
    `INSERT INTO public.weekly_commitments
       (task_id, objective_id, week_id, added_at)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (task_id, week_id) DO NOTHING
     RETURNING id, task_id AS "taskId",
               objective_id AS "objectiveId",
                              week_id AS "weekId", added_at AS "addedAt",
               withdrawn_at AS "withdrawnAt", completed_at AS "completedAt"`,

    [data.taskId, data.objectiveId, data.weekId, data.addedAt],
  );

  if (inserted.rows[0]) {
    return { created: true, commitment: inserted.rows[0] };
  }

  const commitment = await findWeeklyCommitment(
    client,
    data.taskId,
    data.weekId,
  );

  if (!commitment) {
    throw new Error("No se pudo obtener el compromiso semanal");
  }

  return { created: false, commitment };
}

export async function findWeeklyCommitment(
  client: PoolClient,
  taskId: string,
  weekId: string,
): Promise<WeeklyCommitment | null> {
  const result = await client.query<WeeklyCommitment>(
    `SELECT id, task_id AS "taskId",
            objective_id AS "objectiveId",
                       week_id AS "weekId", added_at AS "addedAt",
            withdrawn_at AS "withdrawnAt", completed_at AS "completedAt"
     FROM public.weekly_commitments
     WHERE task_id = $1 AND week_id = $2`,
    [taskId, weekId],
  );

  return result.rows[0] ?? null;
}

type WeeklyCommitmentListItem = WeeklyCommitment & {
  taskTitle: string;
  objectiveTitle: string;
};

export async function listWeeklyCommitments(
  client: PoolClient,
  weekStartsAt: Date,
  onlyActive: boolean = false,
): Promise<WeeklyCommitmentListItem[]> {
  const result = await client.query<WeeklyCommitmentListItem>(
    `SELECT
       c.id,
       c.task_id AS "taskId",
       t.title AS "taskTitle",
       c.objective_id AS "objectiveId",
       o.title AS "objectiveTitle",
       c.week_id AS "weekId",
       c.added_at AS "addedAt",
             c.withdrawn_at AS "withdrawnAt",
       c.completed_at AS "completedAt"
     FROM public.weekly_commitments AS c
     JOIN public.weeks AS w ON w.id = c.week_id
     JOIN public.tasks AS t ON t.id = c.task_id
     JOIN public.objectives AS o ON o.id = c.objective_id
     WHERE w.starts_at = $1
     AND ($2::boolean = false OR (
       c.withdrawn_at IS NULL AND c.completed_at IS NULL
     ))
     ORDER BY c.added_at ASC, c.id ASC`,
    [weekStartsAt, onlyActive],
  );

  return result.rows;
}

export async function withdrawWeeklyCommitment(
  client: PoolClient,
  taskId: string,
  weekStartsAt: Date,
  withdrawnAt: Date,
): Promise<WeeklyCommitment | null> {
  const result = await client.query<WeeklyCommitment>(
    `UPDATE public.weekly_commitments AS c
     SET withdrawn_at = COALESCE(c.withdrawn_at, $3)
     FROM public.weeks AS w
     WHERE w.id = c.week_id
       AND c.task_id = $1
       AND w.starts_at = $2
     RETURNING
       c.id,
       c.task_id AS "taskId",
       c.objective_id AS "objectiveId",
       c.week_id AS "weekId",
       c.added_at AS "addedAt",
             c.withdrawn_at AS "withdrawnAt",
       c.completed_at AS "completedAt"`,
    [taskId, weekStartsAt, withdrawnAt],
  );

  return result.rows[0] ?? null;
}

export async function restoreWeeklyCommitment(
  client: PoolClient,
  taskId: string,
  weekId: string,
): Promise<WeeklyCommitment | null> {
  const result = await client.query<WeeklyCommitment>(
    `UPDATE public.weekly_commitments
     SET withdrawn_at = NULL
     WHERE task_id = $1 AND week_id = $2
     RETURNING
       id,
       task_id AS "taskId",
       objective_id AS "objectiveId",
       week_id AS "weekId",
       added_at AS "addedAt",
          withdrawn_at AS "withdrawnAt",
       completed_at AS "completedAt"`,
    [taskId, weekId],
  );

  return result.rows[0] ?? null;
}

export async function completeWeeklyCommitment(
  client: PoolClient,
  taskId: string,
  completedAt: Date,
): Promise<boolean> {
  const result = await client.query(
    `UPDATE public.weekly_commitments AS c
     SET completed_at = COALESCE(c.completed_at, $2)
     FROM public.weeks AS w
     WHERE w.id = c.week_id
       AND c.task_id = $1
       AND w.starts_at <= $2
       AND $2 < w.ends_at
       AND c.added_at <= $2`,
    [taskId, completedAt],
  );

  return (result.rowCount ?? 0) > 0;
}
