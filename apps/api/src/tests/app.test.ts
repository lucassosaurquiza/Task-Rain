import { after, before, test } from "node:test";
import { app } from "../app.js";
import { pool } from "../db.js";
import { randomUUID } from "node:crypto";
import { getWeekBounds, getOrCreateWeek } from "../repositories/weeks.repository.js";
import { getOrCreateWeeklyCommitment, listWeeklyCommitments } from "../repositories/weekly-commitments.repository.js";

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

test("calcula semanas de Buenos Aires respetando el lunes y el cambio de año", async () => {
  const cases = [
    {
      instant: "2026-11-16T02:59:59.999Z",
      start: "2026-11-09T03:00:00.000Z",
      end: "2026-11-16T03:00:00.000Z",
    },
    {
      instant: "2026-11-16T03:00:00.000Z",
      start: "2026-11-16T03:00:00.000Z",
      end: "2026-11-23T03:00:00.000Z",
    },
    {
      instant: "2027-01-01T12:00:00.000Z",
      start: "2026-12-28T03:00:00.000Z",
      end: "2027-01-04T03:00:00.000Z",
    },
  ];
  const client = await pool.connect();
  try {
    for (const { instant, start, end } of cases) {
      const bounds = await getWeekBounds(client, new Date(instant));
      assert.equal(bounds.startsAt.toISOString(), start, instant);
      assert.equal(bounds.endsAt.toISOString(), end, instant);
    }
  } finally {
    client.release();
  }
});

test("el calendario semanal no depende de la zona horaria de la conexion", async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const zone of ["UTC", "Asia/Tokyo", "America/Los_Angeles"]) {
      await client.query("SELECT set_config('TimeZone', $1, true)", [zone]);
      const bounds = await getWeekBounds(
        client,
        new Date("2026-11-16T02:59:59.999Z"),
      );
      assert.equal(bounds.startsAt.toISOString(), "2026-11-09T03:00:00.000Z", zone);
      assert.equal(bounds.endsAt.toISOString(), "2026-11-16T03:00:00.000Z", zone);
    }
  } finally {
    try {
      await client.query("ROLLBACK");
    } finally {
      client.release();
    }
  }
});

test("crea y reutiliza semanas sin dejar registros despues de rollback", async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const reference = await client.query<{ instant: Date }>(
      `SELECT COALESCE(MAX(ends_at), TIMESTAMPTZ '2040-01-02 03:00:00+00')
              + INTERVAL '1 week' AS instant
       FROM public.weeks`,
    );
    const first = await getOrCreateWeek(client, reference.rows[0].instant);
    const repeated = await getOrCreateWeek(client, first.startsAt);
    const later = await getOrCreateWeek(
      client,
      new Date(first.endsAt.getTime() - 1),
    );
    assert.deepEqual(repeated, first);
    assert.deepEqual(later, first);

    const next = await getOrCreateWeek(client, first.endsAt);
    assert.notEqual(next.id, first.id);
    assert.equal(next.startsAt.toISOString(), first.endsAt.toISOString());

    const stored = await client.query(
      "SELECT id FROM public.weeks WHERE starts_at IN ($1, $2)",
      [first.startsAt, next.startsAt],
    );
    assert.equal(stored.rows.length, 2);

    await client.query("ROLLBACK");
    const remaining = await client.query(
      "SELECT id FROM public.weeks WHERE id IN ($1, $2)",
      [first.id, next.id],
    );
    assert.equal(remaining.rows.length, 0);
  } finally {
    try {
      await client.query("ROLLBACK");
    } finally {
      client.release();
    }
  }
});

