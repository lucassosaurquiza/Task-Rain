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
7. [Pruebas de API](pruebas-api.md): preparacion y ejecucion de tests.

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

1. Mantener la documentación alineada con las reglas y la implementación.
2. Resolver las decisiones pendientes que afecten a cada función
   antes de implementarla.
3. Revisar la separación de validación, HTTP y persistencia antes de ampliar
   las rutas. La creación y listado de objetivos con campos opcionales,
   la edición de títulos de tareas y su importancia ya están implementados
   y cuentan con pruebas. El validador de fechas ya es independiente.
4. Implementar semanas y compromisos vinculados a objetivos,
   evitando duplicados por tarea y semana.
5. Implementar el cierre semanal y la conservación del historial.
6. Conectar el frontend con la API y definir cómo migrar los datos
   locales sin pérdidas ni compromisos históricos inventados.
7. Implementar estadísticas, clasificación, rachas y reconocimientos
   únicamente según las reglas aprobadas.
8. Ampliar las pruebas automatizadas y verificar el uso diario.

Este orden es una propuesta incremental. Las funciones existentes
del backend y sus pruebas están documentadas en pruebas-api.md.
Los cálculos mensuales y anuales siguen pendientes de definición.

## Uso de la documentación

Antes de desarrollar una función:

- Identificar la regla que implementa.
- Resolver sus decisiones pendientes.
- Escribir o ejecutar los casos de aceptación correspondientes.
- Actualizar su estado de implementación con evidencia.
- Registrar decisiones nuevas sin borrar el motivo de las anteriores.

La documentación no sustituye la revisión del código ni las pruebas.
