import { SafetyManager } from "@/components/SafetyManager";
import { Icon } from "@/components/Icons";

export const metadata = {
  title: "Journey sharing & safety",
  description: "Voluntary, revocable live journey sharing with trusted contacts, plus an SOS workflow.",
};

export default function SafetyPage() {
  return (
    <div>
      <section className="bg-ink pb-10 pt-12 text-cream">
        <div className="container-x">
          <p className="eyebrow text-saffron">Safety, on your terms</p>
          <h1 className="display mt-3 max-w-2xl text-4xl leading-[1.02] sm:text-6xl">
            Let someone know
            <br />
            you got there <span className="italic text-saffron">safely.</span>
          </h1>
          <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-cream/60">
            Share a live, revocable link with trusted contacts while you travel. They see your route and ETA — not a
            permanent feed. You can stop it in one tap, and it expires on its own.
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-[11.5px] text-cream/50">
            <span className="inline-flex items-center gap-1.5"><Icon name="check" className="h-3.5 w-3.5 text-saffron" /> Always voluntary</span>
            <span className="inline-flex items-center gap-1.5"><Icon name="check" className="h-3.5 w-3.5 text-saffron" /> Visible while active</span>
            <span className="inline-flex items-center gap-1.5"><Icon name="check" className="h-3.5 w-3.5 text-saffron" /> Instant revocation</span>
            <span className="inline-flex items-center gap-1.5"><Icon name="check" className="h-3.5 w-3.5 text-saffron" /> No secret tracking</span>
          </div>
        </div>
      </section>

      <div className="container-x py-10">
        <SafetyManager />
        <div className="mt-10 grid gap-4 rounded-3xl border border-ink/10 bg-white p-6 sm:grid-cols-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink/40">Consent by design</p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink/55">Sharing only starts after an explicit action. A persistent banner reminds the traveller while it is active.</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink/40">Minimal retention</p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink/55">Location pings exist only for the share session and are purged after it ends. Revoking a link invalidates the token.</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink/40">Honest about emergencies</p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink/55">Nexora notifies your contacts. It does not contact police, ambulances or rescue services on your behalf.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
