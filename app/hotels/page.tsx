import Link from "next/link";
import { HotelBrowser } from "@/components/HotelBrowser";
import { HOTELS } from "@/lib/data";
import { Icon } from "@/components/Icons";

export const metadata = {
  title: "Stays",
  description: "Hotels, hostels, homestays and resorts across India with verified listings and direct requests.",
};

type Props = { searchParams: Promise<{ city?: string }> };

export default async function HotelsPage({ searchParams }: Props) {
  const sp = await searchParams;
  return (
    <div>
      <section className="relative overflow-hidden bg-ink pb-10 pt-12 text-cream">
        <img src="/images/manali.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
        <div className="container-x relative">
          <p className="eyebrow text-saffron">Stays</p>
          <h1 className="display mt-3 max-w-2xl text-4xl leading-[1.03] sm:text-6xl">
            Rooms that fit the route, not just the map.
          </h1>
          <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-cream/60">
            Hotels, hostels, homestays and resorts — priced per night, verified by the Nexora team, with cancellation
            terms visible before you decide.
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-[11.5px] text-cream/50">
            <span className="inline-flex items-center gap-1.5"><Icon name="check" className="h-3.5 w-3.5 text-saffron" /> Verified information</span>
            <span className="inline-flex items-center gap-1.5"><Icon name="check" className="h-3.5 w-3.5 text-saffron" /> Free-cancellation flags</span>
            <span className="inline-flex items-center gap-1.5"><Icon name="check" className="h-3.5 w-3.5 text-saffron" /> Reviews from completed stays</span>
          </div>
        </div>
      </section>

      <div className="container-x py-10">
        <HotelBrowser hotels={HOTELS} initialCity={sp.city ?? ""} />
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-ink/10 bg-white p-6">
          <div>
            <p className="display text-2xl">Own a property?</p>
            <p className="mt-1 max-w-lg text-[12.5px] leading-relaxed text-ink/55">
              Register your hotel, homestay or guesthouse, add rooms and availability, and manage reservations from
              the Nexora partner dashboard. Verification is manual and document-based.
            </p>
          </div>
          <Link href="/signup" className="btn-ink">Register a property</Link>
        </div>
      </div>
    </div>
  );
}
