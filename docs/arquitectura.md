# Arquitectura de Task Rain

## Estado y alcance

Este documento distingue la implementación actual del diseño propuesto
para cumplir las reglas aprobadas.

El backend ya utiliza Express, TypeScript y PostgreSQL.
La API permite crear y listar tareas, editar sus títulos e importancia,
y crear y listar objetivos con sus campos obligatorios y opcionales.
La API también crea compromisos semanales vinculados al objetivo actual de la tarea.
El listado de compromisos de la semana actual está disponible en la API.
El retiro y la reincorporación están disponibles en la API. La integración de Hoy
con el frontend y los cierres siguen pendientes. La finalización está disponible
en la API, separando tarea terminada de compromiso cumplido.

Referencias:

- [Reglas de negocio](reglas-de-negocio.md).
- [Decisiones](decisiones.md).
- [Funcionalidades](funcionalidades.md).

## Base actual

- Monorepo con npm workspaces.
- apps/web: React, TypeScript, Vite y Tailwind.
- apps/api: Express y TypeScript, con PostgreSQL mediante pg.
- packages/shared: espacio reservado para código compartido.

### Frontend

- Las tareas siguen coordinadas desde App y guardadas en localStorage.
- El frontend todavía no está conectado con la API.
- El modelo Task usa brain_dump, important, today y completed.
- Existen tipos de objetivos, semanas y compromisos semanales,
  pero definir tipos no implementa su persistencia ni sus reglas.

### Backend

- app.ts configura Express y registra las rutas.
- server.ts inicia el servidor HTTP.
- db.ts configura el pool de conexiones.
- GET /health comprueba que la API responde.
- GET /tasks consulta las tareas guardadas.
- POST /tasks valida el título y crea una tarea.
- PATCH /tasks/:id valida el identificador y el título,
  actualiza una tarea existente y conserva su fecha de creación.
- PATCH /tasks/:id/importance recibe un booleano isImportant y conserva
  título, identificador y fecha. Repetir el valor mantiene el resultado.
- La tabla tasks contiene id, title, is_important, objective_id y created_at.
  is_important es obligatorio, comienza en false y se devuelve como isImportant.
- GET /objectives lista objetivos por creación e identificador descendentes.
- POST /objectives valida title, successCriterion y period; devuelve 201.
  El período debe ser weekly, monthly o yearly. El estado inicial es in_progress.
- La tabla objectives incluye id, title, success_criterion, period, status,
  motivation, reward, target_date y created_at.
- La creación persiste motivation y reward opcionales: recorta textos,
  guarda null ante ausencia, null o texto vacío, y rechaza otros tipos.
- targetDate es opcional: ausencia o null se guardan como null.
  Si se envía, debe ser una fecha real YYYY-MM-DD entre 0001 y 9999.
  Se rechazan texto vacío, espacios y fecha con hora. No se prohíben fechas pasadas.
- validation/date.ts contiene isValidDateOnly, independiente de HTTP y SQL.
- validation/uuid.ts contiene isValidUuid, compartido por las rutas que reciben
  un ID de tarea. Comprueba el formato, no su existencia en la base.
- validation/task.ts contiene validateTaskTitle, compartido por POST /tasks
  y PATCH /tasks/:id. Recibe unknown y devuelve el título recortado o un error.
  Las rutas conservan las respuestas HTTP y validan el UUID antes del título
  al editar. La comprobación del booleano isImportant sigue en su ruta.
- validation/objective.ts contiene validateCreateObjective: recibe unknown,
  valida y normaliza los campos, y consulta el validador de fechas.
  Devuelve { ok: true, data } o { ok: false, error }, sin modificar la entrada.
- POST /objectives utiliza ese resultado: responde 400 ante error o pasa
  data a createObjective y responde 201 con el objetivo creado.
- repositories/objectives.repository.ts contiene listObjectives y
  createObjective: ejecuta el SQL mediante el pool y devuelve los datos.
  No recibe req ni res; los errores llegan a la ruta, que responde 500.
- Las rutas de objetivos coordinan la validación y la persistencia y
  construyen la respuesta HTTP.
