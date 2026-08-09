"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

const TITLES = {
  write: "Write оноо",
  listen: "Listen оноо",
  total: "Нийт дүн",
};

// Дэвсгэр нь хоёр горимд цайвар хэвээр байдаг тул текстэд brand-darker-ийг
// ашиглаж болохгүй — түүнийг globals.css нь dark горимд цайвар болгодог учир
// цайван дээр цайван болж уншигдахаа болино. Тогтмол бараан brand-900 хэрэглэв.
const RANK_STYLE = {
  1: "bg-accent text-white",
  2: "bg-brand-300 text-brand-900",
  3: "bg-brand-100 text-brand-900",
};

function RankBadge({ rank }) {
  const style = RANK_STYLE[rank];
  if (!style) {
    return (
      <span className="w-6 shrink-0 text-center text-xs tabular-nums text-ink/40">{rank}</span>
    );
  }
  return (
    <span
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${style}`}
    >
      {rank}
    </span>
  );
}

function Row({ rank, nickname, score, highlight }) {
  // Тодотголд accent/10 ашиглав — энэ нь хоёр горимд ч дэвсгэртэйгээ
  // зохицож, accent-dark текст нь dark горимд алтлаг болж уншигдана.
  return (
    <li
      className={`flex items-center gap-2 rounded-lg py-1.5 text-sm ${
        highlight ? "bg-accent/10 px-1.5 font-semibold" : ""
      }`}
    >
      <RankBadge rank={rank} />
      <span className={`flex-1 truncate ${highlight ? "text-accent-dark" : "text-ink/80"}`}>
        {nickname}
      </span>
      <span
        className={`shrink-0 font-semibold tabular-nums ${
          highlight ? "text-accent-dark" : "text-brand-darker"
        }`}
      >
        {score}
      </span>
    </li>
  );
}

/**
 * Шалгалтын хуудасны буланд харагдах авсаархан дүнгийн самбар.
 *
 * refreshKey өөрчлөгдөх бүрд дахин татна — шалгалт дуусаад шинэ байраа
 * шууд харуулахад хэрэгтэй.
 */
export default function ExamLeaderboard({ type = "total", refreshKey = 0, limit = 5 }) {
  const [board, setBoard] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);

    fetch("/api/scores/leaderboard")
      .then((r) => {
        if (!r.ok) throw new Error("leaderboard unavailable");
        return r.json();
      })
      .then((d) => {
        if (!cancelled) setBoard(d[type] || { top10: [], me: null });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [type, refreshKey]);

  const header = (
    <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-brand-darker">
      <Trophy className="h-4 w-4 text-accent" />
      {TITLES[type] || TITLES.total}
    </h2>
  );

  if (failed) {
    return (
      <div className="card p-4">
        {header}
        <p className="text-xs text-ink/40">Дүн ачаалж чадсангүй.</p>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="card p-4">
        {header}
        <ul className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <li key={i} className="h-6 animate-pulse rounded bg-surface-light" />
          ))}
        </ul>
      </div>
    );
  }

  const top = board.top10.slice(0, limit);
  const scoreOf = (row) => row[type] ?? row.total ?? 0;
  const myId = board.me?.userId;
  const meInTop = myId != null && top.some((row) => row.userId === myId);

  return (
    <div className="card p-4">
      {header}

      {top.length === 0 ? (
        <p className="text-xs text-ink/40">Одоогоор оноо алга.</p>
      ) : (
        <ul>
          {top.map((row, i) => (
            <Row
              key={row.userId}
              rank={i + 1}
              nickname={row.nickname}
              score={scoreOf(row)}
              highlight={row.userId === myId}
            />
          ))}

          {/* Хэрэглэгч харагдах хэсэгт багтаагүй бол мөрийг нь тусад нь залгана. */}
          {board.me && !meInTop && (
            <>
              <li className="py-0.5 text-center text-xs leading-none text-ink/25">···</li>
              <Row
                rank={board.me.rank}
                nickname={board.me.nickname}
                score={scoreOf(board.me)}
                highlight
              />
            </>
          )}
        </ul>
      )}
    </div>
  );
}
