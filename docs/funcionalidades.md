# Funcionalidades de Task Rain

## Estado

Especificación objetivo; no certifica funcionalidad implementada.
Las reglas numéricas se definen en [reglas de negocio](reglas-de-negocio.md).
Los pendientes P01 a P09 bloquean solo las partes que dependen de ellos.

Referencia del código revisado:
- Captura, organización por arrastre, completar/reabrir y persistencia
  básica existen parcialmente.
- El modelo actual todavía mezcla clasificación y finalización en status.
- El dashboard recibe datos simulados.
- Objetivos es una pantalla de presentación.
- Los compromisos por fecha y las reglas de racha no están implementados.

## F01 — Capturar tareas rápidamente

Estado del requisito: aceptado.
Implementación: parcial; carga múltiple y errores de persistencia pendientes.

Como usuario quiero anotar tareas durante el día para organizarlas
sin tener que completar primero una planificación detallada.

### Comportamiento

- Capturar un título y quitar espacios de sus extremos.
- Rechazar títulos vacíos.
- Crear identificador y fecha de creación.
- Dejar la tarea en lluvia sin compromiso diario automático.
- Registrar la creación para la constancia de esa fecha.
- Permitir títulos iguales: la identidad depende del identificador.
- Evitar duplicados producidos por el reenvío de una misma operación.
- Conservar la entrada e informar si falla el guardado.
- Permitir varias capturas; la interacción concreta depende de P07.

### Aceptación

- Capturar " Estudiar NestJS " conserva "Estudiar NestJS".
- Capturar cinco tareas en una fecha suma un día de registro.
- Crear una tarea no modifica el total comprometido para Hoy.
- Recargar después de una escritura exitosa conserva la tarea.
- Una escritura fallida no se anuncia como éxito.

## F02 — Editar tareas

Estado del requisito: conservado del alcance anterior.
Implementación: pendiente.

- Permitir editar títulos de tareas pendientes o completadas.
- Validar título, guardar explícitamente y permitir cancelar.
- No cambiar identidad, creación ni compromisos por editar el título.
- Informar errores conservando la edición para reintentar.

### Aceptación

Cancelar conserva el título anterior; guardar persiste el nuevo.
Una edición no crea un día con registro ni duplica tareas o compromisos.

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

## F04 — Pasar a Hoy

Estado del requisito: aceptado.
Implementación: parcial en interfaz; falta compromiso con fecha.

- Pasar una tarea pendiente a Hoy genera un compromiso de la fecha.
- Crear como máximo un compromiso por tarea y fecha.
- La misma tarea en otra fecha puede generar otro compromiso.
- Crear el compromiso y actualizar la vista deben persistirse coherentemente.
- El rol de Importantes depende de P08.

### Aceptación

- Pasar dos veces la misma tarea a Hoy conserva un solo compromiso.
- Pasar una tarea distinta aumenta el total en uno.
- Una tarea que permanece en lluvia no cuenta como pendiente del día.
- Recargar conserva compromisos y clasificación visible.

## F05 — Retirar, posponer y cambiar de día

Estado del requisito: aceptado en cuanto a conservación del compromiso.
Implementación: falta historial y calendario.

- Retirar una tarea de Hoy conserva su compromiso para esa fecha.
- Volver a agregarla ese día reactiva la misma referencia.
- Si se completa ese día, puede cumplir ese compromiso.
- Elegirla para Hoy en una fecha posterior no elimina resultados anteriores.
- Las tareas incumplidas no se consideran cumplidas por cambio de fecha.

### Aceptación

Con cinco compromisos, tres cumplidos y dos retirados, se muestra 60%.
Retirar y devolver una tarea no duplica el total.
Completar el martes no cumple un compromiso del lunes.
El traslado automático o manual al nuevo día debe definirse
explícitamente en la interfaz; no crear compromisos nuevos silenciosamente.

## F06 — Completar y reabrir

Estado: completar aceptado; efectos de reapertura pendientes P02.
Implementación: parcial sobre el modelo anterior.

