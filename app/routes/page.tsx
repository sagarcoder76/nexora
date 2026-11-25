import type { Metadata } from "next";
import Link from "next/link";
import { Icon, ModeIcon } from "@/components/Icons";
import { CITIES, cityByName } from "@/lib/data";
import { searchJourneys } from "@/lib/engine";
import { fmtDuration, fmtTime, inr, todayISO } from "@/lib/format";

export const metadata: Metadata = {
  title: "All routes & cheapest fares",
  description:
    "Every Nexora corridor in one place: the cheapest complete journey, expected duration and connection count from your city.",
};

function buildRows(origin: string, date: string) {
  return CITIES.filter((c) => c.name !== origin).flatMap((city) => {
    const result = searchJourneys({ from: origin, to: city.name, date, pax: 1 });
    const best = [...result.journeys].sort((a, b) => a.totalCost - b.totalCost)[0];
    return best ? [{ city, journey: best }] : [];
  });
}

export default async function RoutesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const origin = cityByName(params.from ?? "")?.name ?? "Delhi";
  const date = todayISO(4);
  const rows = buildRows(origin, date).sort((a, b) => a.journey.totalCost - b.journey.totalCost);
  const cheapest = rows[0];
  const priciest = rows[rows.length - 1];
  const average = rows.length ? Math.round(rows.reduce((sum, r) => sum + r.journey.totalCost, 0) / rows.length) : 0;

  return (
    <div className="container-x pb-10 pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-saffron-dark">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-saffron" /> Route directory
          </p>
          <h1 className="display mt-3 max-w-2xl text-4xl leading-[1.03] sm:text-5xl">
            Every route, ranked by <span className="italic text-teal">what you actually pay.</span>
          </h1>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-ink/60">
            Cheapest complete journey from {origin} to all {rows.length} indexed destinations — fare plus the local
            transfer, with the mode chain and duration shown. Pick a different starting city to rebuild the list.
          </p>
        </div>
        <Link href="/search" className="btn-ink">
          Compare a specific date <Icon name="arrowRight" className="h-4 w-4" />
        </Link>
      </div>

      <div className="no-scrollbar mt-7 flex gap-1.5 overflow-x-auto pb-1">
        {CITIES.map((c) => (
          <Link
            key={c.name}
            href={`/routes?from=${encodeURIComponent(c.name)}`}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition ${
              c.name === origin
                ? "border-ink bg-ink text-cream"
                : "border-ink/12 bg-white text-ink/60 hover:border-teal/40 hover:text-teal"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Cheapest from here", value: cheapest ? inr(cheapest.journey.totalCost) : "—", note: cheapest ? `${cheapest.city.name} · ${cheapest.journey.legs.map((l) => l.operator).join(" + ")}` : "" },
          { label: "Average complete journey", value: inr(average), note: "Fare + local transfer, one traveller" },
          { label: "Most expensive", value: priciest ? inr(priciest.journey.totalCost) : "—", note: priciest ? `${priciest.city.name} · longest haul` : "" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-ink/10 bg-white p-4 shadow-card">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-ink/40">{stat.label}</p>
            <p className="display mt-1.5 text-2xl">{stat.value}</p>
            <p className="mt-1 truncate text-[11px] text-ink/45">{stat.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(({ city, journey }, i) => (
          <Link
            key={city.name}
            href={`/search?from=${origin}&to=${city.name}&date=${date}&pax=1`}
            className="group relative overflow-hidden rounded-3xl border border-ink/10 bg-white p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:border-teal/35 hover:shadow-lift"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">
                  {origin} → {city.state}
                </p>
                <h2 className="display mt-1 text-2xl">{city.name}</h2>
              </div>
              <span className="rounded-full bg-teal-soft px-2 py-0.5 text-[10px] font-extrabold text-teal">#{i + 1}</span>
            </div>

            <div className="mt-4 flex items-center gap-1.5">
              {journey.legs.map((leg, idx) => (
                <span key={leg.id} className="flex items-center gap-1.5">
                  {idx > 0 && <Icon name="plus" className="h-2.5 w-2.5 text-ink/20" />}
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sand text-teal">
                    <ModeIcon mode={leg.mode} className="h-3.5 w-3.5" />
                  </span>
                </span>
              ))}
              <span className="ml-1 text-[11px] font-semibold text-ink/45">
                {fmtDuration(journey.totalDurationMin)} · {journey.transfers === 0 ? "direct" : `${journey.transfers} transfer`}
              </span>
            </div>

            <div className="mt-4 flex items-end justify-between border-t border-ink/8 pt-3">
              <p className="text-[10.5px] leading-relaxed text-ink/45">
                {fmtTime(journey.legs[0].departISO)} → {fmtTime(journey.legs[journey.legs.length - 1].arriveISO)}
                <br />
                {journey.legs.map((l) => l.operator.split(" ")[0]).join(" + ")}
              </p>
              <div className="text-right">
                <p className="display text-2xl leading-none">{inr(journey.totalCost)}</p>
                <p className="text-[9.5px] uppercase tracking-wide text-ink/35">complete</p>
              </div>
            </div>
            <span className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-bold text-teal">
              See every option <Icon name="arrowRight" className="h-3 w-3 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-ink/10 bg-sand/40 p-4 text-[11.5px] leading-relaxed text-ink/50">
        Ranked on complete-journey cost for one traveller on {date}. Every price includes the estimated last-mile
        transfer and is refreshed before booking. This prototype uses simulated provider inventory — no ticket is issued.
      </div>
    </div>
  );
}
