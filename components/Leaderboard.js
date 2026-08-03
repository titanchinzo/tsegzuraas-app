"use client";

const RANK_STYLE = {
  1: "bg-accent text-white",
  2: "bg-brand-300 text-brand-darker",
  3: "bg-brand-100 text-brand-darker",
};

function RankBadge({ rank }) {
  const style = RANK_STYLE[rank];
  if (!style) {
    return <span className="text-ink/50 text-sm pl-1.5">{rank}</span>;
  }
  return (
    <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${style}`}>
      {rank}
    </span>
  );
}

export default function Leaderboard({ title, data, scoreKey }) {
  if (!data) return null;
  const { top10, me } = data;

  return (
    <div className="card p-6">
      <h2 className="text-lg font-bold text-brand-darker mb-4">{title}</h2>
      {top10.length === 0 ? (
        <p className="text-sm text-ink/50">Одоогоор оноо алга.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink/40 border-b border-surface">
              <th className="py-2 font-medium">Байр</th>
              <th className="font-medium">Хэрэглэгч</th>
              <th className="text-right font-medium">Оноо</th>
            </tr>
          </thead>
          <tbody>
            {top10.map((row, idx) => (
              <tr key={row.userId} className="border-b border-surface/60 last:border-0">
                <td className="py-2.5">
                  <RankBadge rank={idx + 1} />
                </td>
                <td className="text-ink/80">{row.nickname}</td>
                <td className="text-right font-semibold text-brand-darker">
                  {row[scoreKey] ?? row.total}
                </td>
              </tr>
            ))}
            {me && (
              <>
                <tr>
                  <td colSpan={3} className="text-center text-ink/30 py-1">···</td>
                </tr>
                <tr className="font-semibold bg-brand-50 rounded-lg">
                  <td className="py-2.5 rounded-l-lg pl-1">
                    <RankBadge rank={me.rank} />
                  </td>
                  <td className="text-brand-darker">{me.nickname}</td>
                  <td className="text-right rounded-r-lg text-brand-darker">
                    {me[scoreKey] ?? me.total}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
