import { cityByName } from "@/lib/data";

type Props = {
  stops: string[];
  className?: string;
  dark?: boolean;
  live?: boolean;
  compact?: boolean;
};

export function RouteSketch({ stops, className = "", dark = false, live = false, compact = false }: Props) {
  const points = stops
    .map((s) => cityByName(s))
    .filter((c): c is NonNullable<ReturnType<typeof cityByName>> => Boolean(c));

  if (points.length < 2) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border border-dashed border-ink/15 bg-sand/40 text-xs font-semibold text-ink/40 ${className}`}
      >
        Route map unavailable
      </div>
    );
  }

  const W = 640;
  const H = compact ? 170 : 240;
  const padX = 68;
  const padY = compact ? 42 : 52;

  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const spanLat = Math.max(maxLat - minLat, 0.55);
  const spanLng = Math.max(maxLng - minLng, 0.55);
  const x = (lng: number) => padX + ((lng - minLng) / spanLng) * (W - padX * 2);
  const y = (lat: number) => H - padY - ((lat - minLat) / spanLat) * (H - padY * 2);

  const coords = points.map((p) => ({ x: x(p.lng), y: y(p.lat), name: p.name }));

  const segments = coords.slice(0, -1).map((a, i) => {
    const b = coords[i + 1];
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2 - Math.abs(b.x - a.x) * 0.16 - 14;
    return { d: `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`, key: `${a.name}-${b.name}` };
  });

  const line = dark ? "#FF6B2C" : "#0F5B52";
  const dot = dark ? "#F7F4EC" : "#0B1412";
  const label = dark ? "rgba(247,244,236,0.72)" : "rgba(11,20,18,0.62)";

  return (
    <div className={`relative overflow-hidden rounded-2xl ${dark ? "bg-ink-2" : "bg-teal-soft/60"} ${className}`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label={`Route from ${points[0].name} to ${points[points.length - 1].name}`}>
        <defs>
          <pattern id="nx-dots" width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="1.4" cy="1.4" r="1.1" fill={dark ? "rgba(255,255,255,0.10)" : "rgba(15,91,82,0.16)"} />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#nx-dots)" />
        {segments.map((s, i) => (
          <g key={s.key}>
            <path d={s.d} fill="none" stroke={line} strokeOpacity="0.18" strokeWidth="7" strokeLinecap="round" />
            <path
              d={s.d}
              fill="none"
              stroke={line}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeDasharray="1 7"
            />
            {i === 0 && !live && (
              <circle r="3.4" fill={line}>
                <animateMotion dur="7s" repeatCount="indefinite" path={s.d} />
              </circle>
            )}
          </g>
        ))}
        {coords.map((c, i) => (
          <g key={c.name}>
            <circle cx={c.x} cy={c.y} r="10" fill={line} opacity="0.14" />
            <circle cx={c.x} cy={c.y} r="4.2" fill={dot} stroke={line} strokeWidth="2" />
            {live && i === coords.length - 1 && (
              <circle cx={c.x} cy={c.y} r="11" fill={line} opacity="0.25" className="animate-pulse-dot" />
            )}
            <text
              x={c.x}
              y={c.y - 15}
              textAnchor="middle"
              fontSize={compact ? "10" : "11.5"}
              fontWeight="700"
              fill={label}
              style={{ letterSpacing: "0.02em" }}
            >
              {c.name}
            </text>
          </g>
        ))}
      </svg>
      {live && (
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-ink/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-cream">
          <span className="h-1.5 w-1.5 rounded-full bg-saffron animate-pulse-dot" /> Live
        </span>
      )}
    </div>
  );
}
