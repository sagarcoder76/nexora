"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Hotel } from "@/lib/types";
import { inr } from "@/lib/format";
import { Icon } from "./Icons";

const TYPES = ["All", "Hotel", "Hostel", "Homestay", "Resort", "Guesthouse"] as const;
const AMENITIES = ["Breakfast", "Pool", "Wi-Fi", "Air conditioning", "Mountain view", "Beach access"];

export function HotelBrowser({ hotels, initialCity = "" }: { hotels: Hotel[]; initialCity?: string }) {
  const [city, setCity] = useState(initialCity);
  const [type, setType] = useState<(typeof TYPES)[number]>("All");
  const [maxPrice, setMaxPrice] = useState(7000);
  const [minRating, setMinRating] = useState(0);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [sort, setSort] = useState<"price" | "rating" | "distance">("rating");

  const cities = useMemo(() => Array.from(new Set(hotels.map((h) => h.city))).sort(), [hotels]);

  const results = useMemo(() => {
    const list = hotels.filter((h) => {
      if (city && h.city !== city) return false;
      if (type !== "All" && h.type !== type) return false;
      if (h.price > maxPrice) return false;
      if (h.rating < minRating) return false;
      if (amenities.length && !amenities.every((a) => h.amenities.includes(a))) return false;
      return true;
    });
    return list.sort((a, b) =>
      sort === "price" ? a.price - b.price : sort === "distance" ? a.distanceKm - b.distanceKm : b.rating - a.rating,
    );
  }, [hotels, city, type, maxPrice, minRating, amenities, sort]);

  function toggleAmenity(a: string) {
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  return (
    <div>
      <div className="card p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label" htmlFor="city">Destination</label>
            <select id="city" value={city} onChange={(e) => setCity(e.target.value)} className="field">
              <option value="">All destinations</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="type">Property type</label>
            <select id="type" value={type} onChange={(e) => setType(e.target.value as typeof type)} className="field">
              {TYPES.map((t) => <option key={t} value={t}>{t === "All" ? "Any type" : t}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="sort">Sort by</label>
            <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="field">
              <option value="rating">Highest rated</option>
              <option value="price">Lowest price</option>
              <option value="distance">Closest to centre</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="rating">Minimum rating · {minRating || "any"}</label>
            <input id="rating" type="range" min={0} max={4.8} step={0.1} value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="mt-2.5 w-full accent-teal" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink/10 pt-4">
          {AMENITIES.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => toggleAmenity(a)}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
                amenities.includes(a) ? "border-teal bg-teal text-cream" : "border-ink/12 text-ink/55 hover:border-ink/30"
              }`}
            >
              {a}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10.5px] font-bold uppercase tracking-wide text-ink/40">Max {inr(maxPrice)}/night</span>
            <input type="range" min={600} max={7000} step={100} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-32 accent-teal" />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-[12.5px] font-semibold text-ink/50">
          {results.length} verified propert{results.length === 1 ? "y" : "ies"}{city ? ` in ${city}` : ""}
        </p>
        <p className="hidden text-[11px] text-ink/35 sm:block">Nightly price for the base room · taxes extra</p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((h) => (
          <Link key={h.id} href={`/hotels/${h.id}`} className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lift">
            <div className="relative h-44 overflow-hidden">
              <img src={h.image} alt={h.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute left-3 top-3 flex gap-1.5">
                <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink">{h.type}</span>
                {h.verified && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-teal px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-cream">
                    <Icon name="check" className="h-2.5 w-2.5" /> Verified
                  </span>
                )}
              </div>
              <span className="absolute bottom-3 right-3 rounded-full bg-ink/85 px-2.5 py-1 text-[10.5px] font-bold text-cream">
                <Icon name="star" className="mr-1 inline h-2.5 w-2.5 fill-saffron text-saffron" />{h.rating} ({h.reviews})
              </span>
            </div>
            <div className="p-4">
              <p className="text-[10.5px] font-bold uppercase tracking-wide text-teal">{h.city} · {h.distanceKm} km from centre</p>
              <h3 className="mt-1 text-[15px] font-extrabold leading-snug">{h.name}</h3>
              <p className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-ink/50">{h.description}</p>
              <div className="mt-3 flex items-end justify-between border-t border-ink/8 pt-3">
                <div className="flex flex-wrap gap-1">
                  {h.amenities.slice(0, 2).map((a) => (
                    <span key={a} className="rounded-full bg-sand px-2 py-0.5 text-[9.5px] font-semibold text-ink/55">{a}</span>
                  ))}
                </div>
                <p className="text-right">
                  <span className="display text-xl">{inr(h.price)}</span>
                  <span className="block text-[9.5px] uppercase tracking-wide text-ink/35">per night</span>
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {!results.length && (
        <div className="card mt-6 p-8 text-center">
          <Icon name="bed" className="mx-auto h-7 w-7 text-teal" />
          <p className="mt-2 font-semibold">No stays match those filters.</p>
          <p className="text-sm text-ink/50">Raise the price ceiling or clear an amenity.</p>
        </div>
      )}
    </div>
  );
}
