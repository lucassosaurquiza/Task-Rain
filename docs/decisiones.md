# Decisiones de Task Rain

## Propósito

El estado de P01 a P09 se consulta en reglas-de-negocio.md:
algunas están resueltas y otras conservan aspectos pendientes.
Las decisiones reemplazadas se conservan como historia,
no como instrucciones vigentes.

## D01 — Comenzar únicamente con tareas y resumen semanal

Estado: reemplazada por D04.

### Propuesta anterior

Limitar la primera versión a tareas y un resumen semanal,
dejando objetivos fuera de la aplicación.

### Motivo del reemplazo

Los requisitos actuales incluyen consulta diaria, semanal y mensual,
objetivos y mecanismos de motivación.
Se pueden construir por etapas, pero no excluir silenciosamente
estas capacidades de la propuesta que se quiere validar.

## D02 — Guardar únicamente el estado actual de las tareas

Estado: reemplazada por D05.

### Propuesta anterior

Guardar la última planificación y finalización y permitir
que reprogramar o eliminar cambie los resúmenes anteriores.

### Motivo del reemplazo

Una tarea retirada de Hoy debe seguir contando como compromiso
incumplido si no se realiza ese día.
El estado actual no permite reconstruir ese resultado de forma confiable.

## D03 — Separar registro y cumplimiento

Estado: reemplazada por D08.

### Decisión

Crear al menos una tarea en la lluvia cuenta como día con registro.
Solo pasar una tarea a Hoy genera un compromiso diario.
Registrar no equivale a cumplir.

### Motivo

La herramienta debe distinguir organización de ejecución.

### Consecuencias

Las métricas pueden dar resultados distintos en la misma fecha.
Los colores semanales usan días con registro, no tareas completadas.
Ver R01 y R02.

## D04 — Incluir estadísticas por período y motivación

Estado: aceptada como dirección de producto.

### Decisión

Task Rain debe permitir captura rápida, consultas por día, semana
y mes, seguimiento de objetivos y reconocimientos por logros.

### Consecuencias

Se necesita completar las reglas de objetivos, premios y agregación.
La aceptación de estas capacidades no aprueba fórmulas o premios
que todavía no fueron acordados. Ver P04, P06 y P07.

## D05 — Conservar compromisos diarios

Estado: reemplazada por D08.

### Decisión

La combinación tarea + fecha identifica un compromiso.
Retirar o posponer no lo borra.
Agregar nuevamente la misma tarea en la misma fecha no lo duplica.
Completar en otra fecha no cumple retroactivamente el compromiso anterior.

### Motivo

El porcentaje debe representar el compromiso asumido,
sin mejorar artificialmente al retirar pendientes.

### Consecuencias

La persistencia debe representar tarea y compromiso por separado.
Eliminar tareas no puede borrar automáticamente esos compromisos.
El mecanismo concreto de archivo, corrección e historial es propuesto
hasta resolver P02 y P03.

## D06 — Racha basada en cumplimiento porcentual

Estado: reemplazada por D08.

### Decisión

Cuando existen compromisos, calcular cumplidos del día / total
comprometido para ese día. Un resultado de 80% o más alcanza
el umbral de la racha diaria de cumplimiento.

Se evalúa antes del redondeo. No se exige un número fijo de tareas.

### Motivo

Los días pueden tener cantidades diferentes de tareas planificadas.

### Consecuencias

Con tres compromisos se necesitan tres cumplidos para alcanzar el umbral.
Con veinte compromisos, dieciséis alcanzan.
No se mide dificultad ni esfuerzo de cada tarea.
Ver R04 y R06; el día sin compromisos sigue pendiente en P01.

## D07 — Incumplimiento sin descuento doble

Estado: aceptada.

### Decisión

Un compromiso retirado o no realizado permanece en el total
y reduce el porcentaje. No se agrega otra resta por ese compromiso.

### Consecuencias

Cinco compromisos semanales, tres cumplidos y dos retirados
sin completar producen 60% al cierre.
No se agregan penalizaciones por días sin nuevas tareas,
según D08.

## D08 — Evaluar el cumplimiento al cierre semanal

Estado: aceptada.

### Contexto

El usuario puede distribuir su trabajo durante la semana.
No necesita registrar ni completar tareas todos los días.

### Decisión

- Lluvia e Importantes sirven para capturar y filtrar.
  No generan estadísticas ni penalizaciones.
- Para pasar una tarea a Hoy debe asignarse a un objetivo
  en curso y confirmarse la planificación.
- Cada tarea cuenta una sola vez dentro de la misma semana.
- Las tareas pendientes permanecen en Hoy al cambiar de día,
  sin duplicarse ni generar incumplimientos diarios adicionales.
- La semana comienza el lunes a las 00:00, incluido,
  y termina el lunes siguiente a las 00:00, excluido.
- Durante la semana se guarda la actividad.
  La estadística oficial se publica al cierre.

### Cálculo

Cumplimiento semanal =
tareas incorporadas a Hoy durante esa semana y completadas
antes del cierre / total de tareas incorporadas × 100.

Las incompletas permanecen en el denominador.

Retirar una tarea no elimina su compromiso ni reduce el denominador.

