import { pool } from "../db.js";
import { findTaskForCommitment } from "../repositories/tasks.repository.js";
import {
  getOrCreateWeek,
  getWeekBounds,
} from "../repositories/weeks.repository.js";
import {
  findWeeklyCommitment,
  getOrCreateWeeklyCommitment,
  listWeeklyCommitments,
} from "../repositories/weekly-commitments.repository.js";

type CommitmentError =
  | "task_not_found"
  | "task_not_important"
  | "objective_required"
  | "objective_not_in_progress";

type CommitmentResult =
  | Awaited<ReturnType<typeof getOrCreateWeeklyCommitment>>
  | { error: CommitmentError };

export async function commitTaskToCurrentWeek(
  taskId: string,
): Promise<CommitmentResult> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN ISOLATION LEVEL READ COMMITTED");

    const task = await findTaskForCommitment(client, taskId);

    if (!task) {
      await client.query("ROLLBACK");
      return { error: "task_not_found" };
    }

    const referenceTime = new Date();
    const week = await getOrCreateWeek(client, referenceTime);

    const existing = await findWeeklyCommitment(client, task.id, week.id);

    if (existing) {
      await client.query("COMMIT");
      return { created: false, commitment: existing };
    }

    if (!task.isImportant) {
      await client.query("ROLLBACK");
      return { error: "task_not_important" };
    }

    if (!task.objectiveId) {
      await client.query("ROLLBACK");
      return { error: "objective_required" };
    }

    if (task.objectiveStatus !== "in_progress") {
      await client.query("ROLLBACK");
      return { error: "objective_not_in_progress" };
    }

    const result = await getOrCreateWeeklyCommitment(client, {
      taskId: task.id,
      objectiveId: task.objectiveId,
      weekId: week.id,
      addedAt: referenceTime,
    });

    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listCurrentWeeklyCommitments() {
  const client = await pool.connect();

  try {
    const referenceTime = new Date();
    const bounds = await getWeekBounds(client, referenceTime);

    return await listWeeklyCommitments(client, bounds.startsAt);
  } finally {
    client.release();
  }
}
