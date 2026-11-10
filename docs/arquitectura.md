# Arquitectura de Task Rain

## Estado y alcance

Este documento distingue la implementación actual del diseño propuesto
para cumplir las reglas aprobadas.

El backend ya utiliza Express, TypeScript y PostgreSQL.
La API permite crear y listar tareas, editar sus títulos e importancia,
y crear y listar objetivos con sus campos obligatorios y opcionales.
Los compromisos semanales y cierres todavía no están implementados.

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
- La tabla tasks contiene id, title, is_important y created_at.
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
  La ruta valida el tipo y la ausencia antes de consultar esta función.
- El estado enviado por el cliente se ignora; la creación usa in_progress.
- Los alias SQL devuelven successCriterion, targetDate y createdAt.
  targetDate se representa como YYYY-MM-DD o null, sin convertirlo en instante.
- Las migraciones 001 a 004 están versionadas y se aplican manualmente.
- No hay autenticación ni separación de datos por usuario.

### Pruebas

- Node Test Runner y Supertest.
- Base separada task_rain_test.
- 23 pruebas de integración de salud, tareas, importancia y objetivos.
- 3 pruebas unitarias del calendario, ejecutables sin PostgreSQL con test:unit.
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

Las tablas tasks y objectives están implementadas en PostgreSQL.
Sus asociaciones, semanas y compromisos describen el modelo previsto,
no migraciones aplicadas.

### Tarea

- Identidad estable, título y fecha de creación.
- Importancia persistida mediante is_important; integración con las
  columnas del frontend pendiente.
- Posible objetivo asociado, opcional antes de incorporarse a Hoy.
- Estado actual de finalización, cuyo diseño persistido falta definir.

Crear o priorizar una tarea no genera estadísticas.
La organización y la finalización son conceptos distintos.
El estado actual de la tarea no sustituye al historial semanal.
La eliminación y las reaperturas requieren resolver P02 y P03.

### Objetivo

- Identidad, título, criterio de logro, período y estado.
- Período semanal, mensual o anual.
- Motivación, recompensa y fecha objetivo opcionales.
- Se prevé que tenga varias tareas y compromisos asociados;
  las relaciones todavía no están implementadas.

La creación y el listado básicos están implementados. Aunque la tabla
admite los estados in_progress y achieved, no hay una ruta para cambiar
el estado ni una regla implementada que determine el logro.

Para incorporar una tarea a Hoy, el objetivo debe estar en curso.
Completar tareas no equivale automáticamente a lograr el objetivo.
Las reglas de logro y reconocimientos siguen pendientes según P06.

### Semana

- Identidad y límites temporales de inicio y fin.
- Estado abierto o cerrado.
- Fecha de cierre y totales del resultado cuando esté cerrada.
- Mientras esté abierta, los campos del resultado cerrado son null.

Una semana puede tener cero compromisos.
Al cerrar sin compromisos, se clasifica como negativa.
La zona horaria y el inicio del seguimiento dependen de P05.

### Compromiso semanal

- id: identidad del compromiso.
- taskId: referencia obligatoria a la tarea.
- objectiveId: referencia obligatoria al objetivo elegido.
- weekId: referencia obligatoria a la semana.
- addedAt: instante de incorporación.
- completedAt: instante de cumplimiento, o null.
- withdrawnAt: instante de retiro de Hoy, o null.

Restricción propuesta en la base: UNIQUE (taskId, weekId).
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
- La zona horaria, el inicio del seguimiento y las semanas
  parciales siguen pendientes según P05.

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
- PostgreSQL para las tareas y objetivos creados mediante la API.

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
Definir el inicio del seguimiento fiable y el tratamiento de tareas
antiguas según P05. Conservar su importancia según el flujo aprobado.
La exportación y recuperación de datos todavía no están implementadas.

## Backend: pendientes

Express, TypeScript y PostgreSQL ya están implementados.
Todavía falta:

- Implementar asociaciones entre tareas y objetivos, semanas y compromisos.
- Integrar las tareas, su importancia y los objetivos con el frontend.
- Validar las transiciones y conservar el historial semanal.
- Implementar cierres transaccionales e idempotentes.
- Aplicar restricciones contra compromisos duplicados.
- Resolver calendario, reaperturas y correcciones antes de implementarlos.
- Incorporar autenticación y autorización antes del uso multiusuario.
- Automatizar la aplicación y el registro de migraciones.

No confiar en porcentajes, premios ni identidades enviados por el cliente.
Las credenciales permanecen fuera de Git.

## Verificación

La última ejecución verificada, el 10 de noviembre de 2026,
aprobó las 26 pruebas existentes: 23 de integración y 3 unitarias.
Consultar pruebas-api.md para su alcance y ejecución.

Pruebas pendientes del modelo semanal:

- Rechazar incorporaciones a Hoy sin un objetivo en curso.
- Evitar duplicados por tarea y semana.
- Conservar el denominador al retirar y reincorporar tareas.
- Mantener pendientes entre días sin compromisos adicionales.
- Calcular 8 completadas de 10 como 80%, sin inferir una clasificación.
- Cerrar semanas vacías sin dividir por cero.
- Respetar los límites semanales y conservar resultados históricos.
- Reintentar cierres sin duplicar efectos ni afectar la nueva semana.
- Migrar datos locales sin pérdidas ni historia inventada.
- Probar reaperturas, correcciones y rachas cuando se aprueben sus reglas.
