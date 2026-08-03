export default function ResultPanel({ result }) {
  if (!result) return null;
  return (
    <div className="card p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center animate-fade-in">
      <Stat label="Нарийвчлал" value={`${result.accuracy}%`} accent />
      <Stat label="Алдаа" value={result.errors} />
      <Stat label="Хурд (WPM)" value={result.wpm} />
      <Stat label="Хугацаа" value={`${result.durationSeconds.toFixed(1)}с`} />
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="space-y-1">
      <p className="label">{label}</p>
      <p className={`text-2xl font-bold ${accent ? "text-accent-dark" : "text-brand-darker"}`}>
        {value}
      </p>
    </div>
  );
}
