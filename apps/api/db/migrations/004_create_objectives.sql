BEGIN;

CREATE TABLE public.objectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    success_criterion TEXT NOT NULL,
    period TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_progress',
    motivation TEXT,
    reward TEXT,
    target_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT objectives_title_not_blank
        CHECK (length(btrim(title)) > 0),

    CONSTRAINT objectives_success_criterion_not_blank
        CHECK (length(btrim(success_criterion)) > 0),

    CONSTRAINT objectives_period_valid
        CHECK (period IN ('weekly', 'monthly', 'yearly')),

    CONSTRAINT objectives_status_valid
        CHECK (status IN ('in_progress', 'achieved'))
);

GRANT SELECT, INSERT
ON TABLE public.objectives
TO task_rain_app;

COMMIT;