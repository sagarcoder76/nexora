export function inr(value: number, opts: { compact?: boolean } = {}) {
  if (opts.compact && value >= 100000) {
    return `₹${(value / 100000).toFixed(value % 100000 === 0 ? 0 : 1)}L`;
  }
  if (opts.compact && value >= 1000) {
    return `₹${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  }
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

const IST = "Asia/Kolkata";

export function fmtTime(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: IST,
  }).format(new Date(iso));
}

export function fmtDate(iso: string, style: "short" | "long" | "day" = "short") {
  const d = new Date(iso.length <= 10 ? `${iso}T12:00:00+05:30` : iso);
  if (style === "long") {
    return new Intl.DateTimeFormat("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: IST,
    }).format(d);
  }
  if (style === "day") {
    return new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: IST }).format(d);
  }
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: IST }).format(d);
}

export function fmtDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function timeAgo(mins: number) {
  if (mins < 1) return "just now";
  if (mins < 60) return `${Math.round(mins)} min ago`;
  return `${Math.floor(mins / 60)} hr ago`;
}

export function modeLabel(mode: string) {
  return { flight: "Flight", train: "Train", bus: "Bus", cab: "Cab" }[mode] ?? mode;
}

export function modeIcon(mode: string) {
  return { flight: "✈", train: "🚆", bus: "🚌", cab: "🚕" }[mode] ?? "•";
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
