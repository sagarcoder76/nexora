import { CITIES, GUIDES, HOTELS, cityByName } from "./data";
import type { Journey, JourneyLeg, Mode, Offer, SearchQuery } from "./types";
import { todayISO } from "./format";

const AIRLINES = [
  { name: "IndiGo", code: "6E" },
  { name: "Air India Express", code: "IX" },
  { name: "Akasa Air", code: "QP" },
  { name: "SpiceJet", code: "SG" },
];

const TRAINS = [
  { name: "Shatabdi Express", code: "12011" },
  { name: "Rajdhani Express", code: "12425" },
  { name: "Jan Shatabdi", code: "12057" },
  { name: "Himalayan Queen", code: "14095" },
  { name: "Netravati Express", code: "12618" },
];

const BUS_OPERATORS = [
  { name: "Zingbus Plus", code: "ZB" },
  { name: "IntrCity SmartBus", code: "IC" },
  { name: "HRTC Volvo", code: "HR" },
  { name: "VRL Travels", code: "VR" },
  { name: "Laxmi Holidays", code: "LH" },
];

const CAB_OPERATORS = [
  { name: "Ola Outstation", code: "OL" },
  { name: "Uber Intercity", code: "UB" },
  { name: "Savaari Cabs", code: "SV" },
];

