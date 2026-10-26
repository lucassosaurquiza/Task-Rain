# Decisiones de Task Rain

## Propósito

Registrar decisiones, motivos y consecuencias.
Los estados son propuesta, aceptada y reemplazada.
Aceptada no significa implementada.

Las reglas operativas viven en [reglas de negocio](reglas-de-negocio.md).
Las preguntas P01 a P09 siguen abiertas; no quedan aprobadas por incluirlas.

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

Estado: aceptada.

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

Estado: aceptada como regla de dominio.

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

Estado: aceptada.

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

Cinco compromisos, tres cumplidos y dos retirados producen 60%.
Una penalización adicional por varios días sin actividad no se inventa;
su alcance se debe resolver en P09.

## Propuestas técnicas por evaluar

- Conservar frontend React, TypeScript y Vite y empezar con persistencia local.
- Usar un registro histórico mínimo para creación y compromisos.
- Definir fechas diarias y cierres sin depender de la aplicación abierta.
- Mantener la lógica de negocio separada de componentes y almacenamiento.
- Elegir backend y base de datos cuando corresponda.

Estudiar NestJS no constituye por sí solo una decisión de adoptarlo.
El README del repositorio menciona Express como backend futuro;
esa referencia debe revisarse cuando se tome una decisión tecnológica.
