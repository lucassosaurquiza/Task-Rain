BEGIN;

CREATE TABLE public.weekly_commitments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    objective_id UUID NOT NULL,
    week_id UUID NOT NULL,
    added_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT weekly_commitments_task_fkey
        FOREIGN KEY (task_id)
        REFERENCES public.tasks (id)
        ON DELETE RESTRICT,

    CONSTRAINT weekly_commitments_objective_fkey
        FOREIGN KEY (objective_id)
        REFERENCES public.objectives (id)
        ON DELETE RESTRICT,

    CONSTRAINT weekly_commitments_week_fkey
        FOREIGN KEY (week_id)
        REFERENCES public.weeks (id)
        ON DELETE RESTRICT,

    CONSTRAINT weekly_commitments_task_week_unique
        UNIQUE (task_id, week_id)
);

GRANT SELECT, INSERT
ON TABLE public.weekly_commitments
TO task_rain_app;

COMMIT;
