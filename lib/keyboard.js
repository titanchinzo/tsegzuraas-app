// Хуудас даяарх товчлолуудын (q/w = цэг/зураас, Enter, Backspace г.м) нийтлэг
// шалгалт.

const NON_TEXT_INPUTS = new Set([
  "button",
  "checkbox",
  "color",
  "file",
  "image",
  "radio",
  "range",
  "reset",
  "submit",
]);

/**
 * Хэрэглэгч текст бичих талбарт (нэвтрэх цонхны имэйл, footer-ийн зурвас г.м)
 * байгаа эсэх. Тийм үед товчлол ажиллах ёсгүй — эс бөгөөс preventDefault нь
 * ".", "q", "w" зэрэг тэмдэгтийг тэр талбарт бичигдүүлэхгүй болгодог байв.
 * Range slider текст биш тул тэр дээр товчлол ажилласаар байна.
 */
export function isTextField(el) {
  if (!el || typeof el.tagName !== "string") return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  return tag === "INPUT" && !NON_TEXT_INPUTS.has(el.type);
}

/**
 * Keydown event-ээс цэг (".") эсвэл зураас ("-") буцаана, хамааралгүй бол null.
 * e.code нь гарын байрлалаас (монгол/англи) үл хамаарна — монгол байрлалтай
 * үед q/w товч "ф"/"ц" гэж ирдэг тул зөвхөн e.key-д найдвал товчлол ажиллахгүй.
 */
export function morseSymbolFromKey(e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return null;
  if (isTextField(e.target)) return null;
  const c = e.code;
  if (c === "KeyQ" || c === "Period" || c === "NumpadDecimal" || e.key === ".") return ".";
  if (c === "KeyW" || c === "Minus" || c === "NumpadSubtract" || e.key === "-") return "-";
  return null;
}
