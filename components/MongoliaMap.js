import { AIMAGS } from "@/lib/aimags";
import { MAP_HEIGHT, MAP_WIDTH, project } from "@/lib/mongoliaMap";

// Улаанбаатар/Төв (9.5), Булган/Орхон (18.2) шиг ойрхон асаалттай төвүүдийг
// нэг тэмдэг болгоно — эс бөгөөс тэмдгүүд давхцаж, нэгнийх нь тайлбарыг
// харах боломжгүй болдог.
const MERGE_DISTANCE = 25;

function groupNearby(places) {
  const groups = [];
  for (const p of places) {
    const near = groups.find((g) => Math.hypot(g[0].x - p.x, g[0].y - p.y) <= MERGE_DISTANCE);
    if (near) near.push(p);
    else groups.push([p]);
  }
  return groups.map((members) => ({
    key: members.map((m) => m.key).join("+"),
    names: members.map((m) => m.name).join(", "),
    x: members.reduce((sum, m) => sum + m.x, 0) / members.length,
    y: members.reduce((sum, m) => sum + m.y, 0) / members.length,
  }));
}

// Монголын цэгэн (дижитал) газрын зураг. Аймгийн төв бүр бүдэг цэгээр
// харагдаж, түлхүүрээр хичээллэж буй (асаалттай) аймгууд нь гэрэлтэн
// анивчина. Hook ашигладаггүй тул server component-д ч, Admin-ын урьдчилан
// харах хэсэгт ч ажиллана; тайлбар нь hover/focus дээр CSS-ээр гарна (утсан
// дээр товшиход товч focus авна).
export default function MongoliaMap({ activeAimags }) {
  const places = AIMAGS.map((aimag) => ({
    ...aimag,
    ...project(aimag.lat, aimag.lng),
    lit: activeAimags.includes(aimag.key),
  }));
  const lit = places.filter((p) => p.lit);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-brand-darker px-4 py-10 sm:px-10 text-white shadow-lift">
      <div className="relative mx-auto max-w-4xl">
        {/* Хил, цэгэн тор нь статик файл тул браузер/CDN кэшлэнэ. */}
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
          {places
            .filter((p) => !p.lit)
            .map((p) => (
              <circle key={p.key} cx={p.x} cy={p.y} r={5} className="fill-white/30" />
            ))}
        </svg>

        {groupNearby(lit).map((m) => {
          const left = (m.x / MAP_WIDTH) * 100;
          const top = (m.y / MAP_HEIGHT) * 100;
          // Тайлбар самбарын (overflow-hidden) захаас гарч таслагдахгүйн тулд
          // захын тэмдгийнхийг тал руу нь тэгшилнэ.
          const horizontal =
            left < 35 ? "left-0" : left > 65 ? "right-0" : "left-1/2 -translate-x-1/2";
          const vertical = top < 35 ? "top-full mt-1" : "bottom-full mb-1";

          return (
            <button
              key={m.key}
              type="button"
              aria-label={`${m.names}: FSA01 түлхүүрээр хичээллэж байна`}
              // Утсан дээр хөрш тэмдгүүдийн дарах талбай давхцахгүйн тулд
              // жижиг; идэвхтэй тэмдгийн тайлбар бусдын доор орохгүйн тулд дээш гарна.
              className="group absolute h-4 w-4 sm:h-6 sm:w-6 -translate-x-1/2 -translate-y-1/2 rounded-full hover:z-20 focus:z-20 focus:outline-none"
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              {/* animate-ping transform-ийг дардаг тул translate биш m-auto-оор голлуулна. */}
              <span className="absolute inset-0 m-auto h-4 w-4 rounded-full bg-accent-light/60 motion-safe:animate-ping motion-safe:[animation-duration:2s] forced-colors:hidden" />
              <span className="absolute inset-0 m-auto h-2.5 w-2.5 rounded-full bg-accent-light shadow-[0_0_12px_rgba(94,234,212,0.9)] group-focus-visible:ring-2 group-focus-visible:ring-white forced-colors:bg-[Highlight]" />
              {/* Тайлбар үргэлж цагаан тул dark горимд globals.css-ийн дахин
                  будаагүй өнгө (brand-900, teal-700) ашиглана. */}
              <span
                aria-hidden
                className={`pointer-events-none absolute z-10 w-max max-w-[12rem] rounded-lg bg-white px-3 py-2 text-left text-xs text-brand-900 shadow-lift opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus:opacity-100 ${horizontal} ${vertical}`}
              >
                <span className="block font-bold">{m.names}</span>
                <span className="block font-semibold text-teal-700">
                  FSA01 түлхүүрээр хичээллэж байна
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-8 text-center text-sm text-white/60">
        {lit.length === 0
          ? "Газрууд удахгүй асна."
          : `${lit.length} аймаг, хотод манай түлхүүрээр хичээллэж байна`}
      </p>
    </div>
  );
}
