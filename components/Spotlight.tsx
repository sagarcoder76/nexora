"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CITIES } from "@/lib/data";
import { roadDistance, searchJourneys } from "@/lib/engine";
import { fmtDuration, fmtTime, inr, modeLabel, todayISO } from "@/lib/format";
import { Icon, ModeIcon, type IconName } from "./Icons";

type FeatureId = "cab" | "live" | "budget" | "routes";

const FEATURES: { id: FeatureId; label: string; hint: string; icon: IconName }[] = [
  { id: "cab", label: "Shared cab", hint: "Split an intercity cab, seat by seat", icon: "cab" },
  { id: "live", label: "Live to parents", hint: "A revocable link with a real ETA", icon: "shield" },
  { id: "budget", label: "Low-budget routes", hint: "The cheapest complete journey, instantly", icon: "wallet" },
  { id: "routes", label: "Every route", hint: "All city pairs in one directory", icon: "compass" },
];

const CAB_ROUTES: [string, string][] = [
  ["Delhi", "Jaipur"],
  ["Chandigarh", "Manali"],
  ["Mumbai", "Pune"],
  ["Bengaluru", "Hyderabad"],
  ["Jaipur", "Udaipur"],
];

const DIRECTORY: [string, string][] = [
  ["Kaithal", "Manali"],
  ["Delhi", "Jaipur"],
  ["Delhi", "Rishikesh"],
  ["Mumbai", "Goa"],
  ["Mumbai", "Pune"],
  ["Chandigarh", "Manali"],
  ["Bengaluru", "Hyderabad"],
  ["Kolkata", "Varanasi"],
  ["Jaipur", "Udaipur"],
];

function cheapestCab(from: string, to: string, date: string) {
  const result = searchJourneys({ from, to, date, pax: 1, modes: ["cab"] });
  const best = [...result.journeys].sort((a, b) => a.totalCost - b.totalCost)[0];
  return best?.totalCost ?? Math.round(1250 + roadDistance(from, to) * 11.6);
}

export function Spotlight() {
  const [active, setActive] = useState<FeatureId>("cab");
  const date = todayISO(3);

  return (
    <section id="features" className="container-x scroll-mt-24 pt-16 sm:pt-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="eyebrow text-saffron-dark">
            <span className="h-1.5 w-1.5 rounded-full bg-saffron" /> Built for how people actually travel
          </p>
          <h2 className="display mt-3 text-4xl leading-[1.03] sm:text-5xl">
            Share the cab. Share the trip.
            <br />
            <span className="italic text-teal">Find the fare that fits.</span>
          </h2>
        </div>
        <p className="max-w-xs text-[13px] leading-relaxed text-ink/55">
          Four things travellers ask for first — now working, not just promised. Tap a feature to try it with live
          demo fares.
        </p>
      </div>

      <div className="mt-9 grid gap-4 lg:grid-cols-[330px_1fr]">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {FEATURES.map((f) => {
            const isActive = active === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setActive(f.id)}
                aria-pressed={isActive}
                className={`group flex items-center gap-3 rounded-2xl border p-4 text-left transition duration-300 ${
                  isActive
                    ? "border-ink bg-ink text-cream shadow-lift"
                    : "border-ink/10 bg-white text-ink hover:-translate-y-0.5 hover:border-teal/40"
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                    isActive ? "bg-saffron text-ink" : "bg-teal-soft text-teal"
                  }`}
                >
                  <Icon name={f.icon} className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold">{f.label}</span>
                  <span className={`mt-0.5 block text-[11.5px] leading-snug ${isActive ? "text-cream/55" : "text-ink/45"}`}>
                    {f.hint}
                  </span>
                </span>
                <Icon
                  name="arrowRight"
                  className={`ml-auto h-4 w-4 shrink-0 transition ${isActive ? "text-saffron" : "text-ink/20 group-hover:translate-x-0.5 group-hover:text-teal"}`}
                />
              </button>
            );
          })}
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-card">
          <div className="absolute -right-14 -top-16 h-56 w-56 rounded-full bg-teal-soft/70 blur-2xl" aria-hidden />
          <div className="relative p-5 sm:p-7">
            {active === "cab" && <CabPanel date={date} />}
            {active === "live" && <LivePanel />}
            {active === "budget" && <BudgetPanel date={date} />}
            {active === "routes" && <RoutesPanel date={date} />}
          </div>
        </div>
      </div>
    </section>
  );
}

