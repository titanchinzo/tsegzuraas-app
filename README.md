# tsegzuraas.mn — Цэг Зураас

Морзын кодоор бичих/сонсох дадлага, шалгалт, сургалтын цахим систем.
Техникийн тодорхойлолтын дагуу (Next.js App Router + MongoDB/Mongoose + Clerk) хийгдсэн scaffold.

## Технологи

- **Frontend/Backend:** Next.js 14 (App Router, Route Handlers) + Tailwind CSS
- **Auth:** Clerk (`@clerk/nextjs`) + Webhook (Svix) ашиглан MongoDB-той sync
- **Database:** MongoDB + Mongoose
- **Audio:** Web Audio API (Морзын beep дуу үүсгэх, `lib/audio.js`)

## Хавтасны бүтэц

```
app/
  layout.js, globals.css        Үндсэн layout, Navbar/Footer
  page.js                       Home
  write/, listen/               Дадлага хуудсууд
  exam/write/, exam/listen/     8 үений шалгалт
  study/                        Морзын код хүснэгт
  products/                     Дэлгүүр (Admin CRUD дотроо)
  score/                        Leaderboard
  lessons/, teacher/            Хичээл үзэх / Багшийн самбар
  api/                          Route handlers (webhook, users, lessons,
                                 practice, exam, scores, products)
components/                     Navbar, Footer, WriteTrainer, ListenTrainer,
                                 MorseTable, ProductCard, Leaderboard, гэх мэт
lib/                            db.js (Mongo connect), morse.js (код mapping),
                                 audio.js (Web Audio), scoring.js, auth.js
models/                         User, Student, Lesson, ExamQuestion, Score, Product
middleware.js                   Clerk route protection
```

## Эхлүүлэх

1. Хамаарлууд суулгах:
   ```bash
   npm install
   ```

2. `.env.example`-ийг хуулж `.env.local` үүсгээд бөглөнө:
   - `MONGODB_URI` — MongoDB Atlas холболт
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` — [Clerk Dashboard](https://dashboard.clerk.com)
   - `CLERK_WEBHOOK_SECRET` — Clerk Dashboard > Webhooks > Endpoint (`/api/webhook/clerk`) үүсгэхэд гардаг

3. Clerk Dashboard дээр Webhook endpoint нэмэх: `https://<domain>/api/webhook/clerk`, events: `user.created`, `user.updated`, `user.deleted`.

4. Хөгжүүлэлтийн сервер асаах:
   ```bash
   npm run dev
   ```

## Анхаарах зүйлс / Дараагийн алхмууд

- **Nickname prompt:** Webhook нь анхны нэвтрэхэд түр зуурын nickname (Clerk username/email) автоматаар онооно. `PATCH /api/users/me`-г ашиглан хэрэглэгчээр өөрийн Nickname-ийг тохируулах modal нэмж болно (spec §3-B).
- **Role удирдлага:** Одоогоор бүх шинэ хэрэглэгч `student` эрхтэй бүртгэгдэнэ. Admin `PUT /api/users/role`-оор бусдын эрхийг өөрчилнө. Эхний Admin хэрэглэгчийг гараар (MongoDB дотроос) `role: "admin"` болгож тохируулах шаардлагатай.
- **Cloudinary:** Видео/зураг upload хийх тусгайлсан UI одоогоор байхгүй — `videoUrl`/`imageUrl` талбарт шууд линк оруулна. Дараа нь Cloudinary upload widget нэмж болно.
- **Морзын код mapping:** `lib/morse.js` доtorх Монгол кирилл үсгийн mapping нь ойролцоо жишээ (spec-ээс шууд авсан). Албан ёсны Монгол Морзын стандарттай тулгаж баталгаажуулах хэрэгтэй.
- **Аудио keyer:** `components/MorseKeyer.js` нь Q/W товчоор Цэг/Зураас угсарч, WPM хурднаас хамаарсан gap timer-аар тэмдэгт болгон хөрвүүлдэг. Бодит телеграф түлхүүр (physical hardware) холбох бол тусдаа input driver нэмэх шаардлагатай.
- **Build шалгах:** Энэ орчинд `npm install`/`next build` ажиллуулж шалгах бололцоогүй тул та `npm install && npm run build`-ийг локал дээрээ ажиллуулж баталгаажуулна уу.
