# Reglas de negocio de Task Rain

## Estado y vocabulario

Fuente central de reglas para producto, funcionalidades y arquitectura.

- Tarea: actividad capturada en la aplicación.
- Registro: creación de una tarea en la lluvia.
- Compromiso diario: tarea elegida para Hoy, asociada a una fecha.
- Cumplimiento: resultado de ese compromiso durante esa fecha.
- Objetivo: meta que se quiere alcanzar; su criterio de logro está pendiente.
- Racha: sucesión de días consecutivos que cumplen una condición.

Una tarea y su compromiso diario no son el mismo registro.

## R01 — Captura y constancia de registro

Estado: aceptado.

- Se pueden crear tareas durante el día, sin obligación de hacerlo temprano.
- Crear al menos una tarea en la lluvia cuenta como día con registro.
- Crear varias tareas el mismo día sigue contando como un solo día.
- Abrir la aplicación, editar o completar tareas no equivale a crearlas.
- Un día terminado sin nuevas tareas cuenta negativamente para el registro.
- Las tareas de la lluvia no entran en el denominador del cumplimiento.
- Completar tareas antiguas puede dar buen cumplimiento sin registro nuevo.
- Crear muchas tareas puede dar registro positivo sin buen cumplimiento.

Debe conservarse evidencia del registro por fecha para que quitar
una tarea de la interfaz no borre automáticamente la actividad pasada.
El tratamiento de creaciones por error está pendiente en P03.

## R02 — Colores de constancia semanal

Estado: aceptado para una semana completa.

| Días con registro | Color |
| --- | --- |
| 0 a 3 | Rojo |
| 4 a 5 | Amarillo |
| 6 a 7 | Verde |

Estos rangos cuentan días, no tareas ni días necesariamente consecutivos.
Registrar lunes, miércoles, viernes y domingo suma cuatro días;
no implica una racha de cuatro días.

Propuesta de presentación: durante la semana mostrar el acumulado
como provisional y no etiquetar días futuros como perdidos.
El comienzo de semana y el tratamiento de semanas parciales están en P05.
Estos rangos no se extrapolan automáticamente a un mes.

## R03 — Compromisos de Hoy

Estado: aceptado.

- Pasar una tarea a Hoy genera un compromiso para esa fecha.
- La identidad del compromiso es la combinación tarea + fecha.
- Agregar varias veces la misma tarea el mismo día no lo duplica.
- Quitar o posponer una tarea no elimina su compromiso original.
- Si se vuelve a agregar y se completa ese día, puede quedar cumplido.
- Si se completa en una fecha posterior, no cumple retroactivamente
  el compromiso anterior.
- Elegirla para Hoy en una fecha posterior genera otro compromiso.
- Una tarea capturada pero nunca elegida para Hoy no genera incumplimiento.

El resultado durante el día es provisional.
No completar un compromiso al cierre lo deja incumplido.
La corrección de errores y la reapertura requieren las reglas P02 y P03.

## R04 — Porcentaje diario

Estado: aceptado cuando existe al menos un compromiso.

C = compromisos de la fecha cumplidos durante esa misma fecha.
T = total de compromisos adquiridos para esa fecha.

Cumplimiento diario = C / T × 100.

- Los compromisos retirados permanecen dentro de T.
- Los compromisos incumplidos reducen el porcentaje.
- No hay un descuento adicional de puntos por cada tarea incumplida.
- Se muestran porcentaje y cantidades para dar contexto.
- No se pondera por dificultad o duración.
- Si T es cero, no se divide por cero: el porcentaje no está definido.
  Su efecto en la racha y presentación está pendiente en P01.
- Completar tareas sin compromiso puede contarse como actividad,
  pero no aumenta C ni genera un compromiso retroactivo automáticamente.

| T | C | Porcentaje | Alcanza el umbral de racha |
| --- | --- | --- | --- |
| 20 | 16 | 80% | Sí |
| 20 | 15 | 75% | No |
| 3 | 3 | 100% | Sí |
| 3 | 2 | 66,67% | No |
| 5 | 4 | 80% | Sí |
| 5 | 3 | 60% | No |

Si se planifican cinco, se completan tres y se retiran dos,
el resultado es 3/5, no 3/3.

## R05 — Clasificación del día

El usuario definió día malo, día más o menos y día fabuloso.
El umbral de 80% para una racha está aceptado.

Interpretación continua propuesta para cubrir todos los porcentajes:

| Resultado | Intervalo propuesto |
| --- | --- |
| Día malo | 0% <= resultado < 50% |
| Día más o menos | 50% <= resultado < 80% |
| Día fabuloso | 80% <= resultado <= 100% |

Los límites intermedios y sus etiquetas deben confirmarse (P09).
No inventar categorías para 45%, 75% o un día sin compromisos.

## R06 — Racha de cumplimiento

Estado: aceptado el umbral y el uso de días consecutivos.

- Un día terminado con al menos 80% alcanza la condición de cumplimiento.
- No se exige una cantidad fija de tareas.
- Un día terminado con compromisos y menos de 80% interrumpe
  la sucesión de días que alcanzaron el umbral.
- Evaluar el porcentaje real antes de redondearlo para presentación.
- Puede compararse C × 100 >= T × 80 cuando T > 0.
- Un 79,6% no alcanza el umbral aunque la interfaz lo redondee a 80%.
- La constancia de registro no reemplaza esta condición.
- No completar el día actual todavía no equivale a un día perdido.

