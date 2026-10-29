# Reglas de negocio de Task Rain

## Estado y vocabulario

Fuente central de reglas para producto, funcionalidades y arquitectura.

- Tarea: actividad capturada en la aplicación.
- Registro: creación de una tarea en la lluvia.
- Compromiso semanal: tarea elegida para Hoy, asociada a una fecha.
- Cumplimiento: resultado de ese compromiso durante esa fecha.
- Objetivo: meta que se quiere alcanzar; su criterio de logro está pendiente.
- Racha: sucesión de días consecutivos que cumplen una condición.

Una tarea y su compromiso semanal no son el mismo registro.

## R01 — Captura y filtrado

Estado: aceptado según D08.

- El usuario puede crear tareas en cualquier momento.
- Lluvia e Importantes sirven para capturar y priorizar.
- Crear, editar o mantener tareas en esas columnas
  no genera estadísticas ni penalizaciones.
- La evaluación comienza cuando una tarea se incorpora
  a Hoy, vinculada a un objetivo en curso.

## R02 — Días sin nuevas tareas

Estado: aceptado según D08.

- No incorporar tareas un día no genera una penalización diaria.
- Las pendientes de Hoy continúan disponibles durante
  los siguientes días de la misma semana.
- Cada tarea cuenta una sola vez en el total semanal.
- Los antiguos colores según días de registro ya no se aplican.
- Una semana cerrada sin compromisos se clasifica como negativa.

## R03 — Incorporación a Hoy y compromiso semanal

Estado: aceptado según D08.

- El recorrido es Lluvia → Importantes → Hoy.
- Lluvia e Importantes no generan estadísticas ni penalizaciones.
- Para incorporar una tarea a Hoy debe elegirse un objetivo
  en curso y confirmarse la acción.
- Sin objetivos en curso no se puede incorporar una tarea a Hoy.
- Cancelar antes de confirmar no genera un compromiso.
- El compromiso conserva el objetivo elegido al incorporarse.
- Cada combinación tarea + semana puede existir una sola vez.
- Las pendientes permanecen en Hoy durante los días siguientes
  de esa misma semana, sin generar compromisos adicionales.
- Completar el martes una tarea incorporada el lunes cuenta
  como cumplimiento de esa semana.
- Retirar una tarea no elimina su compromiso ni reduce
  el total utilizado para calcular el cumplimiento.
- Al cierre, las incompletas vuelven a Importantes.
- Solo ingresan en la semana siguiente si el usuario vuelve
  a pasarlas a Hoy.
- Completar después del cierre no modifica la semana cerrada.

## R04 — Cumplimiento semanal

Estado: aceptado cuando existe al menos un compromiso.

T = total de tareas distintas incorporadas a Hoy en esa semana.
C = tareas de ese conjunto completadas antes del cierre semanal.

Cumplimiento semanal = C / T × 100.

- Las tareas incompletas permanecen dentro de T.
- Retirar una tarea no elimina su compromiso ni reduce T.
- Arrastrar una pendiente entre días no aumenta T.
- No se promedian porcentajes diarios.
- No se aplica un descuento adicional por cada día pendiente.
- La actividad se guarda durante la semana.
- El resultado oficial se publica al cierre.
- Si T es cero, no se realiza la división.
- Si al cierre semanal T es cero, la semana se clasifica
  como negativa por falta de planificación.
- No se realiza la división C / T, porque T es cero.
- La ausencia de compromisos no elimina esa semana
  del historial estadístico.
- Esta evaluación ocurre al cierre, no durante la semana abierta.

Ejemplo: diez tareas comprometidas y ocho completadas
producen un cumplimiento semanal del 80%.

## R05 — Clasificación semanal

Estado: parcialmente definido.

- La clasificación oficial se determina al cierre semanal.
- Una semana sin compromisos es negativa por falta de planificación.
- Con compromisos, el porcentaje se calcula según R04.
- Los rangos y nombres de las clasificaciones están pendientes.
- El mínimo semanal de tareas también está pendiente.
- Los antiguos rangos diarios no se aplican automáticamente
  a la clasificación semanal.

## R06 — Racha

Estado: pendiente de redefinición.