test("reutiliza el compromiso original y permite otro en la semana siguiente", async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const task = await client.query<{ id: string }>(
      "INSERT INTO public.tasks (title) VALUES ($1) RETURNING id",
      [`Compromiso de prueba ${randomUUID()}`],
    );
    const objectives = await client.query<{ id: string }>(
      `INSERT INTO public.objectives (title, success_criterion, period)
       VALUES ($1, 'Completar la practica', 'weekly'),
              ($2, 'Completar otra practica', 'monthly')
       RETURNING id`,
      [`Objetivo A ${randomUUID()}`, `Objetivo B ${randomUUID()}`],
    );
    const reference = await client.query<{ instant: Date }>(
      `SELECT COALESCE(MAX(ends_at), TIMESTAMPTZ '2040-01-02 03:00:00+00')
              + INTERVAL '1 week' AS instant FROM public.weeks`,
    );
    const week = await getOrCreateWeek(client, reference.rows[0].instant);
    const input = {
      taskId: task.rows[0].id,
      objectiveId: objectives.rows[0].id,
      weekId: week.id,
      addedAt: week.startsAt,
    };
    const first = await getOrCreateWeeklyCommitment(client, input);
    assert.equal(first.created, true);
    assert.deepEqual(first.commitment, { id: first.commitment.id, ...input });

    const repeated = await getOrCreateWeeklyCommitment(client, {
      ...input,
      objectiveId: objectives.rows[1].id,
      addedAt: new Date(week.startsAt.getTime() + 1000),
    });
    assert.equal(repeated.created, false);
    assert.deepEqual(repeated.commitment, first.commitment);

    const nextWeek = await getOrCreateWeek(client, week.endsAt);
    const next = await getOrCreateWeeklyCommitment(client, {
      ...input,
      objectiveId: objectives.rows[1].id,
      weekId: nextWeek.id,
      addedAt: nextWeek.startsAt,
    });
    assert.equal(next.created, true);
    assert.notEqual(next.commitment.id, first.commitment.id);
    assert.equal(next.commitment.objectiveId, objectives.rows[1].id);
    assert.equal(next.commitment.weekId, nextWeek.id);

    const stored = await client.query(
      "SELECT id FROM public.weekly_commitments WHERE task_id = $1",
      [input.taskId],
    );
    assert.equal(stored.rows.length, 2);
  } finally {
    try {
      await client.query("ROLLBACK");
    } finally {
      client.release();
    }
  }
});

test("lista solo la semana solicitada, ordena y conserva el objetivo del compromiso", async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const reference = await client.query<{ instant: Date }>(
      `SELECT COALESCE(MAX(ends_at), TIMESTAMPTZ '2040-01-02 03:00:00+00')
       + INTERVAL '1 week' AS instant FROM public.weeks`,
    );
    const bounds = await getWeekBounds(client, reference.rows[0].instant);
    assert.deepEqual(await listWeeklyCommitments(client, bounds.startsAt), []);
    const absent = await client.query("SELECT id FROM public.weeks WHERE starts_at = $1", [bounds.startsAt]);
    assert.equal(absent.rowCount, 0);
    const week = await getOrCreateWeek(client, bounds.startsAt);
    assert.deepEqual(await listWeeklyCommitments(client, bounds.startsAt), []);
    const nextWeek = await getOrCreateWeek(client, bounds.endsAt);
    const objectives = await client.query<{ id: string; title: string }>(
      `INSERT INTO public.objectives (title, success_criterion, period)
       VALUES ($1, 'Practicar', 'weekly'), ($2, 'Practicar', 'weekly') RETURNING id, title`,
      [`Original ${randomUUID()}`, `Actual ${randomUUID()}`],
    );
    const tasks = await client.query<{ id: string; title: string }>(
      `INSERT INTO public.tasks (title, objective_id)
       VALUES ($1, $3), ($2, $3) RETURNING id, title`,
      [`Primera ${randomUUID()}`, `Segunda ${randomUUID()}`, objectives.rows[1].id],
    );
    const expected = [];
    for (const task of tasks.rows) {
      const result = await getOrCreateWeeklyCommitment(client, {
        taskId: task.id, objectiveId: objectives.rows[0].id,
        weekId: week.id, addedAt: week.startsAt,
      });
      expected.push({ ...result.commitment, taskTitle: task.title, objectiveTitle: objectives.rows[0].title });
    }
    await getOrCreateWeeklyCommitment(client, {
      taskId: tasks.rows[0].id, objectiveId: objectives.rows[1].id,
      weekId: nextWeek.id, addedAt: nextWeek.startsAt,
    });
    expected.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
    assert.deepEqual(await listWeeklyCommitments(client, week.startsAt), expected);
    const next = await listWeeklyCommitments(client, nextWeek.startsAt);
    assert.equal(next.length, 1);
    assert.equal(next[0].weekId, nextWeek.id);
    assert.equal(next[0].objectiveId, objectives.rows[1].id);
  } finally {
    try { await client.query("ROLLBACK"); } finally { client.release(); }
  }
});

