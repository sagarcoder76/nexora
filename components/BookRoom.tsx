"use client";

import { useState } from "react";
import type { Hotel } from "@/lib/types";
import { addBooking, makeReference, useUser } from "@/lib/store";
import { inr, todayISO } from "@/lib/format";
import { Icon } from "./Icons";

export function BookRoom({ hotel }: { hotel: Hotel }) {
  const [user] = useUser();
  const [roomIndex, setRoomIndex] = useState(0);
  const [checkIn, setCheckIn] = useState(todayISO(7));
  const [checkOut, setCheckOut] = useState(todayISO(9));
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");

  const room = hotel.rooms[roomIndex];
  const nights = Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000));
  const total = room.price * nights;

  function reserve() {
    if (!name.trim() || !/.+@.+\..+/.test(email)) {
      setError("Add a name and a valid email for the reservation.");
      return;
    }
    if (nights < 1) {
      setError("Check-out needs to be after check-in.");
      return;
    }
    setError("");
    const ref = makeReference("NXH");
    addBooking({
      id: `hb_${Date.now()}`,
      type: "hotel",
      title: hotel.name,
      subtitle: `${room.name} · ${nights} night${nights > 1 ? "s" : ""} · ${hotel.city}`,
      date: checkIn,
      amount: total,
      status: "confirmed",
      createdAt: new Date().toISOString(),
      reference: ref,
    });
    setReference(ref);
  }

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-wide text-ink/40">From</p>
          <p className="display text-3xl">{inr(hotel.price)}<span className="ml-1 text-sm font-sans font-semibold text-ink/40">/ night</span></p>
        </div>
        <span className="chip bg-teal-soft text-teal">
          <Icon name="star" className="h-3 w-3 fill-teal" /> {hotel.rating}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div>
          <label className="label" htmlFor="checkin">Check-in</label>
          <input id="checkin" type="date" min={todayISO()} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="field" />
        </div>
        <div>
          <label className="label" htmlFor="checkout">Check-out</label>
          <input id="checkout" type="date" min={checkIn} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="field" />
        </div>
      </div>

      <div className="mt-3">
        <span className="label">Room</span>
        <div className="space-y-2">
          {hotel.rooms.map((r, i) => (
            <button
              key={r.name}
              type="button"
              onClick={() => setRoomIndex(i)}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-[12px] transition ${
                roomIndex === i ? "border-teal bg-teal-soft/50" : "border-ink/12 hover:border-ink/25"
              }`}
            >
              <span>
                <span className="font-bold">{r.name}</span>
                <span className="block text-[10.5px] text-ink/45">Sleeps {r.capacity} · {r.left} left</span>
              </span>
              <span className="font-extrabold">{inr(r.price)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 grid gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Guest name" className="field" aria-label="Guest name" />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email for confirmation" className="field" aria-label="Email" />
      </div>

      <div className="mt-3 space-y-1 rounded-xl bg-sand/60 p-3 text-[11.5px]">
        <div className="flex justify-between"><span className="text-ink/55">{inr(room.price)} × {nights} night{nights > 1 ? "s" : ""}</span><span className="font-semibold">{inr(total)}</span></div>
        <div className="flex justify-between"><span className="text-ink/55">Taxes & fees (est.)</span><span className="font-semibold">{inr(Math.round(total * 0.12))}</span></div>
        <div className="flex justify-between border-t border-ink/10 pt-1 text-[13px] font-extrabold"><span>Total</span><span>{inr(Math.round(total * 1.12))}</span></div>
        <p className="pt-1 text-[10px] text-ink/40">Free cancellation until 48 hours before check-in · pay at property</p>
      </div>

      {error && <p className="mt-2 text-[11px] font-semibold text-saffron-dark">{error}</p>}

      {reference ? (
        <div className="mt-3 rounded-2xl border border-teal/25 bg-teal-soft/60 p-3.5 text-[12px] text-teal">
          <p className="flex items-center gap-1.5 font-bold"><Icon name="check" className="h-4 w-4" /> Request confirmed</p>
          <p className="mt-1">Reference {reference}. This demo reservation is saved in your dashboard; no payment was taken.</p>
        </div>
      ) : (
        <button type="button" onClick={reserve} className="btn-primary mt-3 w-full py-3">Reserve room</button>
      )}
      <p className="mt-2 text-center text-[10px] text-ink/35">Prototype inventory · availability revalidated on submit</p>
    </div>
  );
}
