"use client";

import { useState } from "react";
import type { Job } from "@/lib/types";
import { addApplication, useUser } from "@/lib/store";
import { inr } from "@/lib/format";
import { Icon } from "./Icons";

export function ApplyForm({ job }: { job: Job }) {
  const [user] = useUser();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [resume, setResume] = useState("");
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !/.+@.+\..+/.test(email)) {
      setError("Add your name and a valid email.");
      return;
    }
    if (!resume) {
      setError("Attach a resume file to continue.");
      return;
    }
    setError("");
    addApplication({
      id: `ap_${Date.now()}`,
      jobId: job.id,
      jobTitle: job.title,
      employer: job.employer,
      name,
      email,
      resumeName: resume,
      note,
      status: "submitted",
      createdAt: new Date().toISOString(),
    });
    setDone(true);
  }

  if (done) {
    return (
      <div className="card p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal text-cream"><Icon name="check" className="h-6 w-6" /></div>
        <p className="display mt-3 text-2xl">Application submitted.</p>
        <p className="mt-1 text-sm text-ink/55">{job.employer} will review your profile. Track the status in your dashboard.</p>
        <p className="mt-3 text-[10.5px] text-ink/35">Prototype: resume file content is not uploaded, only its file name is stored.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-5 sm:p-6">
      <p className="eyebrow text-saffron-dark">Apply</p>
      <p className="mt-1 text-[13px] font-semibold text-ink/60">{inr(job.salaryMin, { compact: true })}–{inr(job.salaryMax, { compact: true })} / month · {job.type}</p>
      <div className="mt-4 grid gap-2.5">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" aria-label="Full name" className="field" />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" aria-label="Email" className="field" />
        <div>
          <label className={`flex cursor-pointer items-center justify-between rounded-xl border border-dashed px-3 py-3 text-[12px] font-semibold transition ${resume ? "border-teal bg-teal-soft/40 text-teal" : "border-ink/20 text-ink/50 hover:border-ink/40"}`}>
            <span className="inline-flex items-center gap-2"><Icon name="plus" className="h-4 w-4" />{resume || "Attach resume (PDF)"}</span>
            <input type="file" accept=".pdf,.doc,.docx" className="sr-only" onChange={(e) => setResume(e.target.files?.[0]?.name ?? "")} />
          </label>
        </div>
        <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="A short note — why this role, and relevant experience." className="field resize-none" />
      </div>
      {error && <p className="mt-2 text-[11px] font-semibold text-saffron-dark">{error}</p>}
      <button type="submit" className="btn-primary mt-3 w-full py-3">Submit application</button>
      <p className="mt-2 text-center text-[10px] leading-relaxed text-ink/35">Prototype application — no data leaves this browser.</p>
    </form>
  );
}
