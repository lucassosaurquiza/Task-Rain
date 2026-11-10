BEGIN;

GRANT UPDATE (title)
ON TABLE public.tasks
TO task_rain_app;

COMMIT;