- Registrar el instante de finalización.
- Si existe compromiso para esa fecha, reflejar el cumplimiento.
- No cumplir automáticamente compromisos de fechas anteriores.
- Completar una tarea sin compromiso no agrega una obligación retroactiva.
- Repetir la misma finalización no duplica cumplimiento ni premios.
- Reabrir requiere la política de P02 antes de implementarse sobre historial.

### Aceptación

De veinte compromisos, dieciséis cumplidos dan 80%.
De tres, dos cumplidos dan aproximadamente 66,67%.
Completar una tarea sin compromiso no altera ese denominador.
Las pruebas de reapertura se completarán con P02.

## F07 — Mostrar estadísticas por día, semana y mes

Estado del requisito: aceptado.
Implementación: dashboard visual con datos simulados.

- Priorizar el resumen en Inicio.
- Permitir elegir día, semana o mes y navegar entre períodos.
- Indicar fechas y si el resultado es provisional.
- Mostrar cantidades junto a los porcentajes.
- Separar constancia de registro, cumplimiento y progreso de objetivos.
- Distinguir falta de datos, período futuro y error de lectura.
- No presentar datos simulados como resultados personales.
- La agregación de semana/mes requiere P04.
- El calendario y períodos parciales requieren P05.

### Aceptación

El porcentaje diario coincide con R04.
La consulta de otra fecha usa sus compromisos, no la columna Hoy actual.
El color de una semana completa coincide con R02.
No se reutilizan los rangos de siete días para colorear un mes.
Un error de lectura muestra un error, no cantidades inventadas en cero.

## F08 — Mostrar racha y resultado negativo

Estado: umbral y compromiso incumplido aceptados.
Implementación: pendiente.

- Aplicar R06 sin redondear antes de comparar.
- Mostrar avance provisional mientras el día sigue abierto.
- Conservar los datos necesarios incluso cuando la app está cerrada.
- No duplicar días de racha al recargar o recalcular.
- Separar la falta de registro del porcentaje de cumplimiento.
- No agregar descuentos adicionales por tareas incumplidas.
- Resolver P01, P05 y P09 antes de cerrar todos los casos.

### Aceptación

Un día cerrado con 16/20 alcanza el umbral; uno con 15/20 no.
Un día cerrado con 3/3 alcanza el umbral; uno con 2/3 no.
No crear tareas nuevas no elimina los compromisos efectivamente cumplidos.
La interpretación del día sin compromisos se verifica tras aprobar P01.

## F09 — Gestionar objetivos

Estado: requisito aceptado; reglas específicas pendientes P06.
Implementación: pantalla de presentación.

Se necesita poder definir objetivos y relacionar el trabajo con ellos.
Antes de implementar:
- Definir datos mínimos y criterio de logro.
- Definir asociación entre tareas y objetivos.
- Definir cómo se muestra el progreso.
- Resolver cambios, reapertura y eliminación de objetivos.

No asumir que todas las tareas aportan lo mismo al objetivo.
No mostrar un porcentaje de progreso sin una fórmula definida.

Los criterios medibles de aceptación se escribirán después de P06.

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

Estado: necesidad aceptada; diseño técnico propuesto.
Implementación: localStorage básico con validación parcial.

- Persistir tareas y registros necesarios para las estadísticas.
- Detectar fallos de lectura, escritura y datos incompatibles.
- No confundir almacenamiento vacío con almacenamiento corrupto.
- No reemplazar datos fallidos automáticamente con datos simulados.
- Preparar una migración del esquema actual antes de cambiarlo.
- Mantener consistencia entre una acción y sus efectos históricos.

Propuesta: respaldo/exportación antes de la migración.
No inventar fechas de compromisos anteriores que no se guardaron.

### Aceptación

Recargar conserva los resultados confirmados.
Si falla una operación, no quedan tarea y compromiso contradictorios.
Una migración fallida conserva el origen recuperable.
Los datos históricos desconocidos se distinguen de días incumplidos.