- repositories/tasks.repository.ts contiene listTasks, createTask,
  updateTaskTitle, updateTaskImportance, updateTaskObjective y findTaskForCommitment.
  Las rutas de tareas conservan
  las validaciones de entrada y las respuestas HTTP; ya no ejecutan SQL.
  Las funciones de actualización devuelven la tarea o null si no existe,
  y la ruta convierte ese null en una respuesta 404.
- El estado enviado por el cliente se ignora; la creación usa in_progress.
- Los alias SQL devuelven successCriterion, targetDate y createdAt.
  targetDate se representa como YYYY-MM-DD o null, sin convertirlo en instante.
- PATCH /tasks/:id/objective asigna, cambia o quita el objetivo actual.
  Recibe objectiveId como UUID o null explícito; rechaza ausencia y valores
  inválidos con 400. Responde 404 si la tarea o el objetivo no existen.
  La migración 005 agrega objective_id nullable, una clave foránea con
  ON DELETE RESTRICT y permiso UPDATE sobre la columna.
  Las respuestas de tareas incluyen objectiveId. La asociación no mueve
  la tarea a Hoy ni comprueba el estado del objetivo.
- POST /tasks/:id/commitments no requiere body: usa el objetivo actual y la hora
  del backend. Devuelve 201 al crear y 200 al reutilizar el compromiso original.
  Responde 400 ante UUID inválido, 404 si falta la tarea y 409 si una incorporación
  nueva no tiene importancia u objetivo en progreso. Los fallos inesperados dan 500.
- services/weekly-commitments.service.ts coordina las reglas y una transacción
  READ COMMITTED con el mismo PoolClient para todos los repositorios.
  Bloquea la tarea con FOR UPDATE OF t, obtiene la semana y busca un compromiso
  existente antes de validar una incorporación nueva. COMMIT confirma todo;
  ROLLBACK deshace los cambios, incluida una semana creada en un intento rechazado.
  El bloqueo protege la tarea; no bloquea el estado del objetivo. Antes de agregar
  cambios de estado de objetivos habrá que definir su coordinación concurrente.
- weeks.repository.ts calcula límites en America/Argentina/Buenos_Aires y crea
  o recupera la semana. weekly-commitments.repository.ts guarda o recupera el
  compromiso sin reemplazar su objetivo ni addedAt ante una repetición.
- Las migraciones 006 y 007 crean weeks y weekly_commitments, con restricciones
  UNIQUE sobre starts_at y sobre (task_id, week_id), respectivamente.
- GET /weekly-commitments/current devuelve 200 con los compromisos de la semana
  actual, ordenados por addedAt e id ascendentes; devuelve [] si no hay registros.
  Incluye taskTitle y objectiveTitle actuales, junto con los identificadores y addedAt.
  El objetivo se obtiene desde el compromiso, no desde la asociación actual de la tarea.
  No filtra por la importancia actual ni crea semanas o compromisos al consultar.
  listCurrentWeeklyCommitments calcula los límites con getWeekBounds y libera el
  cliente en finally. El repositorio usa JOIN con semanas, tareas y objetivos.
  No requiere nuevas migraciones ni una transacción de escritura.
- PATCH /tasks/:id/commitments/current/withdraw retira el compromiso de la semana
  actual sin body. Devuelve 200 con withdrawnAt, 400 ante UUID inválido y 404
  si no existe un compromiso actual para esa tarea. No crea semanas ni registros.
  Conserva la primera fecha de retiro al repetir, mediante COALESCE.
- POST /tasks/:id/commitments reincorpora un compromiso retirado poniendo
  withdrawn_at en NULL. Devuelve 200 y conserva id, objetivo, semana y addedAt.
  Reutilizar un compromiso existente no vuelve a validar la importancia ni el
  objetivo actual de la tarea; las condiciones de incorporación se aplican a nuevos.
  Retiro y reincorporación coordinan sus escrituras bloqueando la misma tarea.