function PanelHeader({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="eyebrow text-teal">{kicker}</p>
        <h3 className="display mt-2 text-2xl leading-tight sm:text-[28px]">{title}</h3>
      </div>
      <span className="chip border-teal/20 bg-teal-soft text-[10.5px] text-teal">
        <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-teal" /> Demo fares
      </span>
    </div>
  );
}

function CabPanel({ date }: { date: string }) {
  const [route, setRoute] = useState("0");
  const [travellers, setTravellers] = useState(3);
  const [from, to] = CAB_ROUTES[Number(route)] ?? CAB_ROUTES[0];
  const total = useMemo(() => cheapestCab(from, to, date), [from, to, date]);
  const perSeat = Math.round(total / travellers);
  const savedEach = total - perSeat;
  const km = roadDistance(from, to);

  return (
    <div className="space-y-5">
      <PanelHeader kicker="Shared cab" title="Four seats. One fair split." />

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
        <div>
          <label className="label" htmlFor="cab-route">Popular intercity leg</label>
          <select id="cab-route" value={route} onChange={(e) => setRoute(e.target.value)} className="field">
            {CAB_ROUTES.map(([a, b], i) => (
              <option key={`${a}-${b}`} value={String(i)}>{a} → {b}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="cab-seats">Travelling together · {travellers}</label>
          <input
            id="cab-seats"
            type="range"
            min={2}
            max={4}
            step={1}
            value={travellers}
            onChange={(e) => setTravellers(Number(e.target.value))}
            className="mt-3 w-full accent-teal"
          />
          <p className="mt-1 text-[11px] text-ink/40">Verified AC sedan · {km} km · door to door</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1.1fr_1fr]">
        <div className="rounded-2xl bg-ink p-5 text-cream">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-cream/45">Your share</p>
          <p className="display mt-1 text-4xl leading-none text-saffron">{inr(perSeat)}</p>
          <p className="mt-1.5 text-[11.5px] text-cream/50">
            of {inr(total)} total · {fmtDuration(Math.round(18 + (km / 52) * 60))} drive
          </p>
          <div className="mt-4 flex items-center gap-2">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-[10px] font-bold transition ${
                  i < travellers
                    ? "border-saffron/60 bg-saffron/15 text-saffron"
                    : "border-dashed border-white/25 text-cream/30"
                }`}
              >
                {i === 0 ? "You" : i < travellers ? "•" : "+"}
              </span>
            ))}
            <span className="ml-1 text-[10.5px] leading-tight text-cream/45">
              {travellers === 4 ? "Cab full" : `${4 - travellers} seat${4 - travellers > 1 ? "s" : ""} open to co-travellers`}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-teal/20 bg-teal-soft/60 p-5">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-teal/70">You save</p>
          <p className="display mt-1 text-3xl leading-none text-teal">{inr(savedEach)}</p>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-teal/80">
            each, versus booking the whole cab alone. Tolls, parking and the transfer estimate are already inside the
            fare — no surprise at drop-off.
          </p>
          <Link href={`/search?from=${from}&to=${to}&date=${date}&pax=1&modes=cab`} className="btn-ink mt-4 w-full text-[12.5px]">
            Search this leg <Icon name="arrowRight" className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <p className="flex items-start gap-2 text-[11px] leading-relaxed text-ink/45">
        <Icon name="shield" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" />
        Co-travellers are matched only after identity verification, and every seat can be cancelled before pickup.
        Prototype fares are simulated.
      </p>
    </div>
  );
}

const LIVE_STOPS = ["Kaithal", "Chandigarh", "Mandi", "Manali"];

function LivePanel() {
  const [progress, setProgress] = useState(0.42);
  const [live, setLive] = useState(true);

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      setProgress((p) => (p >= 0.96 ? 0.06 : p + 0.014));
    }, 800);
    return () => clearInterval(id);
  }, [live]);

  const totalMin = 306;
  const leftMin = Math.max(8, Math.round(totalMin * (1 - progress)));
  const stopIndex = Math.min(LIVE_STOPS.length - 1, Math.floor(progress * LIVE_STOPS.length));

  return (
    <div className="space-y-4">
      <PanelHeader kicker="Live location for parents" title="They watch the journey. Not you." />

      <div className="overflow-hidden rounded-2xl bg-ink p-5 text-cream">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-saffron/15 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-saffron">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-saffron" /> {live ? "Live now" : "Paused"}
          </span>
          <span className="text-[10.5px] font-semibold text-cream/40">Link expires in 5h 40m</span>
        </div>

        <div className="mt-5 flex items-baseline justify-between gap-3">
          <p className="display text-2xl">
            {LIVE_STOPS[stopIndex]} <span className="text-cream/30">→</span> Manali
          </p>
          <p className="text-right text-[11px] text-cream/45">
            ETA <span className="block text-sm font-bold text-cream">{fmtDuration(leftMin)}</span>
          </p>
        </div>

        <div className="relative mt-6 h-1.5 rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal via-moss to-saffron transition-[width] duration-700 ease-linear"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
          <span
            className="absolute top-1/2 flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-saffron shadow-[0_0_0_5px_rgba(255,107,44,0.2)] transition-[left] duration-700 ease-linear"
            style={{ left: `${Math.max(3, Math.min(97, progress * 100))}%` }}
          >
            <Icon name="cab" className="h-2.5 w-2.5 text-ink" />
          </span>
        </div>
        <div className="mt-2 flex justify-between text-[10px] font-semibold text-cream/40">
          {LIVE_STOPS.map((s) => (
            <span key={s} className={s === LIVE_STOPS[stopIndex] ? "text-saffron" : ""}>{s}</span>
          ))}
        </div>

        <div className="mt-5 grid gap-2 border-t border-white/10 pt-4 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            {["M", "D"].map((initial, i) => (
              <span key={initial} className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-extrabold ${i === 0 ? "bg-teal-soft text-teal" : "bg-saffron text-ink"}`}>
                {initial}
              </span>
            ))}
            <div className="text-[11px] leading-tight">
              <p className="font-bold">Mom & Dad are watching</p>
              <p className="text-cream/40">2 trusted contacts · verified</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-cream/45 sm:justify-end">
            <Icon name="pin" className="h-3.5 w-3.5 text-teal" /> Location shared at 32.1°N, 76.5°E
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setLive((v) => !v)} className="btn-ink text-[12.5px]">
          <Icon name={live ? "clock" : "bolt"} className="h-3.5 w-3.5" /> {live ? "Pause sharing" : "Resume sharing"}
        </button>
        <button type="button" onClick={() => setProgress(0.08)} className="btn-ghost text-[12.5px]">
          Reset trip
        </button>
        <Link href="/safety" className="ml-auto inline-flex items-center gap-1 text-[12px] font-bold text-teal hover:underline">
          Set up for real <Icon name="arrowRight" className="h-3.5 w-3.5" />
        </Link>
      </div>

      <p className="text-[11px] leading-relaxed text-ink/45">
        Sharing is off by default, visibly on while active, and revocable in one tap. Contacts see progress and ETA —
        never a permanent location history. No emergency service is dispatched from this prototype.
      </p>
    </div>
  );
}

