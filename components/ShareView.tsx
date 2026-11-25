"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ShareSession } from "@/lib/types";
import { getShareByToken } from "@/lib/store";
import { fmtDate, fmtTime } from "@/lib/format";
import { Icon } from "./Icons";
import { RouteSketch } from "./RouteSketch";

export function ShareView({ token }: { token: string }) {
  const [loaded, setLoaded] = useState(false);
  const [share, setShare] = useState<ShareSession | null>(null);

  useEffect(() => {
    const load = () => setShare(getShareByToken(token));
    load();
    setLoaded(true);
    window.addEventListener("storage", load);
    const t = window.setInterval(load, 3000);
    return () => {
      window.removeEventListener("storage", load);
      window.clearInterval(t);
    };
  }, [token]);

  if (!loaded) {
    return <div className="container-x py-24 text-center text-sm text-ink/45">Looking up the journey…</div>;
  }

  if (!share) {
    return (
      <div className="container-x py-24">
        <div className="card mx-auto max-w-lg p-8 text-center">
          <Icon name="shield" className="mx-auto h-9 w-9 text-teal" />
          <h1 className="display mt-3 text-3xl">This link isn't active.</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-ink/55">
            The journey share may have expired, been revoked by the traveller, or been opened in a different browser.
            Links are single-journey and cannot be guessed.
          </p>
          <Link href="/" className="btn-ink mt-4">Back to Nexora</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x max-w-3xl py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow text-teal">Shared journey</p>
          <h1 className="display mt-1 text-3xl sm:text-4xl">{share.journeyTitle}</h1>
          <p className="mt-1 text-[12.5px] text-ink/50">
            {share.origin} → {share.destination} · ETA {fmtDate(share.eta, "day")} {fmtTime(share.eta)}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wide ${share.active ? "bg-teal text-cream" : "bg-sand text-ink/50"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${share.active ? "bg-saffron animate-pulse-dot" : "bg-ink/30"}`} />
          {share.active ? "Live" : "Sharing ended"}
        </span>
      </div>

      <div className="card mt-5 overflow-hidden">
        <RouteSketch stops={[share.origin, share.destination]} live={share.active} className="h-[240px]" />
        <div className="p-5">
          <div className="flex items-center justify-between text-[11.5px] font-semibold">
            <span className="text-ink/55">Journey progress</span>
            <span>{Math.round(share.progress)}%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-sand">
            <div className="h-full rounded-full bg-teal transition-all duration-1000" style={{ width: `${share.progress}%` }} />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-sand/60 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-ink/35">Current position</p>
              <p className="mt-0.5 text-[12.5px] font-semibold">{share.lat.toFixed(3)}, {share.lng.toFixed(3)}</p>
            </div>
            <div className="rounded-xl bg-sand/60 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-ink/35">Last update</p>
              <p className="mt-0.5 text-[12.5px] font-semibold">{share.active ? "seconds ago" : fmtTime(share.updatedAt)}</p>
            </div>
            <div className="rounded-xl bg-sand/60 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-ink/35">Shared since</p>
              <p className="mt-0.5 text-[12.5px] font-semibold">{fmtDate(share.createdAt, "short")} · {fmtTime(share.createdAt)}</p>
            </div>
          </div>

          <p className="mt-4 rounded-xl border border-teal/20 bg-teal-soft/60 p-3 text-[11.5px] leading-relaxed text-teal">
            This is a read-only view. The traveller controls sharing and can revoke this link at any time. Location
            history is not shown here.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/safety" className="btn-ghost">How Nexora sharing works</Link>
        <a href="tel:112" className="btn-ink"><Icon name="phone" className="h-4 w-4" /> Emergency: call 112</a>
      </div>
      <p className="mt-3 text-[10.5px] leading-relaxed text-ink/35">
        Nexora does not dispatch emergency services. If someone is in danger, call local emergency services directly.
      </p>
    </div>
  );
}
