import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Зөвхөн /admin хуудсыг дундын middleware-ээр хамгаална (нэвтрээгүй бол
// sign-in руу шилжинэ). API route-уудыг ЭНД оруулбал auth().protect() нь
// fetch хүсэлтэд бэйр 404 буцааж, route handler доторх зохих 401/403 JSON
// хариу (lib/auth.js-ийн requireRole/getCurrentUser) хэзээ ч ажиллахгүй
// болдог тул тэдгээрийн эрхийн шалгалтыг зөвхөн route handler дотор хийнэ
// (spec §9 Security).
const isProtectedPage = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedPage(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
