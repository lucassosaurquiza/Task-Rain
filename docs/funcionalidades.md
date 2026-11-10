# Funcionalidades de Task Rain

## Estado

Especificación objetivo; no certifica funcionalidad implementada.
Las reglas numéricas se definen en [reglas de negocio](reglas-de-negocio.md).
Los pendientes P01 a P09 bloquean solo las partes que dependen de ellos.

Referencia de la implementación actual:

- El frontend conserva captura, organización y finalización local.
- Su modelo mezcla clasificación y finalización en status.
- La API permite crear y listar tareas, editar títulos y cambiar importancia.
- La API permite crear y listar objetivos con sus campos obligatorios y opcionales.
- El frontend todavía no consume la API.
- Existen 29 pruebas automatizadas: 23 de integración y 6 unitarias
  de calendario y validación de objetivos.
- Los compromisos semanales y cierres no están
  implementados en el backend.
- La pantalla de objetivos y el dashboard todavía no representan
  el flujo semanal completo con datos reales.

## F01 — Capturar tareas rápidamente

Estado del requisito: aceptado.
Implementación: captura local y API de creación disponibles,
todavía sin integración entre ambas.

Como usuario quiero anotar tareas durante el día sin tener
que asignarles un objetivo ni comprometerme a realizarlas todavía.

### Comportamiento

- Recibir un título de texto y quitar espacios de sus extremos.
- Rechazar títulos vacíos, compuestos por espacios o de otro tipo.
- Crear un identificador y registrar el instante de creación.
- Incorporar la tarea a Lluvia sin crear un compromiso semanal.
- No modificar estadísticas, rachas ni penalizaciones.
- Permitir títulos iguales: cada tarea tiene su propia identidad.
- Conservar la entrada e informar si falla el guardado en la interfaz.

La API actual crea una tarea por petición.
La captura múltiple depende de P07.
La protección contra reenvíos de la misma operación está pendiente:
repetir actualmente un POST válido puede crear otra tarea.

### Aceptación

- Enviar " Practicar SQL " guarda "Practicar SQL".
- Enviar un título vacío o numérico devuelve 400 en la API.
- Una creación válida devuelve 201 con id, title, isImportant en false y createdAt.
- La tarea creada aparece al consultar GET /tasks.
- Reiniciar el backend no elimina las tareas guardadas.
- Capturar cinco tareas no crea compromisos ni puntúa la semana.
- La interfaz no anuncia éxito si la escritura falla.

## F02 — Editar tareas

Estado del requisito: conservado del alcance anterior.
Implementación: edición de título mediante PATCH /tasks/:id disponible
y probada. Integración con la interfaz pendiente. La API todavía no
persiste finalización ni compromisos.

- Permitir editar títulos de tareas pendientes o completadas.
- Validar título, guardar explícitamente y permitir cancelar.
- No cambiar identidad, creación ni compromisos por editar el título.
- Informar errores conservando la edición para reintentar.
- Editar un título no crea tareas ni compromisos nuevos,
  ni cambia por sí mismo el cumplimiento semanal.

### Aceptación

Cancelar conserva el título anterior; guardar persiste el nuevo.

### Importancia implementada

PATCH /tasks/:id/importance recibe isImportant como booleano.
Devuelve 200 con la tarea actualizada, 400 para ID o valor inválido
y 404 para una tarea inexistente. Conserva título, ID y fecha.
Marcar, desmarcar y repetir el mismo valor están probados.
Esta acción no incorpora la tarea a Hoy ni crea compromisos.

## F03 — Retirar o eliminar tareas

Estado: comportamiento histórico aceptado; mecanismo de eliminación pendiente P03.
Implementación: no existe eliminación general.

- Identificar la tarea y pedir confirmación de la acción.
- La eliminación ordinaria no debe borrar compromisos históricos.
- Quitar de Hoy no se trata como una eliminación del compromiso.
- Si falla la persistencia, informar y conservar el estado confirmado.
- Aclarar el efecto sobre la tarea y sobre las estadísticas.

### Aceptación

Eliminar o archivar una tarea comprometida no mejora el porcentaje
por reducir su denominador.
La estrategia concreta y las correcciones por error se verifican
después de resolver P03.

## F04 — Incorporar una tarea a Hoy

Estado del requisito: aceptado según R03.
Implementación: interfaz local parcial; compromiso semanal pendiente.

