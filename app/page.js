export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="card p-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-brand-darker mb-4">
          Цэг Зураас — Морзын кодын цахим сургалтын систем
        </h1>
        <p className="max-w-3xl mx-auto text-ink/80 leading-relaxed">
          Энэхүү &quot;Цэг Зураас&quot; цахим телеграфын программ хангамжийн систем нь
          хэрэглэгчдэд телеграфын түлхүүр ашиглан морзын кодоор бичих, дадлага
          хийх боломжоор хангаж, сургалтын орчныг бүрдүүлэх зорилготой болно.
        </p>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <FeatureCard
          title="Write"
          desc="Хамгаа/тоог түлхүүрээр эсвэл гараас (Q/W) бичих дадлага."
          href="/write"
        />
        <FeatureCard
          title="Listen"
          desc="Морзын дуу сонсож таних дадлага."
          href="/listen"
        />
        <FeatureCard
          title="Study"
          desc="Морзын кодны бүрэн хүснэгт — англи, монгол, тоо, тэмдэгт."
          href="/study"
        />
      </section>
    </div>
  );
}

function FeatureCard({ title, desc, href }) {
  return (
    <a href={href} className="card p-6 hover:shadow-md transition-shadow block">
      <h2 className="text-lg font-semibold text-brand-darker mb-2">{title}</h2>
      <p className="text-sm text-ink/70">{desc}</p>
    </a>
  );
}
