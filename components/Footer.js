import ContactForm from "@/components/ContactForm";

export default function Footer() {
  return (
    <footer className="bg-brand-darker text-white mt-16">
      <div className="container-page py-12 grid gap-10 md:grid-cols-[1.6fr_1fr_1fr] text-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="h-2 w-2 rounded-full bg-accent animate-signal-pulse" />
            <span className="h-2 w-4 rounded-full bg-accent" />
            <span className="font-display font-bold text-white">tsegzuraas.mn</span>
          </div>
          <p className="text-white/60 leading-relaxed">
            Энэхүү “Цэг Зураас” цахим телеграфын программ хангамжийн систем нь
            хэрэглэгчдэд телеграфын түлхүүр ашиглан морзын кодоор бичих, дадлага
            хийх боломжоор хангаж, сургалтын орчныг бүрдүүлэх зорилготой.
            Системийг радио холбооны сонирхогчид, сургалтын байгууллагууд, код
            бичих ур чадвараа хөгжүүлэх хүсэлтэй хэрэглэгчид ашиглах боломжтой.
            Цаашлаад энэ систем нь телеграфын соёлыг түгээн дэлгэрүүлэх,
            сонирхогчдын хамтын ажиллагааг нэмэгдүүлэх, тэмцээн уралдаан зохион
            байгуулах суурь болж чадна.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-3 text-white/50">Холбоо барих</h3>
          <p>
            <a
              href="mailto:titaniumchinzo@gmail.com"
              className="text-white/60 transition-colors hover:text-white"
            >
              titaniumchinzo@gmail.com
            </a>
          </p>
          <p>
            <a
              href="tel:+97695621953"
              className="text-white/60 transition-colors hover:text-white"
            >
              +976 9562-1953
            </a>
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-3 text-white/50">Захидал илгээх</h3>
          <ContactForm />
        </div>
      </div>

      <div className="border-t border-white/10 text-center text-xs text-white/40 py-4">
        © {new Date().getFullYear()} tsegzuraas.mn — Бүх эрх хуулиар хамгаалагдсан.
      </div>
    </footer>
  );
}
