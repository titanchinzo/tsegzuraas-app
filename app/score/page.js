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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-darker">Дүнгийн самбар (Leaderboard)</h1>

      {!data ? (
        <p>Ачааллаж байна...</p>
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
