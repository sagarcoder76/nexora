import Link from "next/link";

type Props = {
  className?: string;
  compact?: boolean;
  tone?: "light" | "dark";
};

/**
 * Nexora mark — a route rising over a horizon, drawn inside a compass ring.
 * The dashed ring rotates slowly; the saffron node is the destination.
 */
export function Logo({ className = "", compact = false, tone = "light" }: Props) {
  const wordmark = tone === "light" ? "text-cream" : "text-ink";
  return (
    <Link href="/" aria-label="Nexora home" className={`group flex items-center gap-2.5 ${className}`}>
      <span className="relative flex h-9 w-9 items-center justify-center">
        <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden="true">
          <circle cx="20" cy="20" r="18" className="logo-ring stroke-current opacity-30" fill="none" strokeDasharray="3 5" strokeWidth="1.3" />
          <path
            d="M10.5 27.5 19 11.5l9 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-90"
          />
          <path d="M10 30.5h20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="opacity-45" />
          <circle cx="19" cy="11.5" r="3.1" fill="#FF6B2C" />
          <circle cx="19" cy="11.5" r="5.7" fill="none" stroke="#FF6B2C" strokeWidth="1" opacity="0.45" className="logo-ping" />
          <circle cx="28" cy="27.5" r="1.7" fill="currentColor" className="opacity-70" />
        </svg>
      </span>
      {!compact && (
        <span className={`flex flex-col leading-none ${wordmark}`}>
          <span className="text-[18px] font-extrabold tracking-[0.16em] transition group-hover:tracking-[0.2em]">
            NEXORA
          </span>
          <span className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.24em] opacity-45">
            Every possibility
          </span>
        </span>
      )}
    </Link>
  );
}
