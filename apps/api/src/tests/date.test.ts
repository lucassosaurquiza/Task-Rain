import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidDateOnly } from "../validation/date.js";

test("acepta fechas reales con formato YYYY-MM-DD", () => {
  const validDates = [
    "2026-11-10",
    "2026-04-30",
    "2028-02-29",
    "2000-02-29",
    "0001-01-01",
    "9999-12-31",
  ];

  for (const date of validDates) {
    assert.equal(isValidDateOnly(date), true, date);
  }
});

test("rechaza fechas que no existen", () => {
  const invalidDates = [
    "2026-02-29",
    "1900-02-29",
    "2026-04-31",
    "2026-01-00",
    "2026-01-32",
    "2026-00-10",
    "2026-13-10",
    "0000-01-01",
  ];

  for (const date of invalidDates) {
    assert.equal(isValidDateOnly(date), false, date);
  }
});

test("rechaza formatos incorrectos", () => {
  const invalidFormats = [
    "",
    "10/11/2026",
    "2026-1-10",
    "2026-11-1",
    " 2026-11-10 ",
    "2026-11-10T00:00:00Z",
    "texto",
  ];

  for (const date of invalidFormats) {
    assert.equal(isValidDateOnly(date), false, date);
  }
});
