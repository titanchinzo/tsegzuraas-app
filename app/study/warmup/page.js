"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Circle, Minus, Heart, Play, RotateCcw, Zap } from "lucide-react";
import { MORSE_MAP, CATEGORIES } from "@/lib/morse";

// Хавтан унах хугацаа. Түвшин ахих тусам богиносно (хурдасна).
const BASE_TRAVEL_MS = 2400;
const MIN_TRAVEL_MS = 800;
const SYMBOL_GAP_MS = 460; // нэг тэмдэгт доторх хавтангуудын хоорондох зай
const CHAR_GAP_MS = 900; // тэмдэгт хооронд
const MIN_SYMBOL_GAP_MS = 200;
const MIN_CHAR_GAP_MS = 380;
const LIVES = 3;

// Зөв товшилт бүрд бага зэрэг хурдасч, алдах бүрд сулардаг — piano tiles шиг
// сайн тоглох тусам л хүндэрнэ.
const SPEEDUP_PER_HIT = 22;
const SLOWDOWN_PER_MISS = 120;

// Товшилтын нарийвчлалын цонх (хавтан шугам дээр ирэх ёстой мөчөөс хазайх зөвшөөрөл).
const WINDOW_PERFECT = 110;
const WINDOW_GOOD = 220;
const WINDOW_OK = 330;

const POOL = CATEGORIES.english.concat(CATEGORIES.numbers);

// Хурдыг 1..10 түвшин болгож харуулна (унах хугацаа богиносох тусам өснө).
function speedLevelOf(travel) {
  const t = Math.min(BASE_TRAVEL_MS, Math.max(MIN_TRAVEL_MS, travel));
  const ratio = (BASE_TRAVEL_MS - t) / (BASE_TRAVEL_MS - MIN_TRAVEL_MS);
  return 1 + Math.round(ratio * 9);
}

function judge(delta) {
  const d = Math.abs(delta);
  if (d <= WINDOW_PERFECT) return { label: "Гоё!", points: 3, tone: "text-accent-dark" };
  if (d <= WINDOW_GOOD) return { label: "Сайн", points: 2, tone: "text-brand-dark" };
  if (d <= WINDOW_OK) return { label: "Болж байна", points: 1, tone: "text-ink/60" };
  return null;
}

