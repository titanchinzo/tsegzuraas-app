export default function ResultPanel({ result }) {
  if (!result) return null;
  return (
    <div className="card p-6 space-y-4 animate-fade-in">
      <h3 className="font-bold text-brand-darker">Үзүүлэлт</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <Stat label="Хугацаа" value={`${result.durationSeconds.toFixed(1)}с`} />
        <Stat label="Алдаа" value={result.errors} />
        <Stat label="Чанар" value={`${result.accuracy}%`} />
        <Stat label="WPM" value={result.wpm} accent />
      </div>
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className={`rounded-xl p-4 ${accent ? "bg-accent text-white" : "bg-surface-light"}`}>
      <p className={`text-xs uppercase tracking-wide ${accent ? "text-white/70" : "text-ink/50"}`}>
        {label}
      </p>
      <p className={`text-2xl font-bold mt-1 ${accent ? "text-white" : "text-brand-darker"}`}>
        {value}
      </p>
    </div>
  );
}
