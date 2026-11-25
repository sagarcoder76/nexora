import Link from "next/link";
import { Logo } from "./Logo";

const columns = [
  {
    title: "Travel",
    links: [
      { href: "/search", label: "Compare transport" },
      { href: "/places", label: "Places to visit" },
      { href: "/routes", label: "All routes & fares" },
      { href: "/planner", label: "Multi-modal planner" },
      { href: "/hotels", label: "Stays" },
      { href: "/guides", label: "Local guides" },
    ],
  },
  {
    title: "More",
    links: [
      { href: "/assistant", label: "AI trip planner" },
      { href: "/safety", label: "Live journey sharing" },
      { href: "/careers", label: "Travel careers" },
      { href: "/dashboard", label: "Your dashboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/admin", label: "Admin console" },
      { href: "/signup", label: "Create an account" },
      { href: "/login", label: "Sign in" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-ink text-cream">
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo className="text-cream" />
            <p className="display mt-5 max-w-xs text-2xl leading-snug text-cream/90">
              Your journey.
              <br />
              <span className="italic text-saffron">Every possibility.</span>
            </p>
            <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-cream/50">
              Transport comparison, connected route planning, stays, local guides, journey sharing and travel
              work — in one ecosystem. Built for India, designed for the world.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cream/40">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-cream/70 transition hover:text-saffron">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="text-[11.5px] leading-relaxed text-cream/40">
            Nexora prototype · Fares, inventory, provider feeds and verification states shown in this build are
            simulated for product demonstration. No live ticket, hotel or guide booking is placed, and no emergency
            service is dispatched. Production access requires authorised provider agreements, payment integration and
            legal review under the DPDP framework.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-cream/35">
            <span>© {new Date().getFullYear()} Nexora Travel Technologies. Concept build.</span>
            <span>Made for travellers, guides and the people who move them.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
