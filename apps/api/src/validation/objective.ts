import { isValidDateOnly } from "./date.js";

export function validateCreateObjective(
  input: unknown,
): ObjectiveValidationResult {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return {
      ok: false,
      error: "El titulo debe ser un texto no vacio",
    };
  }

  const body = input as Record<string, unknown>;

  const { title, successCriterion, period, motivation, reward, targetDate } =
    body;

  if (typeof title !== "string" || title.trim().length === 0) {
    return {
      ok: false,
      error: "El titulo debe ser un texto no vacio",
    };
  }

  if (
    typeof successCriterion !== "string" ||
    successCriterion.trim().length === 0
  ) {
    return {
      ok: false,
      error: "El criterio de logro debe ser un texto no vacio",
    };
  }

  if (period !== "weekly" && period !== "monthly" && period !== "yearly") {
    return {
      ok: false,
      error: "El periodo debe ser semanal, mensual o anual",
    };
  }

  if (
    motivation !== undefined &&
    motivation !== null &&
    typeof motivation !== "string"
  ) {
    return {
      ok: false,
      error: "La motivacion debe ser un texto",
    };
  }

  if (reward !== undefined && reward !== null && typeof reward !== "string") {
    return {
      ok: false,
      error: "La recompensa debe ser un texto",
    };
  }

  let normalizedTargetDate: string | null = null;

  if (targetDate !== undefined && targetDate !== null) {
    if (typeof targetDate !== "string" || !isValidDateOnly(targetDate)) {
      return {
        ok: false,
        error: "La fecha objetivo debe ser una fecha valida YYYY-MM-DD",
      };
    }

    normalizedTargetDate = targetDate;
  }

  return {
    ok: true,
    data: {
      title: title.trim(),
      successCriterion: successCriterion.trim(),
      period,
      motivation:
        typeof motivation === "string" ? motivation.trim() || null : null,
      reward: typeof reward === "string" ? reward.trim() || null : null,
      targetDate: normalizedTargetDate,
    },
  };
}

export type CreateObjectiveData = {
  title: string;
  successCriterion: string;
  period: "weekly" | "monthly" | "yearly";
  motivation: string | null;
  reward: string | null;
  targetDate: string | null;
};

export type ObjectiveValidationResult =
  | {
      ok: true;
      data: CreateObjectiveData;
    }
  | {
      ok: false;
      error: string;
    };
