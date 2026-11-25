"use client";

import { useEffect, useState } from "react";
import type {
  Booking,
  GuideRequest,
  JobApplication,
  ShareSession,
  TrustedContact,
  User,
} from "./types";

export const KEYS = {
  user: "nexora.user",
  bookings: "nexora.bookings",
  saved: "nexora.saved",
  contacts: "nexora.contacts",
  shares: "nexora.shares",
  guideRequests: "nexora.guideRequests",
  applications: "nexora.applications",
  searchHistory: "nexora.searchHistory",
} as const;

const EVT = "nexora:store";

export function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLS<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(EVT));
  } catch {
    /* storage unavailable - demo continues in memory */
  }
}

export function useLocal<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    const load = () => setValue(readLS(key, initial));
    load();
    window.addEventListener(EVT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(EVT, load);
      window.removeEventListener("storage", load);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  function update(next: T | ((prev: T) => T)) {
    setValue((prev) => {
      const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      writeLS(key, resolved);
      return resolved;
    });
  }

  return [value, update] as const;
}

export function useUser() {
  return useLocal<User | null>(KEYS.user, null);
}

export function signIn(user: User) {
  writeLS(KEYS.user, user);
}

export function signOut() {
  writeLS(KEYS.user, null);
}

export function addBooking(booking: Booking) {
  const list = readLS<Booking[]>(KEYS.bookings, []);
  writeLS(KEYS.bookings, [booking, ...list]);
}

export function addGuideRequest(request: GuideRequest) {
  const list = readLS<GuideRequest[]>(KEYS.guideRequests, []);
  writeLS(KEYS.guideRequests, [request, ...list]);
}

export function addApplication(app: JobApplication) {
  const list = readLS<JobApplication[]>(KEYS.applications, []);
  writeLS(KEYS.applications, [app, ...list]);
}

export function addContact(contact: TrustedContact) {
  const list = readLS<TrustedContact[]>(KEYS.contacts, []);
  writeLS(KEYS.contacts, [...list, contact]);
}

export function saveShare(share: ShareSession) {
  const list = readLS<ShareSession[]>(KEYS.shares, []);
  const next = list.some((s) => s.id === share.id)
    ? list.map((s) => (s.id === share.id ? share : s))
    : [share, ...list];
  writeLS(KEYS.shares, next);
}

export function getShareByToken(token: string) {
  return readLS<ShareSession[]>(KEYS.shares, []).find((s) => s.token === token) ?? null;
}

export function addSearchHistory(entry: { from: string; to: string; date: string; pax: number }) {
  const list = readLS<typeof entry[]>(KEYS.searchHistory, []);
  const next = [entry, ...list.filter((e) => !(e.from === entry.from && e.to === entry.to))].slice(0, 5);
  writeLS(KEYS.searchHistory, next);
}

export function makeReference(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 7).toUpperCase()}${Date.now().toString().slice(-3)}`;
}

export function makeToken() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
}
