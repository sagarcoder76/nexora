import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplyForm } from "@/components/ApplyForm";
import { Icon } from "@/components/Icons";
import { JOBS } from "@/lib/data";
import { inr } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

export default async function JobPage({ params }: Props) {
  const { id } = await params;
  const job = JOBS.find((j) => j.id === id);
  if (!job) notFound();

  return (
    <div className="container-x pt-8">
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/40">
        <Link href="/careers" className="hover:text-teal">Travel careers</Link><span>/</span>
        <span className="text-ink/60">{job.title}</span>
      </div>

      <section className="mt-5 grid gap-8 lg:grid-cols-[1.55fr_1fr]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip bg-teal-soft text-teal">{job.type}</span>
            {job.verified && <span className="inline-flex items-center gap-1 rounded-full bg-teal px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-cream"><Icon name="check" className="h-3 w-3" /> Verified employer</span>}
            <span className="text-[11px] text-ink/40">Posted {job.posted}</span>
          </div>
          <h1 className="display mt-3 text-4xl leading-tight sm:text-5xl">{job.title}</h1>
          <p className="mt-2 text-[14px] font-semibold text-ink/60">{job.employer} · {job.city}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Salary", value: `${inr(job.salaryMin, { compact: true })}–${inr(job.salaryMax, { compact: true })}`, note: "per month" },
              { label: "Employment", value: job.type, note: "On-site / hybrid" },
              { label: "Applications", value: "Open", note: "Rolling review" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-ink/10 bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink/35">{s.label}</p>
                <p className="mt-0.5 text-lg font-extrabold">{s.value}</p>
                <p className="text-[10.5px] text-ink/45">{s.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-7">
            <p className="eyebrow text-ink/40">The role</p>
            <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink/65">{job.description}</p>
          </div>

          <div className="mt-6">
            <p className="eyebrow text-ink/40">What we're looking for</p>
            <ul className="mt-2 space-y-2">
              {job.requirements.map((r) => (
                <li key={r} className="flex gap-2.5 rounded-xl border border-ink/10 bg-white px-3.5 py-2.5 text-[12.5px] text-ink/65">
                  <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-teal" /> {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex flex-wrap gap-1.5">
            {job.tags.map((t) => <span key={t} className="chip bg-white">{t}</span>)}
          </div>

          <div className="mt-7 rounded-2xl border border-ink/10 bg-sand/50 p-4 text-[12px] leading-relaxed text-ink/55">
            <p className="font-bold text-ink">About {job.employer}</p>
            <p className="mt-1">
              A travel employer listed on Nexora. Company details, website and contact information are verified before
              listing. Recruitment subscriptions fund featured placement; applications are never charged.
            </p>
            <p className="mt-2 text-[11px] text-ink/40">Never pay a deposit to apply for a job. Report suspicious listings to trust@nexora.example.</p>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <ApplyForm job={job} />
          <div className="mt-3 rounded-2xl border border-ink/10 bg-white p-4 text-[11.5px] leading-relaxed text-ink/45">
            <p className="flex items-center gap-1.5 font-bold text-ink"><Icon name="shield" className="h-3.5 w-3.5 text-teal" /> Safe hiring</p>
            <p className="mt-1">Interviews happen in-app or at the verified workplace. Nexora never asks candidates for money or banking credentials.</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
