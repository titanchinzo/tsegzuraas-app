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

function beep(ctx, startTime, durationMs, frequency = 600) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = frequency;

  // Клик чимээ багасгах богино fade in/out
  const fade = 0.005;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.4, startTime + fade);
  gain.gain.linearRampToValueAtTime(0.4, startTime + durationMs / 1000 - fade);
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

/**
 * Нэг тэмдэгтийг товшиход (Study хуудсанд) дуугаар сонсгоно.
 */
export function playChar(morseCode, wpm = 20, frequency = 600) {
  return playMorseSequence(morseCode, wpm, { frequency });
}
