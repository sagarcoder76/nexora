"use client";

import Link from "next/link";
import { useState } from "react";
import type { Booking, GuideRequest, JobApplication, Journey, ShareSession, TrustedContact } from "@/lib/types";
import { KEYS, useLocal, useUser } from "@/lib/store";
import { fmtDate, fmtDuration, fmtTime, inr, modeLabel } from "@/lib/format";
import { Icon, ModeIcon } from "@/components/Icons";

const TABS = ["Overview", "Bookings", "Saved journeys", "Guide requests", "Applications", "Contacts"] as const;

export default function DashboardPage() {
  const [user] = useUser();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const [bookings] = useLocal<Booking[]>(KEYS.bookings, []);
  const [saved] = useLocal<Journey[]>(KEYS.saved, []);
  const [requests] = useLocal<GuideRequest[]>(KEYS.guideRequests, []);
  const [applications] = useLocal<JobApplication[]>(KEYS.applications, []);
  const [contacts] = useLocal<TrustedContact[]>(KEYS.contacts, []);
  const [shares] = useLocal<ShareSession[]>(KEYS.shares, []);

  const spend = bookings.filter((b) => b.status !== "cancelled").reduce((s, b) => s + b.amount, 0);
  const activeShares = shares.filter((s) => s.active).length;

  return (
    <div className="container-x py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-teal">Your workspace</p>
          <h1 className="display mt-2 text-4xl sm:text-5xl">
            {user ? `Hello, ${user.name.split(" ")[0]}.` : "Your travel dashboard."}
          </h1>
          <p className="mt-1.5 text-[13px] text-ink/50">
            {user
              ? `${user.email} · ${user.role} account · stored locally in this prototype`
              : "Sign in to keep bookings, itineraries and applications together. Everything is stored in this browser."}
          </p>
        </div>
        {!user && (
          <div className="flex gap-2">
            <Link href="/login" className="btn-ghost">Sign in</Link>
            <Link href="/signup" className="btn-primary">Create account</Link>
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Bookings", value: String(bookings.length), note: bookings[0] ? `Next: ${bookings[0].title}` : "Nothing booked yet" },
          { label: "Saved journeys", value: String(saved.length), note: "Itineraries you kept" },
          { label: "Live shares", value: String(activeShares), note: activeShares ? "Sharing with contacts" : "No active sharing" },
          { label: "Total booked", value: inr(spend), note: "Demo amounts, no charges" },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-[10.5px] font-bold uppercase tracking-wide text-ink/35">{s.label}</p>
            <p className="display mt-1 text-2xl">{s.value}</p>
            <p className="truncate text-[10.5px] text-ink/40">{s.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-1 overflow-x-auto border-b border-ink/10 no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`whitespace-nowrap border-b-2 px-3.5 py-2.5 text-[12.5px] font-bold transition ${
              tab === t ? "border-saffron text-ink" : "border-transparent text-ink/40 hover:text-ink/70"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "Overview" && (
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-4">
              <div className="card p-5">
                <div className="flex items-center justify-between">
                  <p className="eyebrow text-teal">Upcoming & recent</p>
                  <Link href="/search" className="text-[11px] font-bold text-teal hover:underline">+ New journey</Link>
                </div>
                {bookings.length ? (
                  <div className="mt-3 space-y-2">
                    {bookings.slice(0, 3).map((b) => (
                      <div key={b.id} className="flex items-center justify-between gap-3 rounded-xl border border-ink/8 p-3">
                        <div className="min-w-0">
                          <p className="truncate text-[12.5px] font-bold">{b.title}</p>
                          <p className="truncate text-[10.5px] text-ink/45">{b.subtitle} · {fmtDate(b.date, "day")}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[12px] font-extrabold">{inr(b.amount)}</p>
                          <p className="text-[9.5px] uppercase tracking-wide text-teal">{b.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 rounded-xl bg-sand/60 p-3 text-[12px] text-ink/50">
                    No bookings yet. <Link href="/search" className="font-bold text-teal underline">Compare a route</Link> to get started.
                  </p>
                )}
              </div>

              <div className="card p-5">
                <p className="eyebrow text-teal">Safety</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-bold">{contacts.length} trusted contact{contacts.length === 1 ? "" : "s"}</p>
                    <p className="text-[11px] text-ink/45">{activeShares ? `${activeShares} journey share active` : "Sharing is off"}</p>
                  </div>
                  <Link href="/safety" className="btn-ghost text-xs"><Icon name="share" className="h-3.5 w-3.5" /> Manage sharing</Link>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="card p-5">
                <p className="eyebrow text-ink/40">Quick actions</p>
                <div className="mt-3 grid gap-2">
                  {[
                    { href: "/assistant", icon: "sparkles" as const, label: "Plan a trip with AI" },
                    { href: "/hotels", icon: "bed" as const, label: "Find a stay" },
                    { href: "/guides", icon: "users" as const, label: "Hire a local guide" },
                    { href: "/careers", icon: "briefcase" as const, label: "Browse travel jobs" },
                  ].map((a) => (
                    <Link key={a.href} href={a.href} className="flex items-center justify-between rounded-xl border border-ink/10 px-3 py-2.5 text-[12px] font-semibold hover:border-teal/40">
                      <span className="flex items-center gap-2"><Icon name={a.icon} className="h-4 w-4 text-teal" /> {a.label}</span>
                      <Icon name="arrowRight" className="h-3.5 w-3.5 text-ink/30" />
                    </Link>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl bg-ink p-5 text-cream">
                <p className="eyebrow text-saffron">Travel preferences</p>
                <p className="mt-2 text-[12.5px] leading-relaxed text-cream/60">
                  Language: English · Budget: balanced · Preferred modes: train and bus. Personalisation is applied to
                  comparison and AI plans. Edit these in account settings in production.
                </p>
              </div>
            </div>
          </div>
        )}

        {tab === "Bookings" && (
          <div className="card overflow-hidden">
            {bookings.length ? (
              <div className="divide-y divide-ink/8">
                {bookings.map((b) => (
                  <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-soft text-teal">
                        <Icon name={b.type === "transport" ? "compass" : b.type === "hotel" ? "bed" : "users"} className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-[13px] font-bold">{b.title}</p>
                        <p className="text-[11px] text-ink/45">{b.subtitle}</p>
                        <p className="text-[10px] text-ink/35">{fmtDate(b.date, "long")} · ref {b.reference}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-extrabold">{inr(b.amount)}</p>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide ${b.status === "confirmed" ? "bg-teal-soft text-teal" : "bg-sand text-ink/50"}`}>{b.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-[12.5px] text-ink/50">No bookings yet. <Link href="/search" className="font-bold text-teal underline">Search transport</Link> or <Link href="/hotels" className="font-bold text-teal underline">browse stays</Link>.</div>
            )}
          </div>
        )}

        {tab === "Saved journeys" && (
          <div className="grid gap-3">
            {saved.length ? saved.map((j) => (
              <div key={j.id} className="card flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="text-[13px] font-extrabold">{j.from} → {j.to}</p>
                  <p className="text-[11px] text-ink/45">{fmtDate(j.date, "long")} · {j.pax} traveller{j.pax > 1 ? "s" : ""}</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    {j.legs.map((l) => (
                      <span key={l.id} className="inline-flex items-center gap-1 rounded-full bg-sand px-2 py-0.5 text-[10px] font-semibold text-ink/60">
                        <ModeIcon mode={l.mode} className="h-3 w-3" /> {l.operator.split(" ")[0]} {fmtTime(l.departISO)}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-extrabold">{inr(j.totalCost)}</p>
                  <p className="text-[10px] text-ink/40">{fmtDuration(j.totalDurationMin)} · {j.transfers ? `${j.transfers} transfer` : "direct"}</p>
                  <Link href={`/search?from=${j.from}&to=${j.to}&date=${j.date}&pax=${j.pax}`} className="mt-1 inline-block text-[11px] font-bold text-teal hover:underline">Open search →</Link>
                </div>
              </div>
            )) : (
              <div className="card p-8 text-center text-[12.5px] text-ink/50">
                No saved journeys. Use the pin on any result, or save an itinerary in the <Link href="/planner" className="font-bold text-teal underline">planner</Link>.
              </div>
            )}
          </div>
        )}

        {tab === "Guide requests" && (
          <div className="card overflow-hidden">
            {requests.length ? (
              <div className="divide-y divide-ink/8">
                {requests.map((r) => (
                  <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div>
                      <p className="text-[13px] font-bold">{r.guideName} · {r.city}</p>
                      <p className="text-[11px] text-ink/45">{fmtDate(r.date, "long")} · {r.groupSize} guest{r.groupSize > 1 ? "s" : ""}</p>
                      {r.note && <p className="mt-1 max-w-lg text-[11px] text-ink/40">“{r.note}”</p>}
                    </div>
                    <span className="rounded-full bg-saffron/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-saffron-dark">{r.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-[12.5px] text-ink/50">No guide requests. <Link href="/guides" className="font-bold text-teal underline">Find a local guide</Link>.</div>
            )}
          </div>
        )}

        {tab === "Applications" && (
          <div className="card overflow-hidden">
            {applications.length ? (
              <div className="divide-y divide-ink/8">
                {applications.map((a) => (
                  <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div>
                      <p className="text-[13px] font-bold">{a.jobTitle}</p>
                      <p className="text-[11px] text-ink/45">{a.employer} · resume: {a.resumeName}</p>
                      <p className="text-[10px] text-ink/35">Applied {fmtDate(a.createdAt, "short")}</p>
                    </div>
                    <span className="rounded-full bg-teal-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-teal">{a.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-[12.5px] text-ink/50">No applications yet. <Link href="/careers" className="font-bold text-teal underline">Explore travel jobs</Link>.</div>
            )}
          </div>
        )}

        {tab === "Contacts" && (
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="card p-5">
              <p className="eyebrow text-teal">Trusted contacts</p>
              {contacts.length ? (
                <div className="mt-3 divide-y divide-ink/8">
                  {contacts.map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sand text-[10px] font-extrabold text-teal">
                          {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <p className="text-[12.5px] font-bold">{c.name}</p>
                          <p className="text-[10.5px] text-ink/45">{c.relationship} · {c.phone}</p>
                        </div>
                      </div>
                      <span className="text-[9.5px] font-semibold uppercase tracking-wide text-ink/35">unverified</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-[12px] text-ink/50">No contacts saved. Add them from the <Link href="/safety" className="font-bold text-teal underline">safety page</Link>.</p>
              )}
            </div>
            <div className="card p-5">
              <p className="eyebrow text-ink/40">Account</p>
              <dl className="mt-3 space-y-2 text-[12px]">
                <div className="flex justify-between"><dt className="text-ink/45">Name</dt><dd className="font-semibold">{user?.name ?? "Guest"}</dd></div>
                <div className="flex justify-between"><dt className="text-ink/45">Email</dt><dd className="font-semibold">{user?.email ?? "—"}</dd></div>
                <div className="flex justify-between"><dt className="text-ink/45">Role</dt><dd className="font-semibold capitalize">{user?.role ?? "guest"}</dd></div>
                <div className="flex justify-between"><dt className="text-ink/45">Member since</dt><dd className="font-semibold">{user ? fmtDate(user.createdAt, "short") : "—"}</dd></div>
              </dl>
              <p className="mt-4 text-[10.5px] leading-relaxed text-ink/35">
                Production authentication uses Supabase Auth with email verification and session management. This
                prototype keeps a local account on your device only.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
