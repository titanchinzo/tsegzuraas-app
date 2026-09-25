"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Circle,
  CloudFog,
  Eye,
  EyeOff,
  Flame,
  Heart,
  Minus,
  Play,
  RotateCcw,
  Skull,
  Snowflake,
  Swords,
  Trophy,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { MORSE_MAP, CATEGORIES } from "@/lib/morse";
import { playTone } from "@/lib/audio";

const MAX_HP = 100;
const HEAL_PER_LETTER = 5; // зөв бичсэн үсэг бүр амь нөхнө
const STAGE_CLEAR_HEAL = 25; // босс ялахад нэмэлт амь
const MINIONS_PER_STAGE = 3; // үе бүрд эхлээд энгийн мангасууд, эцэст нь босс
const TICK_MS = 50;
// Хуучин хавтангийн тоглоомын оноотой холилдохгүйн тулд шинэ түлхүүр.
const BEST_KEY = "tsegzuraas.warmup.best.v2";
const SOUND_KEY = "tsegzuraas.warmup.sound";

// Санамж — үсгийн доорх цэг зураас. Эхний 30 секундэд бүгд харагдана, дараа
// нь 2.5 минутын турш нэг нэгээрээ алга болж, 3 минут тоглосны дараа огт
// үлдэхгүй. Цаг нь зөвхөн тулаан явж байхад гүйнэ (баннер, шилжилтэд биш).
const HINT_GRACE_MS = 30000;
const HINT_FADE_MS = 150000;

// Боссуудын онцгой дайралтын үргэлжлэх хугацаа
const FOG_MS = 6000;
const FREEZE_MS = 1600;
const BURN_MS = 5000;
const BURN_TICK_MS = 1000;
const BURN_DAMAGE = 3;
const TRIPLE_GAP_MS = 300;

const MINIONS = [
  { emoji: "🦇", name: "Сарьсан багваахай", attackName: "Хазалт", interval: 4200, damage: 6 },
  { emoji: "🐺", name: "Саарал чоно", attackName: "Соёо", interval: 5600, damage: 9 },
  { emoji: "🐗", name: "Зэрлэг гахай", attackName: "Мөргөлт", interval: 7000, damage: 13 },
  { emoji: "🕷️", name: "Хорт аалз", attackName: "Хатгалт", interval: 5000, damage: 8 },
];

// Үе бүрийн босс. 5-р үеэс хойш дахин эхнээсээ давтагдах ч хүчтэй болсон байна.
const BOSSES = [
  {
    emoji: "🗿",
    name: "Чулуун аварга",
    attack: "slam",
    attackName: "Нүргэлсэн цохилт",
    desc: "Удаан цэнэглэгдэнэ, гэхдээ нэг цохилт нь маш хүчтэй.",
    interval: 9000,
    damage: 24,
  },
  {
    emoji: "👻",
    name: "Хар сүнс",
    attack: "fog",
    attackName: "Манан",
    desc: "Цохих бүрдээ бүх санамжийг 6 секунд нууна.",
    interval: 6500,
    damage: 8,
  },
  {
    emoji: "🐉",
    name: "Галт луу",
    attack: "burn",
    attackName: "Галын амьсгал",
    desc: "Шатааж, аажмаар амь хасна. Зөв үсэг бичвэл гал унтарна.",
    interval: 7500,
    damage: 8,
  },
  {
    emoji: "🧙",
    name: "Мөсөн шулам",
    attack: "freeze",
    attackName: "Хөлдөөлт",
    desc: "Гарыг чинь хөлдөөж, товч түр ажиллахгүй болно.",
    interval: 7000,
    damage: 10,
  },
  {
    emoji: "👹",
    name: "Мангасын хаан",
    attack: "triple",
    attackName: "Гурвалсан аянга",
    desc: "Гурав дараалан цохино. Шархдах тусам улам хурдан дайрна.",
    interval: 8000,
    damage: 7,
  },
];

const LETTERS = CATEGORIES.english;

// Эхний үеүдэд богино кодтой үсэг, ахих тусам урт код, дараа нь тоо нэмэгдэнэ.
function poolForStage(stage) {
  if (stage === 1) return LETTERS.filter((c) => MORSE_MAP[c].length <= 2);
  if (stage === 2) return LETTERS.filter((c) => MORSE_MAP[c].length <= 3);
  if (stage <= 4) return LETTERS;
  return LETTERS.concat(CATEGORIES.numbers);
}

