function KeyIcon() {
  return (
    <span className="flex items-center gap-1">
      <span className="h-2.5 w-2.5 rounded-full bg-accent animate-signal-pulse" />
      <span className="h-2.5 w-6 rounded-full bg-accent" />
    </span>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-brand-darker text-white px-6 py-24 md:py-36 text-center">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="absolute -top-20 -left-10 h-72 w-72 rounded-full bg-accent/30 blur-3xl animate-drift" />
          <span className="absolute -bottom-24 -right-10 h-80 w-80 rounded-full bg-brand-300/25 blur-3xl animate-drift-slow" />
          <span className="absolute top-1/3 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-accent-light/10 blur-3xl animate-drift-slow" />
        </div>
        <div className="relative mx-auto max-w-4xl space-y-7">
          <div className="flex justify-center">
            <KeyIcon />
          </div>
          <p className="eyebrow">Морзын кодын цахим сургалт</p>
          <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight">
            Цэг Зураас
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-white/70 leading-relaxed">
            Телеграфын түлхүүр ашиглан{" "}
            <span className="text-accent font-semibold">морзын кодоор бичих</span>,
            дадлага хийх боломжоор хангаж, сургалтын орчныг бүрдүүлэх зорилготой
            цахим систем. Радио холбооны сонирхогчид, сургалтын байгууллагууд,
            ур чадвараа хөгжүүлэх хүсэлтэй хэн бүхэнд зориулав.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <a href="/write" className="btn-accent">
              Дадлага эхлүүлэх →
            </a>
            <a href="/study" className="btn-secondary !bg-white/10 !text-white !border-white/20 hover:!bg-white/20">
              Морзын код үзэх
            </a>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="page-title">Юунаас эхлэх вэ?</h2>
          <p className="page-subtitle">Дадлага, сургалт, лавлах — бүгд нэг дор.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon="⌨️"
            title="Write"
            desc="Хамгаа/тоог түлхүүрээр эсвэл гараас (Q/W) бичих дадлага."
            href="/write"
          />
          <FeatureCard
            icon="🎧"
            title="Listen"
            desc="Морзын дуу сонсож таних дадлага."
            href="/listen"
          />
          <FeatureCard
            icon="📖"
            title="Study"
            desc="Морзын кодны бүрэн хүснэгт — англи, монгол, тоо, тэмдэгт."
            href="/study"
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc, href }) {
  return (
    <a href={href} className="card card-hover p-7 block group">
      <span className="text-3xl">{icon}</span>
      <h2 className="font-display text-lg font-bold text-brand-darker mt-4 mb-1.5 flex items-center gap-2">
        {title}
        <span className="text-accent opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 -translate-x-1 transition-all duration-200">
          →
        </span>
      </h2>
      <p className="text-sm text-ink/60 leading-relaxed">{desc}</p>
    </a>
  );
}
