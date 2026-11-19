BEGIN;

CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT tasks_title_not_blank
       CHECK (length(btrim(title)) > 0)
);


GRANT USAGE ON SCHEMA public TO task_rain_app;
GRANT SELECT, INSERT ON TABLE public.tasks TO task_rain_app;

COMMIT;