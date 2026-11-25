"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "./Icons";
import { signOut, useUser } from "@/lib/store";
import { Logo } from "./Logo";

const NAV = [
  { href: "/search", label: "Compare" },
  { href: "/places", label: "Places" },
  { href: "/routes", label: "Routes" },
  { href: "/planner", label: "Plan" },
  { href: "/hotels", label: "Stays" },
  { href: "/guides", label: "Guides" },
  { href: "/careers", label: "Jobs" },
  { href: "/safety", label: "Safety" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user] = useUser();
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/95 text-cream backdrop-blur-md">
      <div className="container-x flex h-[68px] items-center justify-between gap-6">
        <Logo className="text-cream" />

        <nav className="hidden items-center gap-0.5 xl:flex">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3.5 py-2 text-[13px] font-semibold transition ${
                  active ? "bg-white/10 text-cream" : "text-cream/65 hover:bg-white/5 hover:text-cream"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/assistant"
            className="hidden items-center gap-1.5 rounded-full border border-saffron/40 bg-saffron/10 px-3.5 py-2 text-[13px] font-semibold text-saffron transition hover:bg-saffron/20 md:inline-flex"
          >
            <Icon name="sparkles" className="h-3.5 w-3.5" /> AI planner
          </Link>

          {user ? (
            <details className="group relative hidden md:block">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-white/15 py-1 pl-1 pr-3 text-[13px] font-semibold text-cream/80 hover:border-white/30">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-saffron text-[11px] font-extrabold text-ink">
                  {initials || "N"}
                </span>
                {user.name.split(" ")[0]}
                <Icon name="chevronDown" className="h-3.5 w-3.5 opacity-60" />
              </summary>
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-ink/10 bg-white p-1.5 text-ink shadow-lift">
                <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-ink/40">{user.email}</p>
                <Link href="/dashboard" className="block rounded-xl px-3 py-2 text-sm font-semibold hover:bg-sand">
                  My dashboard
                </Link>
                <Link href="/admin" className="block rounded-xl px-3 py-2 text-sm font-semibold hover:bg-sand">
                  Admin console
                </Link>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-saffron-dark hover:bg-sand"
                >
                  <Icon name="logout" className="h-4 w-4" /> Sign out
                </button>
              </div>
            </details>
          ) : (
            <Link href="/login" className="hidden rounded-full px-3 py-2 text-[13px] font-semibold text-cream/70 hover:text-cream md:block">
              Sign in
            </Link>
          )}

          <Link href="/signup" className="hidden rounded-full bg-cream px-4 py-2 text-[13px] font-bold text-ink hover:bg-white md:inline-block">
            Create account
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation"
            className="rounded-full border border-white/15 p-2 xl:hidden"
          >
            <Icon name={open ? "close" : "menu"} className="h-5 w-5" />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-ink px-5 pb-6 pt-3 xl:hidden">
          <div className="grid gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-cream/80 hover:bg-white/5"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/assistant" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-saffron">
              AI trip planner
            </Link>
            <Link href="/dashboard" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-cream/80 hover:bg-white/5">
              Dashboard
            </Link>
          </div>
          <div className="mt-3 flex gap-2 border-t border-white/10 pt-4">
            {user ? (
              <button type="button" onClick={() => signOut()} className="btn-ghost-light flex-1">
                Sign out
              </button>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="btn-ghost-light flex-1">
                  Sign in
                </Link>
                <Link href="/signup" onClick={() => setOpen(false)} className="btn-primary flex-1">
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