function poolLabel(stage) {
  if (stage === 1) return "Хамгийн богино кодтой үсгүүд";
  if (stage === 2) return "Гурван тэмдэгт хүртэлх үсгүүд";
  if (stage <= 4) return "Бүх үсэг";
  return "Үсэг ба тоо";
}

function bossForStage(stage) {
  return BOSSES[(stage - 1) % BOSSES.length];
}

function makeLetters(count, stage) {
  const pool = poolForStage(stage);
  const letters = [];
  let prev = null;
  while (letters.length < count) {
    const char = pool[Math.floor(Math.random() * pool.length)];
    if (char === prev) continue;
    prev = char;
    // Санамжийн түвшин hintSeed-ээс доош ормогц тухайн үсгийн санамж
    // нуугдана — тиймээс санамжууд нэг дор биш, нэг нэгээрээ алга болдог.
    letters.push({ char, pattern: MORSE_MAP[char], hintSeed: Math.random() });
  }
  return letters;
}

function makeEnemy(stage, wave) {
  if (wave >= MINIONS_PER_STAGE) {
    const base = bossForStage(stage);
    const tier = Math.floor((stage - 1) / BOSSES.length);
    return {
      ...base,
      isBoss: true,
      damage: Math.round(base.damage * (1 + 0.3 * tier)),
      interval: Math.round(base.interval * Math.pow(0.88, tier)),
      letters: makeLetters(Math.min(12, 5 + stage), stage),
      index: 0,
      charge: 0,
    };
  }
  const base = MINIONS[Math.floor(Math.random() * MINIONS.length)];
  return {
    ...base,
    isBoss: false,
    attack: "hit",
    damage: Math.round(base.damage * (1 + 0.1 * (stage - 1))),
    interval: Math.round(base.interval * Math.max(0.65, 1 - 0.05 * (stage - 1))),
    letters: makeLetters(Math.min(4, 2 + Math.floor((stage - 1) / 2)), stage),
    index: 0,
    charge: 0,
  };
}

function hintLevel(elapsed) {
  if (elapsed <= HINT_GRACE_MS) return 1;
  return Math.max(0, 1 - (elapsed - HINT_GRACE_MS) / HINT_FADE_MS);
}

function hintShown(g, letter, now) {
  return now >= g.fogUntil && letter.hintSeed < hintLevel(g.elapsed);
}

// Мангасын хаан шархдах тусам уурлаж, дайралт нь хурдасна.
function attackInterval(e) {
  if (e.attack !== "triple") return e.interval;
  const left = (e.letters.length - e.index) / e.letters.length;
  return e.interval * (0.55 + 0.45 * left);
}

// ---------------------------------------------------------------------------
// Тоглоомын логик. Төлөв нь нэг mutable объект (g) — 50ms тутам шинэчлэгддэг
// тул setState-ээр хуваавал рендер бүр олон удаа давхцана. Функцүүд зөвхөн
// g-г өөрчилж, компонент дараа нь дахин рендерлэнэ.
// ---------------------------------------------------------------------------

function newGame(now) {
  return {
    phase: "playing",
    hp: MAX_HP,
    stage: 1,
    wave: 0,
    enemy: null,
    enemyUid: 0,
    nextSpawnAt: 0,
    input: "",
    elapsed: 0,
    lastTick: now,
    score: 0,
    combo: 0,
    bestCombo: 0,
    correct: 0,
    mistakes: 0,
    bossesDefeated: 0,
    fogUntil: 0,
    frozenUntil: 0,
    burn: null,
    pendingHits: [],
    banner: null,
    floaters: [],
    floaterId: 0,
    fx: { playerHit: 0, hitKind: null, enemyAnim: null, enemyAnimKey: 0 },
    sound: true,
    recorded: false,
    newBest: false,
  };
}

function sfx(g, ms, frequency) {
  if (g.sound) playTone(ms, frequency);
}

function addFloater(g, now, text, tone, at) {
  g.floaters = [
    ...g.floaters,
    { id: ++g.floaterId, text, tone, at, dx: Math.round(Math.random() * 60 - 30), until: now + 1000 },
  ];
}

