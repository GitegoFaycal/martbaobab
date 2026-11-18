import { Link } from "react-router-dom";

// The LOCO mark (pin with people) plus the wordmark. `full` shows the
// complete lock-up artwork instead.
export default function Logo({ light = false, compact = false, full = false, onClick }) {
  if (full) {
    return (
      <Link to="/" onClick={onClick} aria-label="LOCO home" className="inline-block">
        <img src="/brand/loco-logo.png" alt="LOCO · Local Connect" className={`h-24 w-auto ${light ? "rounded-2xl bg-white p-2" : ""}`} />
      </Link>
    );
  }

  return (
    <Link to="/" onClick={onClick} aria-label="LOCO home" className="flex shrink-0 items-center gap-2">
      <img src="/brand/loco-mark.png" alt="" className={`h-10 w-10 object-contain ${light ? "rounded-xl bg-white p-0.5" : ""}`} />

      {!compact && (
        <span className="leading-none">
          <strong className={`block text-2xl font-black tracking-tight ${light ? "text-white" : "text-loco-navy"}`}>LOCO</strong>
          <small className={`text-[11px] font-semibold tracking-wide ${light ? "text-loco-sky" : "text-loco-blue"}`}>Local Connect · Rwanda</small>
        </span>
      )}
    </Link>
  );
}