- GET /weekly-commitments/current acepta active=true para devolver solo registros
  con withdrawnAt y completedAt en null. Sin active o con active=false devuelve todos, incluidos
  los retirados. Valores distintos de los textos true/false o repetidos dan 400.
  Activo significa pendiente y no retirado. Completar lo excluye de esta vista,
  pero conserva el registro en el listado completo.
- La migración 008 agrega withdrawn_at TIMESTAMPTZ nullable y concede al rol
  de la API UPDATE únicamente sobre esa columna, en ambas bases.
- PATCH /tasks/:id/complete no requiere body: devuelve 200 con la tarea y
  completedAt, 400 ante UUID inválido y 404 si no existe. El servidor fija la fecha.
  completeTaskAndCommitment bloquea la tarea y actualiza tarea y compromiso
  dentro de una transacción. Solo procesa el compromiso en la primera finalización.
  Repetir conserva la fecha original y no vuelve a procesar el historial.
- El compromiso debe pertenecer a la semana que contiene el instante de
  finalización y haber sido creado antes o en ese instante. Se puede cumplir
  aunque esté retirado, conservando withdrawnAt (D12). No se crean compromisos
  ni semanas al completar una tarea sin compromiso.
- Una tarea completada no admite nuevos compromisos: POST devuelve 409.
  Si ya existe uno en la semana actual, devuelve 200 sin reactivarlo ni alterar
  sus fechas (D14). La reapertura sigue pendiente.
- La migración 009 agrega completed_at nullable en tasks y weekly_commitments,
  con permisos UPDATE limitados a esas columnas. Las respuestas de tareas y
  compromisos exponen completedAt; editar otros campos conserva esta fecha.
- Las migraciones 001 a 009 están versionadas y se aplican manualmente.
- No hay autenticación ni separación de datos por usuario.

### Pruebas

- Node Test Runner y Supertest.
- Base separada task_rain_test.
- 40 pruebas de integración de salud, tareas, objetivos, asociaciones,
  calendario semanal y compromisos, incluida concurrencia sobre la misma tarea.
- 6 pruebas unitarias de calendario y validación de objetivos,
  ejecutables sin PostgreSQL con test:unit.
- Preparación y ejecución documentadas en pruebas-api.md.

Los datos del frontend y del backend siguen separados.
No existe sincronización ni migración automática entre ambos.

## Responsabilidades propuestas

- Componentes: entrada, presentación y feedback.
- Lógica de negocio: compromisos, finalización y reglas de racha.
- Consultas/cálculos: estadísticas derivadas de registros.
- Persistencia: lectura, escritura, validación y migración.

El cálculo no debería depender de React ni leer directamente localStorage.
Debe recibir registros y una referencia temporal explícita, lo que permite
probarlo y reutilizarlo.

El frontend actual conserva su funcionamiento local hasta su integración.
Para las funciones conectadas, el backend validará las acciones y será
la fuente confiable de los datos y resultados.
La interfaz no decidirá por sí sola el cumplimiento ni el cierre semanal.

No se necesita agregar microservicios ni infraestructura de eventos
para conservar un historial mínimo.

## Modelo conceptual propuesto

Las tablas tasks, objectives, weeks y weekly_commitments están implementadas.
La asociación actual y la creación de compromisos están disponibles en la API.
El modelo siguiente distingue los campos persistidos de las ampliaciones previstas.

### Tarea

- Identidad estable, título y fecha de creación.
- Importancia persistida mediante is_important; integración con las
  columnas del frontend pendiente.
- Cero o un objetivo actual, asignable antes de incorporarse a Hoy
  según D10. Relación implementada mediante objective_id y su endpoint.
- Instante de finalización persistido en completed_at; null indica pendiente.

Crear o priorizar una tarea no genera estadísticas.
La organización y la finalización son conceptos distintos.
El estado actual de la tarea no sustituye al historial semanal.
La eliminación y las reaperturas requieren resolver P02 y P03.

### Objetivo

- Identidad, título, criterio de logro, período y estado.
- Período semanal, mensual o anual.
- Motivación, recompensa y fecha objetivo opcionales.
- Puede tener varias tareas asociadas y compromisos que conservan su referencia.

