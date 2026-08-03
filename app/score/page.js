"use client";

import { useEffect, useState } from "react";
import Leaderboard from "@/components/Leaderboard";

export default function ScorePage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/scores/leaderboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">🏆 Дүнгийн самбар</h1>
        <p className="page-subtitle">Хамгийн өндөр амжилт үзүүлсэн хэрэглэгчид.</p>
      </div>

      {!data ? (
        <div className="grid md:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card p-6 h-48 animate-pulse bg-surface-light" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <Leaderboard title="Нийт дүн" data={data.total} scoreKey="total" />
          <Leaderboard title="Write оноо" data={data.write} scoreKey="write" />
          <Leaderboard title="Listen оноо" data={data.listen} scoreKey="listen" />
        </div>
      )}
    </div>
  );
}
