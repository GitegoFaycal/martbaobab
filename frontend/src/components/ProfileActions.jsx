import { Check, Link2, Store, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useT } from "../i18n";
import { recordConnection } from "../lib/connect";
import { whatsappLink } from "../lib/rwanda";
import WhatsAppIcon from "./WhatsAppIcon";

// The three actions every profile offers: WhatsApp me, Visit, Connect.
export default function ProfileActions({ person, layout = "row", size = "sm" }) {
  const t = useT();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [connected, setConnected] = useState(Boolean(person.connected));
  const [busy, setBusy] = useState(false);

  const whatsapp = whatsappLink(person.whatsapp, `Muraho ${person.name}, I found your profile on LOCO.`);
  const visitTo = person.shop ? `/shops/${person.shop.slug}` : `/people/${person.id}`;
  const isSelf = user?.id === person.id;

  async function connect() {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location, message: t("landing.connectLogin") } });
      return;
    }
    if (connected || busy || isSelf) return;
    setBusy(true);
    try {
      await apiRequest("/connections", { method: "POST", body: { personId: person.id, channel: "CONNECT" } });
      setConnected(true);
    } catch {
      // Keep the button as is; nothing to show the user.
    } finally {
      setBusy(false);
    }
  }

  const pad = size === "lg" ? "px-5 py-3 text-base" : "px-3.5 py-2.5 text-sm";
  const base = `inline-flex items-center justify-center gap-2 rounded-full font-bold whitespace-nowrap ${pad}`;
  const wrap = layout === "column" ? "flex flex-col gap-2" : "flex flex-wrap gap-2";

  return (
    <div className={wrap}>
      {whatsapp ? (
        <a
          href={whatsapp}
          target="_blank"
          rel="noreferrer"
          onClick={() => recordConnection({ personId: person.id, channel: "WHATSAPP" })}
          className={`${base} bg-[#25D366] text-white hover:bg-[#1ebe5d]`}
        >
          <WhatsAppIcon size={17} /> {t("listing.whatsappMe")}
        </a>
      ) : null}

      <Link to={visitTo} className={`${base} border border-loco-navy bg-white text-loco-navy hover:bg-loco-ice`}>
        {person.shop ? <Store size={16} /> : <UserRound size={16} />}
        {person.shop ? t("landing.visitBusiness") : t("landing.visitProfile")}
      </Link>

      {!isSelf && (
        <button
          type="button"
          onClick={connect}
          disabled={busy || connected}
          className={`${base} ${connected ? "bg-loco-sky text-loco-navy-dark" : "bg-loco-navy text-white hover:bg-loco-navy-dark"} disabled:cursor-default`}
        >
          {connected ? <Check size={16} /> : <Link2 size={16} />}
          {connected ? t("landing.connected") : t("landing.connect")}
        </button>
      )}
    </div>
  );
}
