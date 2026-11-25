import Link from "next/link";
import { GuideBrowser } from "@/components/GuideBrowser";
import { GUIDES } from "@/lib/data";
import { Icon } from "@/components/Icons";

export const metadata = {
  title: "Local guides",
  description: "Hire verified local guides for city walks, trekking, food, culture and photography across India.",
};

export default function GuidesPage() {
  return (
    <div>
      <section className="bg-ink pb-10 pt-12 text-cream">
        <div className="container-x">
          <p className="eyebrow text-saffron">Local guides</p>
          <h1 className="display mt-3 max-w-2xl text-4xl leading-[1.02] sm:text-6xl">
            A city is a story.
            <br />
            Meet the person <span className="italic text-saffron">telling it.</span>
          </h1>
          <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-cream/60">
            Independent guides with verified identity, stated experience and clear day rates. Request a date, chat
            before confirming and pay only when the plan is agreed.
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-[11.5px] text-cream/50">
            <span className="inline-flex items-center gap-1.5"><Icon name="check" className="h-3.5 w-3.5 text-saffron" /> Document verification</span>
            <span className="inline-flex items-center gap-1.5"><Icon name="check" className="h-3.5 w-3.5 text-saffron" /> Guide accepts, never auto-booked</span>
            <span className="inline-flex items-center gap-1.5"><Icon name="check" className="h-3.5 w-3.5 text-saffron" /> Marketplace fee transparent</span>
          </div>
        </div>
      </section>

      <div className="container-x py-10">
        <GuideBrowser guides={GUIDES} />
        <div className="mt-10 grid gap-4 rounded-3xl border border-ink/10 bg-white p-6 text-[12.5px] leading-relaxed text-ink/60 sm:grid-cols-3">
          <div>
            <p className="font-bold text-ink">For travellers</p>
            <p className="mt-1">Filter by language and specialisation, request a date, and see the guide's response before paying.</p>
          </div>
          <div>
            <p className="font-bold text-ink">For guides</p>
            <p className="mt-1">Publish services, manage availability, accept or decline requests and collect verified reviews.</p>
          </div>
          <div>
            <p className="font-bold text-ink">For safety</p>
            <p className="mt-1">In-app messaging is retained for disputes. Emergency services are never simulated — always call local authorities first.</p>
          </div>
          <div className="sm:col-span-3">
            <Link href="/signup" className="btn-ghost mt-1">Become a listed guide <Icon name="arrowRight" className="h-4 w-4" /></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
