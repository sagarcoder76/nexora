"use client";

import { useState } from "react";
import type { Guide } from "@/lib/types";
import { addGuideRequest, useUser } from "@/lib/store";
import { fmtDate, inr } from "@/lib/format";
import { Icon } from "./Icons";

export function RequestGuide({ guide }: { guide: Guide }) {
  const [user] = useUser();
  const [date, setDate] = useState(guide.availableDates[0] ?? "");
  const [groupSize, setGroupSize] = useState(2);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;
    addGuideRequest({
      id: `gr_${Date.now()}`,
      guideId: guide.id,
      guideName: guide.name,
      city: guide.city,
      date,
      groupSize,
      note,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    setSent(true);
  }

  if (sent) {
    return (
      <div className="card p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal text-cream">
          <Icon name="check" className="h-6 w-6" />
        </div>
        <p className="display mt-3 text-2xl">Request sent.</p>
        <p className="mt-1 text-sm text-ink/55">
          {guide.name} usually replies within a day. You'll see the status in your dashboard. Nothing is charged until
          the guide accepts.
        </p>
        <p className="mt-3 text-[11px] text-ink/40">Request reference saved locally for this prototype.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-5 sm:p-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-wide text-ink/40">Day rate</p>
          <p className="display text-3xl">{inr(guide.pricePerDay)}</p>
        </div>
        <span className="chip bg-teal-soft text-teal"><Icon name="star" className="h-3 w-3 fill-teal" /> {guide.rating}</span>
      </div>

      <div className="mt-4">
        <span className="label">Available date</span>
        <div className="flex flex-wrap gap-1.5">
          {guide.availableDates.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDate(d)}
              className={`rounded-xl border px-2.5 py-1.5 text-[11px] font-bold transition ${
                date === d ? "border-teal bg-teal text-cream" : "border-ink/12 text-ink/55 hover:border-ink/25"
              }`}
            >
              {fmtDate(d, "day")}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <label className="label" htmlFor="gr-group">Group size</label>
          <input id="gr-group" type="number" min={1} max={12} value={groupSize} onChange={(e) => setGroupSize(Number(e.target.value))} className="field" />
        </div>
        <div>
          <label className="label" htmlFor="gr-date">Exact date</label>
          <input id="gr-date" type="date" value={date} min={guide.availableDates[0]} onChange={(e) => setDate(e.target.value)} className="field" />
        </div>
      </div>

      <div className="mt-3">
        <label className="label" htmlFor="gr-note">What would you like to do?</label>
        <textarea id="gr-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} className="field resize-none" placeholder="Two adults, interested in food and old-city architecture, happy to walk 6–8 km." />
      </div>

      <div className="mt-3 rounded-xl bg-sand/60 p-3 text-[11.5px] text-ink/55">
        <div className="flex justify-between"><span>{inr(guide.pricePerDay)} × 1 day</span><span className="font-semibold">{inr(guide.pricePerDay)}</span></div>
        <div className="flex justify-between"><span>Nexora marketplace fee</span><span className="font-semibold">{inr(Math.round(guide.pricePerDay * 0.1))}</span></div>
        <div className="mt-1 flex justify-between border-t border-ink/10 pt-1 font-extrabold text-ink"><span>Estimated total</span><span>{inr(Math.round(guide.pricePerDay * 1.1))}</span></div>
      </div>

      <button type="submit" className="btn-primary mt-3 w-full py-3" disabled={!date}>
        Request {user ? "this date" : "this date"} 
      </button>
      <p className="mt-2 text-center text-[10px] leading-relaxed text-ink/35">
        No payment now. The guide accepts first; payment is authorised after confirmation. Prototype request only.
      </p>
    </form>
  );
}
