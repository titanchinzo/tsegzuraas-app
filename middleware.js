import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Зөвхөн нэвтэрсэн хэрэглэгчид зориулсан route-уудыг тодорхойлно.
// Дэлгэрэнгүй эрхийн шалгалтыг (role-based) тухайн route handler дотор
// lib/auth.js -ийн requireRole() ашиглан хийнэ (spec §9 Security).
const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/api/lessons(.*)",
  "/api/practice(.*)",
  "/api/exam(.*)",
  "/api/users/me",
  "/api/users/role",
  "/api/users/students(.*)",
  "/api/users",
  "/api/upload",
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
