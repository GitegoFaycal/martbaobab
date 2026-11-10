import { Link2, Phone } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "../../components/PersonCard";
import WhatsAppIcon from "../../components/WhatsAppIcon";
import { Button, Container, EmptyState, Message, PageHeader, Spinner } from "../../components/ui";
import useFetch from "../../hooks/useFetch";
import { useT } from "../../i18n";
import { formatRWF, timeAgo } from "../../lib/format";

export default function ConnectionsPage() {
  const t = useT();
  const { data, loading, error } = useFetch("/connections/mine");
  const [tab, setTab] = useState("asSeller");

  const rows = data?.[tab] || [];
  const totals = data?.totals || { asSeller: 0, asBuyer: 0 };

  return (
    <main className="min-h-[75vh] bg-loco-ice py-10">
      <Container>
        <PageHeader eyebrow={t("people.eyebrow")} title={t("connections.title")} description={t("connections.text")} />

        {error && <Message className="mb-4">{error}</Message>}

        <div className="mb-5 flex gap-2">
          {[
            ["asSeller", t("connections.asSeller"), totals.asSeller],
            ["asBuyer", t("connections.asBuyer"), totals.asBuyer],
          ].map(([key, label, count]) => (
            <button key={key} type="button" onClick={() => setTab(key)} className={`rounded-full px-4 py-2 text-sm font-bold ${tab === key ? "bg-loco-navy text-white" : "bg-white text-loco-ink hover:bg-loco-ice"}`}>
              {label} ({count})
            </button>
          ))}
        </div>

        {loading ? (
          <Spinner label={t("common.loading")} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Link2}
            title={tab === "asSeller" ? t("connections.asSeller") : t("connections.asBuyer")}
            description={tab === "asSeller" ? t("connections.noneSeller") : t("connections.noneBuyer")}
            action={tab === "asSeller" ? <Button as={Link} to="/profile/edit" variant="outline">{t("people.join")}</Button> : <Button as={Link} to="/shop" variant="orange">{t("nav.shop")}</Button>}
          />
        ) : (
          <ul className="space-y-3">
            {rows.map((row) => {
              const other = tab === "asSeller" ? row.buyer : row.seller;
              const name = other?.name || t("connections.guest");
              return (
                <li key={row.id} className="flex items-center gap-4 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                  {other ? (
                    <Link to={`/people/${other.id}`}><Avatar person={other} size="h-14 w-14" textSize="text-xl" /></Link>
                  ) : (
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-loco-ice text-xl font-black text-loco-navy ring-4 ring-white shadow">?</span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-loco-ink">
                      {other ? <Link to={`/people/${other.id}`} className="hover:text-loco-navy">{name}</Link> : name}
                      {other?.district && <span className="ml-2 text-xs font-semibold text-gray-500">{other.district}</span>}
                    </p>
                    <p className="mt-0.5 text-sm text-gray-600">
                      {row.listing ? (
                        <>{t("connections.aboutListing", { item: "" })} <Link to={`/listings/${row.listing.slug}`} className="font-semibold text-loco-navy hover:underline">{row.listing.name}</Link> · {formatRWF(row.listing.price)}</>
                      ) : (
                        tab === "asSeller" ? t("connections.aboutProfile") : other?.headline || ""
                      )}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                      <span className="inline-flex items-center gap-1">{row.channel === "CALL" ? <Phone size={12} /> : row.channel === "CONNECT" ? <Link2 size={12} className="text-loco-sky-dark" /> : <WhatsAppIcon size={12} className="text-[#25D366]" />} {row.channel === "CALL" ? t("connections.viaCall") : row.channel === "CONNECT" ? t("connections.viaLoco") : t("connections.viaWhatsapp")}</span>
                      <span>· {timeAgo(row.createdAt, t)}</span>
                    </p>
                  </div>
                  {row.listing?.images?.[0]?.url && (
                    <Link to={`/listings/${row.listing.slug}`} className="hidden h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-loco-ice sm:block">
                      <img src={row.listing.images[0].url} alt="" className="h-full w-full object-cover" />
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </main>
  );
}
