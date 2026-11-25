"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Job } from "@/lib/types";
import { inr } from "@/lib/format";
import { Icon } from "./Icons";

const TYPES = ["All", "Full-time", "Part-time", "Seasonal", "Contract"] as const;

export function JobBrowser({ jobs }: { jobs: Job[] }) {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("All");

  const cities = useMemo(() => Array.from(new Set(jobs.map((j) => j.city))).sort(), [jobs]);

  const results = useMemo(
    () =>
      jobs.filter((j) => {
        if (q && !`${j.title} ${j.employer} ${j.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase())) return false;
        if (city && j.city !== city) return false;
        if (type !== "All" && j.type !== type) return false;
        return true;
      }),
    [jobs, q, city, type],
  );

  return (
    <div>
      <div className="card p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <label className="label" htmlFor="job-q">Search roles</label>
            <div className="relative">
              <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-teal" />
              <input id="job-q" value={q} onChange={(e) => setQ(e.target.value)} className="field pl-9" placeholder="Guide, photographer, operations…" />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="job-city">Location</label>
            <select id="job-city" value={city} onChange={(e) => setCity(e.target.value)} className="field">
              <option value="">All locations</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="job-type">Employment</label>
            <select id="job-type" value={type} onChange={(e) => setType(e.target.value as typeof type)} className="field">
              {TYPES.map((t) => <option key={t} value={t}>{t === "All" ? "Any type" : t}</option>)}
            </select>
          </div>
        </div>
      </div>

      <p className="mt-5 text-[12px] font-semibold text-ink/50">{results.length} open role{results.length === 1 ? "" : "s"}</p>

      <div className="mt-3 space-y-3">
        {results.map((j) => (
          <Link key={j.id} href={`/careers/${j.id}`} className="card group flex flex-wrap items-center gap-4 p-5 transition hover:border-teal/40">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-soft text-teal">
              <Icon name="briefcase" className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[15px] font-extrabold">{j.title}</h3>
                {j.verified && <span className="inline-flex items-center gap-0.5 rounded-full bg-teal-soft px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-teal"><Icon name="check" className="h-2.5 w-2.5" /> Verified</span>}
              </div>
              <p className="mt-0.5 text-[12px] text-ink/55">{j.employer} · {j.city} · {j.type} · posted {j.posted}</p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {j.tags.map((t) => <span key={t} className="rounded-full bg-sand px-2 py-0.5 text-[9.5px] font-semibold text-ink/55">{t}</span>)}
              </div>
            </div>
            <div className="text-right">
              <p className="text-[13px] font-extrabold">{inr(j.salaryMin, { compact: true })} – {inr(j.salaryMax, { compact: true })}</p>
              <p className="text-[10px] uppercase tracking-wide text-ink/35">per month</p>
              <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-teal">View role <Icon name="arrowUpRight" className="h-3 w-3" /></span>
            </div>
          </Link>
        ))}
      </div>

      {!results.length && (
        <div className="card mt-4 p-8 text-center">
          <Icon name="briefcase" className="mx-auto h-7 w-7 text-teal" />
          <p className="mt-2 font-semibold">Nothing matches that search yet.</p>
          <p className="text-sm text-ink/50">Try a broader keyword or clear the location filter.</p>
        </div>
      )}
    </div>
  );
}