function heal(g, amount) {
  const healed = Math.min(amount, MAX_HP - g.hp);
  g.hp += healed;
  return healed;
}

function hurt(g, now, damage, kind) {
  if (g.phase !== "playing") return;
  g.hp = Math.max(0, g.hp - damage);
  g.fx.playerHit += 1;
  g.fx.hitKind = kind;
  addFloater(g, now, `-${damage}`, "damage", "player");
  sfx(g, 160, 140);
  if (g.hp <= 0) g.phase = "over";
}

function showBanner(g, now, kind, duration) {
  g.banner = { kind, until: now + duration, duration };
}

function spawnEnemy(g, now) {
  const enemy = makeEnemy(g.stage, g.wave);
  enemy.uid = ++g.enemyUid;
  g.enemy = enemy;
  g.input = "";
  g.nextSpawnAt = 0;
  g.fx.enemyAnim = "spawn";
  g.fx.enemyAnimKey += 1;
  if (enemy.isBoss) showBanner(g, now, "boss", 3200);
  else if (g.wave === 0) showBanner(g, now, "stage", 2000);
}

function enemyAttack(g, now) {
  const e = g.enemy;
  g.fx.enemyAnim = "attack";
  g.fx.enemyAnimKey += 1;

  switch (e.attack) {
    case "fog":
      g.fogUntil = now + FOG_MS;
      hurt(g, now, e.damage, "hit");
      break;
    case "burn":
      g.burn = { until: now + BURN_MS, nextTick: now + BURN_TICK_MS };
      hurt(g, now, e.damage, "burn");
      break;
    case "freeze":
      g.frozenUntil = now + FREEZE_MS;
      hurt(g, now, e.damage, "freeze");
      break;
    case "triple":
      hurt(g, now, e.damage, "bolt");
      g.pendingHits.push(
        { at: now + TRIPLE_GAP_MS, damage: e.damage },
        { at: now + TRIPLE_GAP_MS * 2, damage: e.damage }
      );
      break;
    case "slam":
      hurt(g, now, e.damage, "slam");
      break;
    default:
      hurt(g, now, e.damage, "hit");
  }
}

function defeatEnemy(g, now) {
  const e = g.enemy;
  e.dead = true;
  const bonus = (e.isBoss ? 100 : 20) * g.stage;
  g.score += bonus;
  addFloater(g, now, e.isBoss ? `Босс ялагдлаа! +${bonus}` : `+${bonus}`, "score", "enemy");
  sfx(g, 180, 990);

  // Тулаан дуусмагц сөрөг нөлөөнүүд арилна.
  g.fogUntil = 0;
  g.frozenUntil = 0;
  g.burn = null;
  g.pendingHits = [];

  if (e.isBoss) {
    g.bossesDefeated += 1;
    g.stage += 1;
    g.wave = 0;
    const healed = heal(g, STAGE_CLEAR_HEAL);
    if (healed > 0) addFloater(g, now, `+${healed}`, "heal", "player");
  } else {
    g.wave += 1;
  }
  g.nextSpawnAt = now + (e.isBoss ? 1200 : 800);
}

function completeLetter(g, now) {
  const e = g.enemy;
  const letter = e.letters[e.index];
  const hinted = hintShown(g, letter, now);

  g.input = "";
  g.combo += 1;
  g.bestCombo = Math.max(g.bestCombo, g.combo);
  g.correct += 1;

  // Санамжгүй бичсэн үсэг илүү оноотой.
  const points = (hinted ? 10 : 25) * (1 + Math.floor(g.combo / 10));
  g.score += points;
  addFloater(g, now, hinted ? `+${points}` : `+${points} санамжгүй!`, "score", "enemy");

  const healed = heal(g, HEAL_PER_LETTER);
  if (healed > 0) addFloater(g, now, `+${healed}`, "heal", "player");
  if (g.burn) {
    g.burn = null;
    addFloater(g, now, "Гал унтарлаа", "heal", "center");
  }

  g.fx.enemyAnim = "hit";
  g.fx.enemyAnimKey += 1;
  sfx(g, 90, 880);

  e.index += 1;
  if (e.index >= e.letters.length) defeatEnemy(g, now);
}

