"use client";

import { useState } from "react";
import { GUIDES, HOTELS, JOBS } from "@/lib/data";
import { inr } from "@/lib/format";
import { Icon } from "@/components/Icons";

type QueueItem = { id: string; name: string; type: string; submitted: string; docs: number; status: "pending" | "approved" | "rejected" };

const INITIAL_QUEUE: QueueItem[] = [
  ...GUIDES.slice(0, 3).map((g, i) => ({
    id: `qg-${g.id}`,
    name: g.name,
    type: `Guide · ${g.city}`,
    submitted: i === 0 ? "2 hours ago" : `${i + 1} days ago`,
    docs: 3,
    status: "pending" as const,
  })),
  ...HOTELS.slice(0, 2).map((h, i) => ({
    id: `qh-${h.id}`,
    name: h.name,
    type: `Property · ${h.city}`,
    submitted: `${i + 1} days ago`,
    docs: 5,
    status: "pending" as const,
  })),
  {
    id: "qe-1",
    name: "Wanderframe Studio",
    type: "Employer · Goa",
    submitted: "5 hours ago",
    docs: 2,
    status: "pending",
  },
];

const TRANSACTIONS = [
  { id: "NXP-88213", user: "A. Sharma", type: "Transport", amount: 1849, commission: 92, status: "captured" },
  { id: "NXH-77120", user: "R. Menon", type: "Hotel", amount: 6480, commission: 648, status: "captured" },
  { id: "NXG-44901", user: "K. Patel", type: "Guide", amount: 3410, commission: 341, status: "authorised" },
  { id: "NXP-88119", user: "D. Iyer", type: "Transport", amount: 5450, commission: 272, status: "refund pending" },
  { id: "NXH-77004", user: "S. Khan", type: "Hotel", amount: 2950, commission: 295, status: "captured" },
];

