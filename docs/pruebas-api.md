# Pruebas automatizadas de la API

## Requisitos

- Node.js 24 y dependencias instaladas desde la raiz con `npm ci`.
- PostgreSQL funcionando.
- Rol `task_rain_app` creado, con permiso de inicio de sesion.
- Base exclusiva `task_rain_test`, propiedad de `postgres`.
- No utilizar la base de desarrollo `task_rain`.

## Preparar la base

En pgAdmin, conectarse como postgres a task_rain_test y comprobar:

```sql
SELECT current_database(), current_user;
```

El resultado debe indicar task_rain_test y postgres.

En una base nueva, ejecutar una vez y en este orden:

1. apps/api/db/migrations/001_create_tasks.sql
2. apps/api/db/migrations/002_allow_task_title_update.sql
3. apps/api/db/migrations/003_add_task_importance.sql
4. apps/api/db/migrations/004_create_objectives.sql
5. apps/api/db/migrations/005_add_task_objective.sql
6. apps/api/db/migrations/006_create_weeks.sql
7. apps/api/db/migrations/007_create_weekly_commitments.sql
8. apps/api/db/migrations/008_add_commitment_withdrawal.sql
9. apps/api/db/migrations/009_add_completion.sql

En una base existente, ejecutar solamente las migraciones
pendientes, respetando el orden.

Despues, solo en la base de pruebas, ejecutar:

```sql
GRANT DELETE ON TABLE public.tasks TO task_rain_app;
GRANT DELETE ON TABLE public.objectives TO task_rain_app;
GRANT DELETE ON TABLE public.weekly_commitments, public.weeks TO task_rain_app;
```

Este permiso permite limpiar los datos creados por los tests.
No incorporarlo a la migracion general.

## Configuracion privada

Crear `apps/api/.env.test` con:

```dotenv
NODE_ENV=test
PGHOST=localhost
PGPORT=5432
PGDATABASE=task_rain_test
PGUSER=task_rain_app
PGPASSWORD="REEMPLAZAR_LOCALMENTE"
```

Usar la contraseña del rol. No subir este archivo a Git.

## Ejecutar desde la raiz

```bash
npm run typecheck -w apps/api
npm test -w apps/api
```

No hace falta iniciar Express: Supertest administra un servidor temporal.

Para ejecutar únicamente las pruebas de fechas y validación de objetivos, sin PostgreSQL
ni archivo de entorno:

```bash
npm run test:unit -w apps/api
```

La suite completa ejecuta app.test.ts, date.test.ts y objective-validation.test.ts.

## Cobertura actual

La suite contiene 46 pruebas: 40 de integración y 6 unitarias.

Cobertura de semanas y compromisos:

- PATCH complete responde 400 ante UUID inválido y 404 para tarea inexistente.
- Completar sin compromiso no crea semanas ni compromisos; solicitudes simultáneas
  conservan la misma fecha en la tarea.
- Una tarea retirada cumple su compromiso de la misma semana sin borrar el retiro.
  Repetir la finalización conserva las fechas y los identificadores originales.
- El repositorio comprueba el intervalo semanal y no modifica otra semana;
  una fecha anterior al inicio no cumple el compromiso. Se prueba el límite de
  inicio de la siguiente semana, sin alterar la fecha de la anterior.
- Los listados exponen completedAt; editar título, importancia u objetivo
  conserva la fecha de la tarea. active=true excluye completados aun sin retiro,
  mientras el listado completo los conserva.
- Incorporar una tarea completada sin compromiso actual devuelve 409 sin crear
  registros. Si ya tiene compromiso, devuelve 200 sin limpiar withdrawnAt ni
  modificar completedAt.

- Retiro repetido conserva su fecha, objetivo e identidad; no modifica el
  compromiso de otra semana. Un compromiso inexistente devuelve null en el repositorio.
- PATCH de retiro valida UUID, devuelve 404 para tarea o compromiso inexistente
  y no crea semanas. Dos retiros simultáneos conservan una sola fecha y registro.
- Reincorporaciones simultáneas devuelven 200, withdrawnAt null y los datos
  originales, incluso si cambió la asociación actual o la importancia de la tarea.
- active=false coincide con el listado sin filtro; active=true excluye el retirado
  y lo incluye una sola vez al reincorporarlo. Valores inválidos o repetidos dan 400.

- El repositorio devuelve [] para una semana inexistente sin crearla, y para
  una semana existente sin compromisos. Separa semanas y ordena por id cuando
  addedAt coincide; usa el objetivo del compromiso aunque la tarea tenga otro.
- GET /weekly-commitments/current devuelve los registros actuales sin modificar
  semanas ni compromisos. El caso con datos verifica títulos y objetivo original
  incluso después de desvincular el objetivo actual y desmarcar importancia.

- Límites de lunes en Buenos Aires, instante anterior al cambio y cambio de año.
- El calendario semanal no depende de la zona horaria de la conexión PostgreSQL.
- Crear y reutilizar semanas; comprobar que ROLLBACK elimina las nuevas.
- Reutilizar el compromiso original, conservando objetivo y fecha; permitir otro
  para la misma tarea en la semana siguiente mediante el repositorio.
