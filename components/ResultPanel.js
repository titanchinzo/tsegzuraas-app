export default function ResultPanel({ result }) {
  if (!result) return null;
  return (
    <div className="card p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
      <Stat label="Нарийвчлал" value={`${result.accuracy}%`} />
      <Stat label="Алдаа" value={result.errors} />
      <Stat label="Хурд (WPM)" value={result.wpm} />
      <Stat label="Хугацаа" value={`${result.durationSeconds.toFixed(1)}с`} />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs text-ink/60 uppercase">{label}</p>
      <p className="text-xl font-bold text-brand-darker">{value}</p>
    </div>
  );
}
