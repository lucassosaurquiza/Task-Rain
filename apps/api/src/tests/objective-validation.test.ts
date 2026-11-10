import { test } from "node:test";
import assert from "node:assert/strict";
import { validateCreateObjective } from "../validation/objective.js";

test("normaliza el objetivo sin modificar la entrada", () => {
  const input = {
    title: "  Aprender backend  ",
    successCriterion: "  Completar una API  ",
    period: "monthly",
    motivation: "  Crear mis proyectos  ",
    reward: "   ",
    targetDate: "2028-02-29",
  };

  const original = { ...input };

  const result = validateCreateObjective(input);

  assert.deepEqual(result, {
    ok: true,
    data: {
      title: "Aprender backend",
      successCriterion: "Completar una API",
      period: "monthly",
      motivation: "Crear mis proyectos",
      reward: null,
      targetDate: "2028-02-29",
    },
  });

  assert.deepEqual(input, original);
});

test("acepta los tres periodos y prepara los opcionales ausentes", () => {
  for (const period of ["weekly", "monthly", "yearly"]) {
    const result = validateCreateObjective({
      title: "Aprender backend",
      successCriterion: "Completar una API",
      period,
    });

    assert.deepEqual(result, {
      ok: true,
      data: {
        title: "Aprender backend",
        successCriterion: "Completar una API",
        period,
        motivation: null,
        reward: null,
        targetDate: null,
      },
    });
  }
});

test("rechaza entradas que no son objetos de datos", () => {
  for (const input of [undefined, null, 123, false, "texto", []]) {
    const result = validateCreateObjective(input);

    assert.deepEqual(result, {
      ok: false,
      error: "El titulo debe ser un texto no vacio",
    });
  }
});
