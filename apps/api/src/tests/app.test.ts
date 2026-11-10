import { after, before, test } from "node:test";
import { app } from "../app.js";
import { pool } from "../db.js";
import { randomUUID } from "node:crypto";

import assert from "node:assert/strict";
import request from "supertest";

before(async () => {
  assert.equal(process.env.NODE_ENV, "test");
  assert.equal(process.env.PGDATABASE, "task_rain_test");

  const resuult = await pool.query("SELECT current_database() as database");

  assert.equal(resuult.rows[0].database, "task_rain_test");
});

after(async () => {
  await pool.end();
});

test("GET /health responde 200 y status ok", async () => {
  const response = await request(app).get("/health");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: "ok" });
});

test("POST /tasks rechaza un titulo vacio", async () => {
  const response = await request(app).post("/tasks").send({ title: "  " });

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, {
    error: "El titulo debe ser un texto no vacio",
  });
});

test("POST /tasks rechaza un titulo numerico", async () => {
  const response = await request(app).post("/tasks").send({ title: 123 });

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, {
    error: "El titulo debe ser un texto no vacio",
  });
});

test("crea una tarea y la devuelve al listar", async (t) => {
  const title = `Prueba automatizada ${randomUUID()}`;

  t.after(async () => {
    await pool.query("DELETE FROM public.tasks WHERE title = $1", [title]);
  });

  const created = await request(app).post("/tasks").send({ title });

  assert.equal(created.status, 201);
  assert.equal(created.body.isImportant, false);
  assert.equal(typeof created.body.id, "string");
  assert.equal(created.body.title, title);
  assert.equal(typeof created.body.createdAt, "string");
  assert.ok(Number.isFinite(Date.parse(created.body.createdAt)));

  const listed = await request(app).get("/tasks");

  assert.equal(listed.status, 200);
  assert.ok(Array.isArray(listed.body));

  const savedTask = listed.body.find(
    (task: { id: string }) => task.id === created.body.id,
  );

  assert.deepEqual(savedTask, created.body);
});

test("edita el titulo y conserva el id y la fecha", async (t) => {
  const title = `Prueba de edicion ${randomUUID()}`;

  const created = await request(app).post("/tasks").send({ title });

  assert.equal(created.status, 201);

  const { id, createdAt } = created.body;

  t.after(async () => {
    await pool.query("DELETE FROM public.tasks WHERE id = $1", [id]);
  });

  const updatedTitle = `${title} actualizada`;

  const updated = await request(app)
    .patch(`/tasks/${id}`)
    .send({ title: `  ${updatedTitle}  ` });

  assert.equal(updated.status, 200);
  assert.deepEqual(updated.body, {
    id,
    title: updatedTitle,
    isImportant: false,
    createdAt,
  });

  const listed = await request(app).get("/tasks");

  assert.equal(listed.status, 200);

  const savedTask = listed.body.find((task: { id: string }) => task.id === id);

  assert.deepEqual(savedTask, updated.body);
});

test("PATCH /tasks rechaza un id invalido", async () => {
  const response = await request(app)
    .patch("/tasks/abc")
    .send({ title: "Titulo actualizado" });

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, {
    error: "El identificador debe ser un UUID valido",
  });
});

test("PATCH /tasks devuelve 404 si la tarea no existe", async () => {
  const nonexistentId = randomUUID();

  const response = await request(app)
    .patch(`/tasks/${nonexistentId}`)
    .send({ title: "Titulo actualizado" });

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, {
    error: "La tarea no existe",
  });
});

test("PATCH rechaza titulos invalidos sin modificar la tarea", async (t) => {
  const title = `Validacion de edicion ${randomUUID()}`;

  const created = await request(app).post("/tasks").send({ title });

  assert.equal(created.status, 201);

  const { id } = created.body;

  t.after(async () => {
    await pool.query("DELETE FROM public.tasks WHERE id = $1", [id]);
  });

  const invalidBodies = [
    { title: "" },
    { title: "   " },
    { title: 123 },
    { title: null },
    {},
  ];

  for (const body of invalidBodies) {
    const response = await request(app).patch(`/tasks/${id}`).send(body);

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, {
      error: "El titulo debe ser un texto no vacio",
    });

    const listed = await request(app).get("/tasks");

    assert.equal(listed.status, 200);

    const savedTask = listed.body.find(
      (task: { id: string }) => task.id === id,
    );

    assert.deepEqual(savedTask, created.body);
  }
});

test("marca y desmarca importancia conservando los otros datos", async (t) => {
  const title = `Prueba de importancia ${randomUUID()}`;

  const created = await request(app).post("/tasks").send({ title });

  assert.equal(created.status, 201);

  const { id } = created.body;

  t.after(async () => {
    await pool.query("DELETE FROM public.tasks WHERE id = $1", [id]);
  });

  for (const isImportant of [true, true, false, false]) {
    const updated = await request(app)
      .patch(`/tasks/${id}/importance`)
      .send({ isImportant });

    const expected = {
      ...created.body,
      isImportant,
    };

    assert.equal(updated.status, 200);
    assert.deepEqual(updated.body, expected);

    const listed = await request(app).get("/tasks");

    assert.equal(listed.status, 200);

    const savedTask = listed.body.find(
      (task: { id: string }) => task.id === id,
    );

    assert.deepEqual(savedTask, expected);
  }
});

