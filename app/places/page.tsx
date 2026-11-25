import type { Metadata } from "next";
import Link from "next/link";
import { Icon, type IconName } from "@/components/Icons";
import { PlacesExplorer } from "@/components/PlacesExplorer";
import { PLACES, PLACE_GROUPS, placesInGroup } from "@/lib/places";
import { inr } from "@/lib/format";

export const metadata: Metadata = {
  title: "Places to visit — India & worldwide",
  description:
    "Browse every kind of destination by category: mountains, water, spiritual, heritage, adventure, wildlife, cities, food, wellness and more — each with real photos, attractions and a daily budget.",
};

const HIGHLIGHTS = ["taj-mahal", "ladakh", "kerala-backwaters", "varanasi", "valley-of-flowers", "maldives"];

export default async function PlacesPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>;
}) {
  const params = await searchParams;
  const featured = PLACES.filter((p) => HIGHLIGHTS.includes(p.slug));
  const cheapest = [...PLACES].sort((a, b) => a.budget.budget - b.budget.budget)[0];

  return (
    <div className="pb-4">
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-ink text-cream">
        <div className="absolute inset-0 -z-10">
          <img
            src="/places/taj-mahal.jpg"
            alt="The Taj Mahal at first light"
            className="kenburns h-full w-full object-cover opacity-70"
            fetchPriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />
        </div>

        <div className="container-x py-14 sm:py-20">
          <div className="anim-rise max-w-2xl">
            <p className="eyebrow text-saffron">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-saffron" /> Places to visit
            </p>
            <h1 className="display mt-4 text-[42px] leading-[1.02] sm:text-[58px]">
              Every kind of place.
              <br />
              <span className="italic text-saffron">Budgeted before you go.</span>
            </h1>
            <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-cream/65">
              {PLACES.length} destinations across {PLACE_GROUPS.length} travel categories — mountains to marine parks.
              Real photographs, the attractions that matter, best season, and an honest daily budget for three travel
              styles.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              <Link href="#all-places" className="btn-primary">
                Browse all places <Icon name="arrowRight" className="h-4 w-4" />
              </Link>
              <Link href="/routes" className="btn-ghost-light">
                Cheapest routes <Icon name="arrowUpRight" className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-2 text-[11.5px] font-semibold text-cream/50">
              <span><span className="font-extrabold text-cream">{PLACES.length}</span> places</span>
              <span><span className="font-extrabold text-cream">{PLACE_GROUPS.length}</span> categories</span>
              <span>from <span className="font-extrabold text-saffron">{inr(cheapest.budget.budget)}</span>/day</span>
              <span>India & worldwide</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED STRIP */}
      <section className="container-x -mt-8">
        <div className="no-scrollbar flex snap-x gap-3 overflow-x-auto pb-2">
          {featured.map((p) => (
            <Link
              key={p.slug}
              href={`/places/${p.slug}`}
              className="group relative h-36 w-[210px] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/20 shadow-lift"
            >
              <img
                src={p.image}
                alt={p.name}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="display text-lg leading-tight text-cream">{p.name}</p>
                <p className="text-[10px] text-cream/60">{inr(p.budget.budget)}/day · {p.region}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* EXPLORER */}
      <section id="all-places" className="container-x scroll-mt-24 pt-10">
        <PlacesExplorer initialGroup={params.group} />
      </section>

      {/* CATEGORY DIRECTORY */}
      <section className="container-x pt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-teal">Master travel categories</p>
            <h2 className="display mt-2 text-3xl leading-tight sm:text-4xl">
              The whole taxonomy, <span className="italic text-teal">one hierarchy.</span>
            </h2>
          </div>
          <p className="max-w-sm text-[12.5px] leading-relaxed text-ink/50">
            Destination → subcategory → attraction. Pick a category to filter the directory above; every place is
            tagged with the subcategories it genuinely belongs to.
          </p>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PLACE_GROUPS.map((g) => {
            const count = placesInGroup(g.id).length;
            return (
              <div key={g.id} className="flex flex-col rounded-3xl border border-ink/10 bg-white p-5 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-soft text-teal">
                      <Icon name={g.icon as IconName} className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold">{g.name}</h3>
                      <p className="text-[10.5px] text-ink/40">{count} place{count === 1 ? "" : "s"}</p>
                    </div>
                  </div>
                  <Link
                    href={`/places?group=${g.id}#all-places`}
                    className="text-[10.5px] font-bold text-teal hover:underline"
                  >
                    View
                  </Link>
                </div>
                <p className="mt-2.5 text-[11.5px] leading-relaxed text-ink/45">{g.blurb}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {g.subcategories.slice(0, 8).map((s) => (
                    <span key={s} className="rounded-full bg-sand/70 px-2 py-0.5 text-[9.5px] font-semibold text-ink/50">
                      {s}
                    </span>
                  ))}
                  <span className="rounded-full px-1.5 py-0.5 text-[9.5px] font-bold text-ink/35">
                    +{g.subcategories.length - 8} more
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-[11px] leading-relaxed text-ink/35">
          Photographs are real location images courtesy of Wikimedia Commons contributors and are used here for
          demonstration. Budgets are indicative per-person daily estimates for this prototype.
        </p>
      </section>
    </div>
  );
}
