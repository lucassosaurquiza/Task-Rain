# Documentación de Task Rain

## Propósito y estado

Estos documentos describen el producto que se quiere construir.
Documentar una regla no significa que ya esté implementada o verificada.
La referencia son los requisitos y las decisiones confirmadas por el usuario.

## Orden de lectura

1. [Producto](producto.md): problema, propósito, alcance y validación.
2. [Reglas de negocio](reglas-de-negocio.md): definiciones, fórmulas y casos.
3. [Funcionalidades](funcionalidades.md): comportamiento y criterios de aceptación.
4. [Arquitectura](arquitectura.md): estructura actual y diseño técnico propuesto.
5. [Decisiones](decisiones.md): decisiones aceptadas y propuestas reemplazadas.
6. [Aprendizaje](aprendizaje.md): registro personal de lo aprendido.

Las fórmulas y los umbrales se mantienen en reglas-de-negocio.md.
Los otros documentos los referencian para evitar versiones contradictorias.

## Estados

- Aceptado: comportamiento confirmado por el usuario.
- Propuesto: recomendación aún no aprobada.
- Pendiente: falta decidir una regla.
- Reemplazado: criterio anterior que ya no debe guiar la implementación.

Estos estados no equivalen a implementado o probado.
Cada funcionalidad tiene además una referencia a su estado de implementación.

## Cómo continuar

1. Resolver las preguntas P01 a P09 de reglas-de-negocio.md
   antes de implementar la parte que dependa de ellas.
2. Diseñar la migración de los datos existentes sin inventar fechas.
3. Construir tareas y compromisos diarios con persistencia.
4. Implementar cálculos diarios, registro semanal y rachas.
5. Incorporar consultas semanales y mensuales según la fórmula aprobada.
6. Implementar objetivos y reconocimientos con sus reglas aprobadas.
7. Verificar los escenarios documentados y realizar la prueba personal.

El orden es una propuesta de trabajo, no una exclusión de objetivos,
estadísticas o motivación del producto.

## Uso de la documentación

Antes de desarrollar una función:
- Identificar la regla que implementa.
- Resolver sus decisiones pendientes.
- Escribir o ejecutar los casos de aceptación correspondientes.
- Actualizar su estado de implementación con evidencia.
- Registrar decisiones nuevas sin borrar el motivo de las anteriores.

La documentación no sustituye la revisión del código ni las pruebas.
