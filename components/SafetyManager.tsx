"use client";

import { useEffect, useMemo, useState } from "react";
import type { ShareSession, TrustedContact } from "@/lib/types";
import { addContact, KEYS, makeToken, readLS, useLocal, writeLS } from "@/lib/store";
import { cityByName } from "@/lib/data";
import { fmtDate, fmtTime } from "@/lib/format";
import { Icon } from "./Icons";
import { RouteSketch } from "./RouteSketch";

const defaultETA = () => {
  const d = new Date();
  d.setHours(d.getHours() + 5, 30, 0, 0);
  return d.toISOString().slice(0, 16);
};

export function SafetyManager() {
  const [contacts, setContacts] = useLocal<TrustedContact[]>(KEYS.contacts, []);
  const [shares, setShares] = useLocal<ShareSession[]>(KEYS.shares, []);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("Family");
  const [selecteds, setSelecteds] = useState<string[]>([]);
  const [journeyTitle, setJourneyTitle] = useState("Kaithal → Manali");
  const [origin, setOrigin] = useState("Kaithal");
  const [destination, setDestination] = useState("Manali");
  const [eta, setEta] = useState(defaultETA);
  const [copied, setCopied] = useState("");
  const [sos, setSos] = useState<"idle" | "armed" | "sent">("idle");
  const [sosCount, setSosCount] = useState(5);

  const activeShare = useMemo(() => shares.find((s) => s.active) ?? shares[0] ?? null, [shares]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const list = readLS<ShareSession[]>(KEYS.shares, []);
      let changed = false;
      const next = list.map((s) => {
        if (!s.active) return s;
        const a = cityByName(s.origin);
        const b = cityByName(s.destination);
        if (!a || !b) return s;
        const progress = Math.min(100, s.progress + 3);
        const lat = a.lat + ((b.lat - a.lat) * progress) / 100 + (Math.random() - 0.5) * 0.05;
        const lng = a.lng + ((b.lng - a.lng) * progress) / 100 + (Math.random() - 0.5) * 0.05;
        changed = true;
        return {
          ...s,
          progress,
          lat,
          lng,
          active: progress < 100,
          updatedAt: new Date().toISOString(),
          history: [...s.history.slice(-30), { lat, lng, at: new Date().toISOString() }],
        };
      });
      if (changed) writeLS(KEYS.shares, next);
    }, 4000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (sos !== "armed") return;
    if (sosCount <= 0) {
      setSos("sent");
      return;
    }
    const t = window.setTimeout(() => setSosCount((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [sos, sosCount]);

  function saveContact(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || phone.replace(/\D/g, "").length < 10) return;
    addContact({
      id: `tc_${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      relationship,
      verified: false,
    });
    setName("");
    setPhone("");
  }

  function startShare() {
    if (!contacts.length) return;
    const a = cityByName(origin);
    const share: ShareSession = {
      id: `sh_${Date.now()}`,
      token: makeToken(),
      journeyTitle: journeyTitle || `${origin} → ${destination}`,
      origin,
      destination,
      eta,
      contactIds: selecteds.length ? selecteds : contacts.map((c) => c.id),
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lat: a?.lat ?? 20.59,
      lng: a?.lng ?? 78.96,
      progress: 0,
      history: [],
    };
    writeLS(KEYS.shares, [share, ...shares]);
    setCopied("");
  }

  function stopShare(id: string) {
    setShares((prev) => prev.map((s) => (s.id === id ? { ...s, active: false, updatedAt: new Date().toISOString() } : s)));
  }

  function copyLink(token: string) {
    const url = `${window.location.origin}/share/${token}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(token);
  }

  function contactsFor(share: ShareSession) {
    return contacts.filter((c) => share.contactIds.includes(c.id));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
      <div className="space-y-5">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="eyebrow text-teal">Trusted contacts</p>
            <span className="text-[10.5px] font-semibold text-ink/35">{contacts.length} saved</span>
          </div>
          <div className="mt-3 space-y-2">
            {contacts.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-ink/10 px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sand text-[11px] font-extrabold text-teal">
                    {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-[12.5px] font-bold">{c.name}</p>
                    <p className="text-[10.5px] text-ink/45">{c.relationship} · {c.phone}</p>
                  </div>
                </div>
                <span className="text-[9.5px] font-bold uppercase tracking-wide text-ink/35">Not yet verified</span>
              </div>
            ))}
            {!contacts.length && (
              <p className="rounded-xl bg-sand/60 p-3 text-[12px] text-ink/50">Add one trusted contact to start a share.</p>
            )}
          </div>

          <form onSubmit={saveContact} className="mt-4 grid gap-2 rounded-2xl bg-sand/50 p-3 sm:grid-cols-2">
            <input value={name} onChange={(e) => setName(e.target.value)} className="field" placeholder="Contact name" aria-label="Contact name" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="field" placeholder="+91 phone" aria-label="Contact phone" />
            <select value={relationship} onChange={(e) => setRelationship(e.target.value)} className="field" aria-label="Relationship">
              {["Family", "Partner", "Friend", "Colleague", "Emergency contact"].map((r) => <option key={r}>{r}</option>)}
            </select>
            <button type="submit" className="btn-ink py-2.5 text-xs"><Icon name="plus" className="h-3.5 w-3.5" /> Add contact</button>
          </form>
          <p className="mt-2 text-[10px] leading-relaxed text-ink/35">
            Contacts receive a link — they do not get an account, and they cannot start tracking you. Share only with
            people you trust.
          </p>
        </div>

        <div className="card p-5">
          <p className="eyebrow text-teal">New journey share</p>
          <div className="mt-3 grid gap-2.5">
            <div>
              <label className="label" htmlFor="s-title">Journey label</label>
              <input id="s-title" value={journeyTitle} onChange={(e) => setJourneyTitle(e.target.value)} className="field" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label" htmlFor="s-from">From</label>
                <input id="s-from" value={origin} onChange={(e) => setOrigin(e.target.value)} className="field" list="safety-cities" />
              </div>
              <div>
                <label className="label" htmlFor="s-to">To</label>
                <input id="s-to" value={destination} onChange={(e) => setDestination(e.target.value)} className="field" list="safety-cities" />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="s-eta">Expected arrival</label>
              <input id="s-eta" type="datetime-local" value={eta} onChange={(e) => setEta(e.target.value)} className="field" />
            </div>
            <div>
              <span className="label">Share with</span>
              <div className="flex flex-wrap gap-1.5">
                {contacts.map((c) => {
                  const on = selecteds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelecteds((prev) => (on ? prev.filter((id) => id !== c.id) : [...prev, c.id]))}
                      className={`rounded-full border px-2.5 py-1.5 text-[11px] font-semibold transition ${
                        on ? "border-teal bg-teal text-cream" : "border-ink/12 text-ink/55"
                      }`}
                    >
                      {c.name.split(" ")[0]}
                    </button>
                  );
                })}
                {!contacts.length && <span className="text-[11px] text-ink/40">No contacts yet</span>}
              </div>
              <p className="mt-1 text-[10px] text-ink/35">Leave all unselected to share with every trusted contact.</p>
            </div>
            <button type="button" onClick={startShare} disabled={!contacts.length} className="btn-primary mt-1 w-full py-3">
              <Icon name="share" className="h-4 w-4" /> Start sharing a live link
            </button>
            <button
              type="button"
              onClick={() => { setSos("armed"); setSosCount(5); }}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-saffron-dark bg-saffron/10 py-3 text-sm font-extrabold text-saffron-dark transition hover:bg-saffron/20"
            >
              <Icon name="alert" className="h-4 w-4" /> Emergency SOS
            </button>
          </div>
          <datalist id="safety-cities">
            {Array.from(new Set(["Kaithal", "Delhi", "Chandigarh", "Manali", "Jaipur", "Goa", "Kochi", "Leh", "Mumbai", "Bengaluru"])).map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>
      </div>

      <div className="space-y-5">
        {shares.length ? (
          <>
            {shares.slice(0, 3).map((s) => (
              <div key={s.id} className="card overflow-hidden">
                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${s.active ? "bg-teal text-cream" : "bg-sand text-ink/50"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${s.active ? "bg-saffron animate-pulse-dot" : "bg-ink/30"}`} />
                        {s.active ? "Sharing live" : s.progress >= 100 ? "Journey complete" : "Sharing stopped"}
                      </span>
                      <p className="mt-2 text-[15px] font-extrabold">{s.journeyTitle}</p>
                      <p className="text-[11.5px] text-ink/50">
                        {s.origin} → {s.destination} · ETA {fmtDate(s.eta, "day")} {fmtTime(s.eta)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="display text-2xl">{Math.round(s.progress)}%</p>
                      <p className="text-[10px] uppercase tracking-wide text-ink/35">of route</p>
                    </div>
                  </div>

                  <RouteSketch stops={[s.origin, s.destination]} live={s.active} className="mt-4 h-[140px]" compact />

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-sand">
                    <div className="h-full rounded-full bg-teal transition-all" style={{ width: `${s.progress}%` }} />
                  </div>
                  <p className="mt-2 text-[10.5px] text-ink/40">
                    Last update {s.active ? "seconds ago" : "sharing closed"} · {s.lat.toFixed(3)}, {s.lng.toFixed(3)} ·{" "}
                    {contactsFor(s).length || contacts.length} contact{(contactsFor(s).length || contacts.length) === 1 ? "" : "s"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-ink/10 bg-sand/60 px-3 py-2">
                      <Icon name="share" className="h-3.5 w-3.5 shrink-0 text-teal" />
                      <span className="truncate text-[11px] font-semibold text-ink/55">/share/{s.token}</span>
                      <button type="button" onClick={() => copyLink(s.token)} className="ml-auto shrink-0 text-[10.5px] font-bold text-teal hover:underline">
                        {copied === s.token ? "Copied" : "Copy link"}
                      </button>
                    </div>
                    {s.active && (
                      <button type="button" onClick={() => stopShare(s.id)} className="rounded-xl border border-saffron-dark/40 px-3 py-2 text-[11px] font-bold text-saffron-dark hover:bg-saffron/10">
                        Stop sharing
                      </button>
                    )}
                  </div>
                  <p className="mt-2 flex items-center gap-1.5 text-[10.5px] text-ink/35">
                    <Icon name="shield" className="h-3 w-3" /> Link is read-only, revocable and expires when sharing stops.
                  </p>
                </div>
              </div>
            ))}

            <div className="card p-5">
              <p className="eyebrow text-ink/40">Location sharing history</p>
              <ul className="mt-3 space-y-2">
                {shares.map((s) => (
                  <li key={`h-${s.id}`} className="flex items-center justify-between rounded-xl border border-ink/8 px-3 py-2 text-[11.5px]">
                    <span className="font-semibold">{s.journeyTitle}</span>
                    <span className="text-ink/40">{fmtDate(s.createdAt, "short")} · {s.active ? "active" : "closed"} · {s.history.length} pings</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[10.5px] leading-relaxed text-ink/35">
                Location pings are retained only for the life of the share plus 24 hours, then purged. No background
                tracking occurs when sharing is off.
              </p>
            </div>
          </>
        ) : (
          <div className="card flex h-full flex-col items-center justify-center p-10 text-center">
            <Icon name="shield" className="h-9 w-9 text-teal" />
            <p className="display mt-3 text-2xl">No journey sharing yet.</p>
            <p className="mt-1 max-w-sm text-[12.5px] leading-relaxed text-ink/50">
              Add a trusted contact, then start a share. You will see exactly what they see, and you can revoke it at
              any moment.
            </p>
          </div>
        )}
      </div>

      {sos !== "idle" && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/70 p-5 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-3xl bg-cream p-6 text-center shadow-lift">
            {sos === "armed" ? (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-saffron text-3xl font-extrabold text-ink">{sosCount}</div>
                <p className="display mt-4 text-2xl">Sending an SOS alert…</p>
                <p className="mt-1 text-[12.5px] text-ink/55">
                  Your live location and journey link will be sent to {contacts.length} trusted contact{contacts.length === 1 ? "" : "s"}.
                </p>
                <button type="button" onClick={() => setSos("idle")} className="btn-ghost mt-4">Cancel</button>
              </>
            ) : (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal text-cream"><Icon name="check" className="h-7 w-7" /></div>
                <p className="display mt-4 text-2xl">Alert prepared.</p>
                <p className="mt-2 text-[12.5px] leading-relaxed text-ink/60">
                  In this prototype no message is actually sent. In production this would notify your trusted contacts
                  with your live link. For a real emergency, call <strong>112</strong> (India) or local emergency
                  services immediately.
                </p>
                <p className="mt-3 rounded-xl bg-saffron/10 px-3 py-2 text-[11px] font-semibold text-saffron-dark">
                  Nexora is not an emergency service and does not dispatch help.
                </p>
                <button type="button" onClick={() => setSos("idle")} className="btn-ink mt-4 w-full">Close</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
