import mongoose from "mongoose";
import { clerkClient } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import User from "@/models/User";
import Score from "@/models/Score";
import Student from "@/models/Student";
import TeacherAttempt from "@/models/TeacherAttempt";

// Admin өөрийгөө ban/устгаж болохгүй — өөрийгөө түгжиж орхихоос сэргийлнэ.
async function findTarget(id, admin) {
  await connectDB();
  const target = mongoose.isValidObjectId(id) ? await User.findById(id) : null;
  if (!target) return { error: "Хэрэглэгч олдсонгүй", status: 404 };
  if (target._id.equals(admin._id)) {
    return { error: "Өөрийгөө ban хийх, устгах боломжгүй", status: 400 };
  }
  return { target };
}

// Clerk дээр аль хэдийн устсан (404) хэрэглэгч DB-д үлдсэн байж болох тул тэр
// алдааг алгасна.
async function ignoreMissing(promise) {
  try {
    await promise;
  } catch (err) {
    if (err?.status !== 404) throw err;
  }
}

// PUT /api/users/:id - Ban хийх / цуцлах (Admin). Clerk-ийн ban нь хэрэглэгчийн
// бүх сессийг цуцалж, дахин нэвтрэхийг хориглоно.
export async function PUT(req, { params }) {
  let admin;
  try {
    admin = await requireRole(["admin"]);
  } catch (err) {
    return Response.json({ error: err.message }, { status: err.status || 500 });
  }

  const { banned } = await req.json();
  if (typeof banned !== "boolean") {
    return Response.json({ error: "banned утга буруу байна" }, { status: 400 });
  }

  const { target, error, status } = await findTarget(params.id, admin);
  if (error) return Response.json({ error }, { status });
  // Admin-ууд бие биенээ ban хийхээс сэргийлнэ — эхлээд эрхийг нь бууруулна.
  if (banned && target.role === "admin") {
    return Response.json(
      { error: "Admin эрхтэй хэрэглэгчийг ban хийхийн өмнө эрхийг нь бууруулна уу" },
      { status: 400 }
    );
  }

  try {
    const client = await clerkClient();
    await ignoreMissing(
      banned ? client.users.banUser(target.clerkId) : client.users.unbanUser(target.clerkId)
    );
  } catch (err) {
    console.error("[users] Clerk ban алдаа:", err);
    return Response.json({ error: "Clerk дээр ban-ы төлөвийг өөрчилж чадсангүй" }, { status: 502 });
  }

  target.banned = banned;
  await target.save();

  return Response.json({ user: target });
}

// DELETE /api/users/:id - Хэрэглэгчийг Clerk болон DB-ээс бүр мөсөн устгах
// (Admin). Оноо, шалгалтын оролдлого, багш-сурагчийн холбоо нь хамт устана;
// багшийн оруулсан хичээл, асуултууд үлдэнэ.
export async function DELETE(req, { params }) {
  let admin;
  try {
    admin = await requireRole(["admin"]);
  } catch (err) {
    return Response.json({ error: err.message }, { status: err.status || 500 });
  }

  const { target, error, status } = await findTarget(params.id, admin);
  if (error) return Response.json({ error }, { status });
  if (target.role === "admin") {
    return Response.json(
      { error: "Admin эрхтэй хэрэглэгчийг устгахын өмнө эрхийг нь бууруулна уу" },
      { status: 400 }
    );
  }

  try {
    const client = await clerkClient();
    await ignoreMissing(client.users.deleteUser(target.clerkId));
  } catch (err) {
    console.error("[users] Clerk устгах алдаа:", err);
    return Response.json({ error: "Clerk дээрээс хэрэглэгчийг устгаж чадсангүй" }, { status: 502 });
  }

  await Promise.all([
    Score.deleteMany({ userId: target._id }),
    TeacherAttempt.deleteMany({ studentId: target._id }),
    Student.deleteMany({ $or: [{ teacherId: target._id }, { studentId: target._id }] }),
  ]);
  await target.deleteOne();

  return Response.json({ success: true });
}
