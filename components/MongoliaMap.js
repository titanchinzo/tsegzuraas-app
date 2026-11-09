"use client";

import { useId, useState } from "react";
import { AIMAG_BY_KEY } from "@/lib/aimags";
import { MAP_HEIGHT, MAP_WIDTH, REGIONS } from "@/lib/mongoliaMap";

// Монголын цэгэн (дижитал) газрын зураг, аймгуудын хилтэй. Түлхүүрээр
// хичээллэж буй (асаалттай) аймгийн нутаг гэрэлтэн анивчина, асаагүй нь
// тодрохгүй. Аль ч аймаг дээр хулгана аваачихад (утсан дээр товшиход) нэр нь
// гарна. Хэлбэрүүд JS модульд (кэшлэгдэнэ) байх тул client component —
// нүүр хуудасны HTML/RSC-д давхардаж орохгүй.
export default function MongoliaMap({ activeAimags }) {
  const [hovered, setHovered] = useState(null);
  // useId-ийн ":" тэмдэгт url(#...)-д асуудал үүсгэдэг.
  const glowId = `glow${useId().replace(/:/g, "")}`;

  const litNames = REGIONS.filter((r) => activeAimags.includes(r.key)).map(
    (r) => AIMAG_BY_KEY[r.key].name
  );
  const tip = REGIONS.find((r) => r.key === hovered);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-brand-darker px-4 pt-10 pb-6 sm:px-10 text-white shadow-lift">
      <div className="relative mx-auto max-w-4xl" onMouseLeave={() => setHovered(null)}>
        {/* Цэгэн тор, улсын болон аймаг хоорондын хил — статик тул кэшлэгдэнэ. */}
        <img
          src="/mongolia-map.svg"
          alt=""
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          className="block h-auto w-full"
        />
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <defs>
            <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {REGIONS.map((r) => {
            const lit = activeAimags.includes(r.key);
            const active = hovered === r.key;
            return (
              <path
                key={r.key}
                d={r.d}
                fillRule="evenodd"
                strokeLinejoin="round"
                filter={lit ? `url(#${glowId})` : undefined}
                className={
                  lit
                    ? `stroke-accent-light [stroke-width:1.5] motion-safe:animate-pulse ${
                        active ? "fill-accent-light/60" : "fill-accent-light/35"
                      }`
                    : active
                      ? "fill-white/10"
                      : "fill-transparent"
                }
                onMouseEnter={() => setHovered(r.key)}
                onClick={() => setHovered(r.key)}
              />
            );
          })}
        </svg>

        {tip && <Tooltip region={tip} lit={activeAimags.includes(tip.key)} />}
      </div>

      <p className="mt-8 text-center text-sm text-white/60">
        {litNames.length === 0
          ? "Газрууд удахгүй асна."
          : `${litNames.length} аймаг, хотод манай түлхүүрээр хичээллэж байна`}
      </p>
      {litNames.length > 0 && (
        <p className="sr-only">Хичээллэж буй аймаг, хот: {litNames.join(", ")}.</p>
      )}
      <p className="mt-3 text-right text-[10px] text-white/30">
        Хил:{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
          className="hover:text-white/60"
        >
          © OpenStreetMap contributors
        </a>
      </p>
    </div>
  );
}

// Аймгийн дотор талын цэг (labelX/labelY) дээр гарах тайлбар. Хулганы доор
// орж hover-ийг булаахгүйн тулд pointer-events-none.
function Tooltip({ region, lit }) {
  const left = (region.labelX / MAP_WIDTH) * 100;
  const top = (region.labelY / MAP_HEIGHT) * 100;
  // Самбарын (overflow-hidden) захаас гарч таслагдахгүйн тулд захынхыг тал руу нь тэгшилнэ.
  const horizontal =
    left < 35 ? "left-0" : left > 65 ? "right-0" : "left-1/2 -translate-x-1/2";
  const vertical = top < 30 ? "top-full mt-1" : "bottom-full mb-1";

  return (
    <div
      className="pointer-events-none absolute z-10 h-0 w-0"
      style={{ left: `${left}%`, top: `${top}%` }}
    >
      {/* Тайлбар үргэлж цагаан тул dark горимд globals.css-ийн дахин будаагүй
          өнгө (brand-900, teal-700) ашиглана. */}
      <div
        className={`absolute w-max max-w-[12rem] rounded-lg bg-white px-3 py-2 text-left text-xs text-brand-900 shadow-lift ${horizontal} ${vertical}`}
      >
        <span className="block font-bold">{AIMAG_BY_KEY[region.key].name}</span>
        {lit && (
          <span className="block font-semibold text-teal-700">
            FSA01 түлхүүрээр хичээллэж байна
          </span>
        )}
      </div>
    </div>
  );
}
