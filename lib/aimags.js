// Нийслэл болон 21 аймгийн төвийн байршил — нүүр хуудасны газрын зурагт
// түлхүүр ашиглаж буй газрыг тэмдэглэхэд. Admin газар нэмэхдээ эндээс сонгоно.
export const AIMAGS = [
  { key: "ulaanbaatar", name: "Улаанбаатар", lat: 47.918, lng: 106.917 },
  { key: "arkhangai", name: "Архангай", lat: 47.475, lng: 101.454 },
  { key: "bayan-ulgii", name: "Баян-Өлгий", lat: 48.968, lng: 89.962 },
  { key: "bayankhongor", name: "Баянхонгор", lat: 46.194, lng: 100.718 },
  { key: "bulgan", name: "Булган", lat: 48.812, lng: 103.534 },
  { key: "govi-altai", name: "Говь-Алтай", lat: 46.372, lng: 96.258 },
  { key: "govisumber", name: "Говьсүмбэр", lat: 46.361, lng: 108.361 },
  { key: "darkhan-uul", name: "Дархан-Уул", lat: 49.487, lng: 105.951 },
  { key: "dornogovi", name: "Дорноговь", lat: 44.892, lng: 110.14 },
  { key: "dornod", name: "Дорнод", lat: 48.072, lng: 114.528 },
  { key: "dundgovi", name: "Дундговь", lat: 45.763, lng: 106.271 },
  { key: "zavkhan", name: "Завхан", lat: 47.741, lng: 96.845 },
  { key: "orkhon", name: "Орхон", lat: 49.028, lng: 104.044 },
  { key: "uvurkhangai", name: "Өвөрхангай", lat: 46.265, lng: 102.775 },
  { key: "umnugovi", name: "Өмнөговь", lat: 43.571, lng: 104.425 },
  { key: "sukhbaatar", name: "Сүхбаатар", lat: 46.681, lng: 113.281 },
  { key: "selenge", name: "Сэлэнгэ", lat: 50.232, lng: 106.208 },
  { key: "tuv", name: "Төв", lat: 47.707, lng: 106.953 },
  { key: "uvs", name: "Увс", lat: 49.981, lng: 92.067 },
  { key: "khovd", name: "Ховд", lat: 48.006, lng: 91.641 },
  { key: "khuvsgul", name: "Хөвсгөл", lat: 49.638, lng: 100.163 },
  { key: "khentii", name: "Хэнтий", lat: 47.319, lng: 110.656 },
];

export const AIMAG_BY_KEY = Object.fromEntries(AIMAGS.map((a) => [a.key, a]));