- POST /tasks/:id/commitments responde 400 ante UUID inválido y 404 si falta la tarea.
- Rechaza con 409 tareas sin importancia, sin objetivo o con objetivo logrado;
  no deja compromisos ni nuevas semanas por esos intentos rechazados.
- Dos solicitudes simultáneas para la misma tarea devuelven 201 y 200, con
  el mismo compromiso y una sola fila persistida.
- Cambiar o quitar el objetivo actual y desmarcar importancia no modifica
  el compromiso original al repetir la solicitud.

- GET /health responde 200 con status ok.
- POST /tasks rechaza títulos compuestos por espacios.
- POST /tasks rechaza títulos numéricos.
- Una tarea válida se crea y aparece al listar.
  Su objectiveId inicial es null.
- PATCH /tasks/:id/objective asigna, cambia y quita el objetivo; repetir
  asignación o desvinculación conserva el estado. Se verifica mediante GET.
- Rechaza identificadores de tarea inválidos con 400 y tareas inexistentes
  con 404. Rechaza objectiveId ausente, mal formado o de tipo incorrecto
  con 400, y objetivos inexistentes con 404, conservando la asociación previa.
- Editar título o importancia conserva el objetivo asociado y los demás
  campos que no se modifican.
- PATCH /tasks/:id actualiza el título, elimina espacios
  de los extremos y conserva el identificador y la fecha.
  El cambio también se comprueba mediante el listado.
- PATCH /tasks/:id rechaza identificadores inválidos con 400.
- PATCH /tasks/:id responde 404 si la tarea no existe.
- PATCH /tasks/:id rechaza títulos inválidos con 400
  y conserva los datos originales de la tarea.
- PATCH /tasks/:id/importance marca y desmarca importancia,
  conserva los otros datos y persiste el cambio al listar.
  Repetir el mismo valor mantiene el resultado.
- PATCH /tasks/:id/importance rechaza identificadores inválidos con 400.
- PATCH /tasks/:id/importance responde 404 si la tarea no existe.
- PATCH /tasks/:id/importance rechaza valores no booleanos o ausentes
  con 400 y conserva la tarea importante sin cambios.
- POST /objectives crea un objetivo y GET /objectives lo devuelve.
  Se comprueban espacios recortados, estado inicial in_progress,
  fecha de creación y campos opcionales en null.
- POST /objectives rechaza títulos inválidos con 400.
- POST /objectives rechaza criterios de logro inválidos con 400.
- POST /objectives rechaza períodos inválidos con 400.

Las tres pruebas de campos obligatorios recorren quince entradas inválidas y verifican
el código HTTP y el mensaje. No comprueban por sí mismas que esos
intentos no hayan insertado registros. La creación válida automatizada
cubre monthly y weekly; yearly aún no tiene un caso de creación por HTTP.

Cobertura adicional de campos opcionales:

- Motivación y recompensa se recortan y se conservan al listar.
- Texto vacío, espacios, null o ausencia se guardan como null.
- Cada campo rechaza números, booleanos, objetos y arreglos con 400;
  se consulta la base para comprobar que no se insertaron registros.
- Una fecha objetivo válida, incluido 2028-02-29, se conserva al crear y listar.
- targetDate explícitamente null permite crear y listar el objetivo sin fecha.
  La ausencia del campo también está cubierta por la creación básica.
- Fechas imposibles, formatos incorrectos y tipos inválidos producen 400
  sin insertar registros. Un texto vacío no equivale a una fecha ausente.
- Las tres pruebas unitarias comprueban fechas reales, días inexistentes
  y formatos incorrectos, incluidos años bisiestos y límites 0001/9999.

Las tres pruebas unitarias del validador de objetivos comprueban:

- Normalización del resultado sin modificar el objeto de entrada.
- Aceptación de weekly, monthly y yearly y opcionales ausentes en null.
- Rechazo de entradas que no son objetos de datos.

Estas pruebas llaman a validateCreateObjective directamente. Las pruebas
de integración existentes también pasan por el validador desde la ruta.
Aceptar períodos en una prueba unitaria no comprueba su persistencia;
la creación válida por HTTP está cubierta con monthly y weekly.

Última ejecución verificada: 18 de noviembre de 2026, 46 aprobadas,
0 fallidas. Actualizar este resultado cuando cambie la suite.

Antes de las pruebas de integración se verifica el entorno y la base real.
Las pruebas que crean tareas u objetivos eliminan sus propios registros
mediante un título único o su identificador. Los tests de repositorio semanal
usan ROLLBACK. El test HTTP de creación limpia sus compromisos antes de sus
tareas y objetivos; elimina las semanas nuevas usadas por la prueba solo si
quedan sin compromisos. Comprueba el permiso DELETE antes de crear esos datos.
Si el proceso se interrumpe abruptamente, pueden quedar datos
de prueba.

No hay cobertura de cambios de estado de objetivos, reaperturas
ni cierres semanales. La suite
tampoco simula fallos de PostgreSQL para comprobar las respuestas 500.
