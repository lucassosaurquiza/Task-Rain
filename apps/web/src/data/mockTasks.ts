import type { Task } from "../types/task";

export const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Revisar correos pendientes de suscripción",
    status: "brain_dump",
    createdAt: "2026-07-10T09:00:00.000Z",
  },
  {
    id: "task-2",
    title: "Actualizar portafolio de diseño",
    status: "brain_dump",
    createdAt: "2026-07-10T09:10:00.000Z",
  },
  {
    id: "task-3",
    title: "Crear estructura inicial de la vista tareas",
    status: "important",
    createdAt: "2026-07-10T09:20:00.000Z",
  },
  {
    id: "task-4",
    title: "Probar si el flujo de tareas sirve para uso diario",
    status: "today",
    createdAt: "2026-07-10T09:30:00.000Z",
  },
  {
    id: "task-5",
    title: "Documentar aprendizajes en Notion",
    status: "completed",
    createdAt: "2026-07-10T10:00:00.000Z",
    completedAt: "2026-07-10T11:00:00.000Z",
  },
];