La creación y el listado básicos están implementados. Aunque la tabla
admite los estados in_progress y achieved, no hay una ruta para cambiar
el estado ni una regla implementada que determine el logro.

Para incorporar una tarea a Hoy, el objetivo debe estar en curso.
Completar tareas no equivale automáticamente a lograr el objetivo.
Las reglas de logro y reconocimientos siguen pendientes según P06.

### Semana

Persistidos: id, starts_at, ends_at y created_at. starts_at es único y
ends_at debe ser posterior. El estado de cierre y los resultados siguientes
son diseño pendiente; todavía no existen como columnas:

- Identidad y límites temporales de inicio y fin.
- Estado abierto o cerrado.
- Fecha de cierre y totales del resultado cuando esté cerrada.
- Mientras esté abierta, los campos del resultado cerrado son null.

Una semana puede tener cero compromisos.
Al cerrar sin compromisos, se clasifica como negativa.
Según D11, el seguimiento comienza en la primera incorporación confirmada
a Hoy y usa America/Argentina/Buenos_Aires. La primera semana puede ser
parcial. Cada compromiso persiste su addedAt; todavía falta implementar la
referencia de inicio del seguimiento y la generación de semanas posteriores vacías.
created_at de la semana no representa el inicio del seguimiento.

### Compromiso semanal

- id: identidad del compromiso.
- taskId: referencia obligatoria a la tarea.
- objectiveId: referencia obligatoria al objetivo elegido.
- weekId: referencia obligatoria a la semana.
- addedAt: instante de incorporación.
- completedAt: instante de cumplimiento, o null; persistido.
- withdrawnAt: instante del retiro vigente, o null si está activo; persistido.

Restricción implementada en la base: UNIQUE (task_id, week_id).
Las claves foráneas a tarea, objetivo y semana usan ON DELETE RESTRICT.
La creación, retiro, reincorporación y finalización están implementados.
Reincorporar limpia withdrawnAt: no se guarda un historial de cada retiro,
pero sí se conserva el compromiso semanal original.
Cambiar de día dentro de la semana no crea otro compromiso.
Retirar y reincorporar la tarea reutiliza el mismo compromiso.
Retirarlo no reduce el total semanal ni elimina su historial.
Cambiar el objetivo actual de una tarea no reasigna compromisos previos.
La misma tarea puede tener compromisos en semanas distintas.
Las reglas de reapertura y corrección dependen de P02 y P03.

### Registro de creación

No se requiere una entidad separada para puntuar días de registro:
esa métrica fue reemplazada por el modelo semanal.
La fecha de creación se conserva en la tarea.
Una auditoría adicional se evaluará si aparece una necesidad concreta.

## Fechas y cierre

Regla aprobada según R07:

- La semana comienza el lunes a las 00:00, incluido.
- Termina el lunes siguiente a las 00:00, excluido.
- Una acción en ese límite pertenece a la nueva semana.
- La zona fija inicial es America/Argentina/Buenos_Aires, según D11.
- El seguimiento comienza al confirmar la primera tarea en Hoy y no genera
  semanas anteriores. La primera semana registra desde ese instante hasta
  el lunes siguiente; se evalúan los compromisos asumidos.
- Las semanas posteriores sin actividad también pertenecen al seguimiento,
  aunque no se abra la aplicación.

Propuesta técnica:

- Guardar instantes en PostgreSQL con TIMESTAMPTZ.
- Intercambiar instantes con la API en formato ISO 8601 UTC.
- Calcular los límites semanales usando la zona horaria acordada.
- No asumir que la fecha UTC equivale a la fecha local.
- Conservar los límites históricos de cada semana.

La actividad se persiste durante la semana.
El resultado oficial se publica al cierre, no diariamente.

El cierre debe:

1. Identificar los compromisos de la semana.
2. Guardar el resultado y conservar el detalle histórico.
3. Devolver las incompletas a Importantes.
4. Retirar de Hoy las tareas de la semana cerrada.
5. Conservar intactos los compromisos de la nueva semana.

