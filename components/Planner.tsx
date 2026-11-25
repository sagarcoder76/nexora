"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Journey, JourneyLeg, Mode, Offer } from "@/lib/types";
import { offersFor, searchJourneys, withLegs } from "@/lib/engine";
import { CITIES } from "@/lib/data";
import { addSearchHistory, readLS, writeLS, KEYS } from "@/lib/store";
import { fmtDate, fmtDuration, fmtTime, inr, modeLabel, todayISO } from "@/lib/format";
import { Icon, ModeIcon } from "./Icons";
import { RouteSketch } from "./RouteSketch";

const MODES: Mode[] = ["flight", "train", "bus", "cab"];

export function Planner() {
  const [from, setFrom] = useState("Kaithal");
  const [to, setTo] = useState("Manali");
  const [date, setDate] = useState(todayISO(7));
  const [pax, setPax] = useState(1);
  const [budget, setBudget] = useState("");
  const [preference, setPreference] = useState<"cost" | "duration">("cost");
  const [options, setOptions] = useState<Journey[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [swap, setSwap] = useState<{ index: number; offers: Offer[] } | null>(null);
  const [savedMsg, setSavedMsg] = useState("");

  function build() {
    const result = searchJourneys({
      from,
      to,
      date,
      pax,
      budget: budget ? Number(budget) : undefined,
      sort: preference,
    });
    setOptions(result.journeys);
    setSelectedId(result.journeys[0]?.id ?? null);
    setSwap(null);
    addSearchHistory({ from: result.query.from, to: result.query.to, date, pax });
  }

  useEffect(() => {
    build();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = options.find((o) => o.id === selectedId) ?? options[0] ?? null;

  function replaceLeg(index: number, offer: Offer) {
    if (!selected) return;
    const legs = selected.legs.map((l, i) => {
      if (i !== index) return l;
      const waitMin =
        i > 0
          ? Math.round(
              (new Date(offer.departISO).getTime() - new Date(legsPrev(i).arriveISO).getTime()) / 60000,
            )
          : undefined;
      return { ...offer, connection: "estimated" as const, waitMin: waitMin && waitMin > 0 ? waitMin : 60 };
    });
    function legsPrev(i: number) {
      return selected!.legs[Math.max(0, i - 1)];
    }
    const rebuilt = withLegs(selected, legs);
    setOptions((prev) => prev.map((o) => (o.id === selected.id ? rebuilt : o)));
    setSelectedId(rebuilt.id);
    setSwap(null);
  }

  function openSwap(index: number) {
    if (!selected) return;
    const leg = selected.legs[index];
    const alternatives = offersFor(leg.from, leg.to, date, [leg.mode]);
    setSwap({ index, offers: alternatives.slice(0, 4) });
  }

  function saveItinerary() {
    if (!selected) return;
    const list = readLS<Journey[]>(KEYS.saved, []);
    if (!list.some((j) => j.id === selected.id)) {
      writeLS(KEYS.saved, [selected, ...list].slice(0, 20));
    }
    setSavedMsg("Itinerary saved — find it in your dashboard.");
    setTimeout(() => setSavedMsg(""), 3500);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[330px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card p-5">
          <p className="eyebrow text-teal">Route inputs</p>
          <div className="mt-4 grid gap-3">
            <div>
              <label className="label" htmlFor="pl-from">From</label>
              <input id="pl-from" list="planner-cities" value={from} onChange={(e) => setFrom(e.target.value)} className="field" />
            </div>
            <div>
              <label className="label" htmlFor="pl-to">To</label>
              <input id="pl-to" list="planner-cities" value={to} onChange={(e) => setTo(e.target.value)} className="field" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="pl-date">Date</label>
                <input id="pl-date" type="date" min={todayISO()} value={date} onChange={(e) => setDate(e.target.value)} className="field" />
              </div>
              <div>
                <label className="label" htmlFor="pl-pax">People</label>
                <input id="pl-pax" type="number" min={1} max={9} value={pax} onChange={(e) => setPax(Number(e.target.value))} className="field" />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="pl-budget">Budget (optional)</label>
              <input id="pl-budget" inputMode="numeric" placeholder="₹ total for the group" value={budget} onChange={(e) => setBudget(e.target.value.replace(/\D/g, ""))} className="field" />
            </div>
            <div>
              <span className="label">Preference</span>
              <div className="grid grid-cols-2 gap-2">
                {(["cost", "duration"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPreference(p)}
                    className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                      preference === p ? "border-teal bg-teal text-cream" : "border-ink/15 text-ink/55"
                    }`}
                  >
                    {p === "cost" ? "Cheapest" : "Fastest"}
                  </button>
                ))}
              </div>
            </div>
            <button type="button" onClick={build} className="btn-primary mt-1 w-full py-3">
              <Icon name="map" className="h-4 w-4" /> Build routes
            </button>
          </div>

          <div className="mt-5 rounded-2xl bg-sand/70 p-3.5 text-[11.5px] leading-relaxed text-ink/55">
            The planner checks hub cities between you and the destination, pairs compatible schedules and flags any
            transfer under 45 minutes. Confirmed schedules and estimated connections are labelled separately.
          </div>

          <datalist id="planner-cities">
            {CITIES.map((c) => <option key={c.name} value={c.name}>{c.state}</option>)}
          </datalist>
        </div>

        <div className="card mt-4 p-5">
          <p className="eyebrow text-ink/40">Alternatives</p>
          <div className="mt-3 space-y-2">
            {options.slice(0, 6).map((o, i) => (
              <button
                key={o.id}
                type="button"
                onClick={() => { setSelectedId(o.id); setSwap(null); }}
                className={`w-full rounded-2xl border p-3 text-left transition ${
                  selected?.id === o.id ? "border-teal bg-teal-soft/60" : "border-ink/10 hover:border-ink/25"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold">
                    {o.legs.map((l) => <ModeIcon key={l.id} mode={l.mode} className="h-3.5 w-3.5" />)}
                    {o.transfers === 0 ? "Direct" : `${o.transfers} transfer`}
                  </span>
                  <span className="text-[13px] font-extrabold">{inr(o.totalCost)}</span>
                </div>
                <p className="mt-1 text-[11px] text-ink/45">
                  Option {i + 1} · {fmtDuration(o.totalDurationMin)} · {o.difficulty}
                </p>
              </button>
            ))}
            {!options.length && <p className="text-[12px] text-ink/45">Build a route to see options.</p>}
          </div>
        </div>
      </aside>

      <div>
        {selected ? (
          <div className="space-y-5">
            <div className="card overflow-hidden">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink/10 p-5">
                <div>
                  <p className="eyebrow text-saffron-dark">Selected itinerary · {selected.difficulty}</p>
                  <h2 className="display mt-1 text-3xl">
                    {selected.from} <span className="text-ink/25">→</span> {selected.to}
                  </h2>
                  <p className="mt-1 text-[12.5px] text-ink/55">
                    {fmtDate(date, "long")} · {pax} traveller{pax > 1 ? "s" : ""} · {fmtDuration(selected.totalDurationMin)} door to door
                  </p>
                </div>
                <div className="text-right">
                  <p className="display text-3xl">{inr(selected.totalCost)}</p>
                  <p className="text-[11px] text-ink/45">{inr(selected.fare)} fares + {selected.transferEstimate ? inr(selected.transferEstimate) : "no"} transfers</p>
                </div>
              </div>

              <div className="p-5">
                <RouteSketch stops={[selected.legs[0].from, ...selected.legs.map((l) => l.to)]} className="h-[220px]" />
              </div>

              <div className="border-t border-ink/10 p-5">
                <p className="eyebrow text-ink/40">Legs & connections</p>
                <ol className="mt-4 space-y-3">
                  {selected.legs.map((leg, i) => (
                    <li key={leg.id} className="relative rounded-2xl border border-ink/10 bg-white p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sand text-teal">
                            <ModeIcon mode={leg.mode} className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-[13.5px] font-bold">
                              {leg.from} → {leg.to}
                            </p>
                            <p className="text-[11.5px] text-ink/50">
                              {fmtTime(leg.departISO)} – {fmtTime(leg.arriveISO)} · {fmtDuration(leg.durationMin)} · {modeLabel(leg.mode)}
                            </p>
                            <p className="mt-0.5 text-[11.5px] font-semibold text-ink/65">{leg.operator} <span className="font-normal text-ink/40">{leg.code}</span></p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-extrabold">{inr(leg.cabForWholeVehicle ? leg.price : leg.price * selected.pax)}</p>
                            <p className="text-[10px] text-ink/35">{leg.seats} seats left</p>
                          </div>
                          <button type="button" onClick={() => openSwap(i)} className="rounded-full border border-ink/15 px-2.5 py-1 text-[10.5px] font-bold text-teal hover:border-teal">
                            Replace
                          </button>
                        </div>
                      </div>

                      {i < selected.legs.length - 1 && (
                        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-sand/60 px-3 py-2 text-[11px] font-semibold text-ink/60">
                          <Icon name="clock" className="h-3.5 w-3.5 text-teal" />
                          {leg.waitMin ? `${fmtDuration(leg.waitMin)} in ${leg.to}` : "Connection"} · {leg.walkMin ? `${leg.walkMin} min walk between stops · ` : ""}
                          <span className={leg.connection === "estimated" ? "text-saffron-dark" : "text-teal"}>
                            {leg.connection === "estimated" ? "Estimated connection" : "Confirmed schedule"}
                          </span>
                        </div>
                      )}

                      {swap?.index === i && (
                        <div className="mt-3 rounded-2xl border border-teal/25 bg-teal-soft/50 p-3">
                          <p className="text-[10.5px] font-bold uppercase tracking-wide text-teal">Replace this leg</p>
                          <div className="mt-2 space-y-1.5">
                            {swap.offers.map((o) => (
                              <button
                                key={o.id}
                                type="button"
                                onClick={() => replaceLeg(i, o)}
                                className="flex w-full items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-left text-[11.5px] hover:bg-white/70"
                              >
                                <span>
                                  <span className="font-bold">{o.operator}</span>
                                  <span className="text-ink/45"> · {fmtTime(o.departISO)} – {fmtTime(o.arriveISO)} · {o.code}</span>
                                </span>
                                <span className="font-extrabold">{inr(o.price)}{o.cabForWholeVehicle ? "" : "/pp"}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ol>

                {selected.warning && (
                  <div className="mt-4 flex gap-2 rounded-2xl border border-saffron/30 bg-saffron/10 p-3.5 text-[12px] font-medium text-saffron-dark">
                    <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" /> {selected.warning}
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  <button type="button" onClick={saveItinerary} className="btn-ink">
                    <Icon name="pin" className="h-4 w-4" /> Save itinerary
                  </button>
                  <Link href={`/search?from=${encodeURIComponent(selected.from)}&to=${encodeURIComponent(selected.to)}&date=${date}&pax=${pax}`} className="btn-ghost">
                    Book each leg <Icon name="arrowRight" className="h-4 w-4" />
                  </Link>
                  <Link href="/safety" className="btn-ghost">
                    <Icon name="share" className="h-4 w-4" /> Share this journey
                  </Link>
                </div>
                {savedMsg && <p className="mt-2 text-[12px] font-semibold text-teal">{savedMsg}</p>}
                <p className="mt-3 text-[10.5px] leading-relaxed text-ink/35">
                  Legs are booked separately unless a combined-booking provider is available. Fares are revalidated
                  before each booking. Some connections are estimated, not operator-guaranteed.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { k: "Transfers", v: String(selected.transfers), note: selected.transfers === 0 ? "No change of vehicle" : "Buffers included" },
                { k: "Journey time", v: fmtDuration(selected.totalDurationMin), note: "Including waits" },
                { k: "Modes", v: String(selected.modes.length), note: selected.modes.map(modeLabel).join(" + ") },
              ].map((s) => (
                <div key={s.k} className="card p-4">
                  <p className="text-[10.5px] font-bold uppercase tracking-wide text-ink/35">{s.k}</p>
                  <p className="display mt-1 text-2xl">{s.v}</p>
                  <p className="text-[11px] text-ink/45">{s.note}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card p-10 text-center">
            <Icon name="map" className="mx-auto h-8 w-8 text-teal" />
            <p className="display mt-3 text-2xl">Build a route to begin.</p>
            <p className="mt-1 text-sm text-ink/50">Try Kaithal → Manali or Mumbai → Goa for a connected journey.</p>
          </div>
        )}
      </div>
    </div>
  );
}
