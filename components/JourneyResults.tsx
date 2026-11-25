"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Journey, Mode } from "@/lib/types";
import type { SearchResult } from "@/lib/engine";
import { addBooking, makeReference, readLS, useUser, writeLS, KEYS } from "@/lib/store";
import { fmtDate, fmtDuration, fmtTime, inr, modeLabel, timeAgo } from "@/lib/format";
import { Icon, ModeIcon } from "./Icons";
import { RouteSketch } from "./RouteSketch";

const SORTS = [
  { id: "cost", label: "Lowest total" },
  { id: "duration", label: "Fastest" },
  { id: "depart", label: "Departure" },
  { id: "rating", label: "Rated" },
] as const;

const MODES: Mode[] = ["flight", "train", "bus", "cab"];

type Props = {
  result: SearchResult;
  title?: string;
  initialSort?: "cost" | "duration" | "depart" | "rating";
};

export function JourneyResults({ result, title, initialSort = "cost" }: Props) {
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>(initialSort);
  const [activeModes, setActiveModes] = useState<Mode[]>([]);
  const [directOnly, setDirectOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [booking, setBooking] = useState<Journey | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [toast, setToast] = useState("");

  const priceCeiling = useMemo(() => {
    const max = Math.max(...result.journeys.map((j) => j.totalCost), 5000);
    return Math.ceil(max / 500) * 500;
  }, [result.journeys]);

  const journeys = useMemo(() => {
    let list = [...result.journeys];
    if (activeModes.length) list = list.filter((j) => j.modes.some((m) => activeModes.includes(m)));
    if (directOnly) list = list.filter((j) => j.transfers === 0);
    if (maxPrice) list = list.filter((j) => j.totalCost <= maxPrice);
    const rating = (j: Journey) => j.legs.reduce((s, l) => s + l.rating, 0) / Math.max(1, j.legs.length);
    switch (sort) {
      case "duration":
        list.sort((a, b) => a.totalDurationMin - b.totalDurationMin);
        break;
      case "depart":
        list.sort((a, b) => new Date(a.legs[0].departISO).getTime() - new Date(b.legs[0].departISO).getTime());
        break;
      case "rating":
        list.sort((a, b) => rating(b) - rating(a));
        break;
      default:
        list.sort((a, b) => a.totalCost - b.totalCost);
    }
    return list;
  }, [result.journeys, activeModes, directOnly, maxPrice, sort]);

  function toggleMode(mode: Mode) {
    setActiveModes((prev) => (prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]));
  }

  function saveJourney(j: Journey) {
    const list = readLS<Journey[]>(KEYS.saved, []);
    if (list.some((s) => s.id === j.id)) {
      writeLS(KEYS.saved, list.filter((s) => s.id !== j.id));
      setSaved((prev) => prev.filter((id) => id !== j.id));
      setToast("Removed from saved journeys");
      return;
    }
    writeLS(KEYS.saved, [j, ...list].slice(0, 20));
    setSaved((prev) => [...prev, j.id]);
    setToast("Journey saved to your dashboard");
  }

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {title && <p className="eyebrow text-saffron-dark">{title}</p>}
          <h2 className="display mt-1 text-3xl text-ink sm:text-4xl">
            {result.query.from} <span className="text-ink/30">→</span> {result.query.to}
          </h2>
          <p className="mt-1.5 text-sm text-ink/55">
            {fmtDate(result.query.date, "long")} · {result.query.pax} traveller{result.query.pax > 1 ? "s" : ""} ·{" "}
            {journeys.length} journeys · total cost includes local transfers
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px]">
          <span className="chip border-teal/20 bg-teal-soft text-teal">
            <span className="h-1.5 w-1.5 rounded-full bg-teal" /> Confirmed schedule
          </span>
          <span className="chip border-saffron/25 bg-saffron/10 text-saffron-dark">
            <span className="h-1.5 w-1.5 rounded-full bg-saffron" /> Estimated connection
          </span>
        </div>
      </div>

      {journeys.length === 0 ? (
        <div className="card mt-8 p-8 text-center">
          <Icon name="alert" className="mx-auto h-7 w-7 text-saffron-dark" />
          <p className="mt-3 font-semibold">No journeys match these filters.</p>
          <p className="mt-1 text-sm text-ink/55">Clear a filter or try a nearby hub city.</p>
          <button
            type="button"
            onClick={() => {
              setActiveModes([]);
              setDirectOnly(false);
              setMaxPrice(null);
            }}
            className="btn-ghost mt-4"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-5">
              <p className="eyebrow text-ink/40">Sort by</p>
              <div className="mt-3 grid gap-1">
                {SORTS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSort(s.id)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      sort === s.id ? "bg-ink text-cream" : "text-ink/60 hover:bg-sand"
                    }`}
                  >
                    {s.label}
                    {sort === s.id && <Icon name="check" className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>

              <p className="eyebrow mt-5 text-ink/40">Transport</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {MODES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleMode(m)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-bold transition ${
                      activeModes.includes(m)
                        ? "border-ink bg-ink text-cream"
                        : "border-ink/12 text-ink/60 hover:border-ink/30"
                    }`}
                  >
                    <ModeIcon mode={m} className="h-3.5 w-3.5" />
                    {modeLabel(m)}
                  </button>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between">
                <p className="eyebrow text-ink/40">Journey</p>
                <button
                  type="button"
                  onClick={() => setDirectOnly((v) => !v)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                    directOnly ? "border-ink bg-ink text-cream" : "border-ink/12 text-ink/60"
                  }`}
                >
                  Direct only
                </button>
              </div>

              <label className="eyebrow mt-5 block text-ink/40" htmlFor="price">
                Max total · {inr(maxPrice ?? priceCeiling)}
              </label>
              <input
                id="price"
                type="range"
                min={Math.max(300, Math.round(priceCeiling * 0.15))}
                max={priceCeiling}
                step={100}
                value={maxPrice ?? priceCeiling}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="mt-3 w-full accent-teal"
              />

              <div className="mt-5 rounded-2xl bg-sand/70 p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-ink/45">Compared for you</p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink/60">
                  Every price is a complete journey: ticket fares plus local transfer estimates. Nothing is compared
                  ticket-to-total.
                </p>
                {result.hubsConsidered.length > 0 && (
                  <p className="mt-2 text-[11.5px] text-ink/45">Hubs checked: {result.hubsConsidered.join(", ")}</p>
                )}
              </div>
            </div>
          </aside>

          <div className="space-y-4">
            {journeys.map((j) => {
              const isOpen = expanded === j.id;
              const isSaved = saved.includes(j.id);
              return (
                <article key={j.id} className="card overflow-hidden">
                  <div className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {j.legs.map((leg, i) => (
                            <span key={leg.id} className="flex items-center">
                              {i > 0 && (
                                <span className="mx-1 text-[10px] font-bold uppercase tracking-wide text-ink/30">
                                  {leg.waitMin ? `${fmtDuration(leg.waitMin)} wait` : "·"}
                                </span>
                              )}
                              <span className="flex flex-col items-center gap-1">
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sand text-teal">
                                  <ModeIcon mode={leg.mode} className="h-4 w-4" />
                                </span>
                              </span>
                            </span>
                          ))}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            {j.tag && (
                              <span className="rounded-full bg-saffron/15 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-saffron-dark">
                                {j.tag}
                              </span>
                            )}
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">
                              {j.transfers === 0 ? "Direct" : `${j.transfers} transfer${j.transfers > 1 ? "s" : ""}`}
                            </span>
                          </div>
                          <p className="mt-1 text-[13px] font-semibold text-ink/60">
                            {j.legs.map((l) => (l.mode === "cab" ? l.operator : l.operator)).join(" · ")}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="display text-3xl leading-none text-ink">{inr(j.totalCost)}</p>
                        <p className="mt-1 text-[11px] text-ink/45">
                          total for {j.pax} · {inr(j.fare)} fare {j.transferEstimate ? `+ ${inr(j.transferEstimate)} transfers` : "· door to door"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 border-t border-ink/8 pt-4 sm:grid-cols-[1fr_auto_1fr_auto]">
                      <div>
                        <p className="display text-lg leading-none">{fmtTime(j.legs[0].departISO)}</p>
                        <p className="mt-1 text-[11.5px] text-ink/50">{j.legs[0].from}</p>
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-[11px] font-bold text-ink/40">{fmtDuration(j.totalDurationMin)}</p>
                        <span className="route-dash my-1 h-px w-16 text-ink/25" />
                        <p className="text-[10px] text-ink/35">{j.legs.length} leg{j.legs.length > 1 ? "s" : ""}</p>
                      </div>
                      <div className="sm:text-right">
                        <p className="display text-lg leading-none">{fmtTime(j.legs[j.legs.length - 1].arriveISO)}</p>
                        <p className="mt-1 text-[11.5px] text-ink/50">{j.legs[j.legs.length - 1].to}</p>
                      </div>
                      <div className="flex items-center gap-2 sm:justify-end">
                        <button
                          type="button"
                          onClick={() => saveJourney(j)}
                          aria-label={isSaved ? "Remove saved journey" : "Save journey"}
                          className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                            isSaved ? "border-saffron bg-saffron/15 text-saffron-dark" : "border-ink/12 text-ink/45 hover:border-ink/30"
                          }`}
                        >
                          <Icon name="pin" className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => setBooking(j)} className="btn-primary px-5">
                          Select
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10.5px] text-ink/35">
                      <span>
                        {j.legs[0].source} · updated {timeAgo(j.legs[0].updatedMinsAgo)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : j.id)}
                        className="inline-flex items-center gap-1 font-bold text-teal hover:underline"
                      >
                        {isOpen ? "Hide itinerary" : "Full itinerary & fare rules"}
                        <Icon name="chevronDown" className={`h-3.5 w-3.5 transition ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="border-t border-ink/8 bg-sand/35 p-5">
                      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
                        <div>
                          <p className="eyebrow text-ink/40">Segment timeline</p>
                          <ol className="mt-3 space-y-4">
                            {j.legs.map((leg) => (
                              <li key={leg.id} className="relative border-l border-ink/15 pl-5">
                                <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-cream bg-teal" />
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <p className="text-sm font-bold">
                                    {leg.from} → {leg.to}
                                  </p>
                                  <span className="chip bg-white py-0.5 text-[10.5px]">
                                    <ModeIcon mode={leg.mode} className="h-3 w-3" /> {modeLabel(leg.mode)}
                                  </span>
                                </div>
                                <p className="mt-0.5 text-[12px] text-ink/55">
                                  {fmtDate(leg.departISO, "day")} · {fmtTime(leg.departISO)} – {fmtTime(leg.arriveISO)} ·{" "}
                                  {fmtDuration(leg.durationMin)}
                                </p>
                                <p className="mt-1 text-[12px] font-semibold text-ink/70">
                                  {leg.operator} <span className="font-normal text-ink/40">{leg.code}</span>
                                </p>
                                <div className="mt-1.5 flex flex-wrap gap-1.5">
                                  {leg.meta.map((m) => (
                                    <span key={m} className="rounded-full bg-white/80 px-2 py-0.5 text-[10.5px] text-ink/55">
                                      {m}
                                    </span>
                                  ))}
                                </div>
                                <p className="mt-1.5 text-[11px] text-ink/45">
                                  {leg.seats > 0 ? `${leg.seats} seats left` : "Sold out"} · {inr(leg.price)}
                                  {leg.cabForWholeVehicle ? " per cab" : " per person"}
                                </p>
                                {leg.waitMin !== undefined && (
                                  <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg bg-saffron/10 px-2 py-1 text-[11px] font-semibold text-saffron-dark">
                                    <Icon name="clock" className="h-3 w-3" /> {fmtDuration(leg.waitMin)} connection
                                    {leg.walkMin ? ` · ~${leg.walkMin} min walk` : ""} · {leg.connection}
                                  </p>
                                )}
                              </li>
                            ))}
                          </ol>

                          {j.warning && (
                            <div className="mt-4 flex gap-2 rounded-2xl border border-saffron/25 bg-saffron/10 p-3 text-[12px] font-medium text-saffron-dark">
                              <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
                              {j.warning}
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          <RouteSketch stops={j.legs.map((l) => l.from).concat(j.legs[j.legs.length - 1].to)} className="h-[170px]" compact />
                          <div className="rounded-2xl bg-white p-4">
                            <p className="eyebrow text-ink/40">Fare breakdown</p>
                            <dl className="mt-2.5 space-y-1.5 text-[12.5px]">
                              <div className="flex justify-between">
                                <dt className="text-ink/55">Fares ({j.pax} traveller{j.pax > 1 ? "s" : ""})</dt>
                                <dd className="font-semibold">{inr(j.fare)}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-ink/55">Local transfers</dt>
                                <dd className="font-semibold">{j.transferEstimate ? inr(j.transferEstimate) : "Included"}</dd>
                              </div>
                              <div className="flex justify-between border-t border-ink/10 pt-2 text-base">
                                <dt className="font-bold">Total</dt>
                                <dd className="font-extrabold">{inr(j.totalCost)}</dd>
                              </div>
                            </dl>
                            <p className="mt-2.5 text-[10.5px] leading-relaxed text-ink/35">
                              {j.estimated
                                ? "Includes at least one estimated connection. Prices and inventory revalidated at checkout."
                                : "All segments come from confirmed schedules. Price revalidated at checkout."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}

            <div className="rounded-2xl border border-ink/10 bg-white/60 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink/40">Data sources</p>
              <p className="mt-1 text-[12px] leading-relaxed text-ink/55">
                {result.sources.length ? result.sources.join(" · ") : "No provider feed matched this search"} — results
                are normalised into one comparison and refreshed before booking. This demo uses simulated feeds.
              </p>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-ink px-4 py-2.5 text-xs font-semibold text-cream shadow-lift">
          <Icon name="check" className="h-3.5 w-3.5 text-saffron" />
          {toast}
          <button type="button" onClick={() => setToast("")} aria-label="Dismiss" className="opacity-50 hover:opacity-100">
            <Icon name="close" className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {booking && <BookingSheet journey={booking} onClose={() => setBooking(null)} />}
    </section>
  );
}

function BookingSheet({ journey, onClose }: { journey: Journey; onClose: () => void }) {
  const [user] = useUser();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [step, setStep] = useState<"review" | "paid">("review");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");

  function confirm() {
    if (!name.trim() || !/.+@.+\..+/.test(email)) {
      setError("Add a name and a valid email for the booking confirmation.");
      return;
    }
    const ref = makeReference("NX");
    addBooking({
      id: `bk_${Date.now()}`,
      type: "transport",
      title: `${journey.from} → ${journey.to}`,
      subtitle: journey.legs.map((l) => `${modeLabel(l.mode)} · ${l.operator}`).join(" + "),
      date: journey.date,
      amount: journey.totalCost,
      status: "confirmed",
      createdAt: new Date().toISOString(),
      reference: ref,
    });
    setReference(ref);
    setStep("paid");
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-cream p-6 shadow-lift sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-saffron-dark">{step === "review" ? "Review & book" : "Booking confirmed"}</p>
            <h3 className="display mt-1 text-2xl">
              {journey.from} → {journey.to}
            </h3>
            <p className="mt-1 text-[13px] text-ink/55">
              {fmtDate(journey.date, "long")} · {journey.pax} traveller{journey.pax > 1 ? "s" : ""}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full border border-ink/10 p-2 text-ink/50">
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>

        {step === "review" ? (
          <>
            <div className="mt-4 space-y-2 rounded-2xl border border-ink/10 bg-white p-4">
              {journey.legs.map((l, i) => (
                <div key={l.id} className="flex items-start justify-between gap-3 text-[12.5px]">
                  <div>
                    <p className="font-bold">
                      {i + 1}. {l.from} → {l.to}
                    </p>
                    <p className="text-ink/50">
                      {fmtTime(l.departISO)} · {l.operator} · {modeLabel(l.mode)}
                    </p>
                  </div>
                  <p className="font-semibold">{inr(l.cabForWholeVehicle ? l.price : l.price * journey.pax)}</p>
                </div>
              ))}
              <div className="flex justify-between border-t border-ink/10 pt-2 text-base font-extrabold">
                <span>Total</span>
                <span>{inr(journey.totalCost)}</span>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-teal/20 bg-teal-soft px-3.5 py-3 text-[11.5px] font-semibold text-teal">
              <Icon name="check" className="mr-1 inline h-3.5 w-3.5" /> Fares revalidated just now · inventory held for 10 minutes
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="bk-name">Traveller name</label>
                <input id="bk-name" value={name} onChange={(e) => setName(e.target.value)} className="field" placeholder="Full name" />
              </div>
              <div>
                <label className="label" htmlFor="bk-email">Email</label>
                <input id="bk-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" placeholder="you@example.com" />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl border border-dashed border-ink/15 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Icon name="wallet" className="h-4 w-4 text-teal" /> Razorpay · UPI / card
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wide text-ink/35">Demo gateway</span>
            </div>

            {error && <p className="mt-3 text-xs font-semibold text-saffron-dark">{error}</p>}

            <button type="button" onClick={confirm} className="btn-primary mt-4 w-full py-3">
              Confirm booking · {inr(journey.totalCost)}
            </button>
            <p className="mt-2 text-center text-[10.5px] leading-relaxed text-ink/35">
              Prototype checkout — no money is charged and no provider ticket is issued. A booking record is saved in
              this browser.
            </p>
          </>
        ) : (
          <div className="mt-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal text-cream">
              <Icon name="check" className="h-7 w-7" />
            </div>
            <p className="display mt-4 text-2xl">You're on your way.</p>
            <p className="mt-1 text-sm text-ink/55">
              Reference <span className="font-bold text-ink">{reference}</span> · details sent to {email}
            </p>
            <div className="mt-4 rounded-2xl border border-ink/10 bg-white p-4 text-left text-[12.5px] text-ink/60">
              <p className="font-bold text-ink">Before you travel</p>
              <p className="mt-1">Reconfirm departure 4 hours before, keep a photo ID and a 30-minute transfer buffer.</p>
            </div>
            <div className="mt-4 flex gap-2">
              <Link href="/dashboard" className="btn-ink flex-1">Open dashboard</Link>
              <button type="button" onClick={onClose} className="btn-ghost flex-1">Keep browsing</button>
            </div>
            <p className="mt-3 text-[10.5px] text-ink/35">
              Add this journey to live sharing from the dashboard so a trusted contact can follow along.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
