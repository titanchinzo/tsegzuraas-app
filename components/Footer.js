export default function Footer() {
  return (
    <footer className="bg-brand-darker text-white mt-16">
      <div className="container-page py-12 grid gap-10 md:grid-cols-3 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="h-2 w-2 rounded-full bg-accent animate-signal-pulse" />
            <span className="h-2 w-4 rounded-full bg-accent" />
            <span className="font-display font-bold text-white">tsegzuraas.mn</span>
          </div>
          <p className="text-white/60 leading-relaxed">
            Цэг Зураас нь телеграфын түлхүүр ашиглан Морзын кодоор бичих
            дадлага, сургалтын цахим орчин юм.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-3 text-white/50">Холбоо барих</h3>
          <p className="text-white/60">info@tsegzuraas.mn</p>
          <p className="text-white/60">+976 0000-0000</p>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-3 text-white/50">Захидал илгээх</h3>
          <form className="flex flex-col gap-2.5">
            <input
              type="email"
              placeholder="Таны и-мэйл"
              className="px-3.5 py-2 rounded-md text-slate-900 bg-white/95 border border-white/10 placeholder:text-slate-400 focus:bg-white focus-visible:outline-white/60 transition-colors text-sm"
            />
            <textarea
              placeholder="Зурвас..."
              rows={2}
              className="px-3.5 py-2 rounded-md text-slate-900 bg-white/95 border border-white/10 placeholder:text-slate-400 focus:bg-white focus-visible:outline-white/60 transition-colors text-sm resize-none"
            />
            <button type="submit" className="btn-accent w-fit !px-4 !py-2">
              Илгээх
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10 text-center text-xs text-white/40 py-4">
        © {new Date().getFullYear()} tsegzuraas.mn — Бүх эрх хуулиар хамгаалагдсан.
      </div>
    </footer>
  );
}