export default function AdminPage() {
  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [tab, setTab] = useState<"queue" | "listings" | "transactions" | "reports">("queue");

  function setStatus(id: string, status: QueueItem["status"]) {
    setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
  }

  const pending = queue.filter((q) => q.status === "pending").length;

  return (
    <div className="bg-[#0f1715] text-cream">
      <div className="container-x py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-saffron">Nexora operations</p>
            <h1 className="display mt-2 text-4xl">Admin console</h1>
            <p className="mt-1 text-[12.5px] text-cream/45">Verification, moderation and transaction oversight · demo workspace</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-cream/60">
            <span className="h-1.5 w-1.5 rounded-full bg-moss" /> All systems nominal
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Active travellers", value: "12,480", delta: "+8.2% this month" },
            { label: "Verified providers", value: "42", delta: "6 awaiting review" },
            { label: "Bookings today", value: "318", delta: "94.1% completion" },
            { label: "GMV (30 days)", value: "₹1.84Cr", delta: "commission ₹9.2L" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-cream/35">{s.label}</p>
              <p className="display mt-1 text-3xl text-cream">{s.value}</p>
              <p className="text-[10.5px] text-cream/40">{s.delta}</p>
            </div>
          ))}
        </div>

        <div className="mt-7 flex gap-1 overflow-x-auto border-b border-white/10 no-scrollbar">
          {[
            { id: "queue" as const, label: `Verification queue (${pending})` },
            { id: "listings" as const, label: "Content moderation" },
            { id: "transactions" as const, label: "Transactions" },
            { id: "reports" as const, label: "Reports & complaints" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap border-b-2 px-3.5 py-2.5 text-[12px] font-bold transition ${
                tab === t.id ? "border-saffron text-cream" : "border-transparent text-cream/40 hover:text-cream/70"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-5">
          {tab === "queue" && (
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-white/[0.04] text-[10px] uppercase tracking-wide text-cream/35">
                  <tr>
                    <th className="px-4 py-3 font-bold">Applicant</th>
                    <th className="hidden px-4 py-3 font-bold sm:table-cell">Type</th>
                    <th className="px-4 py-3 font-bold">Submitted</th>
                    <th className="hidden px-4 py-3 font-bold md:table-cell">Documents</th>
                    <th className="px-4 py-3 text-right font-bold">Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8">
                  {queue.map((q) => (
                    <tr key={q.id} className="bg-white/[0.01]">
                      <td className="px-4 py-3">
                        <p className="font-bold">{q.name}</p>
                        <p className="text-[10.5px] text-cream/35 sm:hidden">{q.type}</p>
                      </td>
                      <td className="hidden px-4 py-3 text-cream/55 sm:table-cell">{q.type}</td>
                      <td className="px-4 py-3 text-cream/45">{q.submitted}</td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-cream/60">{q.docs} files</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {q.status === "pending" ? (
                          <div className="inline-flex gap-1.5">
                            <button type="button" onClick={() => setStatus(q.id, "approved")} className="rounded-full bg-moss px-2.5 py-1 text-[10px] font-bold text-ink">Approve</button>
                            <button type="button" onClick={() => setStatus(q.id, "rejected")} className="rounded-full border border-white/20 px-2.5 py-1 text-[10px] font-bold text-cream/60">Reject</button>
                          </div>
                        ) : (
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${q.status === "approved" ? "bg-moss/20 text-moss" : "bg-saffron/15 text-saffron"}`}>{q.status}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="border-t border-white/10 px-4 py-3 text-[10.5px] text-cream/30">
                Approvals in this prototype are local only. Production verification requires document review, audit logging and dual approval for high-risk accounts.
              </p>
            </div>
          )}

          {tab === "listings" && (
            <div className="grid gap-3 md:grid-cols-2">
              {JOBS.slice(0, 4).map((j) => (
                <div key={j.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-bold">{j.title}</p>
                      <p className="text-[11px] text-cream/45">{j.employer} · {j.city} · {inr(j.salaryMin, { compact: true })}–{inr(j.salaryMax, { compact: true })}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${j.verified ? "bg-moss/20 text-moss" : "bg-saffron/15 text-saffron"}`}>{j.verified ? "verified" : "review"}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button type="button" className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-cream/70">View listing</button>
                    <button type="button" className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-bold text-cream/50">Unpublish</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "transactions" && (
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full min-w-[560px] text-left text-[12px]">
                <thead className="bg-white/[0.04] text-[10px] uppercase tracking-wide text-cream/35">
                  <tr>
                    <th className="px-4 py-3 font-bold">Reference</th>
                    <th className="px-4 py-3 font-bold">Traveller</th>
                    <th className="px-4 py-3 font-bold">Type</th>
                    <th className="px-4 py-3 text-right font-bold">Amount</th>
                    <th className="px-4 py-3 text-right font-bold">Commission</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8">
                  {TRANSACTIONS.map((t) => (
                    <tr key={t.id}>
                      <td className="px-4 py-3 font-mono text-[11px] text-cream/60">{t.id}</td>
                      <td className="px-4 py-3">{t.user}</td>
                      <td className="px-4 py-3 text-cream/55">{t.type}</td>
                      <td className="px-4 py-3 text-right font-semibold">{inr(t.amount)}</td>
                      <td className="px-4 py-3 text-right text-cream/55">{inr(t.commission)}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-cream/60">{t.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "reports" && (
            <div className="space-y-3">
              {[
                { id: "RP-1042", subject: "Guide arrived late, tour shortened", entity: "Guide booking · Jaipur", severity: "medium", age: "6 hours" },
                { id: "RP-1041", subject: "Hotel room differed from listing", entity: "Property · Manali", severity: "high", age: "1 day" },
                { id: "RP-1038", subject: "Job listing asks for a deposit", entity: "Employer · Remote", severity: "high", age: "2 days" },
              ].map((r) => (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div>
                    <p className="text-[12.5px] font-bold">{r.subject}</p>
                    <p className="text-[11px] text-cream/45">{r.entity} · {r.age} ago</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase ${r.severity === "high" ? "bg-saffron/20 text-saffron" : "bg-white/10 text-cream/55"}`}>{r.severity}</span>
                    <button type="button" className="rounded-full border border-white/20 px-2.5 py-1 text-[10px] font-bold text-cream/70">Open case</button>
                  </div>
                </div>
              ))}
              <div className="rounded-2xl border border-white/10 p-4 text-[11px] leading-relaxed text-cream/35">
                Refunds, provider suspensions and account actions require an audit trail. Reports involving safety
                concerns are escalated within 24 hours.
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center gap-2 text-[10.5px] text-cream/30">
          <Icon name="shield" className="h-3.5 w-3.5" /> Role-based access · every admin action is logged · demo data
        </div>
      </div>
    </div>
  );
}
