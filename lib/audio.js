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
 * Морзын кодыг (жиш: ".- / -...") тухайн WPM хурдаар дуугаар тоглуулна.
 * Буцаах: нийт үргэлжлэх хугацаа (ms)
 */
export function playMorseSequence(morse, wpm = 20, onDone) {
  const ctx = getAudioContext();
  if (!ctx) return 0;
  if (ctx.state === "suspended") ctx.resume();

  const unit = 1.2 / Math.max(1, wpm); // секундээр (нэг dot)
  let t = ctx.currentTime + 0.1;
  let totalMs = 0;

  const chars = morse.split(""); // '.', '-', ' ', '/'
  for (const symbol of chars) {
    if (symbol === ".") {
      beep(ctx, t, unit * 1000);
      t += unit;
      totalMs += unit * 1000;
    } else if (symbol === "-") {
      beep(ctx, t, unit * 3 * 1000);
      t += unit * 3;
      totalMs += unit * 3 * 1000;
    } else if (symbol === " ") {
      t += unit; // тэмдэгт хоорондын нэмэлт завсар (char gap - dot gap already added)
      totalMs += unit * 1000;
    } else if (symbol === "/") {
      t += unit * 7;
      totalMs += unit * 7 * 1000;
    }
    t += unit * 0.1; // жижиг тайван зай clip давхцахаас сэргийлэх
  }

  if (onDone) {
    setTimeout(onDone, totalMs + 200);
  }

  return totalMs;
}

/**
 * Нэг тэмдэгтийг товшиход (Study хуудсанд) дуугаар сонсгоно.
 */
export function playChar(morseCode, wpm = 20) {
  return playMorseSequence(morseCode, wpm);
}
