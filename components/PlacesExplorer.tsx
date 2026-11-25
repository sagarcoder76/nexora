"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PLACES, PLACE_GROUPS, type PlaceGroupId } from "@/lib/places";
import { inr } from "@/lib/format";
import { Icon } from "./Icons";

const BUDGET_STEPS = [
  { label: "Any budget", value: 60000 },
  { label: "Under ₹2k/day", value: 2000 },
  { label: "Under ₹4k/day", value: 4000 },
  { label: "Under ₹8k/day", value: 8000 },
];

type Props = { initialGroup?: string };

export function PlacesExplorer({ initialGroup }: Props) {
  const [group, setGroup] = useState<PlaceGroupId | "all">(
    (PLACE_GROUPS.find((g) => g.id === initialGroup)?.id as PlaceGroupId) ?? "all",
  );
  const [query, setQuery] = useState("");
  const [maxBudget, setMaxBudget] = useState(60000);
  const [sub, setSub] = useState("");
  const [sort, setSort] = useState<"curated" | "budget" | "rating">("curated");

  // A typed search is global; category filters only apply to browsing.
  const scoped = useMemo(
    () => (group === "all" || query.trim() ? PLACES : PLACES.filter((p) => p.group === group)),
    [group, query],
  );

  const subcategories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of scoped) for (const s of p.subcategories) counts.set(s, (counts.get(s) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14);
  }, [scoped]);

  const places = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = scoped.filter((p) => {
      if (p.budget.budget > maxBudget) return false;
      if (sub && !p.subcategories.includes(sub)) return false;
      if (!q) return true;
      const haystack = [p.name, p.region, p.country, p.tagline, ...p.tags, ...p.highlights, ...p.subcategories]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
    if (sort === "budget") list = [...list].sort((a, b) => a.budget.budget - b.budget.budget);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [scoped, query, maxBudget, sub, sort]);

  function pickGroup(id: PlaceGroupId | "all") {
    setGroup(id);
    setSub("");
  }

  return (
    <div>
      {/* filter bar */}
      <div className="sticky top-[68px] z-30 -mx-1 rounded-3xl border border-ink/10 bg-cream/90 p-3 backdrop-blur-md sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-teal" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a place, region, attraction or vibe — Manali, aurora, houseboat…"
              aria-label="Search places"
              className="field pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="budget-filter">Maximum daily budget</label>
            <select
              id="budget-filter"
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              className="field w-auto py-2.5 text-[12.5px] font-semibold"
            >
              {BUDGET_STEPS.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
            <label className="sr-only" htmlFor="sort-filter">Sort places</label>
            <select
              id="sort-filter"
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="field w-auto py-2.5 text-[12.5px] font-semibold"
            >
              <option value="curated">Curated</option>
              <option value="budget">Cheapest first</option>
              <option value="rating">Best rated</option>
            </select>
          </div>
        </div>

        <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto pb-0.5">
          <button
            type="button"
            onClick={() => pickGroup("all")}
            aria-pressed={group === "all"}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition ${
              group === "all" ? "border-ink bg-ink text-cream" : "border-ink/12 bg-white text-ink/60 hover:border-teal/40 hover:text-teal"
            }`}
          >
            All places <span className="opacity-50">{PLACES.length}</span>
          </button>
          {PLACE_GROUPS.map((g) => {
            const count = PLACES.filter((p) => p.group === g.id).length;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => pickGroup(g.id)}
                aria-pressed={group === g.id}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition ${
                  group === g.id ? "border-ink bg-ink text-cream" : "border-ink/12 bg-white text-ink/60 hover:border-teal/40 hover:text-teal"
                }`}
              >
                {g.name} <span className="opacity-50">{count}</span>
              </button>
            );
          })}
        </div>

        {subcategories.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-ink/35">Subcategory</span>
            {sub && (
              <button
                type="button"
                onClick={() => setSub("")}
                className="rounded-full bg-saffron/15 px-2 py-1 text-[10px] font-bold text-saffron-dark"
              >
                {sub} ×
              </button>
            )}
            {subcategories
              .filter(([s]) => s !== sub)
              .slice(0, 9)
              .map(([s, n]) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSub(s)}
                  className="rounded-full border border-ink/10 bg-white/70 px-2 py-1 text-[10px] font-semibold text-ink/50 transition hover:border-teal/40 hover:text-teal"
                >
                  {s} <span className="opacity-50">{n}</span>
                </button>
              ))}
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between text-[11.5px] text-ink/45">
        <span>
          <span className="font-bold text-ink">{places.length}</span> destinations · budgets are per person per day
        </span>
        {(group !== "all" || query || sub || maxBudget !== 60000) && (
          <button
            type="button"
            onClick={() => {
              pickGroup("all");
              setQuery("");
              setMaxBudget(60000);
            }}
            className="font-bold text-teal hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {places.length === 0 ? (
        <div className="card mt-5 p-8 text-center">
          <Icon name="compass" className="mx-auto h-7 w-7 text-teal" />
          <p className="mt-3 font-semibold">No place matches that combination yet.</p>
          <p className="mt-1 text-sm text-ink/55">Raise the budget or clear the subcategory.</p>
          <button
            type="button"
            onClick={() => {
              pickGroup("all");
              setQuery("");
              setMaxBudget(60000);
            }}
            className="btn-ghost mt-4"
          >
            Show all places
          </button>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((p, i) => {
            const groupName = PLACE_GROUPS.find((g) => g.id === p.group)?.name ?? "";
            return (
              <Link
                key={p.slug}
                href={`/places/${p.slug}`}
                className="group anim-rise relative flex flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:border-teal/30 hover:shadow-lift"
                style={{ animationDelay: `${Math.min(i, 9) * 45}ms` }}
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={p.image}
                    alt={`${p.name} — ${p.region}, ${p.country}`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full bg-ink/70 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.12em] text-cream backdrop-blur">
                    {groupName}
                  </span>
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-extrabold text-ink">
                    <Icon name="star" className="h-2.5 w-2.5 fill-saffron text-saffron" /> {p.rating}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 px-4 pb-3">
                    <p className="text-[10.5px] font-semibold text-cream/70">{p.region} · {p.country}</p>
                    <h3 className="display text-2xl leading-tight text-cream">{p.name}</h3>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <p className="text-[12px] leading-relaxed text-ink/55">{p.tagline}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {p.subcategories.slice(0, 2).map((s) => (
                      <span key={s} className="rounded-full bg-sand/80 px-2 py-0.5 text-[9.5px] font-semibold text-ink/55">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto flex items-end justify-between border-t border-ink/8 pt-3">
                    <div>
                      <p className="text-[13px] font-extrabold">{inr(p.budget.budget)}<span className="text-[10px] font-semibold text-ink/40"> /day</span></p>
                      <p className="text-[10px] text-ink/40">{p.days} days · from {inr(p.budget.budget * p.days)}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-teal">
                      Open <Icon name="arrowRight" className="h-3 w-3 transition group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
