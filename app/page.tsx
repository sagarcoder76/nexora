import Link from "next/link";
import { SearchForm } from "@/components/SearchForm";
import { Spotlight } from "@/components/Spotlight";
import { Reveal } from "@/components/Reveal";
import { Icon, ModeIcon } from "@/components/Icons";
import { DESTINATIONS, GUIDES, CITIES } from "@/lib/data";
import { PLACES, PLACE_GROUPS } from "@/lib/places";
import { searchJourneys } from "@/lib/engine";
import { todayISO, fmtDuration, fmtTime, inr } from "@/lib/format";

const modules = [
  {
    href: "/search",
    icon: "compass" as const,
    kicker: "Compare",
    title: "Every mode, one ranking",
    copy: "Flights, trains, buses and cabs normalised into complete journey costs — sorted by what you actually pay.",
  },
  {
    href: "/planner",
    icon: "map" as const,
    kicker: "Plan",
    title: "Multi-modal route planner",
    copy: "Connect a bus, a train and a cab through the right hubs, with transfer times you can trust.",
  },
  {
    href: "/routes",
    icon: "pin" as const,
    kicker: "Discover",
    title: "Every route in one place",
    copy: "All corridors from your city, ranked by the complete fare — pick a budget and see where it reaches.",
  },
  {
    href: "/hotels",
    icon: "bed" as const,
    kicker: "Stay",
    title: "Stays that fit the route",
    copy: "Verified hotels, hostels, homestays and resorts with live availability and honest cancellation terms.",
  },
  {
    href: "/guides",
    icon: "users" as const,
    kicker: "Meet",
    title: "Local guides, verified",
    copy: "Book a photographer in Jaipur, a trek guide in Manali or a food walk host in Kochi.",
  },
  {
    href: "/careers",
    icon: "briefcase" as const,
    kicker: "Work",
    title: "Careers in travel",
    copy: "Tour managers, guides, photographers and hospitality roles from verified employers.",
  },
];

const TICKER: [string, string][] = [
  ["Kaithal", "Manali"],
  ["Delhi", "Jaipur"],
  ["Mumbai", "Pune"],
  ["Chandigarh", "Manali"],
  ["Bengaluru", "Goa"],
  ["Delhi", "Rishikesh"],
  ["Mumbai", "Goa"],
  ["Hyderabad", "Bengaluru"],
  ["Kolkata", "Varanasi"],
  ["Jaipur", "Udaipur"],
];

