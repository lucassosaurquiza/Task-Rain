BEGIN;

ALTER TABLE public.weekly_commitments
ADD COLUMN withdrawn_at TIMESTAMPTZ;

GRANT UPDATE (withdrawn_at)
ON TABLE public.weekly_commitments
TO task_rain_app;

COMMIT;