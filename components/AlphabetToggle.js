"use client";

const OPTIONS = [
  { key: "english", label: "English (A-Z)" },
  { key: "mongol", label: "Монгол (Кирилл)" },
];

// Write, Listen, Score хуудсуудын English/Монгол горим сонгогч.
export default function AlphabetToggle({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Тэмдэгтийн горим">
      {OPTIONS.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          aria-pressed={value === o.key}
          className={value === o.key ? "segmented-btn-active" : "segmented-btn-inactive"}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// Сонсох дадлага/шалгалтад монгол горимд юугаар бичихийг сануулна.
export function MongolTypingHint({ alphabet }) {
  if (alphabet !== "mongol") return null;
  return (
    <p className="text-xs text-ink/50">
      Сонссон үсгээ кириллээр (монгол гарын байрлалаар) бичнэ үү.
    </p>
  );
}
