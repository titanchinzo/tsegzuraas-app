// Study хэсгийн хичээлийн каталог.
//
// Дараалал нь Koch аргын зарчмаар: хамгийн богино/түгээмэл тэмдэгтээс эхэлж,
// шинэ хос бүрийг танилцуулаад дараа нь дадлага, бүлэг бүрийн эцэст давтлага.
//
// Зөвхөн латин үсэг, тоо, цэг таслал ашиглав. Монгол кирилл нь давхардсан
// кодтой (Ү ба Ю хоёр "..--") тул хариу шалгахад эргэлзээ үүсгэнэ.

const GROUPS = [
  {
    id: "basic",
    title: "Үндсэн тэмдэгт",
    hint: "Хамгийн богино кодтой үсгүүд.",
    pairs: [
      ["E", "T"],
      ["I", "M"],
      ["A", "N"],
    ],
  },
  {
    id: "common",
    title: "Түгээмэл үсгүүд",
    hint: "Богино үгэнд байнга тохиолддог үсгүүд.",
    pairs: [
      ["S", "O"],
      ["R", "K"],
      ["D", "U"],
    ],
  },
  {
    id: "more",
    title: "Дараагийн бүлэг",
    hint: "Гурав, дөрвөн тэмдэгтийн кодууд.",
    pairs: [
      ["G", "W"],
      ["B", "L"],
      ["F", "H"],
    ],
  },
  {
    id: "rest",
    title: "Үлдсэн үсгүүд",
    hint: "Цагаан толгойг бүрэн дуусгана.",
    pairs: [
      ["C", "P"],
      ["V", "J"],
      ["X", "Y"],
      ["Q", "Z"],
    ],
  },
  {
    id: "digits",
    title: "Тоонууд",
    hint: "Бүх тоо таван тэмдэгтээс тогтоно.",
    pairs: [
      ["1", "2"],
      ["3", "4"],
      ["5", "6"],
      ["7", "8"],
      ["9", "0"],
    ],
  },
  {
    id: "punct",
    title: "Цэг таслал",
    hint: "Зургаан тэмдэгтийн урт кодууд.",
    pairs: [
      [".", ","],
      ["?", "!"],
    ],
  },
];

// Үгийн хичээлүүд: тэмдэгт биш, бүтэн үг кодлоно. Богиноос урт руу.
const WORD_GROUPS = [
  {
    id: "words1",
    title: "Богино үг",
    hint: "2-3 үсэгтэй үгс — тэмдэгт хооронд шилжих дадлага.",
    sets: [
      { title: "Хамгийн богино", words: ["AT", "IT", "AN", "ME", "NO"] },
      { title: "Гурван үсэг", words: ["THE", "AND", "SEA", "RUN", "TOP"] },
      { title: "Дадлага", words: ["ONE", "TWO", "SIX", "TEN", "MAN"] },
    ],
  },
  {
    id: "words2",
    title: "Урт үг",
    hint: "Дөрөв, таван үсэгтэй үгс.",
    sets: [
      { title: "Дөрвөн үсэг", words: ["CODE", "WORD", "TIME", "HELP", "FIVE"] },
      { title: "Таван үсэг", words: ["MORSE", "RADIO", "SOUND", "LIGHT", "SPEED"] },
      { title: "Холимог", words: ["SIGNAL", "ANSWER", "LETTER", "NUMBER"] },
    ],
  },
  {
    id: "callsigns",
    title: "Дуудлагын дохио",
    hint: "Үсэг тоо хосолсон бодит радио дохио.",
    sets: [
      { title: "Тусламжийн дохио", words: ["SOS", "CQ", "QRZ", "QTH"] },
      { title: "Дуудлагын тэмдэг", words: ["JT1A", "JT5B", "K7QQ", "W1AW"] },
    ],
  },
];

// Бүлэг бүрийг: хос тус бүрд [танилцах, дадлага] хоёр хичээл, эцэст нь бүлгийн
// давтлага үүсгэнэ.
function buildLessons() {
  const sections = [];
  let num = 0;
  const learnedSoFar = [];

  for (const group of GROUPS) {
    const lessons = [];
    const groupChars = [];

    for (const pair of group.pairs) {
      groupChars.push(...pair);
      learnedSoFar.push(...pair);

      lessons.push({
        num: ++num,
        id: `${group.id}-${pair.join("")}-intro`,
        title: `${pair.join(" & ")} шинэ`,
        chars: pair,
        length: 6,
        kind: "intro",
      });
      lessons.push({
        num: ++num,
        id: `${group.id}-${pair.join("")}-drill`,
        title: `${pair.join(" & ")} дадлага`,
        chars: pair,
        length: 10,
        kind: "drill",
      });
    }

    lessons.push({
      num: ++num,
      id: `${group.id}-review`,
      title: "Бүлгийн давтлага",
      chars: [...groupChars],
      length: 12,
      kind: "review",
    });

    // Гурав дахь бүлгээс эхлээд өмнөх бүх зүйлээ хольж шалгана.
    if (sections.length >= 2) {
      lessons.push({
        num: ++num,
        id: `${group.id}-mixed`,
        title: "Холимог тест",
        chars: [...learnedSoFar],
        length: 15,
        kind: "test",
      });
    }

    sections.push({ id: group.id, title: group.title, hint: group.hint, lessons });
  }

  // Тэмдэгт дуусмагц үг рүү шилжинэ.
  for (const group of WORD_GROUPS) {
    // ID нь URL-ийн сегмент болдог тул зөвхөн ASCII — кирилл гарчгаас ID
    // үүсгэвэл percent-encode болж, param-тай таарахаа больдог.
    const lessons = group.sets.map((set, i) => ({
      num: ++num,
      id: `${group.id}-${i + 1}`,
      title: set.title,
      // Үгийн хичээлд chars нь бүтэн үгсийн жагсаалт (нэг тэмдэгт биш).
      chars: set.words,
      words: true,
      length: set.words.length,
      kind: "word",
    }));

    sections.push({ id: group.id, title: group.title, hint: group.hint, lessons });
  }

  return sections;
}

export const SECTIONS = buildLessons();

export const LESSONS = SECTIONS.flatMap((s) => s.lessons);

export const TOTAL_LESSONS = LESSONS.length;
export const MAX_STARS = TOTAL_LESSONS * 3;

export function getLesson(id) {
  return LESSONS.find((l) => l.id === id) || null;
}

export function getNextLesson(id) {
  const i = LESSONS.findIndex((l) => l.id === id);
  return i >= 0 && i + 1 < LESSONS.length ? LESSONS[i + 1] : null;
}

// Нарийвчлалаас од тооцно. 3 од = бараг алдаагүй.
export function starsFor(accuracy) {
  if (accuracy >= 95) return 3;
  if (accuracy >= 80) return 2;
  if (accuracy >= 60) return 1;
  return 0;
}