Si no existen compromisos al cierre, la semana es negativa
y permanece en el historial. No se realiza la división por cero.
Su presentación numérica y su efecto en agregaciones y rachas
siguen pendientes según P01.

### Cierre

1. Guardar el resultado y el detalle histórico de la semana.
2. Devolver las tareas incompletas a Importantes.
3. Retirar de Hoy las completadas, conservando su historial.
4. Conservar intactos los compromisos de la nueva semana.

Una tarea pendiente solo cuenta en la nueva semana
si el usuario vuelve a incorporarla explícitamente a Hoy.
Completarla después no modifica la semana cerrada.
Repetir el cierre no debe duplicar resultados ni efectos.

### Pendientes

- Presentación numérica de semanas vacías y efecto en agregaciones.
- Mínimo semanal y condiciones para considerar positiva una semana.
- Condiciones de racha y reconocimientos.
- Calendario resuelto posteriormente por D11; límites semanales implementados,
  seguimiento continuo y cierres pendientes.
- Agregación mensual y anual.
- Reaperturas y correcciones de resultados cerrados.

## D09 — Backend con Express, TypeScript y PostgreSQL

Estado: aceptada; base técnica implementada.

### Motivo

Afianzar Express en un segundo proyecto y aprender PostgreSQL.
No incorporar NestJS en esta etapa.

### Implementación actual

- API con Express y TypeScript.
- PostgreSQL mediante pg y consultas SQL parametrizadas.
- Creación y listado de tareas, edición de título y cambio de importancia.
- Creación y listado de objetivos con motivación, recompensa y fecha opcionales.
- Validación del calendario en una función independiente de Express y PostgreSQL.
- Siete migraciones SQL versionadas y aplicadas manualmente.
- Asociación actual opcional de tareas con objetivos mediante PATCH /tasks/:id/objective.
- Pruebas con Node Test Runner, Supertest y task_rain_test.
- Frontend con localStorage, todavía separado de la API.

### Consecuencias y pendientes

- Integrar el frontend y definir la migración de sus datos.
- Completar retiro, finalización y consulta del historial de compromisos;
  semanas y creación de compromisos ya están persistidos.
- Mantener la lógica de negocio independiente de React.
- Implementar cierres sin depender del navegador.
- Resolver las políticas pendientes antes de implementarlas.
- Automatizar migraciones e incorporar autenticación y autorización
  antes del uso multiusuario.

## D10 — Objetivo actual opcional por tarea

Estado: aceptada el 16 de noviembre de 2026; asociación actual implementada
en la API. Los compromisos conservan su objetivo original; consulta del historial
y cierre semanal pendientes.

### Decisión

- Cada tarea puede tener cero o un objetivo actual.
- Un objetivo puede agrupar muchas tareas.
- El objetivo puede asignarse antes de pasar la tarea a Hoy.
- Asignarlo no crea un compromiso ni genera estadísticas por sí mismo.
- El compromiso semanal conserva su propio objetivo; cambiar la asociación
  actual de la tarea no modifica los compromisos anteriores.

### Diseño técnico implementado

La migración 005 agrega tasks.objective_id como UUID nullable y clave foránea hacia
objectives.id. La columna representa la asociación actual, no el historial.
No se necesita una tabla intermedia para múltiples objetivos simultáneos.
La clave foránea verifica existencia; no verifica que el objetivo esté en curso.
La política de eliminación sigue pendiente según P03; ON DELETE RESTRICT
impide borrar objetivos asociados. El endpoint acepta un UUID o null explícito,
no exige un estado del objetivo y no incorpora la tarea a Hoy.

## D11 — Calendario e inicio del seguimiento semanal

Estado: aceptada el 16 de noviembre de 2026; implementación parcial.
Los límites de semana y la incorporación transaccional están implementados y
probados. Cada compromiso conserva addedAt. Falta completar la referencia de
inicio del seguimiento, las semanas posteriores vacías y el cierre.

### Decisión

- Usar America/Argentina/Buenos_Aires como zona horaria fija configurada
  en el backend durante esta primera versión.
- Mantener los límites de lunes a las 00:00 hasta el lunes siguiente,
  con inicio incluido y fin excluido.
- Iniciar el seguimiento al confirmar la primera tarea en Hoy.
  No generar semanas ni incumplimientos anteriores.
- Registrar la primera semana parcial desde ese instante hasta el lunes
  siguiente y calcular el cumplimiento sobre los compromisos asumidos.
- Continuar el seguimiento aunque no se abra la aplicación. Las semanas
  posteriores sin compromisos son negativas y permanecen en el historial.
- No definir por esta decisión mínimos, rangos de clasificación ni rachas.

### Consecuencias técnicas

- Persistir el instante de inicio del seguimiento junto con la primera
  incorporación exitosa; una petición fallida no debe iniciar el seguimiento.
- Calcular los límites con la zona acordada, independientemente de la zona
  del navegador o del servidor, y guardar instantes como TIMESTAMPTZ.
- Conservar los límites históricos y contemplar semanas vacías en el cierre.
- La configuración por usuario y los cambios de zona quedan para una etapa
  posterior; la implementación actual todavía no es multiusuario.
