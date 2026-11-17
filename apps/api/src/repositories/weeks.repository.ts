import type { PoolClient } from "pg";

const TRACKING_TIME_ZONE = "America/Argentina/Buenos_Aires";

type WeekBounds = {
  startsAt: Date;
  endsAt: Date;
};

export async function getWeekBounds(
  client: PoolClient,
  referenceTime: Date,
): Promise<WeekBounds> {
  const result = await client.query<WeekBounds>(
    `WITH local_week AS (
       SELECT date_trunc(
         'week',
         $1::timestamptz AT TIME ZONE $2::text
       ) AS starts_at
     )
     SELECT
       starts_at AT TIME ZONE $2::text AS "startsAt",
       (starts_at + INTERVAL '1 week')
         AT TIME ZONE $2::text AS "endsAt"
     FROM local_week`,
    [referenceTime, TRACKING_TIME_ZONE],
  );

  return result.rows[0];
}

type Week = WeekBounds & {
  id: string;
  createdAt: Date;
};

export async function getOrCreateWeek(
  client: PoolClient,
  referenceTime: Date,
): Promise<Week> {
  const bounds = await getWeekBounds(client, referenceTime);

  const inserted = await client.query<Week>(
    `INSERT INTO public.weeks (starts_at, ends_at)
     VALUES ($1, $2)
     ON CONFLICT (starts_at) DO NOTHING
     RETURNING id, starts_at AS "startsAt",
               ends_at AS "endsAt", created_at AS "createdAt"`,
    [bounds.startsAt, bounds.endsAt],
  );

  if (inserted.rows[0]) {
    return inserted.rows[0];
  }

  const existing = await client.query<Week>(
    `SELECT id, starts_at AS "startsAt",
            ends_at AS "endsAt", created_at AS "createdAt"
     FROM public.weeks
     WHERE starts_at = $1`,
    [bounds.startsAt],
  );

  const week = existing.rows[0];

  if (!week) {
    throw new Error("No se pudo obtener la semana");
  }

  return week;
}