- Seguir el recorrido Lluvia → Importantes → Hoy.
- Exigir un objetivo en curso y confirmar la incorporación.
- Cancelar antes de confirmar no crea compromisos.
- Conservar el objetivo elegido dentro del compromiso.
- Crear como máximo un compromiso por tarea y semana.
- Persistir la operación de forma coherente.

### Aceptación

- Sin objetivos en curso no se puede incorporar una tarea a Hoy.
- Confirmar una tarea distinta aumenta el total semanal en uno.
- Reincorporar la misma tarea en esa semana no duplica el total.
- Mantener tareas en Lluvia o Importantes no crea compromisos.
- Recargar conserva la planificación confirmada.

## F05 — Retirar tareas y cambiar de período

Estado del requisito: aceptado según R03 y R07.
Implementación: historial y cierre semanal pendientes.

- Retirar una tarea de Hoy conserva su compromiso y el denominador.
- Reincorporarla en la misma semana reutiliza ese compromiso.
- Las pendientes permanecen en Hoy al cambiar de día,
  sin duplicarse ni recibir una penalización diaria.
- Al cierre, las incompletas vuelven a Importantes.
- Las completadas salen de Hoy, conservando su historial.
- Las incompletas solo entran en la siguiente semana
  si el usuario vuelve a incorporarlas explícitamente.

### Aceptación

- Cinco compromisos, tres cumplidos y dos retirados producen
  un resultado oficial del 60% al cierre.
- Una pendiente del lunes sigue disponible el martes
  y cuenta una sola vez en esa semana.
- El cierre no modifica compromisos de la semana nueva.
- Repetir un cierre no duplica sus efectos.

## F06 — Completar y reabrir

Estado: completar aceptado; reapertura pendiente según P02.
Implementación: finalización local; cumplimiento semanal pendiente.

- Registrar el instante de finalización.
- Reflejar el cumplimiento del compromiso de la semana abierta.
- Repetir la finalización no duplica el cumplimiento.
- No alterar semanas cerradas por completar una tarea después.
- Completar sin compromiso no crea una obligación retroactiva.
- Resolver P02 antes de implementar reaperturas del historial.

### Aceptación

- Completar el martes una tarea incorporada el lunes
  cumple su compromiso si ambos días pertenecen a la misma semana.
- Veinte compromisos y dieciséis cumplidos producen 80% al cierre,
  sin asumir que ese porcentaje habilita una racha.
- Completar en otra semana no corrige un incumplimiento anterior.
- Las pruebas de reapertura quedan pendientes de P02.

## F07 — Consultar actividad y resultados por período

Estado: consulta aceptada; agregación mensual y anual pendiente.
Implementación: dashboard visual, sin evaluación semanal completa.

- Priorizar el resumen en Inicio.
- Permitir consultar actividad diaria sin asignarle una puntuación.
- Publicar el resultado oficial semanal únicamente al cierre.
- Distinguir actividad de una semana abierta de resultados cerrados.
- Mostrar el período consultado y las cantidades junto al porcentaje.
- Obtener los resultados históricos de la semana correspondiente,
  no de las tareas que actualmente aparecen en Hoy.
- Separar cumplimiento de compromisos y logro de objetivos.
- Distinguir semana vacía, período futuro, falta de historial y error.
- No presentar datos simulados como resultados personales.
- Resolver P04 antes de implementar agregaciones mensuales y anuales.
- Resolver P05 para calendario, inicio y períodos parciales.

### Aceptación

- Una semana cerrada con ocho cumplidas de diez muestra 80%.
- Una semana cerrada sin compromisos se identifica como negativa,
  sin dividir por cero ni eliminarla del historial.
- La representación numérica de esa semana sigue pendiente según P01.
- Una semana abierta no se presenta como resultado oficial cerrado.
- Un día sin nuevas tareas no genera una penalización.
- Un error de lectura no se presenta como cero tareas.
- Consultar otra semana no modifica sus resultados.

## F08 — Clasificación semanal y rachas

Estado: semana vacía negativa aceptada; demás condiciones pendientes.
Implementación: pendiente.

- Aplicar las reglas de R05 y R06 cuando estén completas.
- No trasladar el antiguo umbral diario del 80% al modelo semanal.
- No exigir un mínimo de tareas que todavía no fue aprobado.
- No descontar puntos adicionales por cada día o tarea incumplida.
- No cortar una racha por un día sin nuevas tareas.
- La propuesta de racha semanal requiere definir qué es
  una semana positiva y cómo afectan los resultados negativos.
