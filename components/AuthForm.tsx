"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Role } from "@/lib/types";
import { signIn, useUser } from "@/lib/store";
import { Icon } from "./Icons";

const ROLES: { id: Role; label: string; copy: string }[] = [
  { id: "traveller", label: "Traveller", copy: "Search, plan, book, share" },
  { id: "guide", label: "Local guide", copy: "Offer walks and experiences" },
  { id: "provider", label: "Transport provider", copy: "Publish routes and inventory" },
  { id: "hotelier", label: "Property owner", copy: "List rooms and reservations" },
  { id: "employer", label: "Employer", copy: "Post travel and tourism roles" },
  { id: "admin", label: "Administrator", copy: "Verify, moderate, monitor" },
];

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [user] = useUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("traveller");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/.+@.+\..+/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password needs at least 6 characters.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setError("Add your full name.");
      return;
    }
    setError("");
    signIn({
      name: mode === "signup" ? name.trim() : name.trim() || email.split("@")[0],
      email: email.trim(),
      role,
      createdAt: new Date().toISOString(),
    });
    router.push("/dashboard");
  }

  return (
    <div className="container-x grid gap-10 py-12 lg:grid-cols-[1fr_420px] lg:items-center">
      <div className="max-w-xl">
        <p className="eyebrow text-saffron-dark">Nexora account</p>
        <h1 className="display mt-3 text-4xl leading-[1.03] sm:text-6xl">
          One account.
          <br />
          The whole <span className="italic text-teal">journey.</span>
        </h1>
        <p className="mt-4 max-w-md text-[14px] leading-relaxed text-ink/60">
          Travellers, guides, transport providers, property owners and employers share one platform — each with the
          tools and permissions their role needs.
        </p>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {ROLES.map((r) => (
            <div key={r.id} className="rounded-2xl border border-ink/10 bg-white p-3">
              <p className="text-[12px] font-bold">{r.label}</p>
              <p className="text-[10.5px] text-ink/45">{r.copy}</p>
            </div>
          ))}
        </div>
        {user && (
          <div className="mt-5 flex items-center gap-2 rounded-2xl bg-teal-soft p-3 text-[12px] font-semibold text-teal">
            <Icon name="check" className="h-4 w-4" /> Already signed in as {user.email}.
            <Link href="/dashboard" className="underline">Go to dashboard</Link>
          </div>
        )}
      </div>

      <div className="card p-6">
        <h2 className="display text-2xl">{mode === "signup" ? "Create your account" : "Welcome back"}</h2>
        <p className="mt-1 text-[11.5px] text-ink/45">
          {mode === "signup" ? "Prototype account — stored only in this browser." : "Enter any saved prototype email, or create an account."}
        </p>

        <form onSubmit={submit} className="mt-4 grid gap-3">
          {mode === "signup" && (
            <div>
              <label className="label" htmlFor="a-name">Full name</label>
              <input id="a-name" value={name} onChange={(e) => setName(e.target.value)} className="field" placeholder="Your name" />
            </div>
          )}
          <div>
            <label className="label" htmlFor="a-email">Email</label>
            <input id="a-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" placeholder="you@example.com" />
          </div>
          <div>
            <label className="label" htmlFor="a-pass">Password</label>
            <input id="a-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="field" placeholder="••••••••" />
          </div>
          <div>
            <span className="label">Account type</span>
            <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="field">
              {ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          </div>

          {error && <p className="text-[11px] font-semibold text-saffron-dark">{error}</p>}

          <button type="submit" className="btn-primary mt-1 w-full py-3">
            {mode === "signup" ? "Create account" : "Sign in"} <Icon name="arrowRight" className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-3 text-center text-[11.5px] text-ink/50">
          {mode === "signup" ? (
            <>Already have an account? <Link href="/login" className="font-bold text-teal underline">Sign in</Link></>
          ) : (
            <>New to Nexora? <Link href="/signup" className="font-bold text-teal underline">Create an account</Link></>
          )}
        </p>

        <div className="mt-4 rounded-xl bg-sand/70 p-3 text-[10.5px] leading-relaxed text-ink/45">
          Demo authentication. No password is stored or transmitted; this prototype keeps only a local profile in your
          browser. Production uses Supabase Auth with email verification, session expiry and role-based access control.
        </div>
      </div>
    </div>
  );
}
