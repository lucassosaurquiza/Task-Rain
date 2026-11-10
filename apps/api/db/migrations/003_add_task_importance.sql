BEGIN;

ALTER TABLE public.tasks
ADD COLUMN is_important BOOLEAN NOT NULL DEFAULT FALSE;

GRANT UPDATE (is_important)
ON TABLE public.tasks
TO task_rain_app;

COMMIT;