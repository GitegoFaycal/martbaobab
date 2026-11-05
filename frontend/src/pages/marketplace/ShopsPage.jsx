import { BadgeCheck, MapPin, Search, Store } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button, Container, DistrictSelect, EmptyState, PageHeader, Pagination, Spinner } from "../../components/ui";
import useFetch from "../../hooks/useFetch";
import { useT } from "../../i18n";
import { buildQuery } from "../../api/api";
import { getSavedDistrict, saveDistrict } from "../../lib/rwanda";

export default function ShopsPage() {
  const t = useT();
  const [params, setParams] = useSearchParams();
  const district = params.get("district") ?? getSavedDistrict();
  const search = params.get("search") || "";
  const page = Number(params.get("page")) || 1;
  const [text, setText] = useState(search);

  const { data, loading } = useFetch(`/shops${buildQuery({ district, search, page, perPage: 24 })}`);

  function update(changes) {
    const next = new URLSearchParams(params);
    Object.entries({ page: 1, ...changes }).forEach(([key, value]) => {
      if (!value || (key === "page" && value === 1)) next.delete(key); else next.set(key, value);
    });
    if ("district" in changes) {
      saveDistrict(changes.district);
      if (!changes.district) next.set("district", "");
    }
    setParams(next);
  }

  return (
    <main className="min-h-[75vh] bg-loco-cream py-10">
      <Container>
        <PageHeader eyebrow={t("shops.eyebrow")} title={t("shops.title")} description={t("shops.text")} action={<Button as={Link} to="/register?role=SELLER" variant="orange">{t("shops.open")}</Button>} />

        <form onSubmit={(event) => { event.preventDefault(); update({ search: text.trim() }); }} className="grid gap-3 rounded-2xl border border-orange-100 bg-white p-3 shadow-sm md:grid-cols-[1fr_220px_auto]">
          <label className="flex items-center gap-2 rounded-xl bg-loco-cream px-3">
            <Search size={18} className="text-loco-wine" />
            <input type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder={t("shops.searchPh")} aria-label={t("common.search")} className="w-full bg-transparent py-3 outline-none" />
          </label>
          <label className="flex items-center gap-2 rounded-xl bg-loco-cream px-3">
            <MapPin size={18} className="text-loco-orange" />
            <DistrictSelect aria-label={t("common.district")} value={district} onChange={(e) => update({ district: e.target.value })} placeholder={t("common.allDistricts")} className="border-0! bg-transparent! px-0! py-3! focus:ring-0!" />
          </label>
          <Button type="submit" variant="orange">{t("common.search")}</Button>
        </form>

        <div className="mt-6">
          {loading ? (
            <Spinner label={t("common.loading")} />
          ) : data?.shops?.length ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.shops.map((shop) => (
                  <Link key={shop.id} to={`/shops/${shop.slug}`} className="flex gap-4 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-loco-orange">
                    <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-loco-wine text-2xl font-black text-white">
                      {shop.logoUrl ? <img src={shop.logoUrl} alt="" className="h-full w-full object-cover" /> : shop.name.charAt(0)}
                    </span>
                    <span className="min-w-0">
                      <strong className="flex items-center gap-1 text-loco-wine"><span className="truncate">{shop.name}</span>{shop.verified && <BadgeCheck size={15} className="shrink-0 text-loco-mint-dark" />}</strong>
                      <span className="mt-0.5 flex items-center gap-1 text-xs text-gray-500"><MapPin size={12} className="text-loco-orange" /> {shop.district}{shop.sector ? `, ${shop.sector}` : ""}</span>
                      {shop.description && <span className="mt-2 line-clamp-2 block text-sm text-gray-600">{shop.description}</span>}
                      <span className="mt-2 block text-xs font-semibold text-gray-400">{t("listing.listings", { count: shop._count?.listings ?? 0 })}</span>
                    </span>
                  </Link>
                ))}
              </div>
              <Pagination pagination={data.pagination} onPage={(p) => update({ page: p })} />
            </>
          ) : (
            <EmptyState icon={Store} title={t("shops.none")} description={district ? t("shops.noneDistrict", { district }) : t("shops.noneText")} action={district ? <Button variant="outline" onClick={() => update({ district: "" })}>{t("common.allDistricts")}</Button> : null} />
          )}
        </div>
      </Container>
    </main>
  );
}
