import { pool } from "../db.js";
import {
  findTaskForCommitment,
  completeTask,
} from "../repositories/tasks.repository.js";
import {
  getOrCreateWeek,
  getWeekBounds,
} from "../repositories/weeks.repository.js";
import {
  findWeeklyCommitment,
  getOrCreateWeeklyCommitment,
  listWeeklyCommitments,
  withdrawWeeklyCommitment,
  restoreWeeklyCommitment,
  completeWeeklyCommitment,
} from "../repositories/weekly-commitments.repository.js";

type CommitmentError =
  | "task_not_found"
  | "task_already_completed"
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
      let commitment = existing;

      if (task.completedAt === null && existing.withdrawnAt !== null) {
        const restored = await restoreWeeklyCommitment(
          client,
          task.id,
          week.id,
        );

        if (!restored) {
          throw new Error("No se pudo reincorporar el compromiso semanal");
        }

        commitment = restored;
      }

      await client.query("COMMIT");
      return { created: false, commitment };
    }

    if (task.completedAt !== null) {
      await client.query("ROLLBACK");
      return { error: "task_already_completed" };
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

export async function listCurrentWeeklyCommitments(
  onlyActive: boolean = false,
) {
  const client = await pool.connect();

  try {
    const referenceTime = new Date();
    const bounds = await getWeekBounds(client, referenceTime);

    return await listWeeklyCommitments(client, bounds.startsAt, onlyActive);
  } finally {
    client.release();
  }
}

export async function withdrawTaskFromCurrentWeek(taskId: string) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const task = await findTaskForCommitment(client, taskId);

    if (!task) {
      await client.query("ROLLBACK");
      return null;
    }

    const referenceTime = new Date();
    const bounds = await getWeekBounds(client, referenceTime);

    const commitment = await withdrawWeeklyCommitment(
      client,
      task.id,
      bounds.startsAt,
      referenceTime,
    );

    await client.query("COMMIT");
    return commitment;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function completeTaskAndCommitment(taskId: string) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existing = await findTaskForCommitment(client, taskId);

    if (!existing) {
      await client.query("ROLLBACK");
      return null;
    }

    const completedAt = new Date();
    const task = await completeTask(client, taskId, completedAt);

    if (!task) {
      throw new Error("No se pudo completar la tarea");
    }

    if (existing.completedAt === null) {
      await completeWeeklyCommitment(client, taskId, completedAt);
    }

    await client.query("COMMIT");
    return task;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
