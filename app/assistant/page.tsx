"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buildAssistantPlan, type AssistantPlan } from "@/lib/engine";
import { fmtDuration, fmtTime, inr, fmtDate } from "@/lib/format";
import { Icon, ModeIcon } from "@/components/Icons";
import { RouteSketch } from "@/components/RouteSketch";

const EXAMPLES = [
  "I want to travel from Kaithal to Manali for 4 days. My total budget is ₹8,000. I prefer comfortable and affordable transportation.",
  "Comfortable weekend from Mumbai to Goa for two, budget ₹18,000.",
  "Three days in Jaipur with a local guide, ₹12,000.",
];

export default function AssistantPage() {
  const [prompt, setPrompt] = useState(EXAMPLES[0]);
  const [plan, setPlan] = useState<AssistantPlan | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setPrompt(q);
  }, []);

  function run(text = prompt) {
    setLoading(true);
    window.setTimeout(() => {
      setPlan(buildAssistantPlan(text));
      setLoading(false);
    }, 450);
  }

  return (
    <div>
      <section className="bg-ink pb-10 pt-12 text-cream">
        <div className="container-x">
          <p className="eyebrow text-saffron"><Icon name="sparkles" className="h-3.5 w-3.5" /> AI trip planner</p>
          <h1 className="display mt-3 max-w-3xl text-4xl leading-[1.02] sm:text-6xl">
            Describe the trip.
            <br />
            Get a plan that <span className="italic text-saffron">adds up.</span>
          </h1>
          <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-cream/60">
            The planner reads real routes, stays and guides from Nexora's own inventory, then builds a day-wise
            itinerary and a line-item budget. No invented prices.
          </p>
        </div>
      </section>

      <div className="container-x py-10">
        <div className="grid gap-6 lg:grid-cols-[420px_1fr] lg:items-start">
          <div className="card p-5 lg:sticky lg:top-24">
            <label className="label" htmlFor="prompt">Tell Nexora about your trip</label>
            <textarea
              id="prompt"
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="field resize-none text-[13px] leading-relaxed"
              placeholder="From where, to where, how many days, what budget, what pace?"
            />
            <button type="button" onClick={() => run()} disabled={loading} className="btn-primary mt-3 w-full py-3">
              <Icon name="sparkles" className="h-4 w-4" />
              {loading ? "Building your plan…" : "Build my plan"}
            </button>

            <p className="eyebrow mt-5 text-ink/40">Try one</p>
            <div className="mt-2 space-y-1.5">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => { setPrompt(ex); run(ex); }}
                  className="w-full rounded-xl border border-ink/10 p-2.5 text-left text-[11.5px] leading-relaxed text-ink/55 transition hover:border-teal/40 hover:text-ink"
                >
                  {ex}
                </button>
              ))}
            </div>
            <p className="mt-4 text-[10px] leading-relaxed text-ink/35">
              Rule-based planner over demo inventory. In production this calls an LLM with tool calling, and every
              price and availability check is retrieved live before it is shown.
            </p>
          </div>

          <div>
            {!plan ? (
              <div className="space-y-4">
                <div className="card flex flex-col items-center justify-center p-12 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-soft text-teal">
                    <Icon name="sparkles" className="h-6 w-6" />
                  </div>
                  <p className="display mt-4 text-2xl">Your plan will appear here.</p>
                  <p className="mt-1 max-w-sm text-[12.5px] leading-relaxed text-ink/50">
                    Transport, a place to stay, a verified guide, a day-by-day outline and a budget that shows exactly
                    where the money goes.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {["Retrieves live routes", "Prices the whole trip", "Flags what it can't verify"].map((t) => (
                    <div key={t} className="rounded-2xl border border-ink/10 bg-white p-4 text-[11.5px] font-semibold text-ink/55">
                      <Icon name="check" className="mb-2 h-4 w-4 text-teal" /> {t}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`rounded-3xl p-6 ${plan.withinBudget ? "bg-ink text-cream" : "bg-saffron/15 text-ink"}`}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className={`eyebrow ${plan.withinBudget ? "text-saffron" : "text-saffron-dark"}`}>
                        {plan.withinBudget ? "Within budget" : "Over budget — adjusted options below"}
                      </p>
                      <h2 className="display mt-1 text-3xl">
                        {plan.from} → {plan.to}
                      </h2>
                      <p className={`mt-1 text-[12.5px] ${plan.withinBudget ? "text-cream/55" : "text-ink/60"}`}>
                        {plan.days} days · {Math.max(1, plan.days - 1)} nights · budget {inr(plan.budget)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="display text-4xl">{inr(plan.total)}</p>
                      <p className={`text-[10.5px] uppercase tracking-wide ${plan.withinBudget ? "text-cream/40" : "text-ink/45"}`}>estimated total</p>
                    </div>
                  </div>
                  <div className={`mt-4 h-2 overflow-hidden rounded-full ${plan.withinBudget ? "bg-white/10" : "bg-ink/10"}`}>
                    <div
                      className={`h-full rounded-full ${plan.withinBudget ? "bg-saffron" : "bg-saffron-dark"}`}
                      style={{ width: `${Math.min(100, (plan.total / Math.max(plan.budget, 1)) * 100)}%` }}
                    />
                  </div>
                  <p className={`mt-1.5 text-[10.5px] ${plan.withinBudget ? "text-cream/40" : "text-ink/45"}`}>
                    {plan.withinBudget
                      ? `${inr(plan.budget - plan.total)} left as spare budget`
                      : `${inr(plan.total - plan.budget)} over your budget`}
                  </p>
                </div>

                {plan.transport && (
                  <div className="card p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="eyebrow text-teal">Transport</p>
                      <span className="chip bg-teal-soft text-teal">{plan.transport.estimated ? "Estimated connection" : "Confirmed schedule"}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[14px] font-extrabold">
                          {plan.transport.legs.map((l) => l.operator.split(" ")[0]).join(" + ")}
                        </p>
                        <p className="text-[11.5px] text-ink/50">
                          {fmtTime(plan.transport.legs[0].departISO)} →{" "}
                          {fmtTime(plan.transport.legs[plan.transport.legs.length - 1].arriveISO)} ·{" "}
                          {fmtDuration(plan.transport.totalDurationMin)} · {plan.transport.transfers} transfer
                          {plan.transport.transfers === 1 ? "" : "s"}
                        </p>
                      </div>
                      <p className="text-right text-lg font-extrabold">{inr(plan.transport.totalCost)}<span className="block text-[10px] font-normal text-ink/40">per person, one way</span></p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {plan.transport.legs.map((l) => (
                        <span key={l.id} className="inline-flex items-center gap-1 rounded-full bg-sand px-2.5 py-1 text-[10.5px] font-semibold text-ink/60">
                          <ModeIcon mode={l.mode} className="h-3 w-3" /> {l.from} → {l.to}
                        </span>
                      ))}
                    </div>
                    <RouteSketch stops={plan.transport.legs.map((l) => l.from).concat(plan.transport.legs[plan.transport.legs.length - 1].to)} compact className="mt-3 h-[140px]" />
                    <Link href={`/search?from=${plan.from}&to=${plan.to}`} className="mt-3 inline-flex text-[11.5px] font-bold text-teal hover:underline">
                      See all comparison options →
                    </Link>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  {plan.hotel && (
                    <Link href={`/hotels/${plan.hotel.id}`} className="card overflow-hidden transition hover:border-teal/40">
                      <img src={plan.hotel.image} alt={plan.hotel.name} className="h-32 w-full object-cover" />
                      <div className="p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-teal">Stay · {plan.hotel.city}</p>
                        <p className="mt-0.5 text-[13px] font-extrabold">{plan.hotel.name}</p>
                        <p className="text-[11px] text-ink/45">{plan.hotel.type} · {plan.hotel.rating}★ · {inr(plan.hotel.price)}/night</p>
                      </div>
                    </Link>
                  )}
                  {plan.guide && (
                    <Link href={`/guides/${plan.guide.id}`} className="card p-4 transition hover:border-teal/40">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-teal">Local guide</p>
                      <div className="mt-2 flex items-center gap-2.5">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal text-xs font-extrabold text-cream">{plan.guide.initials}</span>
                        <div>
                          <p className="text-[13px] font-extrabold">{plan.guide.name}</p>
                          <p className="text-[10.5px] text-ink/45">{plan.guide.languages.join(", ")}</p>
                        </div>
                      </div>
                      <p className="mt-2 text-[11px] leading-relaxed text-ink/50">{plan.guide.categories.join(" · ")}</p>
                      <p className="mt-2 text-[12px] font-extrabold">{inr(plan.guide.pricePerDay)}<span className="font-normal text-ink/40"> / day</span></p>
                    </Link>
                  )}
                </div>

                <div className="card p-5">
                  <p className="eyebrow text-teal">Day by day</p>
                  <ol className="mt-3 space-y-3">
                    {plan.daysPlan.map((d) => (
                      <li key={d.day} className="flex gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sand text-[11px] font-extrabold text-teal">{d.day}</span>
                        <div className="flex-1 border-b border-ink/8 pb-3">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <p className="text-[13px] font-bold">{d.title}</p>
                            <p className="text-[11px] font-semibold text-ink/45">{inr(d.cost)}</p>
                          </div>
                          <ul className="mt-1 space-y-0.5">
                            {d.items.map((i) => (
                              <li key={i} className="text-[11.5px] text-ink/50">· {i}</li>
                            ))}
                          </ul>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="card p-5">
                  <p className="eyebrow text-teal">Budget, line by line</p>
                  <div className="mt-3 space-y-2">
                    {plan.budgetLines.map((l) => (
                      <div key={l.label} className="flex items-start justify-between gap-4 text-[12px]">
                        <div>
                          <p className="font-semibold">{l.label}</p>
                          <p className="text-[10.5px] text-ink/40">{l.note}</p>
                        </div>
                        <p className="shrink-0 font-bold">{inr(l.amount)}</p>
                      </div>
                    ))}
                    <div className="flex justify-between border-t border-ink/10 pt-2 text-base font-extrabold">
                      <span>Estimated total</span><span>{inr(plan.total)}</span>
                    </div>
                  </div>
                  <div className="mt-3 rounded-xl bg-sand/60 p-3 text-[10.5px] leading-relaxed text-ink/45">
                    {plan.notes.map((n) => <p key={n} className="mt-0.5">· {n}</p>)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
