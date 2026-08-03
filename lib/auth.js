import { auth } from "@clerk/nextjs/server";
import { connectDB } from "./db";
import User from "@/models/User";

/**
 * Одоогийн нэвтэрсэн хэрэглэгчийн Mongo document-ийг буцаана (эсвэл null).
 */
export async function getCurrentUser() {
  const { userId } = auth();
  if (!userId) return null;

  await connectDB();
  const user = await User.findOne({ clerkId: userId });
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
