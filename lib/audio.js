"use client";

// Web Audio API ашиглан Морзын кодны дуу (beep) үүсгэх. (Dev Notes §9)
// Цэг = 1 нэгж, Зураас = 3 нэгж, дотоод завсар = 1 нэгж.

let sharedCtx = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!sharedCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    sharedCtx = new AudioCtx();
  }
  return sharedCtx;
}

function beep(ctx, startTime, durationMs, frequency = 600, { volume = 0.4, type = "sine" } = {}) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;

  // Клик чимээ багасгах богино fade in/out
  const fade = 0.005;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + fade);
  gain.gain.linearRampToValueAtTime(volume, startTime + durationMs / 1000 - fade);
  gain.gain.linearRampToValueAtTime(0, startTime + durationMs / 1000);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + durationMs / 1000 + 0.01);
}

/**
 * Морзын кодыг (жиш: ".- / -...") тухайн WPM хурд, өнгө (Hz)-өөр дуугаар
 * тоглуулна. options: { frequency, onDone } эсвэл (хуучин хэвшил хэвээр
 * ажиллуулахын тулд) шууд onDone функц дамжуулж болно.
 * Буцаах: нийт үргэлжлэх хугацаа (ms)
 */
export function playMorseSequence(morse, wpm = 20, options) {
  const { frequency = 600, onDone } =
    typeof options === "function" ? { onDone: options } : options || {};

  const ctx = getAudioContext();
  if (!ctx) return 0;
  if (ctx.state === "suspended") ctx.resume();

  const unit = 1.2 / Math.max(1, wpm); // секундээр (нэг dot)
  const start = ctx.currentTime + 0.1;
  let t = start;

  // Тэмдэгтийг тэмдэгтээр биш, ТОКЕНООР задална. Өмнө нь мөрийг үсэг үсгээр
  // гүйлгэж, элемент хооронд ердөө 0.1 нэгжийн завсар өгдөг байсан тул цэг,
  // зураас хоёр нийлж нэг үргэлжилсэн дуу болдог байв. Мөн " / " нь 1+7+1 = 9
  // нэгжийн чимээгүй үе үүсгэж, тэмдэгт хоорондын завсар стандартаас гурав
  // дахин урт болгодог байсан — улмаас WPM өөрчлөхөд ялгаа мэдрэгдэхгүй байлаа.
  //
  // Стандарт: элемент хооронд 1 нэгж, тэмдэгт хооронд 3, үг хооронд 7.
  const words = morse.trim().split(/\s*\/\s*/).filter(Boolean);

  words.forEach((word, wi) => {
    if (wi > 0) t += unit * 7;

    const letters = word.trim().split(/\s+/).filter(Boolean);
    letters.forEach((letter, li) => {
      if (li > 0) t += unit * 3;

      letter.split("").forEach((symbol, si) => {
        if (si > 0) t += unit;
        const len = (symbol === "-" ? 3 : 1) * unit;
        beep(ctx, t, len * 1000, frequency);
        t += len;
      });
    });
  });

  const totalMs = (t - start) * 1000;
  if (onDone) setTimeout(onDone, totalMs + 200);

  return totalMs;
}

// ---------------------------------------------------------------------------
// Товшилтын дууны дараалал.
//
// Телеграфын түлхүүр USB гар (HID) болж холбогдоход нэг үсгийн бүх тэмдэгтийг
// ("---.") нэг дор илгээдэг. Тэмдэгт бүрийн дууг шууд тоглуулбал давхцаж,
// нийлж сонсогддог байв. Одоо дуу бүр өмнөхөө дуусч, морзын завсар (1 нэгж)
// өнгөрсний дараа эхэлнэ. Хүн гараар товшиход дараалал ихэвчлэн хоосон
// байдаг тул хоцрогдолгүй шууд дуугарна.
// ---------------------------------------------------------------------------

let queueEnd = 0; // дарааллын сүүлийн дуу (завсартайгаа) дуусах AudioContext цаг
const MAX_BACKLOG_S = 3; // үүнээс их хуримтлагдвал шинэ дууг алгасна

function readyContext() {
  const ctx = getAudioContext();
  if (!ctx) return null;
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function enqueue(ctx, durationS, gapS, play) {
  const start = Math.max(ctx.currentTime + 0.005, queueEnd);
  if (start - ctx.currentTime > MAX_BACKLOG_S) return;
  play(start);
  queueEnd = start + durationS + gapS;
}

/**
 * Товшсон нэг цэг/зураасыг дараалалд оруулж тоглуулна.
 */
export function queueSymbol(symbol, wpm = 20, frequency = 600) {
  const ctx = readyContext();
  if (!ctx) return;
  const unit = 1.2 / Math.max(1, wpm);
  const len = (symbol === "-" ? 3 : 1) * unit;
  enqueue(ctx, len, unit, (t) => beep(ctx, t, len * 1000, frequency));
}

/**
 * Тэмдэгт дууссаныг тэмдэглэнэ: дараалал тоглож байвал дараагийн дуу
 * тэмдэгт хоорондын 3 нэгжийн завсрын дараа эхэлнэ (элементийн 1 нэгж
 * аль хэдийн орсон тул +2). Дараалал хоосон бол хоцрогдол нэмэхгүй.
 */
export function queueCharGap(wpm = 20) {
  const ctx = readyContext();
  if (!ctx || queueEnd <= ctx.currentTime) return;
  queueEnd += (2 * 1.2) / Math.max(1, wpm);
}

/**
 * Морзын бус дохио (тоглоомын цохилт, оноо г.м). Цэг зураасыг дарахгүйн тулд
 * чимээгүй, өөр тембртэй бөгөөд дарааллаар морзын дараа тоглогдоно.
 */
export function queueEffect(durationMs, frequency, { volume = 0.12, type = "triangle", gapMs = 40 } = {}) {
  const ctx = readyContext();
  if (!ctx) return;
  enqueue(ctx, durationMs / 1000, gapMs / 1000, (t) =>
    beep(ctx, t, durationMs, frequency, { volume, type })
  );
}

/**
 * Нэг тэмдэгтийг товшиход (Study хуудсанд) дуугаар сонсгоно.
 */
export function playChar(morseCode, wpm = 20, frequency = 600) {
  return playMorseSequence(morseCode, wpm, { frequency });
}
