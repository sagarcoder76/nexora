import Link from "next/link";
import { notFound } from "next/navigation";
import { BookRoom } from "@/components/BookRoom";
import { Icon } from "@/components/Icons";
import { HOTELS } from "@/lib/data";
import { inr } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

export default async function HotelPage({ params }: Props) {
  const { id } = await params;
  const hotel = HOTELS.find((h) => h.id === id);
  if (!hotel) notFound();
  const nearby = HOTELS.filter((h) => h.id !== hotel.id && h.city === hotel.city).slice(0, 2);
  const others = HOTELS.filter((h) => h.id !== hotel.id).slice(0, 3);

  return (
    <div>
      <div className="container-x pt-6">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/40">
          <Link href="/hotels" className="hover:text-teal">Stays</Link><span>/</span>
          <Link href={`/hotels?city=${hotel.city}`} className="hover:text-teal">{hotel.city}</Link><span>/</span>
          <span className="text-ink/60">{hotel.name}</span>
        </div>
      </div>

      <section className="container-x mt-4">
        <div className="grid gap-3 sm:grid-cols-[1.6fr_1fr]">
          <div className="relative h-[300px] overflow-hidden rounded-3xl sm:h-[420px]">
            <img src={hotel.image} alt={hotel.name} className="h-full w-full object-cover" />
            <div className="absolute left-4 top-4 flex gap-2">
              <span className="rounded-full bg-white/90 px-3 py-1 text-[10.5px] font-bold uppercase tracking-wide">{hotel.type}</span>
              {hotel.verified && <span className="inline-flex items-center gap-1 rounded-full bg-teal px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-cream"><Icon name="check" className="h-3 w-3" /> Verified</span>}
            </div>
          </div>
          <div className="grid gap-3">
            <div className="relative hidden overflow-hidden rounded-3xl sm:block">
              <img src={hotel.city === "Manali" ? "/images/kerala.jpg" : "/images/manali.jpg"} alt="Room detail" className="h-full w-full object-cover" />
            </div>
            <div className="relative hidden overflow-hidden rounded-3xl sm:block">
              <img src={hotel.city === "Jaipur" ? "/images/hero.jpg" : "/images/jaipur.jpg"} alt="Property detail" className="h-full w-full object-cover" />
            </div>
            <div className="flex min-h-[96px] flex-col justify-center rounded-3xl bg-sand p-4 sm:hidden">
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink/40">Photo gallery</p>
              <p className="text-sm text-ink/60">Two more interior images of this property</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="eyebrow text-teal">{hotel.city} · {hotel.distanceKm} km from the centre</p>
              <h1 className="display mt-2 text-4xl leading-tight">{hotel.name}</h1>
              <p className="mt-1 text-[12.5px] font-semibold text-ink/50">
                <Icon name="star" className="mr-1 inline h-3.5 w-3.5 fill-saffron text-saffron" />
                {hotel.rating} · {hotel.reviews} verified guest reviews
              </p>
            </div>
            <p className="chip bg-white">{hotel.type} · {hotel.rooms.reduce((s, r) => s + r.left, 0)} rooms open</p>
          </div>

          <p className="mt-5 max-w-2xl text-[14px] leading-relaxed text-ink/65">{hotel.description}</p>

          <div className="mt-6">
            <p className="eyebrow text-ink/40">Amenities</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {hotel.amenities.map((a) => (
                <div key={a} className="flex items-center gap-2 rounded-xl border border-ink/10 bg-white px-3 py-2 text-[12px] font-semibold text-ink/65">
                  <Icon name="check" className="h-3.5 w-3.5 text-teal" /> {a}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <p className="eyebrow text-ink/40">Rooms & rates</p>
            <div className="mt-3 overflow-hidden rounded-2xl border border-ink/10 bg-white">
              {hotel.rooms.map((r) => (
                <div key={r.name} className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/8 px-4 py-3.5 last:border-0">
                  <div>
                    <p className="text-sm font-bold">{r.name}</p>
                    <p className="text-[11.5px] text-ink/50">Sleeps {r.capacity} · {r.left} rooms left · breakfast included</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold">{inr(r.price)}</p>
                    <p className="text-[10px] uppercase tracking-wide text-ink/35">per night</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-saffron/25 bg-saffron/5 p-4 text-[12px] leading-relaxed text-ink/60">
            <p className="font-bold text-ink">Cancellation policy</p>
            <p className="mt-1">Free cancellation until 48 hours before check-in. After that, the first night is charged. Check-in from 1 pm, check-out by 11 am. ID required at check-in.</p>
          </div>

          {nearby.length > 0 && (
            <div className="mt-8">
              <p className="eyebrow text-ink/40">Also in {hotel.city}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {nearby.map((h) => (
                  <Link key={h.id} href={`/hotels/${h.id}`} className="card flex gap-3 p-3 transition hover:border-teal/40">
                    <img src={h.image} alt={h.name} className="h-20 w-20 rounded-xl object-cover" />
                    <div>
                      <p className="text-[13px] font-bold">{h.name}</p>
                      <p className="text-[11px] text-ink/50">{h.type} · {h.rating}★</p>
                      <p className="mt-1 text-[12px] font-extrabold">{inr(h.price)}<span className="font-normal text-ink/40"> / night</span></p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BookRoom hotel={hotel} />
          <p className="mt-3 px-2 text-[11px] leading-relaxed text-ink/40">
            Booking support: stays@nexora.example · 24×7 traveller helpline in the app. Payments via Razorpay in
            production; this prototype charges nothing.
          </p>
        </aside>
      </section>

      <section className="container-x mt-14">
        <p className="eyebrow text-ink/40">You might also like</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {others.map((h) => (
            <Link key={h.id} href={`/hotels/${h.id}`} className="card flex items-center gap-3 p-3 transition hover:border-teal/40">
              <img src={h.image} alt={h.name} className="h-16 w-16 rounded-xl object-cover" />
              <div className="min-w-0">
                <p className="truncate text-[12.5px] font-bold">{h.name}</p>
                <p className="text-[11px] text-ink/45">{h.city}</p>
                <p className="text-[11.5px] font-extrabold">{inr(h.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
