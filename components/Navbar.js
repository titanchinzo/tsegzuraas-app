"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import useCurrentUser from "@/lib/useCurrentUser";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <span className="h-9 w-9 shrink-0" />;

  const isDark = resolvedTheme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Цайвар горим руу шилжих" : "Бараан горим руу шилжих"}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors shrink-0"
    >
      {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}

const NAV_LINKS = [
  { href: "/", label: "Нүүр" },
  { href: "/write", label: "Write" },
  { href: "/listen", label: "Listen" },
  { href: "/study", label: "Study" },
  { href: "/products", label: "Products" },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0">
      <span className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-accent animate-signal-pulse" />
        <span className="h-2 w-4 rounded-full bg-accent" />
      </span>
      <span className="font-display text-lg font-bold tracking-wide text-white">
        tsegzuraas<span className="text-accent">.mn</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const { role } = useCurrentUser();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    ...NAV_LINKS,
    ...(role === "teacher" || role === "student" || role === "admin"
      ? [
          { href: "/lessons", label: "Lessons" },
          { href: "/exam/score", label: "Score" },
        ]
      : []),
    ...(role === "teacher" || role === "admin" ? [{ href: "/teacher", label: "Teacher" }] : []),
    ...(role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-brand-darker/95 backdrop-blur text-white shadow-soft">
      <div className="container-page flex items-center justify-between py-3.5">
        <Logo />

        <nav className="hidden lg:flex items-center gap-1 text-xs uppercase tracking-wide">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-full font-semibold transition-colors duration-150 ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <ThemeToggle />
          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn-accent !px-3 sm:!px-4 !py-1.5 !text-xs sm:!text-sm !tracking-normal">Login</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Цэс нээх"
            className="lg:hidden flex flex-col justify-center gap-1.5 h-9 w-9 shrink-0 rounded-lg hover:bg-white/10 transition-colors"
          >
            <span
              className={`block h-0.5 w-5 mx-auto bg-white transition-transform duration-200 ${
                open ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-5 mx-auto bg-white transition-opacity duration-200 ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-5 mx-auto bg-white transition-transform duration-200 ${
                open ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-white/10 bg-brand-darker animate-fade-in">
          <div className="container-page py-3 flex flex-col gap-1">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-xs uppercase tracking-wide font-semibold transition-colors duration-150 ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
