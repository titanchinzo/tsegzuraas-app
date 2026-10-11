import { SignIn } from "@clerk/nextjs";

// Clerk-ийн signInUrl ("/sign-in") энэ хуудас руу заадаг. Хамгаалагдсан
// хуудас (/admin) руу нэвтрээгүй орох, эсвэл бүртгэлээс нэвтрэх рүү шилжихэд
// энд ирнэ — өмнө нь хуудас байгаагүй тул 404 гардаг байв.
export default function SignInPage() {
  return (
    <div className="flex justify-center">
      <SignIn path="/sign-in" signUpUrl="/sign-up" />
    </div>
  );
}