export default function WarmupPage() {
  const [phase, setPhase] = useState("idle"); // idle | playing | over
  const [tiles, setTiles] = useState([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [feedback, setFeedback] = useState(null);
  const [currentChar, setCurrentChar] = useState(null);
  const [hits, setHits] = useState(0);
  const [best, setBest] = useState(0);
  const [speedLevel, setSpeedLevel] = useState(1);

  // Тоглоомын явцын утгууд — рендер бүрд шинэчлэгдэх шаардлагагүй тул ref-д.
  const tilesRef = useRef([]);
  const timersRef = useRef([]);
  const travelRef = useRef(BASE_TRAVEL_MS);
  const idRef = useRef(0);
  const livesRef = useRef(LIVES);
  const phaseRef = useRef("idle");
  // Оноо/комбог ref-д давхар барина. setState updater дотроос өөр setState
  // буюу хажуугийн үр дагавар дуудвал React 18 dev Strict Mode-ын давхар
  // дуудалт үүнийг хоёр удаа гүйцэтгэдэг тул updater-уудыг цэвэр байлгана.
  const scoreRef = useRef(0);
  const comboRef = useRef(0);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const later = useCallback((fn, ms) => {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  }, []);

  useEffect(() => {
    try {
      setBest(Number(window.localStorage.getItem("tsegzuraas.warmup.best") || 0));
    } catch {
      /* localStorage байхгүй бол дээд оноо харагдахгүй, тоглоом ажиллана */
    }
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const removeTile = useCallback((id) => {
    tilesRef.current = tilesRef.current.filter((t) => t.id !== id);
    setTiles(tilesRef.current);
  }, []);

  const endGame = useCallback(
    (finalScore) => {
      phaseRef.current = "over";
      clearTimers();
      tilesRef.current = [];
      setTiles([]);
      setPhase("over");
      setCurrentChar(null);

      setBest((prevBest) => {
        if (finalScore <= prevBest) return prevBest;
        try {
          window.localStorage.setItem("tsegzuraas.warmup.best", String(finalScore));
        } catch {
          /* хадгалж чадахгүй бол зөвхөн энэ сесст харагдана */
        }
        return finalScore;
      });
    },
    [clearTimers]
  );

  const loseLife = useCallback(() => {
    comboRef.current = 0;
    setCombo(0);
    // Алдвал бага зэрэг сулруулж, эргэж орох боломж өгнө.
    travelRef.current = Math.min(BASE_TRAVEL_MS, travelRef.current + SLOWDOWN_PER_MISS);
    setSpeedLevel(speedLevelOf(travelRef.current));
    setFeedback({ label: "Алдлаа", tone: "text-red-600", key: Math.random() });

    livesRef.current -= 1;
    setLives(livesRef.current);

    if (livesRef.current <= 0) endGame(scoreRef.current);
  }, [endGame]);

  // Нэг тэмдэгтийн бүх хавтанг төлөвлөөд, дараагийн тэмдэгтийг дуудна.
  const scheduleChar = useCallback(() => {
    if (phaseRef.current !== "playing") return;

    const char = POOL[Math.floor(Math.random() * POOL.length)];
    const pattern = MORSE_MAP[char];
    setCurrentChar({ char, pattern });

    const travel = travelRef.current;
    // Хавтангийн зай ч хурдтай хамт нягтарна — эс бөгөөс зөвхөн унах хурд
    // өөрчлөгдөж, хэмнэл нь хэвээрээ үлддэг.
    const density = travel / BASE_TRAVEL_MS;
    const symbolGap = Math.max(MIN_SYMBOL_GAP_MS, SYMBOL_GAP_MS * density);
    const charGap = Math.max(MIN_CHAR_GAP_MS, CHAR_GAP_MS * density);
    let offset = 0;

    for (const symbol of pattern.split("")) {
      const id = ++idRef.current;
      const hitAt = Date.now() + travel + offset;

      later(() => {
        if (phaseRef.current !== "playing") return;
        tilesRef.current = [...tilesRef.current, { id, symbol, hitAt, travel }];
        setTiles(tilesRef.current);

        // Цонх хаагдмагц хавтан алдагдсанд тооцогдоно.
        later(() => {
          const still = tilesRef.current.find((t) => t.id === id);
          if (!still || phaseRef.current !== "playing") return;
          removeTile(id);
          loseLife();
        }, travel + WINDOW_OK);
      }, offset);

      offset += symbolGap;
    }

    later(scheduleChar, offset + charGap);
  }, [later, loseLife, removeTile]);

  const start = useCallback(() => {
    clearTimers();
    tilesRef.current = [];
    travelRef.current = BASE_TRAVEL_MS;
    livesRef.current = LIVES;
    idRef.current = 0;
    phaseRef.current = "playing";
    scoreRef.current = 0;
    comboRef.current = 0;

    setTiles([]);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setHits(0);
    setLives(LIVES);
    setSpeedLevel(1);
    setFeedback(null);
    setPhase("playing");

    scheduleChar();
  }, [clearTimers, scheduleChar]);

  const tap = useCallback(
    (symbol) => {
      if (phaseRef.current !== "playing") return;

      const now = Date.now();
      // Тухайн эгнээний хамгийн ойрын хавтанг сонгоно.
      const candidates = tilesRef.current
        .filter((t) => t.symbol === symbol)
        .sort((a, b) => Math.abs(a.hitAt - now) - Math.abs(b.hitAt - now));

      const target = candidates[0];
      const verdict = target ? judge(target.hitAt - now) : null;

      if (!target || !verdict) {
        loseLife();
        return;
      }

      removeTile(target.id);

      const nextCombo = comboRef.current + 1;
      comboRef.current = nextCombo;
      // Комбо 10 болгонд оноо нэмэгддэг үржүүлэгч.
      scoreRef.current += verdict.points * (1 + Math.floor(nextCombo / 10));
      // Зөв товшсон бүрдээ л хурдална.
      travelRef.current = Math.max(MIN_TRAVEL_MS, travelRef.current - SPEEDUP_PER_HIT);

      setFeedback({ ...verdict, key: target.id });
      setHits((h) => h + 1);
      setCombo(nextCombo);
      setBestCombo((b) => Math.max(b, nextCombo));
      setScore(scoreRef.current);
      setSpeedLevel(speedLevelOf(travelRef.current));
    },
    [loseLife, removeTile]
  );

  useEffect(() => {
    function onKeyDown(e) {
      if (e.repeat) return;
      const k = e.key;
      if (k === "q" || k === "Q" || k === ".") {
        e.preventDefault();
        tap(".");
      } else if (k === "w" || k === "W" || k === "-") {
        e.preventDefault();
        tap("-");
      } else if (k === " " && phaseRef.current !== "playing") {
        e.preventDefault();
        start();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [tap, start]);

  const accuracy = hits + (LIVES - lives) > 0 ? Math.round((hits / (hits + (LIVES - lives))) * 100) : 100;

  return (
    <div className="mx-auto max-w-2xl space-y-5 animate-fade-in">
      <Link
        href="/study"
        className="inline-flex items-center gap-1.5 text-sm text-ink/50 transition-colors hover:text-brand-dark"
      >
        <ArrowLeft className="h-4 w-4" />
        Study
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">⚡ Гар халаалт</h1>
          <p className="page-subtitle">
            Хавтан шугам дээр ирэх агшинд тохирох товчийг дар.
          </p>
        </div>
        <div className="text-right">
          <p className="label">Дээд оноо</p>
          <p className="text-xl font-bold text-brand-darker">{best}</p>
        </div>
      </div>

      {/* Онооны мөр */}
      <div className="card flex flex-wrap items-center justify-between gap-4 px-5 py-3">
        <div className="flex items-center gap-5">
          <div>
            <p className="label">Оноо</p>
            <p className="text-xl font-bold tabular-nums text-brand-darker">{score}</p>
          </div>
          <div>
            <p className="label">Комбо</p>
            <p className="flex items-center gap-1 text-xl font-bold tabular-nums text-brand-darker">
              {combo > 0 && <Zap className="h-4 w-4 text-accent" />}
              {combo}
            </p>
          </div>
          <div>
            <p className="label">Хурд</p>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-300"
                  style={{ width: `${(speedLevel / 10) * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold tabular-nums text-brand-darker">
                {speedLevel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {Array.from({ length: LIVES }).map((_, i) => (
            <Heart
              key={i}
              className={`h-5 w-5 ${
                i < lives ? "fill-red-500 text-red-500" : "fill-transparent text-ink/20"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Тоглоомын талбар */}
      <div className="card relative h-[380px] overflow-hidden p-0">
        {/* Эгнээ хуваах шугам */}
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-surface" />

        {/* Товших бүс: хавтангийн доод ирмэг энэ шугам дээр ирэх ёстой. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[72px] z-10 h-12 -translate-y-full rounded-lg border-2 border-dashed border-accent/25" />
        <div className="pointer-events-none absolute inset-x-0 bottom-[72px] z-10 h-1 rounded-full bg-accent shadow-[0_0_12px_rgba(13,148,136,0.6)]" />

        {/* Унаж буй хавтангууд */}
        {tiles.map((t) => (
          <div
            key={t.id}
            className={`absolute flex h-12 items-center justify-center rounded-xl text-white shadow-lift ${
              t.symbol === "." ? "left-[8%] w-[34%] bg-brand-dark" : "right-[8%] w-[34%] bg-accent"
            }`}
            style={{
              top: "-48px",
              // Шугам хүртэл 308px явна; цонх хаагдах хүртэл ижил хурдаар
              // үргэлжлүүлэн уначихаар нийт зайг сунгаж өгнө.
              "--fall-distance": `${Math.round((308 * (t.travel + WINDOW_OK)) / t.travel)}px`,
              animation: `tileFall ${t.travel + WINDOW_OK}ms linear forwards`,
            }}
          >
            {t.symbol === "." ? (
              <Circle className="h-4 w-4 fill-current" />
            ) : (
              <Minus className="h-7 w-7" strokeWidth={3} />
            )}
          </div>
        ))}

        {/* Одоогийн тэмдэгт */}
        {phase === "playing" && currentChar && (
          <div className="pointer-events-none absolute left-1/2 top-3 z-20 -translate-x-1/2 rounded-full bg-brand-darker/90 px-3 py-1 text-center">
            <span className="font-mono text-sm font-bold text-white">{currentChar.char}</span>
            <span className="ml-2 font-mono text-xs text-white/50">{currentChar.pattern}</span>
          </div>
        )}

        {/* Товшилтын үнэлгээ */}
        {feedback && (
          <div
            key={feedback.key}
            className={`pointer-events-none absolute bottom-[104px] left-1/2 z-20 -translate-x-1/2 text-sm font-bold animate-fade-in ${feedback.tone}`}
          >
            {feedback.label}
          </div>
        )}

        {/* Эхлэх / дуусах дэлгэц */}
        {phase !== "playing" && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-surface-card/95 px-6 text-center">
            {phase === "idle" ? (
              <>
                <Zap className="h-10 w-10 text-accent" />
                <div>
                  <p className="text-lg font-bold text-brand-darker">Бэлэн үү?</p>
                  <p className="mt-1 text-sm text-ink/55">
                    Зүүн эгнээ — цэг, баруун эгнээ — зураас. Гараас{" "}
                    <kbd className="rounded border border-surface bg-surface-light px-1 font-mono">
                      q
                    </kbd>{" "}
                    /{" "}
                    <kbd className="rounded border border-surface bg-surface-light px-1 font-mono">
                      w
                    </kbd>{" "}
                    ч болно.
                  </p>
                </div>
                <button onClick={start} className="btn-primary">
                  <Play className="h-4 w-4" />
                  Эхлэх
                </button>
              </>
            ) : (
              <>
                <p className="text-3xl">🏁</p>
                <div>
                  <p className="text-lg font-bold text-brand-darker">Дууслаа</p>
                  <p className="mt-1 text-sm text-ink/55">
                    Оноо <strong className="text-brand-darker">{score}</strong> &middot; Хамгийн
                    урт комбо <strong className="text-brand-darker">{bestCombo}</strong> &middot;
                    Оносон <strong className="text-brand-darker">{accuracy}%</strong>
                  </p>
                </div>
                <button onClick={start} className="btn-primary">
                  <RotateCcw className="h-4 w-4" />
                  Дахин тоглох
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Товшилтын товчнууд */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            tap(".");
          }}
          disabled={phase !== "playing"}
          className="flex h-20 items-center justify-center rounded-xl border-2 border-brand-dark text-brand-darker transition-all active:scale-95 disabled:opacity-40 sm:hover:bg-brand-50"
        >
          <Circle className="h-6 w-6 fill-current" />
          <span className="ml-3 text-sm font-semibold">Цэг · q</span>
        </button>
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            tap("-");
          }}
          disabled={phase !== "playing"}
          className="flex h-20 items-center justify-center rounded-xl border-2 border-accent text-accent-dark transition-all active:scale-95 disabled:opacity-40 sm:hover:bg-accent/10"
        >
          <Minus className="h-8 w-8" strokeWidth={3} />
          <span className="ml-3 text-sm font-semibold">Зураас · w</span>
        </button>
      </div>
    </div>
  );
}
