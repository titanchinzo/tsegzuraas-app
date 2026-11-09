// Нийслэл болон 21 аймаг — Admin чеклэж, нүүр хуудасны газрын зурагт
// асаана. Хил нь lib/mongoliaMap.js-д ижил key-ээр байна.
export const AIMAGS = [
  { key: "ulaanbaatar", name: "Улаанбаатар" },
  { key: "arkhangai", name: "Архангай" },
  { key: "bayan-ulgii", name: "Баян-Өлгий" },
  { key: "bayankhongor", name: "Баянхонгор" },
  { key: "bulgan", name: "Булган" },
  { key: "govi-altai", name: "Говь-Алтай" },
  { key: "govisumber", name: "Говьсүмбэр" },
  { key: "darkhan-uul", name: "Дархан-Уул" },
  { key: "dornogovi", name: "Дорноговь" },
  { key: "dornod", name: "Дорнод" },
  { key: "dundgovi", name: "Дундговь" },
  { key: "zavkhan", name: "Завхан" },
  { key: "orkhon", name: "Орхон" },
  { key: "uvurkhangai", name: "Өвөрхангай" },
  { key: "umnugovi", name: "Өмнөговь" },
  { key: "sukhbaatar", name: "Сүхбаатар" },
  { key: "selenge", name: "Сэлэнгэ" },
  { key: "tuv", name: "Төв" },
  { key: "uvs", name: "Увс" },
  { key: "khovd", name: "Ховд" },
  { key: "khuvsgul", name: "Хөвсгөл" },
  { key: "khentii", name: "Хэнтий" },
];

export const AIMAG_BY_KEY = Object.fromEntries(AIMAGS.map((a) => [a.key, a]));
