type ProgressRingProps = {
  value: number;
  label: string;
};

function ProgressRing({ value, label }: ProgressRingProps) {
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  const radius = 42;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const progress = (normalizedValue / 100) * circumference;
  const remaining = circumference - progress;

  return (
    <>
      <article className="flex items-center gap-5 rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <div className="relative grid size-28 place-items-center">
          <svg
            className="-rotate-90"
            width="112"
            height="112"
            viewBox="0 0 112 112"
            role="img"
            aria-label={`${label}: ${normalizedValue}%`}
          >
            <circle
              cx="56"
              cy="56"
              r={radius}
              fill="none"
              stroke="#27272a"
              strokeWidth={stroke}
            />
            <circle
              cx="56"
              cy="56"
              r={radius}
              fill="none"
              stroke="#34d399"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${progress} ${remaining}`}
            />
          </svg>
          <span className="absolute text-2xl font-semibold text-zinc-50">
            {normalizedValue}%
          </span>
        </div>

        <div>
          <p className="text-sm font-medium text-zinc-400">{label}</p>
          <p className="mt-2 text-sm leading-5 text-zinc-500">
            Promedio de avance segun tareas completadas y dias activos.
          </p>
        </div>
      </article>
    </>
  );
}

export default ProgressRing;
