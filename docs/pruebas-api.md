# Pruebas automatizadas de la API

## Requisitos

- Node.js 24 y dependencias instaladas desde la raiz con `npm ci`.
- PostgreSQL funcionando.
- Rol `task_rain_app` creado, con permiso de inicio de sesion.
- Base exclusiva `task_rain_test`, propiedad de `postgres`.
- No utilizar la base de desarrollo `task_rain`.

## Preparar la base

En pgAdmin, abrir Query Tool sobre `task_rain_test`
conectado como `postgres`.

Comprobar el destino:

```sql
SELECT current_database(), current_user;
```

Debe mostrar `task_rain_test` y `postgres`.

En una base nueva, ejecutar una vez:
`apps/api/db/migrations/001_create_tasks.sql`.

Despues, solo en la base de pruebas, ejecutar:

```sql
GRANT DELETE ON TABLE public.tasks TO task_rain_app;
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

## Cobertura actual

- GET /health responde 200 con status ok.
- POST /tasks rechaza titulos compuestos por espacios.
- POST /tasks rechaza titulos numericos.
- Una tarea valida se crea y aparece al listar.

Antes de las pruebas se verifica el entorno y la base real.
Cada prueba de creacion elimina su tarea mediante un titulo unico.
Si el proceso se interrumpe abruptamente, pueden quedar datos de prueba.
Estas pruebas no cubren todavia objetivos ni compromisos semanales.