El proceso debe ser transaccional e idempotente:
un fallo no debe dejar un cierre parcial, y repetirlo no debe
duplicar resultados ni modificar otra semana.

No debe depender de que el navegador esté abierto.
La ejecución programada y la recuperación de cierres atrasados
se definirán al implementar este proceso.

## Cálculos

- T: total de tareas distintas comprometidas en la semana.
- C: tareas de ese conjunto completadas antes del cierre.
- Si T > 0, cumplimiento semanal = C / T × 100.
- Si T = 0, la semana cerrada es negativa y no se divide por cero.
- Retirar una tarea no reduce T.
- Cambiar de día no duplica compromisos ni agrega penalizaciones.
- No se promedian porcentajes diarios.
- Completar después del cierre no altera el resultado histórico.

Los rangos de clasificación, el mínimo semanal y las rachas
siguen pendientes. El 80% no es un umbral semanal aprobado.
Los cálculos mensuales y anuales requieren resolver P04.

Las vistas consultan tareas y compromisos; no mantienen copias
independientes de las mismas tareas por columna.

## Persistencia y transición

Actualmente conviven dos almacenamientos independientes:

- localStorage para las tareas del frontend.
- PostgreSQL para tareas, objetivos, semanas y compromisos creados mediante la API.

La integración debe establecer PostgreSQL como fuente de verdad
para las funciones conectadas, sin mantener dos versiones divergentes.
La política de trabajo sin conexión todavía no está definida.

Antes de migrar los datos locales:

1. Conservar un respaldo del contenido original.
2. Definir correspondencias de campos e identificadores.
3. Validar los datos y evitar duplicados al repetir la importación.
4. Confirmar la persistencia antes de retirar los datos de origen.
5. Conservar el origen si la operación falla.

No inventar compromisos históricos usando la fecha de creación.
El seguimiento comienza con la primera incorporación confirmada a Hoy
según D11. Importar tareas antiguas no crea compromisos ni semanas previas.
Conservar su importancia según el flujo aprobado.
La exportación y recuperación de datos todavía no están implementadas.

## Backend: pendientes

Express, TypeScript y PostgreSQL ya están implementados.
Todavía falta:

- Conectar el listado de activos y la finalización con el frontend.
- Integrar las tareas, su importancia y los objetivos con el frontend.
- Validar las transiciones y conservar el historial semanal.
- Implementar cierres transaccionales e idempotentes.
- Completar D11: referencia de inicio del seguimiento y semanas posteriores vacías.
- Resolver reaperturas y correcciones.
- Incorporar autenticación y autorización antes del uso multiusuario.
- Automatizar la aplicación y el registro de migraciones.

No confiar en porcentajes, premios ni identidades enviados por el cliente.
Las credenciales permanecen fuera de Git.

## Verificación

La última ejecución verificada, el 18 de noviembre de 2026,
aprobó las 46 pruebas existentes: 40 de integración y 6 unitarias.
El chequeo TypeScript también pasó. En Postman se observó una respuesta 200
al recuperar un compromiso existente; la creación y repetición están cubiertas
por pruebas automatizadas. También se verificó en Postman GET
/weekly-commitments/current con 200 y los títulos de tarea y objetivo.
Consultar pruebas-api.md para su alcance y ejecución.
Las capturas de Postman muestran retiro con fecha y reincorporación con null,
conservando el compromiso. El usuario confirmó la repetición del retiro y
el recorrido del filtro de activos.

Pruebas pendientes del modelo semanal:

- Verificar el cálculo final del denominador; ya se prueba que retiro y
  reincorporación conservan una sola fila por tarea y semana.
- Mantener pendientes entre días sin compromisos adicionales.
- Calcular 8 completadas de 10 como 80%, sin inferir una clasificación.
- Cerrar semanas vacías sin dividir por cero.
- Conservar resultados históricos del cierre; los límites semanales ya se prueban.
- Reintentar cierres sin duplicar efectos ni afectar la nueva semana.
- Migrar datos locales sin pérdidas ni historia inventada.
- Probar reaperturas, correcciones y rachas cuando se aprueben sus reglas.
