export default function Footer() {
  return (
    <footer className="bg-brand-dark text-white">
      <div className="container-page py-10 grid gap-8 md:grid-cols-3 text-sm">
        <div>
          <h3 className="font-semibold mb-2">Бидний тухай</h3>
          <p className="text-white/80">
            Цэг Зураас нь телеграфын түлхүүр ашиглан Морзын кодоор бичих
            дадлага, сургалтын цахим орчин юм.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Холбоо барих</h3>
          <p className="text-white/80">info@tsegzuraas.mn</p>
          <p className="text-white/80">+976 0000-0000</p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Захидал илгээх</h3>
          <form className="flex flex-col gap-2">
            <input
              type="email"
              placeholder="Таны и-мэйл"
              className="px-3 py-1.5 rounded-md text-ink"
            />
            <textarea
              placeholder="Зурвас..."
              rows={2}
              className="px-3 py-1.5 rounded-md text-ink"
            />
            <button type="submit" className="bg-brand-darker px-3 py-1.5 rounded-md w-fit">
              Илгээх
            </button>
          </form>
        </div>
      </div>

      <div className="text-center text-xs text-white/60 pb-4">
        © {new Date().getFullYear()} tsegzuraas.mn — Бүх эрх хуулиар хамгаалагдсан.
      </div>
    </footer>
  );
}
