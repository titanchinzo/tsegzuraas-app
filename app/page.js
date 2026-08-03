function KeyIcon() {
  return (
    <span className="flex items-center gap-1">
      <span className="h-2.5 w-2.5 rounded-full bg-accent" />
      <span className="h-2.5 w-6 rounded-full bg-accent" />
    </span>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-3xl bg-brand-darker text-white px-6 py-16 md:py-24 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(200,150,62,0.5), transparent 40%), radial-gradient(circle at 80% 60%, rgba(143,179,160,0.4), transparent 45%)",
          }}
        />
        <div className="relative space-y-6">
          <div className="flex justify-center">
            <KeyIcon />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight max-w-3xl mx-auto">
            Цэг Зураас — Морзын кодын{" "}
            <span className="text-accent">цахим сургалтын систем</span>
          </h1>
          <p className="max-w-2xl mx-auto text-white/70 leading-relaxed">
            Телеграфын түлхүүр ашиглан морзын кодоор бичих, дадлага хийх
            боломжоор хангаж, сургалтын орчныг бүрдүүлэх зорилготой цахим
            платформ.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
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
      <h2 className="text-lg font-semibold text-brand-darker mt-4 mb-1.5 flex items-center gap-2">
        {title}
        <span className="text-accent opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 -translate-x-1 transition-all duration-200">
          →
        </span>
      </h2>
      <p className="text-sm text-ink/60 leading-relaxed">{desc}</p>
    </a>
  );
}
