// Resend-ийн REST API-г шууд fetch-ээр дуудна (нэмэлт npm сан хэрэггүй).
// RESEND_API_KEY тохируулаагүй бол зөвхөн log хийж, захиалгыг блоклохгүй —
// имэйл нь "нэмэлт мэдэгдэл" тул амжилтгүй ч захиалга DB-д хадгалагдсан хэвээр.
export async function sendOrderEmail({
  productName,
  price,
  quantity,
  customerName,
  customerPhone,
  note,
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  if (!apiKey || to.length === 0) {
    console.warn(
      "[email] RESEND_API_KEY эсвэл ADMIN_EMAILS тохируулаагүй тул захиалгын имэйл илгээгдсэнгүй."
    );
    return;
  }

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

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "tsegzuraas.mn <onboarding@resend.dev>",
        to,
        subject: `Шинэ захиалга: ${productName} (${quantity}ш)`,
        html,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[email] Resend алдаа:", res.status, text);
    } else {
      console.log(`[email] Захиалгын мэдэгдэл ${to.join(", ")} рүү илгээгдлээ.`);
    }
  } catch (err) {
    console.error("[email] Захиалгын имэйл илгээхэд алдаа гарлаа:", err.message);
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
