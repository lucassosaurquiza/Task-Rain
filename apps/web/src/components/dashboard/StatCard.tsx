type StatCardProps = {
  label: string;
  value: string | number;
  helperText?: string;
  tone?: "positive" | "negative" | "neutral";
};

const toneStyles = {
  positive: "text-emerald-400",
  negative: "text-rose-400",
  neutral: "text-zinc-50",
};

function StatCard({
  label,
  value,
  helperText,
  tone = "neutral",
}: StatCardProps) {
  return (
    <>
      <article className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <p className="text-sm font-medium text-zinc-400">{label}</p>
        <p
          className={`mt-3 text-3xl font-semibold tracking-tight ${toneStyles[tone]}`}
        >
          {value}
        </p>
        {helperText ? <p>{helperText}</p> : null}
      </article>
    </>
  );
}

export default StatCard;