function pressSymbol(g, now, symbol) {
  const e = g.enemy;
  if (g.phase !== "playing" || g.banner || !e || e.dead) return;

  if (now < g.frozenUntil) {
    addFloater(g, now, "Хөлдсөн!", "freeze", "center");
    return;
  }

  const letter = e.letters[e.index];
  if (symbol !== letter.pattern[g.input.length]) {
    // Буруу товч — мангас тэр дороо дайрна.
    g.input = "";
    g.combo = 0;
    g.mistakes += 1;
    addFloater(g, now, "Буруу!", "damage", "center");
    e.charge = 0;
    enemyAttack(g, now);
    return;
  }

  sfx(g, symbol === "." ? 70 : 200, 620);
  g.input += symbol;
  if (g.input.length === letter.pattern.length) completeLetter(g, now);
}

function step(g, now) {
  const dt = Math.min(now - g.lastTick, 200);
  g.lastTick = now;
  if (g.floaters.some((f) => f.until <= now)) {
    g.floaters = g.floaters.filter((f) => f.until > now);
  }
  if (g.phase !== "playing") return;

  if (g.banner) {
    if (now < g.banner.until) return;
    g.banner = null;
  }

  if (g.nextSpawnAt && now >= g.nextSpawnAt) {
    spawnEnemy(g, now);
    if (g.banner) return;
  }

  if (g.pendingHits.length) {
    const due = g.pendingHits.filter((h) => h.at <= now);
    g.pendingHits = g.pendingHits.filter((h) => h.at > now);
    due.forEach((h) => hurt(g, now, h.damage, "bolt"));
  }

  if (g.burn) {
    if (now >= g.burn.nextTick) {
      g.burn.nextTick += BURN_TICK_MS;
      hurt(g, now, BURN_DAMAGE, "burn");
    }
    if (g.burn && now >= g.burn.until) g.burn = null;
  }

  const e = g.enemy;
  if (g.phase !== "playing" || !e || e.dead) return;

  g.elapsed += dt;
  e.charge += dt;
  if (e.charge >= attackInterval(e)) {
    e.charge = 0;
    enemyAttack(g, now);
  }
}

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

const ENEMY_ANIM = { spawn: "anim-spawn", hit: "anim-hit", attack: "anim-lunge" };

const HIT_FLASH = {
  slam: "bg-red-600/40",
  bolt: "bg-yellow-200/40",
  burn: "bg-orange-500/25",
  freeze: "bg-sky-300/30",
  hit: "bg-red-500/25",
};

const FLOAT_TONE = {
  damage: "text-red-400",
  heal: "text-emerald-300",
  score: "text-accent-light",
  freeze: "text-sky-300",
};

const FLOAT_TOP = { enemy: "28%", center: "52%", player: "80%" };

function HintGlyphs({ pattern, typed = 0, small = false }) {
  return (
    <span className={`flex h-full items-center justify-center ${small ? "gap-0.5" : "gap-1"}`}>
      {pattern.split("").map((s, i) => (
        <span
          key={i}
          className={`rounded-full ${
            s === "." ? (small ? "h-1 w-1" : "h-2 w-2") : small ? "h-1 w-2" : "h-2 w-4"
          } ${i < typed ? "bg-accent-light shadow-[0_0_6px_rgba(94,234,212,0.8)]" : "bg-white/70"}`}
        />
      ))}
    </span>
  );
}

