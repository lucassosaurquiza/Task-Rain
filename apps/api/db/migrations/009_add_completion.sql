BEGIN;

ALTER TABLE public.tasks
ADD COLUMN completed_at TIMESTAMPTZ;

ALTER TABLE public.weekly_commitments
ADD COLUMN completed_at TIMESTAMPTZ;

GRANT UPDATE (completed_at)
ON TABLE public.tasks
TO task_rain_app;

GRANT UPDATE (completed_at)
ON TABLE public.weekly_commitments
TO task_rain_app;

COMMIT;