"use client";

export default function Leaderboard({ title, data, scoreKey }) {
  if (!data) return null;
  const { top10, me } = data;

  return (
    <div className="card p-6">
      <h2 className="text-lg font-bold text-brand-darker mb-4">{title}</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-ink/50 border-b border-surface">
            <th className="py-2">Байр</th>
            <th>Хэрэглэгч</th>
            <th className="text-right">Оноо</th>
          </tr>
        </thead>
        <tbody>
          {top10.map((row, idx) => (
            <tr key={row.userId} className="border-b border-surface/60">
              <td className="py-2">{idx + 1}</td>
              <td>{row.nickname}</td>
              <td className="text-right font-semibold">{row[scoreKey] ?? row.total}</td>
            </tr>
          ))}
          {me && (
            <>
              <tr>
                <td colSpan={3} className="text-center text-ink/40 py-1">
                  .....
                </td>
              </tr>
              <tr className="font-semibold bg-surface-light">
                <td className="py-2">{me.rank}</td>
                <td>{me.nickname}</td>
                <td className="text-right">{me[scoreKey] ?? me.total}</td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
