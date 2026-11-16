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
