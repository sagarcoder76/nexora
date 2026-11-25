import Link from "next/link";
import { notFound } from "next/navigation";
import { RequestGuide } from "@/components/RequestGuide";
import { Icon } from "@/components/Icons";
import { GUIDES } from "@/lib/data";
import { inr } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

const REVIEWS = [
  {
    name: "Ananya S.",
    text: "Punctual, thoughtful and full of context you don't get from a guidebook. The pace was perfect and every stop felt personal.",
    rating: 5,
  },
  {
    name: "Rohit & family",
    text: "Travelled with two children. Our guide adjusted the plan on the day, found shade and snacks, and kept everyone interested.",
    rating: 5,
  },
];

export default async function GuidePage({ params }: Props) {
  const { id } = await params;
  const guide = GUIDES.find((g) => g.id === id);
  if (!guide) notFound();
  const others = GUIDES.filter((g) => g.id !== guide.id && g.city === guide.city).slice(0, 2);

  return (
    <div>
      <div className="container-x pt-6">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/40">
          <Link href="/guides" className="hover:text-teal">Local guides</Link><span>/</span>
          <span className="text-ink/60">{guide.city}</span>
        </div>
      </div>

      <section className="container-x mt-4 grid gap-8 lg:grid-cols-[1.55fr_1fr]">
        <div>
          <div className="flex flex-wrap items-start gap-5">
            <span className="flex h-24 w-24 items-center justify-center rounded-3xl bg-teal text-3xl font-extrabold text-cream">{guide.initials}</span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="display text-4xl">{guide.name}</h1>
                {guide.verified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-teal px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-cream">
                    <Icon name="check" className="h-3 w-3" /> Verified guide
                  </span>
                ) : (
                  <span className="rounded-full border border-saffron/40 bg-saffron/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-saffron-dark">
                    Verification pending
                  </span>
                )}
              </div>
              <p className="mt-1 text-[13px] font-semibold text-ink/55">{guide.city} · {guide.experience} years of guiding · {guide.languages.join(", ")}</p>
              <p className="mt-2 flex flex-wrap items-center gap-3 text-[12.5px] font-semibold">
                <span><Icon name="star" className="mr-1 inline h-3.5 w-3.5 fill-saffron text-saffron" /> {guide.rating} rating</span>
                <span className="text-ink/40">{guide.reviews} reviews</span>
                <span className="text-ink/40">{inr(guide.pricePerDay)} / day</span>
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-1.5">
            {guide.categories.map((c) => <span key={c} className="chip bg-white">{c}</span>)}
            {guide.certifications.map((c) => (
              <span key={c} className="inline-flex items-center gap-1 rounded-full border border-teal/20 bg-teal-soft px-3 py-1 text-[11px] font-semibold text-teal">
                <Icon name="shield" className="h-3 w-3" /> {c}
              </span>
            ))}
          </div>

          <div className="mt-7">
            <p className="eyebrow text-ink/40">About</p>
            <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink/65">{guide.bio}</p>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Languages", value: guide.languages.length.toString(), note: guide.languages.join(" · ") },
              { label: "Experience", value: `${guide.experience} yrs`, note: "Licensed local guiding" },
              { label: "Availability", value: `${guide.availableDates.length} days`, note: "Next 30 days" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-ink/10 bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink/35">{s.label}</p>
                <p className="display mt-0.5 text-2xl">{s.value}</p>
                <p className="text-[10.5px] text-ink/45">{s.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-7">
            <p className="eyebrow text-ink/40">Services & pricing</p>
            <div className="mt-2 overflow-hidden rounded-2xl border border-ink/10 bg-white">
              {guide.categories.map((c) => (
                <div key={c} className="flex items-center justify-between border-b border-ink/8 px-4 py-3 last:border-0">
                  <div>
                    <p className="text-[13px] font-bold">{c}</p>
                    <p className="text-[11px] text-ink/45">Full day · up to 8 hours · custom route</p>
                  </div>
                  <p className="text-[13px] font-extrabold">{inr(guide.pricePerDay)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-7">
            <div className="flex items-center gap-2">
              <p className="eyebrow text-ink/40">Reviews</p>
              <span className="text-[10.5px] text-ink/35">Sample reviews · demo data</span>
            </div>
            <div className="mt-3 space-y-3">
              {REVIEWS.map((r) => (
                <div key={r.name} className="card p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[12.5px] font-bold">{r.name}</p>
                    <span className="text-[10.5px] font-bold text-saffron-dark">{"★".repeat(r.rating)}</span>
                  </div>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink/60">{r.text}</p>
                  <p className="mt-2 text-[10px] uppercase tracking-wide text-teal">Verified completed service</p>
                </div>
              ))}
            </div>
          </div>

          {others.length > 0 && (
            <div className="mt-8">
              <p className="eyebrow text-ink/40">More guides in {guide.city}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {others.map((g) => (
                  <Link key={g.id} href={`/guides/${g.id}`} className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-white p-3 hover:border-teal/40">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sand text-xs font-extrabold text-teal">{g.initials}</span>
                    <div>
                      <p className="text-[12.5px] font-bold">{g.name}</p>
                      <p className="text-[11px] text-ink/45">{g.rating}★ · {inr(g.pricePerDay)}/day</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <RequestGuide guide={guide} />
          <div className="mt-3 rounded-2xl border border-ink/10 bg-white p-4 text-[11.5px] leading-relaxed text-ink/50">
            <p className="flex items-center gap-1.5 font-bold text-ink"><Icon name="shield" className="h-3.5 w-3.5 text-teal" /> Before you meet</p>
            <p className="mt-1">Verify the guide's licence at the first meeting, share your live journey with a trusted contact, and keep payments inside the platform for support and dispute cover.</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
