import Link from "next/link";
import { SearchForm } from "@/components/SearchForm";
import { JourneyResults } from "@/components/JourneyResults";
import { Icon } from "@/components/Icons";
import { searchJourneys } from "@/lib/engine";
import type { Mode, SearchQuery } from "@/lib/types";
import { fmtDate, todayISO } from "@/lib/format";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function param(v: string | string[] | undefined, fallback = "") {
  return Array.isArray(v) ? v[0] ?? fallback : v ?? fallback;
}

export const metadata = {
  title: "Compare transport",
  description: "Compare complete journey costs across flights, trains, buses and cabs.",
};

export default async function SearchPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const from = param(sp.from, "Kaithal");
  const to = param(sp.to, "Manali");
  const date = param(sp.date, todayISO(7));
  const pax = Number(param(sp.pax, "1")) || 1;
  const budget = Number(param(sp.budget, "")) || undefined;
  const returnDate = param(sp.return);
  const sortParam = param(sp.sort, "cost") as NonNullable<SearchQuery["sort"]>;
  const modesParam = param(sp.modes);
  const modes = modesParam ? (modesParam.split(",").filter(Boolean) as Mode[]) : undefined;

  const query: SearchQuery = { from, to, date, pax, budget, modes, sort: sortParam };
  const outbound = searchJourneys(query);
  const inbound = returnDate ? searchJourneys({ ...query, date: returnDate, from: to, to: from }) : null;

  return (
    <div>
      <section className="bg-ink pb-8 pt-10 text-cream">
        <div className="container-x">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-cream/40">
            <Link href="/" className="hover:text-saffron">Home</Link>
            <span>/</span>
            <span className="text-cream/70">Compare</span>
          </div>
          <h1 className="display mt-3 text-4xl sm:text-5xl">Every way there, side by side.</h1>
          <p className="mt-2 max-w-xl text-[13.5px] text-cream/55">
            Flights, trains, buses, cabs and connected combinations — ranked by complete journey cost. Provider
            availability revalidates at checkout.
          </p>
          <div className="mt-6">
            <SearchForm compact initial={{ from, to, date, pax, modes, budget }} />
          </div>
        </div>
      </section>

      <div className="container-x py-10">
        <JourneyResults result={outbound} title="Outbound" initialSort={sortParam} />

        {inbound && (
          <div className="mt-16 border-t border-ink/10 pt-12">
            <div className="mb-6 flex items-center gap-2 rounded-2xl border border-teal/20 bg-teal-soft/60 px-4 py-3 text-[12px] font-semibold text-teal">
              <Icon name="calendar" className="h-4 w-4" />
              Return journey · {fmtDate(returnDate, "long")} · booked separately or combined at checkout
            </div>
            <JourneyResults result={inbound} title="Return" />
          </div>
        )}

        <div className="mt-14 grid gap-4 rounded-3xl border border-ink/10 bg-white p-6 text-[12px] leading-relaxed text-ink/55 sm:grid-cols-3">
          <div>
            <p className="font-bold text-ink">How total cost is calculated</p>
            <p className="mt-1">Ticket fare × travellers, plus a last-mile transfer estimate. Cab fares are per vehicle.</p>
          </div>
          <div>
            <p className="font-bold text-ink">Confirmed vs estimated</p>
            <p className="mt-1">Scheduled provider departures are marked confirmed. Rebuilt connections that need a wait are marked estimated.</p>
          </div>
          <div>
            <p className="font-bold text-ink">No scraping, no pretend bookings</p>
            <p className="mt-1">Production requires authorised provider agreements. Direct booking is enabled provider by provider; otherwise Nexora links out.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
