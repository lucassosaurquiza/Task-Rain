BEGIN;

ALTER TABLE public.tasks
ADD COLUMN objective_id UUID;

ALTER TABLE public.tasks
ADD CONSTRAINT tasks_objective_id_fkey
FOREIGN KEY (objective_id)
REFERENCES public.objectives (id)
ON DELETE RESTRICT;

GRANT UPDATE (objective_id)
ON TABLE public.tasks
TO task_rain_app;

COMMIT;