test("PATCH importance rechaza un id invalido", async () => {
  const response = await request(app)
    .patch("/tasks/abc/importance")
    .send({ isImportant: true });

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, {
    error: "El identificador debe ser un UUID valido",
  });
});

test("PATCH importance devuelve 404 si la tarea no existe", async () => {
  const nonexistentId = randomUUID();

  const response = await request(app)
    .patch(`/tasks/${nonexistentId}/importance`)
    .send({ isImportant: true });

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, {
    error: "La tarea no existe",
  });
});

test("PATCH importance rechaza valores invalidos sin modificar la tarea", async (t) => {
  const title = `Validacion de importancia ${randomUUID()}`;

  const created = await request(app).post("/tasks").send({ title });

  assert.equal(created.status, 201);

  const { id } = created.body;

  t.after(async () => {
    await pool.query("DELETE FROM public.tasks WHERE id = $1", [id]);
  });

  const marked = await request(app)
    .patch(`/tasks/${id}/importance`)
    .send({ isImportant: true });

  const expected = {
    ...created.body,
    isImportant: true,
  };

  assert.equal(marked.status, 200);
  assert.deepEqual(marked.body, expected);

  const invalidBodies = [
    { isImportant: "true" },
    { isImportant: "false" },
    { isImportant: 1 },
    { isImportant: 0 },
    { isImportant: null },
    {},
  ];

  for (const body of invalidBodies) {
    const response = await request(app)
      .patch(`/tasks/${id}/importance`)
      .send(body);

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, {
      error: "isImportant debe ser un booleano",
    });

    const listed = await request(app).get("/tasks");

    assert.equal(listed.status, 200);

    const savedTask = listed.body.find(
      (task: { id: string }) => task.id === id,
    );

    assert.deepEqual(savedTask, expected);
  }
});

test("crea un objetivo y lo devuelve al listar", async (t) => {
  const title = `Objetivo de prueba ${randomUUID()}`;
  const successCriterion = "Completar los cuatro modulos";

  t.after(async () => {
    await pool.query("DELETE FROM public.objectives WHERE title = $1", [title]);
  });

  const created = await request(app)
    .post("/objectives")
    .send({
      title: `  ${title}  `,
      successCriterion: `  ${successCriterion}  `,
      period: "monthly",
    });

  assert.equal(created.status, 201);
  assert.equal(typeof created.body.id, "string");
  assert.equal(created.body.title, title);
  assert.equal(created.body.successCriterion, successCriterion);
  assert.equal(created.body.period, "monthly");
  assert.equal(created.body.status, "in_progress");
  assert.equal(created.body.motivation, null);
  assert.equal(created.body.reward, null);
  assert.equal(created.body.targetDate, null);
  assert.equal(typeof created.body.createdAt, "string");
  assert.ok(Number.isFinite(Date.parse(created.body.createdAt)));

  const listed = await request(app).get("/objectives");

  assert.equal(listed.status, 200);
  assert.ok(Array.isArray(listed.body));

  const savedObjective = listed.body.find(
    (objective: { id: string }) => objective.id === created.body.id,
  );

  assert.deepEqual(savedObjective, created.body);
});

const invalidObjectiveCases = [
  {
    field: "title",
    values: ["", "   ", 123, null, undefined],
    error: "El titulo debe ser un texto no vacio",
  },
  {
    field: "successCriterion",
    values: ["", "   ", 123, null, undefined],
    error: "El criterio de logro debe ser un texto no vacio",
  },
  {
    field: "period",
    values: ["daily", "", 123, null, undefined],
    error: "El periodo debe ser semanal, mensual o anual",
  },
];

for (const { field, values, error } of invalidObjectiveCases) {
  test(`POST /objectives rechaza ${field} invalido`, async () => {
    for (const value of values) {
      const response = await request(app)
        .post("/objectives")
        .send({
          title: "Completar el curso",
          successCriterion: "Terminar los cuatro modulos",
          period: "monthly",
          [field]: value,
        });

      assert.equal(
        response.status,
        400,
        `Debe rechazar ${field} con valor ${String(value)}`,
      );

      assert.deepEqual(response.body, { error });
    }
  });
}

test("guarda motivacion y recompensa sin espacios en los extremos", async (t) => {
  const title = `Objetivo con extras ${randomUUID()}`;

  t.after(async () => {
    await pool.query("DELETE FROM public.objectives WHERE title = $1", [title]);
  });

  const created = await request(app).post("/objectives").send({
    title,
    successCriterion: "Crear una API con pruebas",
    period: "monthly",
    motivation: "  Construir mis proyectos  ",
    reward: "  Una salida al cine  ",
  });

  assert.equal(created.status, 201);
  assert.equal(created.body.motivation, "Construir mis proyectos");
  assert.equal(created.body.reward, "Una salida al cine");

  const listed = await request(app).get("/objectives");

  assert.equal(listed.status, 200);

  const savedObjective = listed.body.find(
    (objective: { id: string }) => objective.id === created.body.id,
  );

  assert.deepEqual(savedObjective, created.body);
});