function BudgetPanel({ date }: { date: string }) {
  const [from, setFrom] = useState("Kaithal");
  const [to, setTo] = useState("Manali");
  const [budget, setBudget] = useState(3000);
  const [pax, setPax] = useState(1);

  const result = useMemo(() => {
    if (from === to) return null;
    return searchJourneys({ from, to, date, pax });
  }, [from, to, date, pax]);

  const ranked = useMemo(
    () => (result ? [...result.journeys].sort((a, b) => a.totalCost - b.totalCost) : []),
    [result],
  );
  const best = ranked[0];
  const inBudget = ranked.filter((j) => j.totalCost <= budget);
  const ratio = best ? Math.min(100, Math.round((best.totalCost / Math.max(budget, 1)) * 100)) : 0;

  return (
    <div className="space-y-4">
      <PanelHeader kicker="Low-budget route finder" title="Tell it your budget. It builds the trip." />

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-1">
          <label className="label" htmlFor="b-from">From</label>
          <select id="b-from" value={from} onChange={(e) => setFrom(e.target.value)} className="field px-2.5">
            {CITIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div className="sm:col-span-1">
          <label className="label" htmlFor="b-to">To</label>
          <select id="b-to" value={to} onChange={(e) => setTo(e.target.value)} className="field px-2.5">
            {CITIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="b-budget">Budget / person</label>
          <input
            id="b-budget"
            type="number"
            min={500}
            step={100}
            value={budget}
            onChange={(e) => setBudget(Math.max(500, Number(e.target.value) || 500))}
            className="field"
          />
        </div>
        <div>
          <label className="label" htmlFor="b-pax">People</label>
          <input
            id="b-pax"
            type="number"
            min={1}
            max={9}
            value={pax}
            onChange={(e) => setPax(Math.min(9, Math.max(1, Number(e.target.value) || 1)))}
            className="field"
          />
        </div>
      </div>

      {from === to ? (
        <p className="rounded-2xl border border-saffron/30 bg-saffron/10 p-4 text-[12.5px] font-semibold text-saffron-dark">
          Pick a different destination to see journeys.
        </p>
      ) : !best ? (
        <p className="rounded-2xl border border-ink/10 p-4 text-[12.5px] text-ink/55">No route data for this pair yet.</p>
      ) : (
        <>
          <div className="rounded-2xl border border-ink/10 bg-sand/40 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink/40">Cheapest complete journey</p>
                <p className="display mt-1 text-3xl leading-none">{inr(best.totalCost)}</p>
                <p className="mt-1 text-[11.5px] text-ink/50">
                  for {pax} · {inr(best.totalCost / pax)} each · {fmtDuration(best.totalDurationMin)}
                </p>
              </div>
              <span className={`chip text-[10.5px] ${best.totalCost <= budget ? "border-teal/20 bg-teal-soft text-teal" : "border-saffron/30 bg-saffron/10 text-saffron-dark"}`}>
                {best.totalCost <= budget ? `${inr(budget - best.totalCost)} under budget` : `${inr(best.totalCost - budget)} over budget`}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-1.5">
              {best.legs.map((leg, i) => (
                <span key={leg.id} className="flex items-center gap-1.5">
                  {i > 0 && <Icon name="plus" className="h-3 w-3 text-ink/25" />}
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10.5px] font-bold text-ink/70">
                    <ModeIcon mode={leg.mode} className="h-3 w-3 text-teal" /> {leg.operator.split(" ")[0]}
                  </span>
                </span>
              ))}
              <span className="ml-auto text-[10.5px] font-semibold text-ink/40">
                {fmtTime(best.legs[0].departISO)} → {fmtTime(best.legs[best.legs.length - 1].arriveISO)}
              </span>
            </div>

            <div className="mt-4">
              <div className="h-2 overflow-hidden rounded-full bg-white">
                <div
                  className={`h-full rounded-full transition-[width] duration-500 ${best.totalCost <= budget ? "bg-teal" : "bg-saffron"}`}
                  style={{ width: `${ratio}%` }}
                />
              </div>
              <div className="mt-1.5 flex justify-between text-[10px] font-semibold text-ink/40">
                <span>{inr(best.totalCost)} spent</span>
                <span>{inr(budget)} budget</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-ink/40">
              {inBudget.length} option{inBudget.length === 1 ? "" : "s"} inside your budget
            </p>
            {(inBudget.length ? inBudget : ranked).slice(0, 2).map((j) => (
              <Link
                key={j.id}
                href={`/search?from=${from}&to=${to}&date=${date}&pax=${pax}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-ink/10 px-3 py-2 text-[12px] transition hover:border-teal/40 hover:bg-teal-soft/40"
              >
                <span className="flex min-w-0 items-center gap-1.5 truncate text-ink/60">
                  {j.legs.map((l) => (
                    <ModeIcon key={l.id} mode={l.mode} className="h-3.5 w-3.5 text-teal" />
                  ))}
                  <span className="truncate">{j.legs.map((l) => l.operator).join(" + ")}</span>
                </span>
                <span className="shrink-0 font-extrabold">{inr(j.totalCost)}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/search?from=${from}&to=${to}&date=${date}&pax=${pax}&budget=${budget}`} className="btn-primary text-[12.5px]">
          See all options <Icon name="arrowRight" className="h-3.5 w-3.5" />
        </Link>
        <span className="text-[11px] text-ink/40">Totals include the transfer estimate, not just the ticket.</span>
      </div>
    </div>
  );
}

function RoutesPanel({ date }: { date: string }) {
  const rows = useMemo(
    () =>
      DIRECTORY.flatMap(([from, to]) => {
        const result = searchJourneys({ from, to, date, pax: 1 });
        const best = [...result.journeys].sort((a, b) => a.totalCost - b.totalCost)[0];
        return best ? [{ from, to, journey: best }] : [];
      }).sort((a, b) => a.journey.totalCost - b.journey.totalCost),
    [date],
  );

  return (
    <div className="space-y-4">
      <PanelHeader kicker="All travelling routes" title="Every corridor, cheapest fare first." />

      <div className="divide-y divide-ink/8 overflow-hidden rounded-2xl border border-ink/10">
        {rows.map((row) => (
          <Link
            key={`${row.from}-${row.to}`}
            href={`/search?from=${row.from}&to=${row.to}&date=${date}&pax=1`}
            className="group flex items-center gap-3 px-4 py-2.5 transition hover:bg-sand/50"
          >
            <span className="flex w-[130px] shrink-0 items-center gap-1.5 text-[12.5px] font-bold sm:w-[170px]">
              {row.from} <Icon name="arrowRight" className="h-3 w-3 text-ink/25" /> {row.to}
            </span>
            <span className="hidden min-w-0 flex-1 items-center gap-1 sm:flex">
              {row.journey.legs.map((l) => (
                <ModeIcon key={l.id} mode={l.mode} className="h-3.5 w-3.5 text-teal" />
              ))}
              <span className="ml-1 truncate text-[11px] text-ink/40">
                {fmtDuration(row.journey.totalDurationMin)} · {row.journey.transfers === 0 ? "direct" : `${row.journey.transfers} transfer`}
              </span>
            </span>
            <span className="ml-auto text-right">
              <span className="block text-[13px] font-extrabold">{inr(row.journey.totalCost)}</span>
              <span className="block text-[9.5px] uppercase tracking-wide text-ink/35">from</span>
            </span>
            <Icon name="arrowUpRight" className="h-3.5 w-3.5 shrink-0 text-ink/20 transition group-hover:text-teal" />
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link href="/routes" className="btn-ink text-[12.5px]">
          Open the route directory <Icon name="arrowRight" className="h-3.5 w-3.5" />
        </Link>
        <span className="text-[11px] text-ink/40">
          {CITIES.length} cities · every pair compared by complete journey cost
        </span>
      </div>
    </div>
  );
}