function hash(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seeded(key: string) {
  let a = hash(key);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function geoDistance(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function roadDistance(from: string, to: string) {
  const a = cityByName(from);
  const b = cityByName(to);
  if (!a || !b) return 0;
  return Math.round(geoDistance(a.lat, a.lng, b.lat, b.lng) * 1.22);
}

function isoAt(date: string, minutesFromMidnight: number) {
  const base = new Date(`${date}T00:00:00+05:30`).getTime();
  return new Date(base + minutesFromMidnight * 60000).toISOString();
}

function round(n: number, step = 10) {
  return Math.round(n / step) * step;
}

function buildOffer(
  mode: Mode,
  from: string,
  to: string,
  date: string,
  index: number,
  opts: { operator: string; code: string; durationMin: number; price: number; seats: number; depMin: number; meta: string[]; source: string; rating: number; cabWhole?: boolean },
): Offer {
  const arriveMin = opts.depMin + opts.durationMin;
  return {
    id: `${mode}-${hash(`${from}${to}${date}${index}${opts.code}`).toString(36)}`,
    mode,
    operator: opts.operator,
    code: opts.code,
    from,
    to,
    departISO: isoAt(date, opts.depMin),
    arriveISO: isoAt(date, arriveMin),
    durationMin: opts.durationMin,
    price: Math.max(120, round(opts.price)),
    seats: Math.max(0, opts.seats),
    availability: opts.seats === 0 ? "sold_out" : opts.seats < 5 ? "filling" : "available",
    rating: opts.rating,
    meta: opts.meta,
    source: opts.source,
    updatedMinsAgo: 1 + Math.floor(seeded(`${from}${to}${mode}${index}`)() * 11),
    cabForWholeVehicle: opts.cabWhole,
  };
}

function offersForMode(mode: Mode, from: string, to: string, date: string): Offer[] {
  const a = cityByName(from);
  const b = cityByName(to);
  if (!a || !b) return [];
  const road = roadDistance(from, to);
  const air = Math.round(geoDistance(a.lat, a.lng, b.lat, b.lng));
  const out: Offer[] = [];

  if (mode === "flight") {
    if (!a.airport || !b.airport) return [];
    for (let i = 0; i < 3; i++) {
      const r = seeded(`f${from}${to}${date}${i}`);
      const airline = AIRLINES[Math.floor(r() * AIRLINES.length)];
      const duration = Math.round(38 + (air / 690) * 60 + r() * 18);
      const dep = 5 * 60 + Math.floor(r() * 17) * 30;
      const base = 1950 + air * 3.4;
      const price = base * (0.86 + r() * 0.5);
      const seats = Math.floor(r() * 34);
      out.push(
        buildOffer(mode, from, to, date, i, {
          operator: airline.name,
          code: `${airline.code} ${100 + Math.floor(r() * 899)}`,
          durationMin: duration,
          price,
          seats,
          depMin: dep,
          meta: ["Non-stop", i === 0 ? "15 kg check-in" : "7 kg cabin only", i === 2 ? "Flexi fare" : "Saver fare"],
          source: `${airline.name} partner feed`,
          rating: 3.9 + r() * 0.9,
        }),
      );
    }
    return out;
  }

  if (mode === "train") {
    const classes = [
      { label: "Sleeper", factor: 1 },
      { label: "3A", factor: 2.2 },
      { label: "2A", factor: 3.1 },
    ];
    const duration = Math.round(30 + (road / 54) * 60);
    const train = TRAINS[hash(`${from}${to}`) % TRAINS.length];
    for (let i = 0; i < 3; i++) {
      const r = seeded(`t${from}${to}${date}${i}`);
      const cls = classes[i];
      const dep = 4 * 60 + Math.floor(r() * 18) * 35;
      out.push(
        buildOffer(mode, from, to, date, i, {
          operator: `${train.name}`,
          code: `${train.code} · ${cls.label}`,
          durationMin: Math.round(duration * (0.94 + r() * 0.15)),
          price: (140 + road * 0.5) * cls.factor,
          seats: Math.floor(r() * 90),
          depMin: dep,
          meta: [cls.label, i === 0 ? "Pantry available" : "No pantry", "Confirmed schedule"],
          source: "IRCTC-authorised partner",
          rating: 3.7 + r() * 0.9,
        }),
      );
    }
    return out;
  }

  if (mode === "bus") {
    const duration = Math.round(25 + (road / 43) * 60);
    for (let i = 0; i < 3; i++) {
      const r = seeded(`b${from}${to}${date}${i}`);
      const op = BUS_OPERATORS[Math.floor(r() * BUS_OPERATORS.length)];
      const dep = 5 * 60 + Math.floor(r() * 16) * 40;
      const ac = r() > 0.28;
      out.push(
        buildOffer(mode, from, to, date, i, {
          operator: op.name,
          code: `${op.code}-${100 + Math.floor(r() * 800)}`,
          durationMin: Math.round(duration * (0.95 + r() * 0.2)),
          price: 210 + road * 1.02 * (ac ? 1.22 : 1),
          seats: Math.floor(r() * 26),
          depMin: dep,
          meta: [ac ? "AC sleeper" : "Non-AC seater", i === 0 ? "Live tracking" : "Boarding point", i === 2 ? "Free cancellation" : "Partial refund"],
          source: `${op.name} via aggregator`,
          rating: 3.6 + r() * 1.1,
        }),
      );
    }
    return out;
  }

  // cab
  for (let i = 0; i < 2; i++) {
    const r = seeded(`c${from}${to}${date}${i}`);
    const op = CAB_OPERATORS[Math.floor(r() * CAB_OPERATORS.length)];
    const duration = Math.round(18 + (road / 52) * 60);
    out.push(
      buildOffer(mode, from, to, date, i, {
        operator: op.name,
        code: i === 0 ? "Sedan · 4 seats" : "SUV · 6 seats",
        durationMin: duration,
        price: 1250 + road * 11.6 * (i === 0 ? 1 : 1.35),
        seats: 4 + i * 2,
        depMin: 6 * 60 + Math.floor(r() * 9) * 30,
        meta: ["Door to door", "Tolls & parking extra", i === 0 ? "AC sedan" : "AC SUV"],
        source: `${op.name} API`,
        rating: 4.1 + r() * 0.7,
        cabWhole: true,
      }),
    );
  }
  return out;
}

export function offersFor(from: string, to: string, date: string, modes?: Mode[]): Offer[] {
  const allowed: Mode[] = modes?.length ? modes : ["flight", "train", "bus", "cab"];
  return allowed.flatMap((m) => offersForMode(m, from, to, date));
}

function shiftDeparture(offer: Offer, newDepartISO: string): Offer {
  const duration = offer.durationMin;
  return {
    ...offer,
    id: `${offer.id}-s`,
    departISO: newDepartISO,
    arriveISO: new Date(new Date(newDepartISO).getTime() + duration * 60000).toISOString(),
  };
}

function makeJourney(from: string, to: string, date: string, pax: number, legs: JourneyLeg[]): Journey {
  const fare = legs.reduce((sum, leg) => sum + (leg.cabForWholeVehicle ? leg.price : leg.price * pax), 0);
  const lastIsCab = legs[legs.length - 1]?.mode === "cab";
  const transferEstimate = lastIsCab ? 0 : 249;
  const first = legs[0];
  const last = legs[legs.length - 1];
  const totalDurationMin = Math.max(
    0,
    Math.round((new Date(last.arriveISO).getTime() - new Date(first.departISO).getTime()) / 60000),
  );
  const warnings: string[] = [];
  const transferLegs = legs.filter((l) => l.connection);
  if (transferLegs.some((l) => (l.waitMin ?? 60) < 45)) {
    warnings.push("One transfer leaves under 45 minutes — carry your own bags and keep a buffer.");
  }
  if (legs.some((l) => l.connection === "estimated")) {
    warnings.push("Some connection times are estimated, not confirmed schedules.");
  }
  const modes = Array.from(new Set(legs.map((l) => l.mode)));
  const id = `J${hash(legs.map((l) => l.id).join("|")).toString(36).toUpperCase()}`;

  return {
    id,
    from,
    to,
    date,
    pax,
    legs,
    fare,
    transferEstimate,
    totalCost: fare + transferEstimate,
    totalDurationMin,
    transfers: legs.length - 1,
    modes,
    estimated: legs.some((l) => l.connection === "estimated"),
    warning: warnings[0],
    difficulty: legs.length > 2 || totalDurationMin > 15 * 60 ? "demanding" : legs.length === 2 ? "moderate" : "easy",
  };
}

export type SearchResult = {
  journeys: Journey[];
  sources: string[];
  hubsConsidered: string[];
  query: { from: string; to: string; date: string; pax: number };
};

export function searchJourneys(q: SearchQuery): SearchResult {
  const fromCity = cityByName(q.from);
  const toCity = cityByName(q.to);
  const date = q.date || todayISO(3);
  if (!fromCity || !toCity || fromCity.name === toCity.name) {
    return {
      journeys: [],
      sources: [],
      hubsConsidered: [],
      query: { from: fromCity?.name ?? q.from, to: toCity?.name ?? q.to, date, pax: q.pax || 1 },
    };
  }
  const from = fromCity.name;
  const to = toCity.name;
  const pax = Math.min(9, Math.max(1, q.pax || 1));
  const modes = q.modes;
  const direct = offersFor(from, to, date, modes);

  const journeys: Journey[] = direct.map((o) => makeJourney(from, to, date, pax, [{ ...o, connection: "confirmed" }]));

  // Connected journeys via hubs that sit roughly between origin and destination.
  const directDistance = geoDistance(fromCity.lat, fromCity.lng, toCity.lat, toCity.lng);
  const hubs = CITIES.filter(
    (c) =>
      c.hub &&
      c.name !== from &&
      c.name !== to &&
      geoDistance(fromCity.lat, fromCity.lng, c.lat, c.lng) +
        geoDistance(c.lat, c.lng, toCity.lat, toCity.lng) <=
        directDistance * 1.55 + 180,
  )
    .sort(
      (a, b) =>
        geoDistance(fromCity.lat, fromCity.lng, a.lat, a.lng) +
        geoDistance(a.lat, a.lng, toCity.lat, toCity.lng) -
        (geoDistance(fromCity.lat, fromCity.lng, b.lat, b.lng) +
          geoDistance(b.lat, b.lng, toCity.lat, toCity.lng)),
    )
    .slice(0, 2);

  const hubsConsidered = hubs.map((h) => h.name);

  for (const hub of hubs) {
    const firstOffers = offersFor(from, hub.name, date, modes).sort((a, b) => a.price - b.price);
    const secondOffers = offersFor(hub.name, to, date, modes).sort((a, b) => a.price - b.price);
    if (!firstOffers.length || !secondOffers.length) continue;

    const seen = new Set<string>();
    for (const legA of firstOffers.slice(0, 3)) {
      for (const legB of secondOffers.slice(0, 3)) {
        const key = `${legA.mode}-${legB.mode}`;
        if (seen.has(key)) continue;
        seen.add(key);

        let departB = new Date(legB.departISO).getTime();
        const arriveA = new Date(legA.arriveISO).getTime();
        let waitMin = Math.round((departB - arriveA) / 60000);
        if (waitMin < 45) {
          waitMin += 1440 * Math.ceil((45 - waitMin) / 1440);
          departB += 1440 * 60000 * Math.ceil(0);
        }
        if (waitMin < 45) waitMin += 1440;
        const shiftedB =
          waitMin === Math.round((new Date(legB.departISO).getTime() - arriveA) / 60000)
            ? legB
            : shiftDeparture(legB, new Date(arriveA + waitMin * 60000).toISOString());

        const legs: JourneyLeg[] = [
          { ...legA, connection: "confirmed" },
          {
            ...shiftedB,
            connection: waitMin < 90 ? "estimated" : "confirmed",
            waitMin,
            walkMin: legA.mode !== legB.mode ? 10 : 4,
          },
        ];
        journeys.push(makeJourney(from, to, date, pax, legs));
      }
    }
  }

  const deduped = Array.from(new Map(journeys.map((j) => [j.id, j])).values());
  const budgeted = q.budget ? deduped.filter((j) => j.totalCost <= q.budget! * 1.35) : deduped;
  const ranked = rankJourneys(budgeted.length ? budgeted : deduped, q.sort ?? "cost").slice(0, 18);
  const annotate = annotateJourneys(ranked);
  const sources = Array.from(new Set(direct.map((o) => o.source))).slice(0, 6);

  return { journeys: annotate, sources, hubsConsidered, query: { from, to, date, pax } };
}

export function rankJourneys(journeys: Journey[], sort: NonNullable<SearchQuery["sort"]>): Journey[] {
  const list = [...journeys];
  switch (sort) {
    case "duration":
      return list.sort((a, b) => a.totalDurationMin - b.totalDurationMin || a.totalCost - b.totalCost);
    case "depart":
      return list.sort(
        (a, b) => new Date(a.legs[0].departISO).getTime() - new Date(b.legs[0].departISO).getTime(),
      );
    case "rating":
      return list.sort((a, b) => avgRating(b) - avgRating(a) || a.totalCost - b.totalCost);
    default:
      return list.sort((a, b) => a.totalCost - b.totalCost || a.totalDurationMin - b.totalDurationMin);
  }
}

export function avgRating(j: Journey) {
  return j.legs.reduce((s, l) => s + l.rating, 0) / Math.max(1, j.legs.length);
}

export function annotateJourneys(journeys: Journey[]): Journey[] {
  if (!journeys.length) return journeys;
  const cheapest = [...journeys].sort((a, b) => a.totalCost - b.totalCost)[0];
  const fastest = [...journeys].sort((a, b) => a.totalDurationMin - b.totalDurationMin)[0];
  const fewest = [...journeys].sort((a, b) => a.transfers - b.transfers || a.totalCost - b.totalCost)[0];
  return journeys.map((j) => {
    const tags: string[] = [];
    if (j.id === cheapest.id) tags.push("Lowest total cost");
    if (j.id === fastest.id) tags.push("Fastest door to door");
    if (j.id === fewest.id && j.transfers === 0) tags.push("Direct");
    if (j.transfers > 0 && j.totalCost < cheapest.totalCost * 1.18) tags.push("Budget connection");
    return { ...j, tag: tags[0] };
  });
}

export function withLegs(journey: Journey, legs: JourneyLeg[]): Journey {
  return makeJourney(journey.from, journey.to, journey.date, journey.pax, legs);
}

export function journeySummary(j: Journey) {
  return j.legs.map((l) => `${l.mode === "cab" ? "Cab" : l.operator.split(" ")[0]} ${l.from}→${l.to}`).join(" · ");
}

export type AssistantPlan = {
  from: string;
  to: string;
  days: number;
  budget: number;
  transport: Journey | null;
  hotel: (typeof HOTELS)[number] | null;
  guide: (typeof GUIDES)[number] | null;
  daysPlan: { day: number; title: string; items: string[]; cost: number }[];
  budgetLines: { label: string; amount: number; note: string }[];
  total: number;
  withinBudget: boolean;
  notes: string[];
};

export function buildAssistantPlan(prompt: string): AssistantPlan {
  const text = prompt.toLowerCase();
  const mentioned = CITIES.filter((c) => text.includes(c.name.toLowerCase()));
  let from = mentioned[0]?.name ?? "Kaithal";
  let to = mentioned[1]?.name ?? "Manali";
  if (mentioned.length >= 2 && mentioned[0].name === mentioned[1].name) {
    to = "Manali";
  }
  const fromTo = prompt.match(/from\s+([a-zA-Z\s]+?)\s+to\s+([a-zA-Z\s]+?)(?:\s+for|\s+in|\s+with|\.|,|$)/i);
  if (fromTo) {
    const a = cityByName(fromTo[1]);
    const b = cityByName(fromTo[2]);
    if (a) from = a.name;
    if (b) to = b.name;
  }
  const dayMatch = prompt.match(/(\d+)\s*(day|night)/i);
  const days = Math.min(14, Math.max(1, dayMatch ? Number(dayMatch[1]) : 4));
  const budgetMatch = prompt.match(/(?:₹|rs\.?|inr)?\s*([\d,]{3,})\s*(?:rupees|budget|₹)?/i);
  const budget = budgetMatch ? Number(budgetMatch[1].replace(/,/g, "")) : 8000;
  const comfort = /comfort|premium|luxury|family/i.test(text);

  const search = searchJourneys({ from, to, date: todayISO(7), pax: 1, sort: comfort ? "duration" : "cost" });
  const transport =
    [...search.journeys].sort((a, b) =>
      comfort ? a.totalDurationMin - b.totalDurationMin : a.totalCost - b.totalCost,
    )[0] ?? null;

  const cityHotels = HOTELS.filter((h) => h.city.toLowerCase() === to.toLowerCase()).sort(
    (a, b) => (comfort ? b.rating - a.rating : a.price - b.price),
  );
  const nights = Math.max(1, days - 1);
  const affordable = cityHotels.find((h) => h.price * nights <= budget * 0.42) ?? cityHotels[0] ?? null;
  const guide = GUIDES.filter((g) => g.city.toLowerCase() === to.toLowerCase()).sort((a, b) => b.rating - a.rating)[0] ?? null;

  const dest = cityByName(to);
  const highlights = dest?.highlights ?? ["Old town walk", "Local market", "Sunset viewpoint"];
  const transportCost = transport?.totalCost ?? 1800;
  const stayCost = (affordable?.price ?? 1600) * nights;
  const food = Math.round(days * 650);
  const guideCost = guide ? Math.min(guide.pricePerDay, 3200) : 0;
  const local = days * 250;

  const budgetLines = [
    { label: "Transport (return, per person)", amount: transportCost * 2, note: transport ? "Cheapest sensible route, both directions" : "Estimate" },
    { label: `Stay · ${nights} night${nights > 1 ? "s" : ""}`, amount: stayCost, note: affordable?.name ?? "Budget guesthouse" },
    { label: "Food & chai", amount: food, note: `₹650 × ${days} days` },
    { label: "Guide (one day)", amount: guideCost, note: guide?.name ?? "Local guide marketplace" },
    { label: "Local transfers & entries", amount: local, note: `₹250 × ${days} days` },
  ];
  const subtotal = budgetLines.reduce((s, l) => s + l.amount, 0);
  const buffer = Math.round(subtotal * 0.08);
  budgetLines.push({ label: "Buffer", amount: buffer, note: "8% contingency" });
  const total = subtotal + buffer;

  const daysPlan = Array.from({ length: days }).map((_, i) => {
    const day = i + 1;
    if (i === 0)
      return {
        day,
        title: `Arrive in ${to}, settle in`,
        items: [transport ? `${transport.legs.map((l) => l.mode).join(" + ")} from ${from}` : `Travel to ${to}`, "Check in and slow lunch", highlights[0] ?? "Evening walk"],
        cost: Math.round(food / days + local / days),
      };
    if (i === days - 1)
      return {
        day,
        title: "Last morning & journey home",
        items: ["Sunrise coffee", highlights[highlights.length - 1] ?? "Local market", "Pack and head back"],
        cost: Math.round(food / days + transportCost),
      };
    return {
      day,
      title: i === 1 ? (guide ? `Guided day with ${guide.name}` : "Explore the old quarter") : highlights[Math.min(i, highlights.length - 1)] ?? "Slow travel day",
      items: [
        highlights[i % highlights.length] ?? "Neighbourhood walk",
        "Local lunch stop",
        i === 1 && guide ? `${guide.categories[0]} with a verified local guide` : "Sunset viewpoint",
      ],
      cost: Math.round(food / days + local / days + (i === 1 ? guideCost : 0)),
    };
  });

  const notes = [
    "Built from live search results in this demo dataset — no provider booking has been made.",
    transport?.warning ?? "Fares and availability must be revalidated before booking.",
    guide ? "Guide availability is subject to confirmation by the guide." : "No verified guide listed for this destination yet.",
  ];

  return {
    from,
    to,
    days,
    budget,
    transport,
    hotel: affordable,
    guide: guide ?? null,
    daysPlan,
    budgetLines,
    total,
    withinBudget: total <= budget,
    notes,
  };
}
