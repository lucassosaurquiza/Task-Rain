# Arquitectura de Task Rain

## Estado y alcance

Diseño técnico propuesto para cumplir las reglas aceptadas.
No describe todo como implementado ni fija un backend nuevo.

Referencias:
- [Reglas de negocio](reglas-de-negocio.md).
- [Decisiones](decisiones.md).
- [Funcionalidades](funcionalidades.md).

## Base actual

- Monorepo npm workspaces.
- apps/web: React, TypeScript, Vite y Tailwind.
- apps/api: espacio reservado para backend.
- packages/shared: espacio reservado para código compartido.
- Estado de tareas coordinado desde App.
- Persistencia mediante useLocalStorageState.
- Dashboard alimentado con datos simulados.

El Task actual usa status con brain_dump, important, today y completed.
No existe todavía una colección de compromisos por fecha.
El código no debe considerarse alineado solo porque cambió esta documentación.

## Responsabilidades propuestas

- Componentes: entrada, presentación y feedback.
- Lógica de negocio: compromisos, finalización y reglas de racha.
- Consultas/cálculos: estadísticas derivadas de registros.
- Persistencia: lectura, escritura, validación y migración.

El cálculo no debería depender de React ni leer directamente localStorage.
Debe recibir registros y una referencia temporal explícita, lo que permite
probarlo y reutilizarlo.

Durante el MVP local estas responsabilidades pueden ejecutarse
en el frontend. Con backend, el servidor deberá validar acciones
y ser la fuente confiable de los resultados.

No se necesita agregar microservicios ni infraestructura de eventos
para conservar un historial mínimo.

## Modelo conceptual propuesto

Los nombres siguientes son conceptuales; no son una migración aplicada.

### Tarea

| Dato | Propósito |
| --- | --- |
| id | Identidad estable |
| titulo | Texto validado |
| creadaEn | Instante de creación |
| completada | Estado actual |
| completadaEn | Instante de la finalización actual, si existe |
| archivadaEn | Posible alternativa a eliminación física, pendiente P03 |

Importancia y asociación a objetivos dependen de P08 y P06.
El estado actual no sustituye al historial diario.

### Registro de creación

Evidencia mínima para la constancia:
- Identificador de la operación.
- Referencia a la tarea.
- Instante y fecha local del registro.
- Referencia de zona horaria según P05.

Permite contar días con registro sin depender de tareas todavía visibles.
La corrección de creaciones por error requiere P03.

### Compromiso diario

| Dato | Propósito |
| --- | --- |
| id | Identidad del compromiso |
| tareaId | Tarea comprometida |
| fecha | Día de compromiso |
| comprometidaEn | Instante de incorporación |
| retiradaDeHoy | Estado de presentación, no eliminación del compromiso |
| cumplidaEn | Evidencia de cumplimiento para esa fecha, si existe |

Restricción: una sola combinación tareaId + fecha.
Retirar no elimina el registro ni reduce el denominador.
Reincorporar en esa fecha reutiliza el mismo compromiso.

La forma final de registrar reaperturas y correcciones depende de P02/P03.
No implementar una actualización de cumplidaEn que reescriba historia
sin resolver esas políticas.

### Objetivo y reconocimiento

Se necesitarán conceptos independientes de Tarea:
- Objetivo con criterio explícito de logro.
- Relación entre tareas y objetivos.
- Evidencia de reconocimiento entregado.

Los campos y cardinalidades se definen después de P06.
Una racha global no se interpreta automáticamente como avance
de todos los objetivos.

## Fechas y cierre

Propuesta pendiente de P05:
- Guardar instantes en ISO 8601 UTC.
- Guardar la fecha del compromiso como YYYY-MM-DD.
- Usar una zona horaria de referencia para asignar esa fecha.
- Día como intervalo desde 00:00 incluido hasta 00:00 siguiente excluido.
- Conservar la fecha histórica y evitar reagruparla automáticamente
  según la zona horaria actual del dispositivo.

Obtener la fecha UTC recortando un instante no equivale siempre
a obtener su fecha local.
Un día de calendario tampoco debe suponerse siempre de 24 horas
en zonas con cambios de horario.

El cálculo del día cerrado debe funcionar al volver a abrir la app.
No exige un temporizador ejecutándose a medianoche.
Un servicio programado puede evaluarse más adelante, si hace falta.

## Cálculos

- Registro: contar fechas distintas de creación.
- Cumplimiento diario: aplicar R04 a compromisos de una fecha.
- Constancia semanal: aplicar R02 cuando el período esté definido.
- Racha: recorrer fechas cerradas y aplicar R06.
- Semana y mes: fórmula pendiente P04.

No guardar listas independientes de las mismas tareas para cada vista.
Las vistas consultan tareas y compromisos persistidos.

Los resúmenes pueden derivarse del historial. Si se guardan por rendimiento,
deben tener una política de reconstrucción y corrección;
no convertirse en una segunda fuente contradictoria.

## Persistencia local propuesta

Mantener un esquema versionado con tareas y registros históricos.
Una acción que afecte ambos debe guardarse de manera coherente.

Para el primer usuario puede evaluarse un único documento persistido
con las colecciones relacionadas. Si el tamaño, la concurrencia
o los requisitos lo justifican, evaluar otro almacenamiento.

- Capturar errores de lectura y escritura.
- Validar estructura y reglas de consistencia.
- Distinguir ausencia de datos, corrupción y versión incompatible.
- No anunciar éxito persistido si la escritura falló.
- No sobrescribir datos inválidos con mocks al cargar.
- Definir comportamiento ante dos pestañas para evitar pérdida silenciosa.

Exportación y recuperación son propuestas de protección,
no funcionalidades ya implementadas.

## Migración del modelo existente

Antes de editar Task o el validador:
1. Conservar un respaldo del contenido actual.
2. Identificar la versión de origen.
3. Definir correspondencias de campos.
4. Validar la transformación antes de reemplazar datos.
5. Conservar el origen si la transformación falla.

No se puede deducir cuándo una tarea antigua pasó a today.
No inventar compromisos históricos usando su fecha de creación.
Definir una fecha de inicio del seguimiento fiable y cómo tratar
las tareas anteriores; esa política necesita aprobación.
Preservar la importancia existente hasta resolver P08.

## Backend futuro

Tecnología y base de datos pendientes de una decisión explícita.
El README menciona Express; el aprendizaje de NestJS no cambia
automáticamente esa propuesta.

Cuando exista backend:
- Validar identidad del usuario y pertenencia de sus datos.
- Aplicar reglas de compromiso y finalización en el servidor.
- Evitar duplicados y actualizaciones parciales.
- Usar transacciones y restricciones donde corresponda.
- No confiar en un porcentaje o premio enviado por el cliente.
- Conservar zona horaria y fechas según la política aprobada.

No se necesita backend para empezar a verificar las reglas con datos locales.

## Verificación prevista

Pruebas de reglas:
- Misma tarea y fecha sin duplicados.
- Retirar pendientes sin reducir el denominador.
- Cumplimiento exacto del 80% y valores inferiores sin redondeo previo.
- Completar en otra fecha sin modificar el resultado anterior.
- Fechas consecutivas y límites de período.
- Reapertura, corrección y cero compromisos después de resolver pendientes.

Pruebas de integración:
- Persistencia y recarga.
- Fallos de almacenamiento sin éxito falso.
- Migración sin pérdida ni fechas históricas inventadas.
- Inicio con datos reales y sin mensajes de progreso simulado.