- Evitar duplicar reconocimientos o avances al repetir un cierre.

### Aceptación

- Cerrar una semana vacía produce una clasificación negativa.
- Tener compromisos permite calcular el porcentaje según R04,
  pero no determina por sí solo una clasificación positiva.
- No se otorgan premios ni se reinician contadores usando
  condiciones todavía pendientes.
- Los casos de racha y clasificación restante se definirán
  cuando se resuelvan P01, P05 y P09.

## F09 — Gestionar objetivos

Estado: requisito aceptado; reglas de logro pendientes según P06.
Implementación: tabla objectives, GET /objectives y POST /objectives
disponibles. Frontend todavía sin integración con estas rutas.

### Alcance actual de la API

- La creación exige title y successCriterion como textos no vacíos;
  elimina espacios de los extremos.
- period acepta weekly, monthly o yearly.
- PostgreSQL genera id, createdAt y el estado inicial in_progress.
- Una creación válida devuelve 201; una entrada inválida devuelve 400.
- GET /objectives devuelve 200 con una lista, vacía si no hay registros.
- POST guarda motivation y reward opcionales: recorta los extremos y
  convierte texto vacío, espacios, null o ausencia en null. Otros tipos dan 400.
- POST guarda targetDate opcional como DATE. Ausencia o null significan
  sin fecha. Un valor presente exige un día real YYYY-MM-DD entre 0001 y 9999;
  texto vacío, espacios, hora y otros tipos se rechazan con 400.
- Se permiten fechas pasadas. No se infiere una fecha a partir de period.
- El listado conserva la fecha como YYYY-MM-DD sin zona horaria.
- No hay edición, eliminación ni cambios de estado de objetivos por API.
- No hay asociación persistida con tareas ni cálculo de progreso.
- La suite cubre creación mensual y listado, valores iniciales,
  recorte de espacios, campos opcionales, calendario y rechazos de entradas.

Modelo previsto:

- Identificador, título, criterio de logro, período y estado.
- Período semanal, mensual o anual.
- Motivación, recompensa y fecha objetivo opcionales.
- Asociación opcional de una tarea antes de incorporarla a Hoy.
- Objetivo en curso obligatorio al confirmar un compromiso semanal.

### Aceptación prevista

- Sin objetivos en curso, se permite capturar y priorizar tareas,
  pero no incorporarlas a Hoy.
- Cada compromiso conserva el objetivo elegido al crearlo.
- Completar tareas no marca automáticamente el objetivo como logrado.
- No se muestra un porcentaje de progreso sin una fórmula aprobada.

Antes de implementar el logro y sus efectos, resolver P06:
progreso, confirmación del resultado, cambios de estado y tratamiento
de compromisos pendientes cuando el objetivo se logra o archiva.

## F10 — Reconocer logros

Estado: requisito aceptado; tipo de reconocimiento pendiente P06.
Implementación: pendiente.

- Reconocer un objetivo alcanzado según su criterio aprobado.
- Definir si también se reconocen hitos de constancia.
- Conservar qué reconocimiento se entregó y por qué.
- Evitar entregas duplicadas por recarga o repetición de una acción.
- Definir el efecto de correcciones sobre reconocimientos previos.

No se consideran aprobados monedas, vidas, niveles ni premios concretos.
Los casos de aceptación dependen de P02, P03 y P06.

## F11 — Persistencia y recuperación

Estado: necesidad aceptada; integración y migración pendientes.
Implementación: frontend con localStorage y API con PostgreSQL,
todavía independientes.

- Persistir tareas y compromisos necesarios para el historial semanal.
- Detectar errores de lectura, escritura y datos incompatibles.
- No confundir almacenamiento vacío con datos corruptos.
- No reemplazar datos fallidos automáticamente con mocks.
- Integrar el frontend con la API sin mantener versiones divergentes.
- Respaldar y validar los datos locales antes de migrarlos.
- Evitar duplicados al repetir una importación.
- No inventar compromisos históricos a partir de fechas de creación.
- Mantener coherencia entre acciones y efectos sobre el historial.

### Aceptación

- Reiniciar el backend conserva las tareas guardadas en PostgreSQL.
- Un error no se anuncia como una operación guardada correctamente.
- Una operación fallida no deja tarea y compromiso contradictorios.
- Una migración fallida conserva el origen recuperable.
- La falta de historial previo no se interpreta como incumplimiento.
- Las pruebas automatizadas utilizan task_rain_test, no task_rain.