test("GET current responde con los compromisos actuales sin modificar semanas ni compromisos", async () => {
  const weeksBefore = await pool.query("SELECT * FROM public.weeks ORDER BY id");
  const commitmentsBefore = await pool.query("SELECT * FROM public.weekly_commitments ORDER BY id");
  const response = await request(app).get("/weekly-commitments/current");
  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body));
  const expected = await pool.query(
    `SELECT c.id, c.task_id AS "taskId", t.title AS "taskTitle",
      c.objective_id AS "objectiveId", o.title AS "objectiveTitle",
      c.week_id AS "weekId", c.added_at AS "addedAt"
     FROM public.weekly_commitments c
     JOIN public.weeks w ON w.id = c.week_id
     JOIN public.tasks t ON t.id = c.task_id
     JOIN public.objectives o ON o.id = c.objective_id
     WHERE w.starts_at <= CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP < w.ends_at
     ORDER BY c.added_at, c.id`,
  );
  assert.deepEqual(response.body, JSON.parse(JSON.stringify(expected.rows)));
  assert.deepEqual((await pool.query("SELECT * FROM public.weeks ORDER BY id")).rows, weeksBefore.rows);
  assert.deepEqual((await pool.query("SELECT * FROM public.weekly_commitments ORDER BY id")).rows, commitmentsBefore.rows);
});

test("POST commitments rechaza UUID invalido y tarea inexistente", async () => {
  const invalid = await request(app).post("/tasks/abc/commitments");
  assert.equal(invalid.status, 400);
  const missing = await request(app).post(`/tasks/${randomUUID()}/commitments`);
  assert.equal(missing.status, 404);
  assert.deepEqual(missing.body, { error: "La tarea no existe" });
});

test("POST commitments valida las reglas y revierte las escrituras rechazadas", async (t) => {
  const taskIds: string[] = [];
  const objectiveIds: string[] = [];
  t.after(async () => {
    await pool.query("DELETE FROM public.tasks WHERE id = ANY($1::uuid[])", [taskIds]);
    await pool.query("DELETE FROM public.objectives WHERE id = ANY($1::uuid[])", [objectiveIds]);
  });

  const objective = await pool.query<{ id: string }>(
    `INSERT INTO public.objectives (title, success_criterion, period, status)
     VALUES ($1, 'Practicar', 'weekly', 'achieved') RETURNING id`,
    [`Objetivo logrado ${randomUUID()}`],
  );
  objectiveIds.push(objective.rows[0].id);
  const beforeWeeks = await pool.query("SELECT id FROM public.weeks ORDER BY id");

  const cases = [
    { important: false, objectiveId: null, error: "La tarea debe estar marcada como importante" },
    { important: true, objectiveId: null, error: "La tarea debe tener un objetivo asignado" },
    { important: true, objectiveId: objective.rows[0].id, error: "El objetivo debe estar en progreso" },
  ];
  for (const scenario of cases) {
    const task = await pool.query<{ id: string }>(
      `INSERT INTO public.tasks (title, is_important, objective_id)
       VALUES ($1, $2, $3) RETURNING id`,
      [`Reglas de Hoy ${randomUUID()}`, scenario.important, scenario.objectiveId],
    );
    taskIds.push(task.rows[0].id);
    const response = await request(app).post(`/tasks/${task.rows[0].id}/commitments`);
    assert.equal(response.status, 409);
    assert.deepEqual(response.body, { error: scenario.error });
  }

  const commitments = await pool.query(
    "SELECT id FROM public.weekly_commitments WHERE task_id = ANY($1::uuid[])",
    [taskIds],
  );
  assert.equal(commitments.rowCount, 0);
  const afterWeeks = await pool.query("SELECT id FROM public.weeks ORDER BY id");
  assert.deepEqual(afterWeeks.rows, beforeWeeks.rows);
});

