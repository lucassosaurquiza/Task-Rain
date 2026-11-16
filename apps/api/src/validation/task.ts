import { isValidUuid } from "./uuid.js";

type TaskTitleValidationResult =
  | { ok: true; data: string }
  | { ok: false; error: string };

export function validateTaskTitle(value: unknown): TaskTitleValidationResult {
  if (typeof value !== "string" || value.trim().length === 0) {
    return {
      ok: false,
      error: "El titulo debe ser un texto no vacio",
    };
  }

  return {
    ok: true,
    data: value.trim(),
  };
}

type TaskObjectiveValidationResult =
  | { ok: true; data: string | null }
  | { ok: false; error: string };

export function validateTaskObjective(
  value: unknown,
): TaskObjectiveValidationResult {
  if (value === null) {
    return { ok: true, data: null };
  }

  if (typeof value !== "string" || !isValidUuid(value)) {
    return {
      ok: false,
      error: "El objetivo debe ser un UUID valido o null",
    };
  }

  return { ok: true, data: value };
}
