// Resend-ийн REST API-г шууд fetch-ээр дуудна (нэмэлт npm сан хэрэггүй).
//
// Илгээгч: EMAIL_FROM тохируулаагүй бол Resend-ийн туршилтын хаяг
// (onboarding@resend.dev) ашиглагдана — тэр нь зөвхөн Resend бүртгэлийн
// эзний имэйл рүү л хүргэдэг. Домэйноо Resend-д баталгаажуулсны дараа
// EMAIL_FROM="Цэг Зураас <noreply@tsegzuraas.mn>" гэж тохируулна.
const FROM = process.env.EMAIL_FROM || "tsegzuraas.mn <onboarding@resend.dev>";

function adminRecipients() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

// Амжилттай илгээсэн эсэхийг буцаана; хэзээ ч throw хийхгүй.
async function sendToAdmins({ subject, html, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = adminRecipients();

  if (!apiKey || to.length === 0) {
    console.warn("[email] RESEND_API_KEY эсвэл ADMIN_EMAILS тохируулаагүй тул имэйл илгээгдсэнгүй.");
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to,
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[email] Resend алдаа:", res.status, text);
      return false;
    }
    console.log(`[email] "${subject}" ${to.join(", ")} рүү илгээгдлээ.`);
    return true;
  } catch (err) {
    console.error("[email] Имэйл илгээхэд алдаа гарлаа:", err.message);
    return false;
  }
}

// Захиалгын мэдэгдэл нь "нэмэлт" — амжилтгүй ч захиалга DB-д хадгалагдсан
// хэвээр тул захиалгыг блоклохгүй.
export async function sendOrderEmail({
  productName,
  price,
  quantity,
  customerName,
  customerPhone,
  note,
}) {
  const total = price * quantity;
  const html = `
    <div style="font-family: sans-serif; max-width: 480px;">
      <h2 style="color:#132a4a;">🛍️ Шинэ захиалга — tsegzuraas.mn</h2>
      <table style="width:100%; border-collapse: collapse;">
        <tr><td style="padding:4px 0; color:#666;">Бүтээгдэхүүн</td><td style="padding:4px 0; font-weight:bold;">${escapeHtml(productName)}</td></tr>
        <tr><td style="padding:4px 0; color:#666;">Тоо ширхэг</td><td style="padding:4px 0;">${quantity}</td></tr>
        <tr><td style="padding:4px 0; color:#666;">Нэгжийн үнэ</td><td style="padding:4px 0;">${price.toLocaleString()}₮</td></tr>
        <tr><td style="padding:4px 0; color:#666;">Нийт дүн</td><td style="padding:4px 0; font-weight:bold; color:#0d9488;">${total.toLocaleString()}₮</td></tr>
      </table>
      <hr style="border:none; border-top:1px solid #eee; margin:16px 0;" />
      <table style="width:100%; border-collapse: collapse;">
        <tr><td style="padding:4px 0; color:#666;">Захиалагч</td><td style="padding:4px 0;">${escapeHtml(customerName)}</td></tr>
        <tr><td style="padding:4px 0; color:#666;">Утас</td><td style="padding:4px 0;">${escapeHtml(customerPhone)}</td></tr>
        ${note ? `<tr><td style="padding:4px 0; color:#666;">Тэмдэглэл</td><td style="padding:4px 0;">${escapeHtml(note)}</td></tr>` : ""}
      </table>
    </div>
  `;

  await sendToAdmins({
    subject: `Шинэ захиалга: ${productName} (${quantity}ш)`,
    html,
  });
}

// Footer-ийн "Захидал илгээх" формын зурвас. DB-д хадгалагддаггүй тул
// амжилтгүй бол хэрэглэгчид мэдэгдэхийн тулд үр дүнг буцаана.
export async function sendContactEmail({ email, message }) {
  const html = `
    <div style="font-family: sans-serif; max-width: 480px;">
      <h2 style="color:#132a4a;">✉️ Шинэ зурвас — tsegzuraas.mn</h2>
      <p style="color:#666; margin:0 0 8px;">Илгээгч: <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
      <p style="white-space:pre-wrap; margin:0;">${escapeHtml(message)}</p>
    </div>
  `;

  return sendToAdmins({
    subject: `Сайтаас ирсэн зурвас: ${email}`,
    html,
    replyTo: email,
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
