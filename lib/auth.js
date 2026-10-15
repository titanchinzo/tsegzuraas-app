import { auth } from "@clerk/nextjs/server";
import { connectDB } from "./db";
import User from "@/models/User";

// Анхны admin-г тэмдэглэх имэйлүүд (таслалаар тусгаарлана) — эх кодод
// биш, зөвхөн ADMIN_EMAILS орчны хувьсагчаар (.env / Vercel) тохируулна.
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email) {
  return ADMIN_EMAILS.includes((email || "").trim().toLowerCase());
}

/**
 * Одоогийн нэвтэрсэн хэрэглэгчийн Mongo document-ийг буцаана (эсвэл null).
 * Ban-тай хэрэглэгчийг нэвтрээгүйтэй адил үзнэ: Clerk ban хийхэд сессийг
 * цуцалдаг ч аль хэдийн олгосон token ~1 минут хүчинтэй хэвээр байдаг.
 */
export async function getCurrentUser() {
  const { userId } = auth();
  if (!userId) return null;

  await connectDB();
  const user = await User.findOne({ clerkId: userId });
  if (user?.banned) return null;
  return user;
}

/**
 * Тухайн role(с) -той эсэхийг шалгаж, биш бол 403 шидэх helper.
 * API route дотор ашиглана: `await requireRole(["admin", "teacher"])`.
 */
export async function requireRole(allowedRoles = []) {
  const user = await getCurrentUser();
  if (!user) {
    const err = new Error("Нэвтрээгүй байна");
    err.status = 401;
    throw err;
  }
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    const err = new Error("Энэ үйлдэлд эрх байхгүй байна");
    err.status = 403;
    throw err;
  }
  return user;
}