export default function HomePage() {
  const demo = searchJourneys({ from: "Kaithal", to: "Manali", date: todayISO(7), pax: 1 });
  const preview = [...demo.journeys].sort((a, b) => a.totalCost - b.totalCost).slice(0, 3);
  const max = Math.max(...preview.map((j) => j.totalCost), 1);
  const guides = [GUIDES[0], GUIDES[1], GUIDES[3]];
  const featuredPlaces = PLACES.filter((p) =>
    ["ladakh", "kerala-backwaters", "varanasi", "maldives", "spiti", "wayanad"].includes(p.slug),
  );

  const ticker = TICKER.map(([from, to]) => {
    const result = searchJourneys({ from, to, date: todayISO(4), pax: 1 });
    const best = [...result.journeys].sort((a, b) => a.totalCost - b.totalCost)[0];
    return { from, to, price: best?.totalCost ?? 0 };
  }).filter((t) => t.price > 0);

  return (
    <div className="overflow-x-clip">
      {/* HERO */}
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10">
          <img
            src="/images/hero.jpg"
            alt="A mountain highway winding through the Himalayas at golden hour"
            className="h-full w-full object-cover"
            fetchPriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/65 to-ink" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/10 to-transparent" />
        </div>

        <div className="container-x pb-10 pt-14 sm:pt-20">
          <div className="grid gap-10 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
            <div className="anim-rise max-w-2xl">
              <p className="eyebrow text-saffron">
                <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-saffron" /> India first · then everywhere
              </p>
              <h1 className="display mt-5 text-[44px] leading-[0.98] text-cream sm:text-[62px] lg:text-[68px]">
                Your journey.
                <br />
                <span className="italic text-saffron">Every possibility.</span>
              </h1>
              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-cream/70 sm:text-base">
                Share a cab and split it by seat. Send Mom and Dad a live trip link. Find the cheapest complete route
                across flights, trains, buses and cabs — every corridor, one ranking.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {[
                  { href: "/routes", label: "Low-budget routes" },
                  { href: "#features", label: "Shared cab" },
                  { href: "/safety", label: "Live to parents" },
                ].map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.06] px-3.5 py-1.5 text-[12px] font-semibold text-cream/80 backdrop-blur transition hover:border-saffron/50 hover:text-cream"
                  >
                    {c.label} <Icon name="arrowUpRight" className="h-3 w-3 text-saffron" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Floating live-trip card */}
            <div className="relative hidden lg:block">
              <div className="anim-float relative rounded-4xl border border-white/15 bg-white/[0.07] p-5 text-cream shadow-[0_40px_90px_-40px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-saffron/15 px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.16em] text-saffron">
                    <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-saffron" /> Live · shared with home
                  </span>
                  <span className="text-[10px] font-semibold text-cream/40">2 watching</span>
                </div>

                <div className="mt-5 flex items-end justify-between gap-3">
                  <div>
                    <p className="display text-2xl leading-none">Kaithal → Manali</p>
                    <p className="mt-1 text-[10.5px] text-cream/45">Chandigarh connection · verified cab</p>
                  </div>
                  <span className="text-right text-[10px] text-cream/45">
                    ETA <span className="block text-sm font-bold text-cream">6:40 pm</span>
                  </span>
                </div>

                <div className="relative mt-5 h-1.5 rounded-full bg-white/15">
                  <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-teal via-moss to-saffron" />
                  <span className="sweep-dot absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-saffron shadow-[0_0_0_6px_rgba(255,107,44,0.18)]">
                    <Icon name="cab" className="m-auto mt-[3px] h-2.5 w-2.5 text-ink" />
                  </span>
                </div>
                <div className="mt-2 flex justify-between text-[9.5px] font-semibold text-cream/40">
                  <span>Kaithal</span>
                  <span>Chandigarh</span>
                  <span>Mandi</span>
                  <span className="text-saffron">Manali</span>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
                  {[
                    { k: "₹1,840", v: "total fare" },
                    { k: "₹460", v: "per seat" },
                    { k: "0", v: "hidden fees" },
                  ].map((s) => (
                    <div key={s.v}>
                      <p className="text-[15px] font-extrabold text-cream">{s.k}</p>
                      <p className="text-[9.5px] uppercase tracking-wide text-cream/40">{s.v}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="anim-float-slow absolute -bottom-7 -left-6 flex items-center gap-2 rounded-2xl border border-white/15 bg-ink/90 px-3.5 py-2.5 text-[11px] font-semibold text-cream backdrop-blur">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal text-cream">
                  <Icon name="check" className="h-3 w-3" />
                </span>
                Revalidated 12s ago · demo inventory
              </div>
            </div>
          </div>

          <div className="mt-9">
            <SearchForm />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-7 gap-y-2 text-[11.5px] font-medium text-cream/45">
            <span><span className="font-bold text-cream/70">{CITIES.length}</span> cities live in comparison</span>
            <span><span className="font-bold text-cream/70">4</span> transport modes</span>
            <span><span className="font-bold text-cream/70">306</span> city pairs indexed</span>
            <span className="hidden sm:inline">Try Kaithal → Manali, or Mumbai → Goa</span>
          </div>
        </div>
      </section>

      {/* ROUTE TICKER */}
      <div className="relative mt-10 overflow-hidden border-y border-white/10 bg-ink py-3 text-cream">
        <div className="marquee flex w-max items-center gap-7">
          {[...ticker, ...ticker].map((t, i) => (
            <span key={`${t.from}-${t.to}-${i}`} className="flex items-center gap-2 whitespace-nowrap text-[11.5px] font-semibold">
              <Icon name="pin" className="h-3 w-3 text-saffron" />
              <span className="text-cream/55">{t.from} → {t.to}</span>
              <span className="font-extrabold text-cream">{inr(t.price)}</span>
              <span className="text-cream/25">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* FEATURE SPOTLIGHT */}
      <Reveal>
        <Spotlight />
      </Reveal>

      {/* PLACES TO VISIT */}
      <section className="container-x pt-20">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="eyebrow text-teal">Places to visit</p>
              <h2 className="display mt-3 text-4xl leading-[1.04] sm:text-5xl">
                Every kind of place.
                <br />
                <span className="italic text-teal">With a real budget.</span>
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-ink/60">
                {PLACES.length} destinations across {PLACE_GROUPS.length} categories — mountains, backwaters, temples,
                reefs, deserts and road trips. Real photographs, the attractions that matter, and a daily budget for
                three travel styles.
              </p>
            </div>
            <Link href="/places" className="btn-ink">
              Explore all places <Icon name="arrowRight" className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPlaces.map((p, i) => (
            <Reveal key={p.slug} delay={i * 60}>
              <Link
                href={`/places/${p.slug}`}
                className="group relative block h-56 overflow-hidden rounded-3xl border border-ink/10 shadow-card"
              >
                <img
                  src={p.image}
                  alt={`${p.name} — ${p.region}`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full bg-ink/70 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-cream backdrop-blur">
                  {PLACE_GROUPS.find((g) => g.id === p.group)?.name}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-[10.5px] font-semibold text-cream/60">{p.region} · {p.country}</p>
                  <h3 className="display text-2xl text-cream">{p.name}</h3>
                  <div className="mt-1 flex items-center justify-between text-[11px]">
                    <span className="text-cream/55">{p.days} days · {p.bestSeason}</span>
                    <span className="font-bold text-saffron">{inr(p.budget.budget)}/day</span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="no-scrollbar mt-5 flex gap-1.5 overflow-x-auto pb-1">
          {PLACE_GROUPS.map((g) => (
            <Link
              key={g.id}
              href={`/places?group=${g.id}#all-places`}
              className="shrink-0 rounded-full border border-ink/12 bg-white px-3 py-1.5 text-[11.5px] font-semibold text-ink/55 transition hover:border-teal/40 hover:text-teal"
            >
              {g.name}
            </Link>
          ))}
        </div>
      </section>

      {/* COMPARISON PREVIEW */}
      <section className="container-x pt-20">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <Reveal>
            <div>
              <p className="eyebrow text-teal">The comparison engine</p>
              <h2 className="display mt-3 text-4xl leading-[1.05] sm:text-5xl">
                A cheap ticket
                <br />
                isn&apos;t a cheap
                <br />
                <span className="italic text-teal">journey.</span>
              </h2>
              <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-ink/60">
                A ₹1,200 bus plus a ₹250 auto is not the same as a ₹1,450 train that drops you at the door. Nexora
                normalises fares, transfers, baggage and timing, then ranks the complete journey — for everyone
                travelling.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link href="/search" className="btn-ink">
                  Compare a route <Icon name="arrowRight" className="h-4 w-4" />
                </Link>
                <Link href="/routes" className="btn-ghost">
                  All routes <Icon name="arrowUpRight" className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-ink/10 px-5 py-3.5">
                <div className="flex items-center gap-2 text-[12px] font-bold">
                  <Icon name="pin" className="h-3.5 w-3.5 text-saffron" /> Kaithal → Manali
                </div>
                <span className="text-[10.5px] font-semibold uppercase tracking-wide text-ink/35">
                  {preview.length} of {demo.journeys.length} journeys
                </span>
              </div>
              <div className="divide-y divide-ink/8">
                {preview.map((j, index) => (
                  <Link
                    key={j.id}
                    href={`/search?from=Kaithal&to=Manali&date=${todayISO(7)}&pax=1`}
                    className="group block px-5 py-4 transition hover:bg-sand/50"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-1.5">
                          {j.legs.map((l) => (
                            <span key={l.id} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-sand text-teal">
                              <ModeIcon mode={l.mode} className="h-3.5 w-3.5" />
                            </span>
                          ))}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold">
                            {j.legs.map((l) => l.operator.split(" ")[0]).join(" + ")}
                            {index === 0 && (
                              <span className="ml-2 rounded-full bg-teal-soft px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-teal">
                                Lowest
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-ink/45">
                            {fmtTime(j.legs[0].departISO)} → {fmtTime(j.legs[j.legs.length - 1].arriveISO)} ·{" "}
                            {fmtDuration(j.totalDurationMin)} · {j.transfers === 0 ? "direct" : `${j.transfers} transfer`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-extrabold">{inr(j.totalCost)}</p>
                        <p className="text-[10px] text-ink/40">complete</p>
                      </div>
                    </div>
                    <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-sand">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-teal to-moss transition-all duration-700 group-hover:from-saffron group-hover:to-saffron"
                        style={{ width: `${Math.max(12, (j.totalCost / max) * 100)}%` }}
                      />
                    </div>
                  </Link>
                ))}
              </div>
              <div className="bg-teal-soft/60 px-5 py-3 text-[11px] leading-relaxed text-teal">
                Every row includes the last-mile transfer estimate. Fares revalidated before booking. Demo inventory.
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* MODULES */}
      <section className="container-x pt-24">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-saffron-dark">The ecosystem</p>
              <h2 className="display mt-3 max-w-2xl text-4xl leading-[1.05] sm:text-5xl">
                The whole trip stops being <span className="italic text-teal">seven tabs.</span>
              </h2>
            </div>
            <Link href="/planner" className="link-underline hidden text-sm font-semibold sm:block">
              Start with a route planner
            </Link>
          </div>
        </Reveal>

        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m, i) => (
            <Reveal key={m.href} delay={i * 60}>
              <Link
                href={m.href}
                className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lift ${
                  i === 0 ? "border-ink bg-ink text-cream" : "border-ink/10 bg-white"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${i === 0 ? "bg-saffron text-ink" : "bg-teal-soft text-teal"}`}>
                      <Icon name={m.icon} className="h-5 w-5" />
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-[0.18em] ${i === 0 ? "text-cream/40" : "text-ink/35"}`}>
                      {m.kicker}
                    </span>
                  </div>
                  <h3 className={`display mt-6 text-2xl ${i === 0 ? "text-cream" : "text-ink"}`}>{m.title}</h3>
                  <p className={`mt-2 text-[13px] leading-relaxed ${i === 0 ? "text-cream/60" : "text-ink/55"}`}>{m.copy}</p>
                </div>
                <span className={`mt-6 inline-flex items-center gap-1.5 text-[12px] font-bold ${i === 0 ? "text-saffron" : "text-teal"}`}>
                  Open module <Icon name="arrowUpRight" className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* DESTINATIONS */}
      <section className="mt-24 bg-ink py-20 text-cream">
        <div className="container-x">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-saffron">Where next</p>
                <h2 className="display mt-3 text-4xl leading-tight sm:text-5xl">Five ways to disappear for a while.</h2>
              </div>
              <p className="max-w-sm text-[13px] leading-relaxed text-cream/50">
                Route, stay and guide data for each destination. Prices are indicative complete-journey starting points
                from Delhi NCR.
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {DESTINATIONS.map((d, i) => (
              <Link
                key={d.city}
                href={`/search?from=Delhi&to=${d.city}&date=${todayISO(10)}&pax=2`}
                className={`group relative overflow-hidden rounded-3xl ${i === 0 ? "sm:col-span-2 lg:col-span-2" : ""}`}
              >
                <img
                  src={d.image}
                  alt={`${d.city} — ${d.tagline}`}
                  loading="lazy"
                  decoding="async"
                  className="h-72 w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="flex flex-wrap gap-1.5">
                    {d.tags.map((t) => (
                      <span key={t} className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-cream/85 backdrop-blur">
                        {t}
                      </span>
                    ))}
                  </div>
                  <h3 className="display mt-2 text-2xl">{d.city}</h3>
                  <p className="text-[12px] text-cream/65">{d.tagline}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-cream/45">{d.season}</span>
                    <span className="font-bold text-saffron">from {inr(d.from)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* GUIDES */}
      <section className="container-x pt-20">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <div>
              <p className="eyebrow text-teal">Local, verified, human</p>
              <h2 className="display mt-3 text-4xl leading-[1.05] sm:text-5xl">
                The best guidebook
                <br />
                is a person.
              </h2>
              <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-ink/60">
                Every guide on Nexora submits identity and qualification documents. Browse by language, specialisation
                and price, then request a date. The guide accepts — no silent auto-booking.
              </p>
              <Link href="/guides" className="btn-ghost mt-6">
                Browse local guides <Icon name="arrowRight" className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>

          <div className="space-y-3">
            {guides.map((g, i) => (
              <Reveal key={g.id} delay={i * 80}>
                <Link href={`/guides/${g.id}`} className="card flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:border-teal/40">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal text-lg font-extrabold text-cream">
                    {g.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold">{g.name}</p>
                      {g.verified && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-teal-soft px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-teal">
                          <Icon name="check" className="h-2.5 w-2.5" /> Verified
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-[12px] text-ink/50">
                      {g.city} · {g.languages.join(", ")}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[11.5px] font-semibold text-ink/60">
                      <Icon name="star" className="h-3 w-3 fill-saffron text-saffron" /> {g.rating} · {g.reviews} reviews
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold">{inr(g.pricePerDay)}</p>
                    <p className="text-[10px] uppercase tracking-wide text-ink/35">per day</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SAFETY + CAREERS */}
      <section className="container-x pt-20">
        <div className="grid gap-4 lg:grid-cols-2">
          <Reveal>
            <div className="relative h-full overflow-hidden rounded-4xl bg-ink p-8 text-cream">
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border border-dashed border-saffron/30" />
              <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full border border-saffron/20" />
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-saffron text-ink">
                <Icon name="shield" className="h-5 w-5" />
              </span>
              <h3 className="display mt-6 text-3xl">Someone at home, along for the ride.</h3>
              <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-cream/60">
                Share a live journey link with trusted contacts. They see progress and your ETA — never a hidden,
                permanent feed. You start sharing, you can revoke it in one tap, and every link expires on its own.
              </p>
              <ul className="mt-5 space-y-2 text-[12.5px] text-cream/65">
                {["Voluntary, revocable, time-limited", "No silent tracking — history stays visible to you", "Emergency contacts, not a pretend emergency service"].map((t) => (
                  <li key={t} className="flex gap-2"><Icon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-saffron" />{t}</li>
                ))}
              </ul>
              <Link href="/safety" className="btn-ghost-light mt-6">Set up journey sharing</Link>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="relative h-full overflow-hidden rounded-4xl border border-ink/10 bg-white p-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-soft text-teal">
                <Icon name="briefcase" className="h-5 w-5" />
              </span>
              <h3 className="display mt-6 text-3xl">Work that moves people.</h3>
              <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-ink/60">
                Eight live roles across guiding, hospitality, content and operations. Apply with a profile and resume;
                employers shortlist and update status, and every application stays trackable.
              </p>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {[
                  { k: "8", v: "open roles" },
                  { k: "6", v: "cities" },
                  { k: "4", v: "job types" },
                ].map((s) => (
                  <div key={s.v} className="rounded-2xl bg-sand/60 p-3">
                    <p className="display text-2xl">{s.k}</p>
                    <p className="text-[10.5px] uppercase tracking-wide text-ink/40">{s.v}</p>
                  </div>
                ))}
              </div>
              <Link href="/careers" className="btn-ink mt-6">Explore travel jobs</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* AI */}
      <section className="container-x pt-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-4xl border border-ink/10 bg-gradient-to-br from-teal-soft via-cream to-sand p-8 sm:p-12">
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div>
                <p className="eyebrow text-teal"><Icon name="sparkles" className="h-3.5 w-3.5" /> AI trip planner</p>
                <h2 className="display mt-3 max-w-xl text-4xl leading-[1.02] sm:text-5xl">
                  “Kaithal to Manali, 4 days, ₹8,000.”
                </h2>
                <p className="mt-4 max-w-lg text-[14.5px] leading-relaxed text-ink/60">
                  Nexora retrieves real routes and stays from its own search results, then builds a day-wise plan and a
                  line-item budget. If the numbers don&apos;t fit, it says so and offers a cheaper combination.
                </p>
                <Link href="/assistant" className="btn-ink mt-6">
                  Plan my trip <Icon name="arrowRight" className="h-4 w-4" />
                </Link>
              </div>
              <div className="card p-5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-ink/40">Try a prompt</p>
                {[
                  "I want to travel from Kaithal to Manali for 4 days with a budget of ₹8,000.",
                  "Comfortable weekend from Mumbai to Goa for two.",
                  "Three days in Jaipur with a local guide.",
                ].map((p, i) => (
                  <Link
                    key={p}
                    href={`/assistant?q=${encodeURIComponent(p)}`}
                    className={`mt-2 flex items-start gap-2.5 rounded-2xl border p-3 text-[12.5px] font-medium transition hover:border-teal/40 ${
                      i === 0 ? "border-teal/30 bg-teal-soft/60 text-teal" : "border-ink/10 text-ink/60"
                    }`}
                  >
                    <Icon name="sparkles" className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {p}
                  </Link>
                ))}
                <p className="mt-3 text-[10.5px] leading-relaxed text-ink/35">
                  Runs on Shimla, Manali, Jaipur and {CITIES.length - 3} other Indian cities in this prototype — no API
                  key required.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="container-x pt-16 text-center">
        <p className="mx-auto max-w-3xl text-[12px] leading-relaxed text-ink/40">
          Live in {CITIES.length} Indian cities across every indexed corridor. Nexora is designed as a modular platform:
          comparison first, direct provider booking added partner by partner as commercial access, licensing and
          compliance approvals are secured.
        </p>
      </section>
    </div>
  );
}
