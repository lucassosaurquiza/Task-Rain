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