Propuesta: mostrar racha confirmada hasta el último día cerrado
y avance provisional del día actual.
No otorgar repetidamente el mismo día por entrar varias veces.

La racha definida es de cumplimiento diario global.
Una racha por objetivo y una racha adicional de registro
no se consideran aprobadas automáticamente (P06).

## R07 — Cierre e historial

Aceptado:
- Quitar o posponer no borra el compromiso.
- Completar mañana no mejora retroactivamente el resultado de hoy.
- Las consultas históricas requieren conservar compromisos por fecha.

Propuesta técnica de calendario:
- Inicio incluido: 00:00 de una fecha.
- Final excluido: 00:00 de la fecha siguiente.
- El instante exacto de medianoche pertenece al nuevo día.
- No usar 00:01 como inicio: dejaría un minuto fuera del cálculo.
- Utilizar una zona horaria definida y conservar la fecha asignada.

El ajuste del horario y la política de zona horaria se confirman en P05.
El resultado no debe depender de tener la aplicación abierta al cierre.
Puede calcularse al reabrir a partir de los registros persistidos.

No reinterpretar automáticamente el historial al viajar o cambiar
la zona horaria del dispositivo.

## R08 — Estadísticas por período

Estado: aceptadas las consultas por día, semana y mes.

Cada consulta debe indicar período, fechas y si está en curso.
Separar:
- Días con registro.
- Cumplimiento de compromisos diarios.
- Racha de cumplimiento.
- Avance de objetivos cuando su regla esté definida.

La fórmula diaria no define por sí sola el porcentaje semanal o mensual.
No mezclar tareas completadas por fecha de finalización con pendientes
de otro conjunto para formar un porcentaje.

La agregación semanal y mensual está pendiente en P04.
Los colores semanales de R02 no constituyen una fórmula mensual.

## R09 — Objetivos, premios y penalizaciones

Aceptado como requisito de producto:
- Incentivar el avance hacia objetivos.
- Reconocer los objetivos logrados.
- Mostrar constancia mediante días de cumplimiento.
- Reflejar negativamente falta de registro e incumplimiento.

Ya definidos:
- Sin registro al cierre: día sin registro para R01/R02.
- Compromisos incumplidos: menor porcentaje para R04.
- Porcentaje inferior al umbral: no alcanza R06.

No aprobados:
- Pérdida de puntos, vidas o recompensas acumuladas.
- Umbral adicional de varios días con un castigo extra.
- Premios concretos, niveles o monedas.
- Que completar cualquier tarea equivalga a lograr un objetivo.

Se necesita definir el vínculo entre tareas, metas y premios (P06).

## Decisiones pendientes

### P01 — Día sin compromisos

Propuesta: mostrar "Sin planificación", sin porcentaje, e interrumpir
la racha al cerrar ese día. Pendiente de aprobación.
No asumir descansos, pausas ni excepciones automáticas.

### P02 — Reabrir una tarea

Definir qué ocurre si se completa y reabre durante el mismo día
o después del cierre. Propuesta: antes del cierre revertir el cumplimiento;
después del cierre tratar una corrección explícita por separado.
No permitir que completar/reabrir otorgue recompensas duplicadas.

### P03 — Errores y eliminación

Definir correcciones de creación o planificación por error.
La eliminación ordinaria no debe borrar compromisos incumplidos.
Propuesta técnica: archivar la tarea o preservar sus referencias
históricas, en lugar de borrar en cascada.
Decidir el efecto de una corrección sobre rachas y premios.

### P04 — Agregación semanal y mensual

Elegir entre porcentaje de compromisos cumplidos del período
y promedio de porcentajes diarios. No son equivalentes.

Ejemplo: un día 1/1 y otro 0/9:
- Por compromisos: 1/10 = 10%.
- Promedio de días: (100% + 0%)/2 = 50%.

Propuesta: mostrar el porcentaje de compromisos del período y,
por separado, cuántos días alcanzaron 80%.
No presentarlo como decisión aceptada.

### P05 — Calendario y períodos parciales

Confirmar 00:00 incluido hasta 00:00 siguiente excluido,
zona horaria de referencia, lunes a domingo para la semana,
mes calendario y tratamiento de la primera semana incompleta.
No evaluar fechas anteriores al comienzo del seguimiento como fallos.

### P06 — Objetivos y reconocimientos

Definir:
- Qué significa lograr un objetivo y qué evidencia lo confirma.
- Si una tarea puede asociarse a uno o varios objetivos.
- Cómo se calcula el avance.
- Qué reconocimiento se obtiene y cuándo se entrega.
- Si se necesita una racha por objetivo además de la global.

### P07 — Captura de varias tareas

Confirmar carga consecutiva con Enter, una tarea por línea
u otra interacción. No dividir texto arbitrariamente.
También decidir si desde la captura se puede crear y pasar a Hoy
en una sola acción explícita.

### P08 — Importantes

Confirmar si se conserva esta clasificación del diseño original.
Si se conserva, proponer importancia independiente de planificación
y finalización, sin imponer el paso por Importantes.

### P09 — Clasificaciones y penalización adicional

Confirmar los intervalos continuos de R05.
Aclarar si el resultado negativo y la interrupción de la racha
satisfacen la penalización deseada o se requiere otro mecanismo.