test("POST commitments crea una sola vez ante solicitudes simultaneas y conserva el original", async (t) => {
  const permissions = await pool.query<{ allowed: boolean }>(
    `SELECT has_table_privilege(current_user, 'public.weeks', 'DELETE')
        AND has_table_privilege(current_user, 'public.weekly_commitments', 'DELETE') AS allowed`,
  );
  assert.equal(permissions.rows[0].allowed, true,
    "Falta conceder DELETE sobre weeks y weekly_commitments en task_rain_test para limpiar las pruebas");

  const taskIds: string[] = [];
  const objectiveIds: string[] = [];
  const weekIds = new Set<string>();
  const previousWeeks = await pool.query<{ id: string }>("SELECT id FROM public.weeks");
  const previousWeekIds = new Set(previousWeeks.rows.map((week) => week.id));
  t.after(async () => {
    const stored = await pool.query<{ week_id: string }>(
      "SELECT week_id FROM public.weekly_commitments WHERE task_id = ANY($1::uuid[])", [taskIds],
    );
    for (const row of stored.rows) weekIds.add(row.week_id);
    await pool.query("DELETE FROM public.weekly_commitments WHERE task_id = ANY($1::uuid[])", [taskIds]);
    await pool.query("DELETE FROM public.tasks WHERE id = ANY($1::uuid[])", [taskIds]);
    await pool.query("DELETE FROM public.objectives WHERE id = ANY($1::uuid[])", [objectiveIds]);
    await pool.query(
      `DELETE FROM public.weeks AS w WHERE w.id = ANY($1::uuid[])
       AND NOT EXISTS (SELECT 1 FROM public.weekly_commitments AS c WHERE c.week_id = w.id)`,
      [[...weekIds].filter((id) => !previousWeekIds.has(id))],
    );
  });

  const objectives = await pool.query<{ id: string }>(
    `INSERT INTO public.objectives (title, success_criterion, period)
     VALUES ($1, 'Practicar', 'weekly'), ($2, 'Practicar mas', 'weekly') RETURNING id`,
    [`Original ${randomUUID()}`, `Nuevo ${randomUUID()}`],
  );
  objectiveIds.push(...objectives.rows.map((objective) => objective.id));
  const task = await pool.query<{ id: string }>(
    `INSERT INTO public.tasks (title, is_important, objective_id)
     VALUES ($1, true, $2) RETURNING id`,
    [`Hoy ${randomUUID()}`, objectiveIds[0]],
  );
  const taskId = task.rows[0].id;
  taskIds.push(taskId);
  const url = `/tasks/${taskId}/commitments`;
  const responses = await Promise.all([request(app).post(url), request(app).post(url)]);
  assert.deepEqual(responses.map((response) => response.status).sort(), [200, 201]);
  assert.deepEqual(responses[0].body, responses[1].body);
  const original = responses[0].body;
  weekIds.add(original.weekId);
  assert.equal(original.taskId, taskId);
  assert.equal(original.objectiveId, objectiveIds[0]);

  const stored = await pool.query(
    `SELECT id, task_id AS "taskId", objective_id AS "objectiveId",
            week_id AS "weekId", added_at AS "addedAt"
     FROM public.weekly_commitments WHERE task_id = $1`, [taskId],
  );
  assert.equal(stored.rowCount, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(stored.rows[0])), original);

  const reassigned = await request(app).patch(`/tasks/${taskId}/objective`)
    .send({ objectiveId: objectiveIds[1] });
  assert.equal(reassigned.status, 200);
  const repeated = await request(app).post(url);
  assert.equal(repeated.status, 200);
  assert.deepEqual(repeated.body, original);

  const unlinked = await request(app).patch(`/tasks/${taskId}/objective`).send({ objectiveId: null });
  assert.equal(unlinked.status, 200);
  const unmarked = await request(app).patch(`/tasks/${taskId}/importance`).send({ isImportant: false });
  assert.equal(unmarked.status, 200);
  const retried = await request(app).post(url);
  assert.equal(retried.status, 200);
  assert.deepEqual(retried.body, original);
  const listed = await request(app).get("/weekly-commitments/current");
  assert.equal(listed.status, 200);
  const taskRow = await pool.query("SELECT title FROM public.tasks WHERE id = $1", [taskId]);
  const objectiveRow = await pool.query("SELECT title FROM public.objectives WHERE id = $1", [objectiveIds[0]]);
  assert.deepEqual(listed.body.filter((item: { taskId: string }) => item.taskId === taskId), [{
    ...original, taskTitle: taskRow.rows[0].title, objectiveTitle: objectiveRow.rows[0].title,
  }]);
});

test("PATCH objective rechaza un identificador de tarea invalido", async () => {
  const response = await request(app)
    .patch("/tasks/abc/objective")
    .send({ objectiveId: null });

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, {
    error: "El identificador debe ser un UUID valido",
  });
});

test("PATCH objective devuelve 404 cuando la tarea no existe", async () => {
  const response = await request(app)
    .patch(`/tasks/${randomUUID()}/objective`)
    .send({ objectiveId: null });

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, { error: "La tarea no existe" });
});

