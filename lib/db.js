import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn("[db] MONGODB_URI тохируулаагүй байна. .env.local файлд оруулна уу.");
}

// Next.js dev-д hot-reload хийхэд олон mongoose connection нээгдэхээс сэргийлж
// global кэш ашиглана.
let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
      })
      .then((mongoose) => mongoose);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // Холболт амжилтгүй болбол кэшлэгдсэн promise-ыг цэвэрлэнэ. Үгүй бол
    // дараагийн дуудалт бүр мөн энэ л rejected promise-ыг await хийж,
    // сүлжээ/whitelist засагдсан ч lambda дахин эхлэх хүртэл алдаа өгсөөр
    // байдаг (serverless дээр warm instance удаан амьдардаг тул ноцтой).
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
