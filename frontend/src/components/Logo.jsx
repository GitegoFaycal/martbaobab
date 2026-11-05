import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function Logo({ light = false, compact = false, onClick }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label="LOCO home"
      className="flex shrink-0 items-center gap-2"
    >
      <span
        className={`relative grid h-10 w-10 place-items-center rounded-xl font-black ${
          light ? "bg-white text-loco-wine" : "bg-loco-wine text-white"
        }`}
      >
        <MapPin size={22} />
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-loco-orange ring-2 ring-white" />
      </span>

      {!compact && (
        <span className="leading-none">
          <strong
            className={`block text-2xl font-black tracking-tight ${
              light ? "text-white" : "text-loco-wine"
            }`}
          >
            LOCO
          </strong>
          <small
            className={`text-[11px] font-semibold tracking-wide ${
              light ? "text-loco-mint" : "text-loco-orange"
            }`}
          >
            Local Connect · Rwanda
          </small>
        </span>
      )}
    </Link>
  );
}