export default function WarmupPage() {
  const gRef = useRef(null);
  const timerRef = useRef(null);
  const arenaRef = useRef(null);
  const bestRef = useRef(0);
  const soundRef = useRef(true);
  const [, rerender] = useReducer((n) => n + 1, 0);
  const [best, setBest] = useState(0);
  const [sound, setSound] = useState(true);

  useEffect(() => {
    try {
      const saved = Number(window.localStorage.getItem(BEST_KEY) || 0);
      bestRef.current = saved;
      setBest(saved);
      if (window.localStorage.getItem(SOUND_KEY) === "off") {
        soundRef.current = false;
        setSound(false);
      }
    } catch {
      /* localStorage байхгүй бол дээд оноо харагдахгүй, тоглоом ажиллана */
    }
  }, []);

  useEffect(() => () => clearInterval(timerRef.current), []);

  // Логик алхам бүрийн дараа дуудагдана: тоглоом дууссан бол цагийг зогсоож,
  // дээд оноог хадгална.
  const sync = useCallback(() => {
    const g = gRef.current;
    if (g && g.phase === "over" && !g.recorded) {
      g.recorded = true;
      clearInterval(timerRef.current);
      timerRef.current = null;
      if (g.score > bestRef.current) {
        g.newBest = true;
        bestRef.current = g.score;
        setBest(g.score);
        try {
          window.localStorage.setItem(BEST_KEY, String(g.score));
        } catch {
          /* хадгалж чадахгүй бол зөвхөн энэ сесст харагдана */
        }
      }
    }
    rerender();
  }, []);

  const start = useCallback(() => {
    clearInterval(timerRef.current);
    const now = Date.now();
    const g = newGame(now);
    g.sound = soundRef.current;
    spawnEnemy(g, now);
    gRef.current = g;

    timerRef.current = setInterval(() => {
      const t = Date.now();
      // Таб нуугдсан үед тоглоом зогсоно — буцаж ирэхэд мангас хуримтлагдсан
      // цагаар нэг дор дайрахгүй.
      if (document.hidden) {
        g.lastTick = t;
        return;
      }
      step(g, t);
      sync();
    }, TICK_MS);
    rerender();
  }, [sync]);

  const press = useCallback(
    (symbol) => {
      const g = gRef.current;
      if (!g) return;
      pressSymbol(g, Date.now(), symbol);
      sync();
    },
    [sync]
  );

  function toggleSound() {
    const next = !soundRef.current;
    soundRef.current = next;
    setSound(next);
    if (gRef.current) gRef.current.sound = next;
    try {
      window.localStorage.setItem(SOUND_KEY, next ? "on" : "off");
    } catch {
      /* тохиргоо хадгалагдахгүй ч дуу унтарна */
    }
  }

  useEffect(() => {
    function onKeyDown(e) {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key;
      if (k === "q" || k === "Q" || k === ".") {
        e.preventDefault();
        press(".");
      } else if (k === "w" || k === "W" || k === "-") {
        e.preventDefault();
        press("-");
      } else if (k === " " && gRef.current?.phase !== "playing") {
        e.preventDefault();
        start();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [press, start]);

  const g = gRef.current;
  const hitCount = g ? g.fx.playerHit : 0;

  // Цохилт авах бүрд талбай доргино. Хүнд цохилт (чулуун аварга) илүү хүчтэй.
  useEffect(() => {
    const el = arenaRef.current;
    if (!hitCount || !el || typeof el.animate !== "function") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const heavy = gRef.current?.fx.hitKind === "slam";
    const a = heavy ? 12 : 5;
    el.animate(
      [
        { transform: "translate(0, 0)" },
        { transform: `translate(${-a}px, ${a / 2}px)` },
        { transform: `translate(${a * 0.8}px, ${-a * 0.6}px)` },
        { transform: `translate(${-a * 0.5}px, ${a * 0.3}px)` },
        { transform: "translate(0, 0)" },
      ],
      { duration: heavy ? 520 : 300, easing: "ease-out" }
    );
  }, [hitCount]);

  const phase = g ? g.phase : "idle";
  const now = g ? g.lastTick : 0;
  const e = g?.enemy;
  const level = g ? hintLevel(g.elapsed) : 1;
  const fogged = g ? now < g.fogUntil : false;
  const frozen = g ? now < g.frozenUntil : false;
  const current = e && !e.dead ? e.letters[e.index] : null;
  const currentHinted = current ? hintShown(g, current, now) : false;
  const charge = e && !e.dead ? Math.min(1, e.charge / attackInterval(e)) : 0;
  const accuracy =
    g && g.correct + g.mistakes > 0 ? Math.round((g.correct / (g.correct + g.mistakes)) * 100) : 100;
  const stageBoss = bossForStage(g ? g.stage : 1);

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
          <h1 className="page-title">⚔️ Гар халаалт</h1>
          <p className="page-subtitle">
            Үсгийг морзоор бичиж мангасыг ял — зөв бичих бүрд амь нөхөгдөнө.
          </p>
        </div>
        <div className="text-right">
          <p className="label">Дээд оноо</p>
          <p className="text-xl font-bold text-brand-darker">{best}</p>
        </div>
      </div>

      {/* Онооны мөр */}
      <div className="card flex flex-wrap items-center justify-between gap-4 px-5 py-3">
        <div className="flex flex-wrap items-center gap-5">
          <div>
            <p className="label">Оноо</p>
            <p className="text-xl font-bold tabular-nums text-brand-darker">{g ? g.score : 0}</p>
          </div>
          <div>
            <p className="label">Комбо</p>
            <p className="flex items-center gap-1 text-xl font-bold tabular-nums text-brand-darker">
              {g && g.combo > 0 && <Zap className="h-4 w-4 text-accent" />}
              {g ? g.combo : 0}
            </p>
          </div>
          <div>
            <p className="label">Санамж</p>
            <div className="mt-1 flex items-center gap-2">
              {level > 0 ? (
                <Eye className="h-4 w-4 text-accent-dark" />
              ) : (
                <EyeOff className="h-4 w-4 text-ink/40" />
              )}
              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${level * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold tabular-nums text-brand-darker">
                {level > 0 ? `${Math.round(level * 100)}%` : "Үгүй"}
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={toggleSound}
          aria-label={sound ? "Дууг унтраах" : "Дууг асаах"}
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink/50 transition-colors hover:bg-surface hover:text-ink"
        >
          {sound ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </button>
      </div>

      {/* Тулааны талбар */}
      <div
        ref={arenaRef}
        className="relative h-[470px] overflow-hidden rounded-xl border border-brand-900 bg-brand-darker bg-gradient-to-b from-brand-darker to-brand-900 text-white shadow-soft"
      >
        {e && (
          <div className="relative z-10 flex h-full flex-col px-4 pb-4 pt-3">
            {/* Мангасын нэр, амь (үлдсэн үсэг) */}
            <div>
              <div className="flex items-center justify-between gap-2 text-xs font-semibold">
                <span className="flex min-w-0 items-center gap-1.5">
                  {e.isBoss && (
                    <span className="shrink-0 rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      Босс
                    </span>
                  )}
                  <span className="truncate text-white/90">{e.name}</span>
                </span>
                <span className="shrink-0 tabular-nums text-white/55">
                  Үе {g.stage} · {e.isBoss ? "Босс" : `${Math.min(g.wave + 1, MINIONS_PER_STAGE)}/${MINIONS_PER_STAGE}`}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-[width] duration-300 ${
                    e.isBoss ? "bg-red-500" : "bg-orange-400"
                  }`}
                  style={{ width: `${((e.letters.length - e.index) / e.letters.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Мангас ба дайралтын цэнэг */}
            <div className="flex flex-1 flex-col items-center justify-center">
              <span
                key={`${e.uid}-${g.fx.enemyAnimKey}`}
                className={`inline-block ${e.dead ? "anim-die" : ENEMY_ANIM[g.fx.enemyAnim] || ""}`}
              >
                <span
                  aria-hidden
                  className={`block select-none leading-none ${e.dead ? "" : "anim-bob"} ${
                    e.isBoss ? "text-8xl drop-shadow-[0_0_22px_rgba(239,68,68,0.55)]" : "text-7xl"
                  }`}
                >
                  {e.emoji}
                </span>
              </span>
              <div className={`mt-4 w-40 transition-opacity ${e.dead ? "opacity-0" : "opacity-100"}`}>
                <p className="mb-1 text-center text-[10px] font-semibold uppercase tracking-wider text-white/50">
                  {e.attackName}
                </p>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full ${charge > 0.75 ? "bg-red-500" : "bg-amber-400"}`}
                    style={{ width: `${charge * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Бичих үсгүүд — одоогийнх том, дараагийнх нь жижиг */}
            <div className="flex h-32 items-center justify-center gap-2.5">
              {current && (
                <div
                  key={`${e.uid}-${e.index}`}
                  className="flex min-w-[6rem] flex-col items-center gap-2.5 rounded-2xl border-2 border-accent-light/80 bg-white/10 px-3 pb-3 pt-2 shadow-[0_0_28px_rgba(94,234,212,0.3)]"
                >
                  <span className="font-mono text-5xl font-bold leading-none">{current.char}</span>
                  <div className="relative h-2 w-full">
                    <div
                      className={`absolute inset-0 transition-opacity duration-700 ${
                        currentHinted ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <HintGlyphs pattern={current.pattern} typed={g.input.length} />
                    </div>
                    {/* Санамжгүй үед зөвхөн өөрийн оруулсныг харуулна */}
                    {!currentHinted && g.input && (
                      <div className="absolute inset-0">
                        <HintGlyphs pattern={g.input} typed={g.input.length} />
                      </div>
                    )}
                  </div>
                </div>
              )}
              {current &&
                e.letters.slice(e.index + 1, e.index + 4).map((l, i) => (
                  <div
                    key={`${e.uid}-${e.index + 1 + i}`}
                    className="flex min-w-[3rem] flex-col items-center gap-2 rounded-xl bg-white/5 px-1.5 pb-2 pt-1.5"
                    style={{ opacity: 0.75 - i * 0.2 }}
                  >
                    <span className="font-mono text-2xl font-bold leading-none text-white/85">{l.char}</span>
                    <div
                      className={`h-1 transition-opacity duration-700 ${
                        hintShown(g, l, now) ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <HintGlyphs pattern={l.pattern} small />
                    </div>
                  </div>
                ))}
            </div>

            {/* Тоглогчийн амь, нөлөөнүүд */}
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-white/80">
                  <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
                  Амь
                </span>
                <span className="flex flex-wrap justify-center gap-1.5">
                  {g.burn && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/20 px-2 py-0.5 text-orange-300">
                      <Flame className="h-3 w-3" />
                      Шатаж байна
                    </span>
                  )}
                  {fogged && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-400/20 px-2 py-0.5 text-slate-200">
                      <CloudFog className="h-3 w-3" />
                      Манан
                    </span>
                  )}
                  {frozen && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-sky-400/20 px-2 py-0.5 text-sky-200">
                      <Snowflake className="h-3 w-3" />
                      Хөлдсөн
                    </span>
                  )}
                </span>
                <span className="tabular-nums text-white/80">
                  {g.hp}/{MAX_HP}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-[width] duration-300 ${
                    g.hp > 50 ? "bg-emerald-400" : g.hp > 25 ? "bg-amber-400" : "bg-red-500"
                  }`}
                  style={{ width: `${(g.hp / MAX_HP) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Боссын нөлөөний давхарга */}
        {fogged && (
          <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-b from-slate-300/30 via-slate-400/10 to-slate-300/25" />
        )}
        {frozen && (
          <div className="pointer-events-none absolute inset-0 z-20 rounded-xl bg-sky-300/10 ring-4 ring-inset ring-sky-300/70" />
        )}
        {g?.burn && <div className="anim-burn pointer-events-none absolute inset-0 z-20 rounded-xl" />}
        {hitCount > 0 && (
          <div
            key={hitCount}
            className={`anim-flash pointer-events-none absolute inset-0 z-20 ${HIT_FLASH[g.fx.hitKind] || HIT_FLASH.hit}`}
          />
        )}

        {/* Хөвөх тоонууд (оноо, амь) */}
        {g?.floaters.map((f) => (
          <div
            key={f.id}
            className={`anim-float pointer-events-none absolute z-30 whitespace-nowrap text-sm font-bold ${
              FLOAT_TONE[f.tone] || "text-white"
            }`}
            style={{ left: `calc(50% + ${f.dx}px)`, top: FLOAT_TOP[f.at] }}
          >
            {f.text}
          </div>
        ))}

        {/* Үе / боссын танилцуулга */}
        {g?.banner && phase === "playing" && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-brand-900/70 px-6 text-center backdrop-blur-[2px]">
            <div key={g.banner.until} className="anim-banner" style={{ animationDuration: `${g.banner.duration}ms` }}>
              {g.banner.kind === "boss" && e ? (
                <>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-400">⚠ Босс гарлаа</p>
                  <p className="mt-2 text-7xl leading-none">{e.emoji}</p>
                  <p className="mt-3 font-display text-2xl font-bold">{e.name}</p>
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold">
                    <Zap className="h-3.5 w-3.5 text-amber-300" />
                    {e.attackName}
                  </p>
                  <p className="mx-auto mt-2 max-w-xs text-sm text-white/65">{e.desc}</p>
                </>
              ) : (
                <>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent-light">
                    {g.stage === 1 ? "Тулаан эхэллээ" : "Дараагийн үе"}
                  </p>
                  <p className="mt-1 font-display text-5xl font-bold">Үе {g.stage}</p>
                  <p className="mt-2 text-sm text-white/65">{poolLabel(g.stage)}</p>
                  <p className="mt-3 text-sm text-white/65">
                    Эцэст нь: {stageBoss.emoji} <strong className="text-white">{stageBoss.name}</strong>
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Эхлэх / дуусах дэлгэц */}
        {phase !== "playing" && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-brand-darker/95 px-6 text-center">
            {phase === "idle" ? (
              <>
                <Swords className="h-10 w-10 text-accent-light" />
                <p className="text-lg font-bold">Мангастай тулаанд бэлэн үү?</p>
                <ul className="max-w-sm space-y-1.5 text-left text-sm text-white/70">
                  <li>
                    • Мангасын үсгийг цэг (
                    <kbd className="rounded border border-white/20 px-1 font-mono">q</kbd>) ба зураасаар (
                    <kbd className="rounded border border-white/20 px-1 font-mono">w</kbd>) бич.
                  </li>
                  <li>
                    • Зөв үсэг бүр мангасыг шархдуулж, чамд{" "}
                    <strong className="text-emerald-300">+{HEAL_PER_LETTER} амь</strong> нөхнө.
                  </li>
                  <li>• Буруу товчвол, эсвэл удааширвал мангас дайрна.</li>
                  <li>• Тоглох тусам үсгийн доорх санамж алга болж, 3 минутын дараа огт үлдэхгүй.</li>
                  <li>• Үе бүрийн эцэст өөр өөр дайралттай босс гарна.</li>
                </ul>
                <p className="text-3xl tracking-widest" aria-hidden>
                  {BOSSES.map((b) => b.emoji).join(" ")}
                </p>
                <button onClick={start} className="btn-accent">
                  <Play className="h-4 w-4" />
                  Эхлэх
                </button>
              </>
            ) : (
              <>
                <Skull className="h-10 w-10 text-red-400" />
                <div>
                  <p className="text-lg font-bold">Ялагдлаа</p>
                  {g.newBest && (
                    <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-300">
                      <Trophy className="h-4 w-4" />
                      Шинэ дээд оноо!
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-x-8 gap-y-3">
                  {[
                    ["Оноо", g.score],
                    ["Хүрсэн үе", g.stage],
                    ["Ялсан босс", g.bossesDefeated],
                    ["Нарийвчлал", `${accuracy}%`],
                    ["Урт комбо", g.bestCombo],
                    ["Хугацаа", formatTime(g.elapsed)],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-white/45">{label}</p>
                      <p className="text-lg font-bold tabular-nums">{value}</p>
                    </div>
                  ))}
                </div>
                <button onClick={start} className="btn-accent">
                  <RotateCcw className="h-4 w-4" />
                  Дахин тоглох
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Товчнууд */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onPointerDown={(ev) => {
            ev.preventDefault();
            press(".");
          }}
          disabled={phase !== "playing"}
          className={`flex h-20 items-center justify-center rounded-xl border-2 border-brand-dark text-brand-darker transition-all active:scale-95 disabled:opacity-40 sm:hover:bg-brand-50 ${
            frozen ? "opacity-50" : ""
          }`}
        >
          {frozen ? <Snowflake className="h-6 w-6 text-sky-400" /> : <Circle className="h-6 w-6 fill-current" />}
          <span className="ml-3 text-sm font-semibold">Цэг · q</span>
        </button>
        <button
          type="button"
          onPointerDown={(ev) => {
            ev.preventDefault();
            press("-");
          }}
          disabled={phase !== "playing"}
          className={`flex h-20 items-center justify-center rounded-xl border-2 border-accent text-accent-dark transition-all active:scale-95 disabled:opacity-40 sm:hover:bg-accent/10 ${
            frozen ? "opacity-50" : ""
          }`}
        >
          {frozen ? <Snowflake className="h-7 w-7 text-sky-400" /> : <Minus className="h-8 w-8" strokeWidth={3} />}
          <span className="ml-3 text-sm font-semibold">Зураас · w</span>
        </button>
      </div>
    </div>
  );
}