test("rechaza asociaciones invalidas y conserva el objetivo al editar otros campos", async (t) => {
  const taskTitle = `Validacion de asociacion ${randomUUID()}`;
  const updatedTitle = `${taskTitle} editada`;
  const objectiveTitle = `Objetivo protegido ${randomUUID()}`;

  t.after(async () => {
    await pool.query("DELETE FROM public.tasks WHERE title IN ($1, $2)", [
      taskTitle,
      updatedTitle,
    ]);
    await pool.query("DELETE FROM public.objectives WHERE title = $1", [
      objectiveTitle,
    ]);
  });

  const objective = await request(app).post("/objectives").send({
    title: objectiveTitle,
    successCriterion: "Conservar la asociacion",
    period: "weekly",
  });
  assert.equal(objective.status, 201);

  const created = await request(app).post("/tasks").send({ title: taskTitle });
  assert.equal(created.status, 201);
  const id = created.body.id;
  const expected = { ...created.body, objectiveId: objective.body.id };

  const assigned = await request(app)
    .patch(`/tasks/${id}/objective`)
    .send({ objectiveId: objective.body.id });
  assert.equal(assigned.status, 200);
  assert.deepEqual(assigned.body, expected);

  const invalidBodies = [
    {},
    { objectiveId: "" },
    { objectiveId: "abc" },
    { objectiveId: ` ${objective.body.id} ` },
    { objectiveId: 123 },
    { objectiveId: false },
    { objectiveId: {} },
    { objectiveId: [] },
  ];
  const cases = [
    ...invalidBodies.map((body) => ({
      body,
      status: 400,
      error: "El objetivo debe ser un UUID valido o null",
    })),
    {
      body: { objectiveId: randomUUID() },
      status: 404,
      error: "El objetivo no existe",
    },
  ];

  for (const { body, status, error } of cases) {
    const response = await request(app)
      .patch(`/tasks/${id}/objective`)
      .send(body);
    assert.equal(response.status, status, JSON.stringify(body));
    assert.deepEqual(response.body, { error });

    const listed = await request(app).get("/tasks");
    assert.equal(listed.status, 200);
    assert.deepEqual(
      listed.body.find((task: { id: string }) => task.id === id),
      expected,
    );
  }

  const edited = await request(app)
    .patch(`/tasks/${id}`)
    .send({ title: updatedTitle });
  assert.equal(edited.status, 200);
  assert.deepEqual(edited.body, { ...expected, title: updatedTitle });

  const marked = await request(app)
    .patch(`/tasks/${id}/importance`)
    .send({ isImportant: true });
  assert.equal(marked.status, 200);
  const finalExpected = { ...expected, title: updatedTitle, isImportant: true };
  assert.deepEqual(marked.body, finalExpected);

  const listed = await request(app).get("/tasks");
  assert.equal(listed.status, 200);
  assert.deepEqual(
    listed.body.find((task: { id: string }) => task.id === id),
    finalExpected,
  );
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
  assert.equal(created.body.objectiveId, null);
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
    objectiveId: null,
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

test("asigna, cambia y quita el objetivo conservando los otros datos", async (t) => {
  const taskTitle = `Tarea asociada ${randomUUID()}`;
  const objectiveTitle = `Objetivo asociado ${randomUUID()}`;
  const secondObjectiveTitle = `Segundo objetivo ${randomUUID()}`;

  t.after(async () => {
    await pool.query("DELETE FROM public.tasks WHERE title = $1", [taskTitle]);
    await pool.query(
      "DELETE FROM public.objectives WHERE title IN ($1, $2)",
      [objectiveTitle, secondObjectiveTitle],
    );
  });

  const objective = await request(app).post("/objectives").send({
    title: objectiveTitle,
    successCriterion: "Completar la practica",
    period: "weekly",
  });

  assert.equal(objective.status, 201);

  const secondObjective = await request(app).post("/objectives").send({
    title: secondObjectiveTitle,
    successCriterion: "Completar otra practica",
    period: "monthly",
  });
  assert.equal(secondObjective.status, 201);

  const created = await request(app).post("/tasks").send({ title: taskTitle });

  assert.equal(created.status, 201);
  assert.equal(created.body.objectiveId, null);

  for (const objectiveId of [
    objective.body.id,
    objective.body.id,
    secondObjective.body.id,
    null,
    null,
  ]) {
    const updated = await request(app)
      .patch(`/tasks/${created.body.id}/objective`)
      .send({ objectiveId });

    const expected = {
      ...created.body,
      objectiveId,
    };

    assert.equal(updated.status, 200);
    assert.deepEqual(updated.body, expected);

    const listed = await request(app).get("/tasks");

    assert.equal(listed.status, 200);

    const savedTask = listed.body.find(
      (task: { id: string }) => task.id === created.body.id,
    );

    assert.deepEqual(savedTask, expected);
  }
});