test("guarda los textos opcionales vacios como null", async (t) => {
  for (const value of ["", "   ", null, undefined]) {
    const title = `Objetivo sin extras ${randomUUID()}`;

    t.after(async () => {
      await pool.query("DELETE FROM public.objectives WHERE title = $1", [
        title,
      ]);
    });

    const created = await request(app).post("/objectives").send({
      title,
      successCriterion: "Completar los ejercicios",
      period: "monthly",
      motivation: value,
      reward: value,
    });

    assert.equal(created.status, 201);
    assert.equal(created.body.motivation, null);
    assert.equal(created.body.reward, null);

    const listed = await request(app).get("/objectives");

    assert.equal(listed.status, 200);

    const savedObjective = listed.body.find(
      (objective: { id: string }) => objective.id === created.body.id,
    );

    assert.deepEqual(savedObjective, created.body);
  }
});

const invalidOptionalTextCases = [
  {
    field: "motivation",
    error: "La motivacion debe ser un texto",
  },
  {
    field: "reward",
    error: "La recompensa debe ser un texto",
  },
];

for (const { field, error } of invalidOptionalTextCases) {
  test(`POST /objectives rechaza tipos invalidos en ${field}`, async (t) => {
    const title = `Opcional invalido ${randomUUID()}`;

    t.after(async () => {
      await pool.query("DELETE FROM public.objectives WHERE title = $1", [
        title,
      ]);
    });

    for (const value of [123, 0, true, false, {}, []]) {
      const response = await request(app)
        .post("/objectives")
        .send({
          title,
          successCriterion: "Completar los ejercicios",
          period: "monthly",
          [field]: value,
        });

      assert.equal(
        response.status,
        400,
        `Debe rechazar ${field} con valor ${JSON.stringify(value)}`,
      );

      assert.deepEqual(response.body, { error });

      const stored = await pool.query(
        "SELECT id FROM public.objectives WHERE title = $1",
        [title],
      );

      assert.equal(stored.rows.length, 0);
    }
  });
}

test("conserva la fecha objetivo al crear y listar", async (t) => {
  const title = `Objetivo con fecha ${randomUUID()}`;
  const targetDate = "2028-02-29";

  t.after(async () => {
    await pool.query("DELETE FROM public.objectives WHERE title = $1", [title]);
  });

  const created = await request(app).post("/objectives").send({
    title,
    successCriterion: "Completar los ejercicios",
    period: "monthly",
    targetDate,
  });

  assert.equal(created.status, 201);
  assert.equal(created.body.targetDate, targetDate);

  const listed = await request(app).get("/objectives");

  assert.equal(listed.status, 200);

  const savedObjective = listed.body.find(
    (objective: { id: string }) => objective.id === created.body.id,
  );

  assert.deepEqual(savedObjective, created.body);
});

test("permite crear un objetivo con targetDate null", async (t) => {
  const title = `Objetivo sin fecha ${randomUUID()}`;

  t.after(async () => {
    await pool.query("DELETE FROM public.objectives WHERE title = $1", [title]);
  });

  const created = await request(app).post("/objectives").send({
    title,
    successCriterion: "Completar los ejercicios",
    period: "monthly",
    targetDate: null,
  });

  assert.equal(created.status, 201);
  assert.equal(created.body.targetDate, null);

  const listed = await request(app).get("/objectives");

  assert.equal(listed.status, 200);

  const savedObjective = listed.body.find(
    (objective: { id: string }) => objective.id === created.body.id,
  );

  assert.deepEqual(savedObjective, created.body);
});

test("rechaza fechas objetivo invalidas sin crear registros", async (t) => {
  const title = `Objetivo con fecha invalida ${randomUUID()}`;

  t.after(async () => {
    await pool.query("DELETE FROM public.objectives WHERE title = $1", [title]);
  });

  const invalidDates = [
    "",
    "   ",
    "2026-02-31",
    "2026-02-29",
    "30/11/2026",
    "2026-11-30T00:00:00Z",
    " 2026-11-30 ",
    123,
    false,
    {},
    [],
  ];

  for (const targetDate of invalidDates) {
    const response = await request(app).post("/objectives").send({
      title,
      successCriterion: "Completar los ejercicios",
      period: "monthly",
      targetDate,
    });

    assert.equal(
      response.status,
      400,
      `Debe rechazar ${JSON.stringify(targetDate)}`,
    );

    assert.deepEqual(response.body, {
      error: "La fecha objetivo debe ser una fecha valida YYYY-MM-DD",
    });

    const stored = await pool.query(
      "SELECT id FROM public.objectives WHERE title = $1",
      [title],
    );

    assert.equal(stored.rows.length, 0);
  }
});
