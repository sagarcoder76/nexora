import { Planner } from "@/components/Planner";
import { SearchForm } from "@/components/SearchForm";

export const metadata = {
  title: "Multi-modal route planner",
  description: "Connect buses, trains, flights and cabs into one itinerary with transfer warnings and total costs.",
};

export default function PlannerPage() {
  return (
    <div>
      <section className="bg-ink pb-10 pt-12 text-cream">
        <div className="container-x">
          <p className="eyebrow text-saffron">Connected journeys</p>
          <h1 className="display mt-3 max-w-3xl text-4xl leading-[1.02] sm:text-6xl">
            Three vehicles.
            <br />
            One <span className="italic text-saffron">sensible</span> journey.
          </h1>
          <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-cream/60">
            Nexora checks the hubs between your origin and destination, pairs real schedules, calculates the waiting
            time and lets you swap any single leg without rebuilding the trip.
          </p>
          <div className="mt-7 max-w-2xl">
            <SearchForm compact initial={{ from: "Kaithal", to: "Manali" }} />
          </div>
        </div>
      </section>

      <div className="container-x py-10">
        <Planner />
      </div>
    </div>
  );
}
