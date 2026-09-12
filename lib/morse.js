// Морзын кодны үндсэн mapping (Study, Write, Listen хуудсуудад ашиглагдана)

export const MORSE_MAP = {
  // English
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".",
  F: "..-.", G: "--.", H: "....", I: "..", J: ".---",
  K: "-.-", L: ".-..", M: "--", N: "-.", O: "---",
  P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-",
  U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",

  // Numbers
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
  "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",

  // Punctuation
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "!": "-.-.--",

  // Mongol Cyrillic (spec-д заасан ойролцоо утгууд)
  А: ".-", Б: "-...", В: ".--", Г: "--.", Д: "-..",
  Е: ".", Ж: "...-", З: "--..", И: "..", Й: ".---",
  К: "-.-", Л: ".-..", М: "--", Н: "-.", О: "---",
  П: ".--.", Р: ".-.", С: "...", Т: "-", У: "..-",
  Ү: "..--", Ф: "..-.", Х: "....", Ц: "-.-.", Ч: "---.",
  Ш: "----", Щ: "--.-", Ъ: "-.--.", Ы: "-.--", Ь: "-..-",
  Э: "..-..", Ю: "..--", Я: ".-.-",
};

export const REVERSE_MORSE_MAP = Object.entries(MORSE_MAP).reduce(
  (acc, [char, code]) => {
    // Давхцсан кодтой тэмдэгт тохиолдвол эхнийхийг нь хадгална (E override асуудлаас сэргийлнэ)
    if (!(code in acc)) acc[code] = char;
    return acc;
  },
  {}
);

export const CATEGORIES = {
  english: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  mongol: "АБВГДЕЖЗИЙКЛМНОПРСТУҮФХЦЧШЩЪЫЬЭЮЯ".split(""),
  numbers: "0123456789".split(""),
  symbols: [".", ",", "?", "!"],
};

// Морзын нэгжийн тохиргоо: Цэг = 1 нэгж, Зураас = 3 нэгж, доторх завсар = 1 нэгж
export const MORSE_UNIT = {
  DOT: 1,
  DASH: 3,
  INTRA_CHAR_GAP: 1,
  INTER_CHAR_GAP: 3,
  WORD_GAP: 7,
};

// WPM (Words Per Minute) -ээс millisecond нэгжийн урт руу хөрвүүлэх
// Стандарт: "PARIS" гэсэн үг 50 нэгж морзын кодтой тэнцүү гэж тооцно
export function unitDurationMs(wpm) {
  const safeWpm = Math.max(1, wpm || 20);
  return 1200 / safeWpm; // 1 dot-ийн үргэлжлэх хугацаа (ms)
}

export function randomChars(count, pool = CATEGORIES.english.concat(CATEGORIES.numbers)) {
  let result = "";
  for (let i = 0; i < count; i++) {
    result += pool[Math.floor(Math.random() * pool.length)];
  }
  return result;
}

// Дурын текстийн зайг арилгаж, groupSize-аар бүлэглэсэн массив болгоно
// ("K3XQP N8ZRT" -> ["K3XQP", "N8ZRT"]). Багшийн шалгалтад бүлэг тус бүрийг
// дараалан тоглуулж, бичүүлэхэд ашиглана.
export function groupChars(text, groupSize = 5) {
  const clean = (text || "").replace(/\s+/g, "");
  const groups = [];
  for (let i = 0; i < clean.length; i += groupSize) {
    groups.push(clean.slice(i, i + groupSize));
  }
  return groups;
}

// Радио дуудлагын (жиш нь Morse Runner) хэвшлээр groupSize-аар бүлэглэж,
// зайгаар тусгаарлана ("K3XQP N8ZRT" гэх мэт). textToMorse нь зайг "/"
// (7 нэгжийн чимээгүй завсар) болгодог тул бүлэг хоорондоо стандарт
// радио завсартайгаар тоглогдоно.
export function formatInGroups(text, groupSize = 5) {
  return groupChars(text, groupSize).join(" ");
}

// Тэмдэгтүүдийг ЗАЙГААР тусгаарлана ("/" нь үг хоорондын завсрыг илэрхийлдэг
// тул үсэг бүрийн хооронд тавибал стандарт 3 нэгжийн оронд 7+ нэгжийн
// чимээгүй үе үүсгэдэг байв).
export function textToMorse(text) {
  return text
    .toUpperCase()
    .split("")
    .map((ch) => (ch === " " ? "/" : MORSE_MAP[ch] || ""))
    .filter(Boolean)
    .join(" ");
}