- La antigua racha de días consecutivos queda sin efecto.
- Un día sin nuevas tareas no interrumpe una racha diaria,
  porque ese mecanismo ya no se utiliza.
- Se propone medir semanas consecutivas con resultado positivo.
- Antes de implementarla, deben aprobarse las condiciones
  de una semana positiva y el efecto de una semana negativa.
- No se otorgan premios ni se reinicia un contador
  usando reglas todavía pendientes.

## R07 — Cierre semanal e historial

Estado: aceptado; zona horaria pendiente de definición.

- La semana comienza el lunes a las 00:00, incluido.
- Termina el lunes siguiente a las 00:00, excluido.
- Una acción realizada exactamente en el límite pertenece
  a la nueva semana.

Al cerrar:

1. Identificar los compromisos de la semana.
2. Calcular el resultado según R04 y R05.
3. Guardar el resultado y el detalle histórico.
4. Devolver las tareas incompletas a Importantes.
5. Retirar de Hoy las completadas, conservando su historial.
6. Dejar Hoy vacío para la nueva semana.

- Las pendientes no se incorporan automáticamente
  a los compromisos de la semana siguiente.
- Completar una tarea después no modifica la semana cerrada.
- El cierre debe funcionar aunque la aplicación esté apagada.
- Procesar nuevamente el mismo cierre no debe duplicar
  resultados ni retirar tareas incorporadas a la nueva semana.
- Las correcciones de resultados cerrados requieren
  una política específica, todavía pendiente.

  ## R08 — Estadísticas por período

- La actividad se registra durante la semana.
- El resultado oficial semanal se publica al cierre, según R04 y R07.
- Consultar actividad de un día no genera una evaluación diaria.
- No se utilizan días de registro para puntuar el cumplimiento.
- Los cálculos y cierres mensuales y anuales siguen pendientes.
- Debe definirse cómo agrupar semanas que atraviesan dos meses.
- El cumplimiento de tareas no equivale automáticamente
  al logro de un objetivo.

## R09 — Objetivos, reconocimientos y resultados negativos

- Para incorporar una tarea a Hoy se requiere un objetivo en curso.
- El compromiso conserva el objetivo elegido al incorporarse.
- Las tareas incumplidas permanecen en el total semanal.
- Una semana cerrada sin compromisos es negativa.
- No se aplican penalizaciones por días sin nuevas tareas.
- No se descuentan puntos adicionales por cada tarea incumplida.
- Los reconocimientos y las condiciones de racha siguen pendientes.
- No se otorgan premios automáticamente por completar tareas
  sin una regla de logro aprobada.

## Decisiones pendientes y resueltas

### P01 — Semana sin compromisos

Resuelto: es negativa y permanece en el historial.
No se divide por cero. Falta definir su presentación numérica
y su efecto en agregaciones y rachas.

### P02 — Reabrir una tarea

Definir el efecto de reabrir antes del cierre semanal.
Después del cierre, no cambiar automáticamente el resultado histórico.

### P03 — Errores y eliminación

Definir correcciones y eliminación sin borrar compromisos históricos.
Establecer cómo autorizar y registrar correcciones de semanas cerradas.

### P04 — Agregación mensual y anual

La fórmula semanal está resuelta en R04.
Definir fórmulas mensuales y anuales, semanas entre meses
y tratamiento de semanas negativas sin compromisos.

### P05 — Calendario

El límite semanal está resuelto en R07.
Definir zona horaria, inicio del seguimiento y semanas parciales.

### P06 — Objetivos y reconocimientos

Definir el criterio de logro, progreso y recompensas.
Establecer qué ocurre si un objetivo se logra o archiva
mientras todavía tiene tareas comprometidas pendientes.

### P07 — Captura de varias tareas

Definir la interacción de carga múltiple.
La captura no incorpora tareas automáticamente a Hoy.

### P08 — Importantes

Resuelto: forma parte del recorrido Lluvia → Importantes → Hoy.
Las incompletas vuelven a Importantes al cierre semanal.

### P09 — Clasificación y racha

Definir mínimo semanal, rangos de clasificación y condiciones de racha.
No trasladar automáticamente los antiguos umbrales diarios.
