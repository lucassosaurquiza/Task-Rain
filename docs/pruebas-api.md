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

En una base existente, ejecutar solamente las migraciones
pendientes, respetando el orden.

Despues, solo en la base de pruebas, ejecutar:

```sql
GRANT DELETE ON TABLE public.tasks TO task_rain_app;
GRANT DELETE ON TABLE public.objectives TO task_rain_app;
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

Para ejecutar únicamente las pruebas de calendario y validación de objetivos, sin PostgreSQL
ni archivo de entorno:

```bash
npm run test:unit -w apps/api
```

La suite completa ejecuta app.test.ts, date.test.ts y objective-validation.test.ts.

## Cobertura actual

La suite contiene 29 pruebas: 23 de integración y 6 unitarias.

- GET /health responde 200 con status ok.
- POST /tasks rechaza títulos compuestos por espacios.
- POST /tasks rechaza títulos numéricos.
- Una tarea válida se crea y aparece al listar.
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
cubre monthly; weekly y yearly son aceptados por el código, pero aún
no tienen casos de creación válidos en la suite.

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
la creación válida por HTTP sigue cubierta con monthly.

Última ejecución verificada: 10 de noviembre de 2026, 29 aprobadas,
0 fallidas. Actualizar este resultado cuando cambie la suite.

Antes de las pruebas de integración se verifica el entorno y la base real.
Las pruebas que crean tareas u objetivos eliminan sus propios registros
mediante un título único o su identificador.
Si el proceso se interrumpe abruptamente, pueden quedar datos
de prueba.

No hay cobertura de cambios de estado de objetivos, compromisos
ni cierres semanales. La suite
tampoco simula fallos de PostgreSQL para comprobar las respuestas 500.
