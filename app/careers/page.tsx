import Link from "next/link";
import { JobBrowser } from "@/components/JobBrowser";
import { JOBS } from "@/lib/data";
import { Icon } from "@/components/Icons";

export const metadata = {
  title: "Travel careers",
  description: "Travel and tourism jobs from verified employers — guiding, hospitality, content, photography and operations.",
};

export default function CareersPage() {
  return (
    <div>
      <section className="bg-ink pb-10 pt-12 text-cream">
        <div className="container-x grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div>
            <p className="eyebrow text-saffron">Travel careers</p>
            <h1 className="display mt-3 max-w-2xl text-4xl leading-[1.02] sm:text-6xl">
              Work that moves
              <br />
              people, <span className="italic text-saffron">literally.</span>
            </h1>
            <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-cream/60">
              Guiding, hospitality, photography, content and operations roles from verified employers. Build one
              travel profile, apply with a resume and follow every application status in one place.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
            {[
              { k: "8", v: "open roles" },
              { k: "6", v: "cities + remote" },
              { k: "100%", v: "employer verified" },
            ].map((s) => (
              <div key={s.v} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="display text-3xl text-saffron">{s.k}</p>
                <p className="text-[10.5px] uppercase tracking-wide text-cream/45">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container-x py-10">
        <JobBrowser jobs={JOBS} />

        <div className="mt-12 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="card p-6">
            <p className="eyebrow text-teal">For employers</p>
            <h2 className="display mt-2 text-3xl">Hire from a travel-native talent pool.</h2>
            <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-ink/55">
              Publish a vacancy, search candidate profiles by skills and languages, shortlist applicants and message
              them in-app. Company verification is required before a listing goes live. Subscriptions unlock featured
              placement and analytics.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/signup" className="btn-primary">Post a role</Link>
              <Link href="/admin" className="btn-ghost">How moderation works</Link>
            </div>
          </div>
          <div className="rounded-3xl bg-sand p-6">
            <p className="eyebrow text-ink/40">Candidate checklist</p>
            <ul className="mt-3 space-y-2 text-[12.5px] text-ink/60">
              {[
                "Profile with photo, bio and languages",
                "Resume upload (PDF, max 2 MB in production)",
                "Skills and work experience",
                "Preferred locations and expected salary",
              ].map((t) => (
                <li key={t} className="flex gap-2"><Icon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" />{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
