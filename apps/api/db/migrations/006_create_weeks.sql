BEGIN;

CREATE TABLE public.weeks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT weeks_start_unique
        UNIQUE (starts_at),

    CONSTRAINT weeks_dates_valid
        CHECK (ends_at > starts_at)
);

GRANT SELECT, INSERT
ON TABLE public.weeks
TO task_rain_app;

COMMIT;