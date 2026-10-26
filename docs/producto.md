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

- Registrar una o varias tareas con poca fricción durante el día.
  Idealmente se planifica por la mañana, pero no existe una hora
  obligatoria para agregar tareas.
- Mantener la lluvia como espacio de captura: solo pasar a Hoy
  genera un compromiso de cumplimiento para esa fecha.
- Consultar rápidamente estadísticas por día, semana y mes.
- Medir por separado constancia de registro y cumplimiento.
- Mostrar días consecutivos de cumplimiento con un umbral diario del 80%.
- Incorporar objetivos y reconocimientos por logros.
- Reflejar negativamente los días sin registro y los compromisos
  diarios incumplidos, según sus métricas independientes.
- Conservar el compromiso aunque se quite o posponga la tarea de Hoy.

No se exige la misma cantidad de tareas cada día.
El porcentaje expresa cumplimiento de lo planificado, no dificultad
ni esfuerzo equivalente entre tareas.

## Experiencia prevista

Se conserva como referencia la navegación superior y el contenido centrado,
sin barra lateral, con tres vistas:

- Inicio: estadísticas visibles, período seleccionado y racha.
- Tareas: captura rápida, lluvia y organización de compromisos de Hoy.
- Objetivos: definición y seguimiento de metas y sus reconocimientos.

La clasificación Importantes existía en el diseño inicial.
Su continuidad y relación con Hoy están pendientes (P08);
no se elimina ni se vuelve obligatoria por omisión documental.

## Alcance funcional del producto

La versión que valide esta propuesta debe cubrir tareas, compromisos
diarios, persistencia, estadísticas por período, racha de cumplimiento
y una forma básica de objetivos y motivación.

Se construirá por etapas. Tener solo una lista de tareas funcionando
es un avance técnico, pero no valida por sí solo toda la propuesta.

Las reglas exactas de objetivos y premios siguen pendientes (P06).
No se implementarán monedas, niveles, insignias o recompensas concretas
como si ya hubieran sido aprobadas.

## Propuesta de entrega inicial

Mantener uso personal con almacenamiento local para probar el flujo.
La sincronización entre dispositivos y el acceso por cuentas pueden
abordarse después. Esta elección técnica se revisará si impide el uso real.

Siguen fuera del trabajo inmediato:
- Suscripciones y cobros.
- Colaboración entre usuarios.
- Integraciones con Notion o calendarios.
- Finanzas personales y diario.
- Inteligencia artificial.
- Notificaciones automáticas.

Las estadísticas, objetivos y rachas no se clasifican como extras
prescindibles: forman parte de los requisitos de producto.

## Validación propuesta

Utilizar la versión funcional durante dos semanas y revisar:
- Si registrar y planificar lleva poco esfuerzo.
- Si las estadísticas ayudan a elegir qué hacer.
- Si las rachas y resultados incentivan a volver o generan abandono.
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
