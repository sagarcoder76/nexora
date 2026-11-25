import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icons";
import { PLACES, groupById, placeBySlug } from "@/lib/places";
import { inr } from "@/lib/format";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PLACES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const place = placeBySlug(slug);
  if (!place) return { title: "Place not found" };
  return {
    title: `${place.name} — places to visit`,
    description: `${place.tagline} Attractions, best season and a daily budget for ${place.name}, ${place.region}.`,
  };
}

const TIERS = [
  { key: "budget" as const, label: "Backpacker", note: "Hostels, buses, local food" },
  { key: "mid" as const, label: "Comfort", note: "Good hotels, cabs, guided days" },
  { key: "luxury" as const, label: "Luxury", note: "Best stays, private transfers" },
];

export default async function PlacePage({ params }: Params) {
  const { slug } = await params;
  const place = placeBySlug(slug);
  if (!place) notFound();

  const group = groupById(place.group);
  const related = PLACES.filter((p) => p.group === place.group && p.slug !== place.slug)
    .concat(PLACES.filter((p) => p.group !== place.group))
    .slice(0, 3);

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-ink text-cream">
        <div className="absolute inset-0 -z-10">
          <img
            src={place.image}
            alt={`${place.name}, ${place.region}`}
            className="kenburns h-full w-full object-cover"
            fetchPriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
        </div>

        <div className="container-x pb-10 pt-8">
          <nav className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-cream/50">
            <Link href="/places" className="hover:text-saffron">Places to visit</Link>
            <span>/</span>
            <Link href={`/places?group=${place.group}`} className="hover:text-saffron">{group?.name}</Link>
            <span>/</span>
            <span className="text-cream/80">{place.name}</span>
          </nav>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
            <div className="anim-rise">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-saffron px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-ink">
                  {group?.name}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10.5px] font-semibold backdrop-blur">
                  <Icon name="star" className="h-3 w-3 fill-saffron text-saffron" /> {place.rating} · {place.reviews.toLocaleString("en-IN")} reviews
                </span>
              </div>
              <h1 className="display mt-4 text-[44px] leading-[0.98] sm:text-[62px]">{place.name}</h1>
              <p className="mt-2 flex items-center gap-1.5 text-[12.5px] font-semibold text-cream/60">
                <Icon name="pin" className="h-3.5 w-3.5 text-saffron" /> {place.region} · {place.country}
              </p>
              <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-cream/70">{place.tagline}</p>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-5 backdrop-blur-xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cream/45">Daily budget</p>
              <p className="display mt-1 text-3xl text-saffron">{inr(place.budget.budget)}<span className="text-[13px] font-sans font-semibold text-cream/50"> /person</span></p>
              <p className="mt-1 text-[11px] text-cream/50">
                {place.days}-day trip from {inr(place.budget.budget * place.days)} · {place.bestSeason}
              </p>
              <div className="mt-4 flex gap-2">
                <Link href={`/assistant?q=${encodeURIComponent(`Plan a ${place.days}-day trip to ${place.name} on a budget`)}`} className="btn-primary flex-1 text-[12px]">
                  Plan this trip
                </Link>
                <Link href="/routes" className="btn-ghost-light px-3 text-[12px]" aria-label="Compare routes">
                  <Icon name="compass" className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x pt-10">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <div>
            <p className="eyebrow text-teal">Why go</p>
            <p className="mt-2 text-[15px] leading-relaxed text-ink/70">{place.about}</p>

            <div className="mt-8">
              <p className="eyebrow text-saffron-dark">Attractions & things to do</p>
              <ol className="mt-4 grid gap-2 sm:grid-cols-2">
                {place.highlights.map((h, i) => (
                  <li key={h} className="flex items-start gap-3 rounded-2xl border border-ink/10 bg-white p-3.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-soft text-[10.5px] font-extrabold text-teal">
                      {i + 1}
                    </span>
                    <span className="text-[12.5px] font-semibold leading-snug text-ink/70">{h}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-8">
              <p className="eyebrow text-teal">Categories</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {place.subcategories.map((s) => (
                  <Link
                    key={s}
                    href={`/places?group=${place.group}#all-places`}
                    className="rounded-full border border-ink/12 bg-white px-3 py-1 text-[11px] font-semibold text-ink/60 transition hover:border-teal/40 hover:text-teal"
                  >
                    {s}
                  </Link>
                ))}
                {place.tags.map((t) => (
                  <span key={t} className="rounded-full bg-sand/70 px-3 py-1 text-[11px] font-semibold text-ink/50">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="card p-5">
              <p className="eyebrow text-ink/40">Budget for {place.days} days</p>
              <div className="mt-3 space-y-2">
                {TIERS.map((t) => (
                  <div key={t.key} className="rounded-2xl border border-ink/8 p-3">
                    <div className="flex items-baseline justify-between">
                      <p className="text-[12px] font-bold">{t.label}</p>
                      <p className="text-[13px] font-extrabold">{inr(place.budget[t.key] * place.days)}</p>
                    </div>
                    <p className="mt-0.5 text-[10.5px] text-ink/40">
                      {inr(place.budget[t.key])}/day · {t.note}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[10px] leading-relaxed text-ink/35">
                Excludes travel to the destination. Indicative prototype pricing, not a quote.
              </p>
            </div>

            <div className="rounded-3xl bg-ink p-5 text-cream">
              <p className="eyebrow text-saffron">Getting there</p>
              {place.fromCity ? (
                <>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-cream/65">
                    Compare complete journeys from <span className="font-bold text-cream">{place.fromCity}</span> to the
                    nearest gateway, with transfers included.
                  </p>
                  <Link href={`/routes?from=${encodeURIComponent(place.fromCity)}`} className="btn-ghost-light mt-4 w-full text-[12px]">
                    Routes from {place.fromCity} <Icon name="arrowRight" className="h-3.5 w-3.5" />
                  </Link>
                </>
              ) : (
                <>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-cream/65">
                    An international destination. Build a multi-modal plan and compare the long-haul leg before booking.
                  </p>
                  <Link href="/planner" className="btn-ghost-light mt-4 w-full text-[12px]">
                    Open the planner <Icon name="arrowRight" className="h-3.5 w-3.5" />
                  </Link>
                </>
              )}
              <div className="mt-4 space-y-1.5 border-t border-white/10 pt-3 text-[11.5px] text-cream/55">
                <p className="flex justify-between"><span>Best season</span><span className="font-semibold text-cream">{place.bestSeason}</span></p>
                <p className="flex justify-between"><span>Ideal length</span><span className="font-semibold text-cream">{place.days} days</span></p>
                <p className="flex justify-between"><span>From</span><span className="font-semibold text-cream">{inr(place.budget.budget)}/day</span></p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="container-x pt-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="display text-3xl">More places like this</h2>
          <Link href="/places" className="link-underline text-[12.5px] font-semibold">All places</Link>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {related.map((p) => (
            <Link
              key={p.slug}
              href={`/places/${p.slug}`}
              className="group relative h-44 overflow-hidden rounded-3xl border border-ink/10"
            >
              <img
                src={p.image}
                alt={p.name}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="display text-xl text-cream">{p.name}</p>
                <p className="text-[10.5px] text-cream/60">{inr(p.budget.budget)}/day · {p.region}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
