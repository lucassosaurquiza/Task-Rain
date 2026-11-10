# Task Rain

## Estado

Visión actual basada en los requisitos confirmados por el usuario.
Las reglas incompletas se identifican en
[reglas de negocio](reglas-de-negocio.md), sin tratarlas como aprobadas.

## Problema y origen

El usuario registraba su día a día en Notion, con información separada
por meses. Con el tiempo dejó de sostener ese registro.

Task Rain nace para simplificar la organización diaria, facilitar
el regreso después de una interrupción y hacer visible el cumplimiento.
El primer usuario será su creador; después se evaluará su utilidad
para otras personas.

## Propósito

Simplificar, motivar e incentivar la realización de objetivos mediante
captura rápida de tareas, planificación diaria, estadísticas visibles,
rachas y reconocimientos.

La motivación es una hipótesis que debe verificarse durante el uso.
Una clasificación negativa no debe confundirse con una medición
del valor personal, del esfuerzo ni de toda la actividad fuera de la app.

## Requisitos confirmados

- Capturar tareas con poca fricción durante el día.
- Seguir el recorrido Lluvia → Importantes → Hoy.
- No generar estadísticas ni penalizaciones por capturar
  o mantener tareas en Lluvia o Importantes.
- Exigir un objetivo en curso al confirmar la incorporación a Hoy.
- Mantener las pendientes entre días de la misma semana.
- Contar cada tarea una sola vez dentro de la semana.
- Conservar el compromiso aunque la tarea se retire de Hoy.
- Publicar el resultado oficial al cierre semanal.
- Considerar negativa una semana cerrada sin compromisos.
- Conservar el historial y devolver las incompletas a Importantes.
- Permitir objetivos semanales, mensuales y anuales.

No se exige trabajar todos los días.
El porcentaje mide cumplimiento de compromisos, no dificultad
ni esfuerzo equivalente entre tareas.
La fórmula y el tratamiento de semanas vacías están en R04 y R05.

La consulta de actividad diaria no implica una puntuación diaria.
Las estadísticas mensuales y anuales requieren definir su agregación.
Las rachas y reconocimientos forman parte de la visión del producto,
pero sus condiciones concretas todavía están pendientes.

## Experiencia prevista

Tres vistas principales:

- Inicio: consulta de actividad y resultados de semanas cerradas.
- Tareas: captura y organización en Lluvia, Importantes y Hoy.
- Objetivos: definición y seguimiento de metas.

Importantes forma parte del recorrido aprobado.
Sin objetivos en curso, se permite capturar y priorizar,
pero no incorporar tareas a Hoy.

## Alcance funcional del producto

El núcleo previsto incluye tareas, objetivos, compromisos semanales,
persistencia, cierre semanal e historial de cumplimiento.

Se construirá por etapas. Crear y listar tareas mediante la API
es un avance técnico, no una validación de toda la propuesta.
Las rachas, clasificaciones y recompensas se implementarán
cuando sus reglas estén aprobadas.
No se asumen monedas, niveles ni insignias.

## Propuesta de entrega inicial

Priorizar el uso personal para validar el flujo.
El frontend local y la API con PostgreSQL todavía están separados.
La integración y la migración deben conservar los datos existentes.

La autenticación y autorización son necesarias antes de ofrecer
acceso multiusuario. El uso sin conexión queda por definir.

Fuera del trabajo inmediato:

- Suscripciones y cobros.
- Colaboración entre usuarios.
- Integraciones con Notion o calendarios.
- Finanzas personales y diario.
- Inteligencia artificial.
- Notificaciones automáticas.

## Validación propuesta

Utilizar la versión funcional durante dos semanas y revisar:

- Si registrar y planificar lleva poco esfuerzo.
- Si las estadísticas ayudan a elegir qué hacer.
- Si los resultados semanales incentivan a volver o generan abandono.
- Evaluar las rachas cuando sus reglas estén definidas e implementadas.
- Si aparecen incentivos para reducir artificialmente los compromisos.
- Si la relación entre tareas y objetivos resulta comprensible.
- Qué dificultades hay al corregir errores o cambiar de día.

Como referencias iniciales, no como reglas de puntuación:

- Poder registrar el plan diario en unos cinco minutos.
- Identificar decisiones concretas ayudadas por la herramienta.
- Registrar las dificultades al retomar después de una interrupción.

Dos semanas permiten probar el cambio de semana, pero no validan
por sí solas el seguimiento mensual: se requieren escenarios de prueba
y un período de uso posterior más largo.

Que le sirva al creador no demuestra demanda comercial.
Antes de ofrecer una suscripción habrá que validar con otros usuarios.
