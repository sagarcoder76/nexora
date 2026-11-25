"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CITIES } from "@/lib/data";
import { todayISO } from "@/lib/format";
import type { Mode } from "@/lib/types";
import { Icon, ModeIcon } from "./Icons";

const MODES: { id: Mode; label: string }[] = [
  { id: "flight", label: "Flights" },
  { id: "train", label: "Trains" },
  { id: "bus", label: "Buses" },
  { id: "cab", label: "Cabs" },
];

type Props = {
  compact?: boolean;
  initial?: { from?: string; to?: string; date?: string; pax?: number; budget?: number; modes?: Mode[] };
};

export function SearchForm({ compact = false, initial }: Props) {
  const router = useRouter();
  const [from, setFrom] = useState(initial?.from ?? "Kaithal");
  const [to, setTo] = useState(initial?.to ?? "Manali");
  const [date, setDate] = useState(initial?.date ?? todayISO(7));
  const [returnDate, setReturnDate] = useState("");
  const [roundTrip, setRoundTrip] = useState(false);
  const [pax, setPax] = useState(initial?.pax ?? 1);
  const [budget, setBudget] = useState(initial?.budget ? String(initial.budget) : "");
  const [modes, setModes] = useState<Mode[]>(initial?.modes ?? []);
  const [error, setError] = useState("");

  function toggleMode(mode: Mode) {
    setModes((prev) => (prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]));
  }

  function swap() {
    setFrom(to);
    setTo(from);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!from.trim() || !to.trim()) {
      setError("Add both a starting point and a destination.");
      return;
    }
    if (from.trim().toLowerCase() === to.trim().toLowerCase()) {
      setError("Starting point and destination need to be different.");
      return;
    }
    setError("");
    const params = new URLSearchParams({
      from: from.trim(),
      to: to.trim(),
      date,
      pax: String(pax),
    });
    if (modes.length) params.set("modes", modes.join(","));
    if (budget) params.set("budget", budget);
    if (roundTrip && returnDate) params.set("return", returnDate);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={submit}
      className={`rounded-3xl border border-ink/10 bg-white p-4 shadow-lift sm:p-5 ${compact ? "" : "md:p-6"}`}
    >
      {!compact && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ink/45">
            <Icon name="compass" className="h-4 w-4 text-teal" /> Search the whole journey
          </p>
          <div className="flex items-center gap-3 text-[12px] font-semibold">
            <label className="flex cursor-pointer items-center gap-1.5 text-ink/60">
              <input type="checkbox" checked={roundTrip} onChange={(e) => setRoundTrip(e.target.checked)} className="h-3.5 w-3.5 accent-teal" />
              Return trip
            </label>
            <span className="text-ink/20">|</span>
            <span className="text-ink/40">Prices include local transfers</span>
          </div>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-12">
        <div className="relative md:col-span-3">
          <label className="label" htmlFor="from">
            From
          </label>
          <div className="relative">
            <Icon name="pin" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-teal" />
            <input
              id="from"
              list="nexora-cities"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="field pl-9"
              placeholder="City, station or airport"
            />
          </div>
        </div>

        <div className="flex items-end md:col-span-1">
          <button
            type="button"
            onClick={swap}
            aria-label="Swap origin and destination"
            className="mb-0.5 flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 bg-sand text-ink/60 transition hover:border-teal hover:text-teal"
          >
            <Icon name="arrowRight" className="h-4 w-4" />
          </button>
        </div>

        <div className="md:col-span-3">
          <label className="label" htmlFor="to">
            To
          </label>
          <div className="relative">
            <Icon name="pin" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-saffron" />
            <input
              id="to"
              list="nexora-cities"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="field pl-9"
              placeholder="Where to?"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="label" htmlFor="date">
            Depart
          </label>
          <input id="date" type="date" value={date} min={todayISO()} onChange={(e) => setDate(e.target.value)} className="field" />
        </div>

        {roundTrip ? (
          <div className="md:col-span-2">
            <label className="label" htmlFor="returnDate">
              Return
            </label>
            <input
              id="returnDate"
              type="date"
              value={returnDate}
              min={date}
              onChange={(e) => setReturnDate(e.target.value)}
              className="field"
            />
          </div>
        ) : (
          <div className="md:col-span-1">
            <label className="label" htmlFor="pax">
              People
            </label>
            <input
              id="pax"
              type="number"
              min={1}
              max={9}
              value={pax}
              onChange={(e) => setPax(Number(e.target.value))}
              className="field px-2.5"
            />
          </div>
        )}
      </div>

      {roundTrip && (
        <div className="mt-3 grid gap-3 md:grid-cols-12">
          <div className="md:col-span-2">
            <label className="label" htmlFor="pax2">
              People
            </label>
            <input
              id="pax2"
              type="number"
              min={1}
              max={9}
              value={pax}
              onChange={(e) => setPax(Number(e.target.value))}
              className="field"
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 border-t border-ink/10 pt-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] font-bold uppercase tracking-[0.12em] text-ink/35">Modes</span>
          {MODES.map((mode) => {
            const active = modes.includes(mode.id);
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => toggleMode(mode.id)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  active ? "border-ink bg-ink text-cream" : "border-ink/12 bg-white text-ink/60 hover:border-ink/30"
                }`}
              >
                <ModeIcon mode={mode.id} className="h-3.5 w-3.5" />
                {mode.label}
              </button>
            );
          })}
          <div className="ml-auto hidden items-center gap-1.5 sm:flex">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink/35">Budget</span>
            <input
              value={budget}
              onChange={(e) => setBudget(e.target.value.replace(/[^\d]/g, ""))}
              inputMode="numeric"
              placeholder="₹ optional"
              className="w-28 rounded-full border border-ink/12 bg-white px-3 py-1.5 text-xs font-semibold outline-none focus:border-teal"
            />
          </div>
        </div>

        <button type="submit" className="btn-primary shrink-0 px-6 py-3 text-[15px]">
          <Icon name="search" className="h-4 w-4" />
          Compare every route
        </button>
      </div>

      {error && <p className="mt-3 text-xs font-semibold text-saffron-dark">{error}</p>}

      <datalist id="nexora-cities">
        {CITIES.map((c) => (
          <option key={c.name} value={c.name}>
            {c.state}
          </option>
        ))}
      </datalist>
    </form>
  );
}
