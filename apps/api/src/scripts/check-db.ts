import { pool } from "../db.js";

try {
  const result = await pool.query(`
    SELECT 
           current_database() as database,
           current_user as username`);

  console.table(result.rows);
} catch (error) {
  console.error(
    "No se pudo comprobar la conexion:",
    error instanceof Error ? error.message : "Error desconocido",
  );

  process.exitCode = 1;
} finally {
  await pool.end();
}
