"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Guide } from "@/lib/types";
import { inr } from "@/lib/format";
import { Icon } from "./Icons";

const CATEGORIES = [
  "All",
  "City sightseeing",
  "Historical tours",
  "Cultural experiences",
  "Photography tours",
  "Nature tours",
  "Adventure experiences",
  "Food tours",
];

export function GuideBrowser({ guides }: { guides: Guide[] }) {
  const [city, setCity] = useState("");
  const [language, setLanguage] = useState("");
  const [category, setCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(4000);
  const [minRating, setMinRating] = useState(0);

  const cities = useMemo(() => Array.from(new Set(guides.map((g) => g.city))).sort(), [guides]);
  const languages = useMemo(() => Array.from(new Set(guides.flatMap((g) => g.languages))).sort(), [guides]);

  const results = useMemo(() => {
    return guides
      .filter((g) => {
        if (city && g.city !== city) return false;
        if (language && !g.languages.includes(language)) return false;
        if (category !== "All" && !g.categories.includes(category)) return false;
        if (g.pricePerDay > maxPrice) return false;
        if (g.rating < minRating) return false;
        return true;
      })
      .sort((a, b) => b.rating - a.rating);
  }, [guides, city, language, category, maxPrice, minRating]);

  return (
    <div>
      <div className="card p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label" htmlFor="g-city">Destination</label>
            <select id="g-city" value={city} onChange={(e) => setCity(e.target.value)} className="field">
              <option value="">All cities</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="g-lang">Language</label>
            <select id="g-lang" value={language} onChange={(e) => setLanguage(e.target.value)} className="field">
              <option value="">Any language</option>
              {languages.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="g-cat">Specialisation</label>
            <select id="g-cat" value={category} onChange={(e) => setCategory(e.target.value)} className="field">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c === "All" ? "Any specialisation" : c}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="g-rating">Rating · {minRating || "any"}+</label>
            <input id="g-rating" type="range" min={0} max={4.8} step={0.1} value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="mt-2.5 w-full accent-teal" />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ink/10 pt-3">
          <span className="text-[10.5px] font-bold uppercase tracking-wide text-ink/40">Day rate up to {inr(maxPrice)}</span>
          <input type="range" min={1500} max={4000} step={100} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-40 accent-teal" />
          <span className="ml-auto hidden text-[10.5px] text-ink/35 sm:block">All guides submit ID and qualifications for manual verification</span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((g) => (
          <Link key={g.id} href={`/guides/${g.id}`} className="card group flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
            <div className="flex items-start gap-3">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal text-lg font-extrabold text-cream">{g.initials}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h3 className="text-[15px] font-extrabold leading-tight">{g.name}</h3>
                  {g.verified && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-teal-soft px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-teal">
                      <Icon name="check" className="h-2.5 w-2.5" /> Verified
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[11.5px] text-ink/50">{g.city} · {g.experience} yrs guiding</p>
                <p className="mt-1 text-[11.5px] font-semibold">
                  <Icon name="star" className="mr-1 inline h-3 w-3 fill-saffron text-saffron" />
                  {g.rating} <span className="font-normal text-ink/40">({g.reviews} reviews)</span>
                </p>
              </div>
            </div>
            <p className="mt-3 line-clamp-2 text-[12px] leading-relaxed text-ink/55">{g.bio}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {g.categories.slice(0, 2).map((c) => (
                <span key={c} className="rounded-full bg-sand px-2 py-0.5 text-[9.5px] font-semibold text-ink/55">{c}</span>
              ))}
              {g.languages.slice(0, 2).map((l) => (
                <span key={l} className="rounded-full border border-ink/10 px-2 py-0.5 text-[9.5px] font-semibold text-ink/45">{l}</span>
              ))}
            </div>
            <div className="mt-4 flex items-end justify-between border-t border-ink/8 pt-3">
              <span className="text-[11px] text-ink/40">{g.availableDates.length} open dates this month</span>
              <p className="text-right">
                <span className="display text-xl">{inr(g.pricePerDay)}</span>
                <span className="block text-[9px] uppercase tracking-wide text-ink/35">per day</span>
              </p>
            </div>
          </Link>
        ))}
      </div>

      {!results.length && (
        <div className="card mt-6 p-8 text-center">
          <Icon name="users" className="mx-auto h-7 w-7 text-teal" />
          <p className="mt-2 font-semibold">No guides match those filters.</p>
          <p className="text-sm text-ink/50">Try clearing the language or raising the day rate.</p>
        </div>
      )}
    </div>
  );
}
