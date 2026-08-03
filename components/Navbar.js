"use client";

import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import useCurrentUser from "@/lib/useCurrentUser";

const NAV_LINKS = [
  { href: "/", label: "Нүүр" },
  { href: "/write", label: "Write" },
  { href: "/listen", label: "Listen" },
  { href: "/study", label: "Study" },
  { href: "/products", label: "Products" },
  { href: "/score", label: "Score" },
];

export default function Navbar() {
  const { role } = useCurrentUser();

  const links = [
    ...NAV_LINKS,
    ...(role === "teacher" || role === "student"
      ? [
          { href: "/lessons", label: "Lessons" },
          { href: "/exam/write", label: "Write Exam" },
          { href: "/exam/listen", label: "Listen Exam" },
        ]
      : []),
    ...(role === "teacher" ? [{ href: "/teacher", label: "Teacher" }] : []),
    ...(role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <header className="bg-brand-darker text-white">
      <div className="container-page flex items-center justify-between py-4">
        <Link href="/" className="text-xl font-bold tracking-wide">
          tsegzuraas.mn
        </Link>

        <nav className="hidden md:flex gap-6 text-sm">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-surface">
              {link.label}
            </Link>
          ))}
        </nav>

        <div>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-brand-dark px-4 py-1.5 rounded-md text-sm hover:bg-brand-darker border border-white/20">
                Login
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
