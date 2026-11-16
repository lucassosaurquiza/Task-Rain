import type { PoolClient } from "pg";

type CommitmentData = {
  taskId: string;
  objectiveId: string;
  weekId: string;
  addedAt: Date;
};

type WeeklyCommitment = CommitmentData & {
  id: string;
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
               week_id AS "weekId", added_at AS "addedAt"`,
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
            week_id AS "weekId", added_at AS "addedAt"
     FROM public.weekly_commitments
     WHERE task_id = $1 AND week_id = $2`,
    [taskId, weekId],
  );

  return result.rows[0] ?? null;
}
