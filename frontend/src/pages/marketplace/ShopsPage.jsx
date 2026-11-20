import { BadgeCheck, MapPin, Search, Store } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button, Container, EmptyState, PageHeader, Pagination, Spinner } from "../../components/ui";
import LocationPicker from "../../components/LocationPicker";
import ShopTile from "../../components/ShopTile";
import useFetch from "../../hooks/useFetch";
import { useT } from "../../i18n";
import { buildQuery } from "../../api/api";
import { getSavedLocation, locationFromParams, saveLocation } from "../../lib/locations";

export default function ShopsPage() {
  const t = useT();
  const [params, setParams] = useSearchParams();
  const place = params.has("district") ? locationFromParams(params) : getSavedLocation();
  const district = place.district;
  const search = params.get("search") || "";
  const page = Number(params.get("page")) || 1;
  const [text, setText] = useState(search);

  const { data, loading } = useFetch(`/shops${buildQuery({ ...place, search, page, perPage: 24 })}`);

  function update(changes) {
    const next = new URLSearchParams(params);
    Object.entries({ page: 1, ...changes }).forEach(([key, value]) => {
      if (!value || (key === "page" && value === 1)) next.delete(key); else next.set(key, value);
    });
    if ("district" in changes) {
      saveLocation(changes);
      if (!changes.district) next.set("district", "");
    }
    setParams(next);
  }

  return (
    <main className="min-h-[75vh] bg-loco-ice py-10">
      <Container>
        <PageHeader eyebrow={t("shops.eyebrow")} title={t("shops.title")} description={t("shops.text")} action={<Button as={Link} to="/register?role=SELLER" variant="orange">{t("shops.open")}</Button>} />

        <form onSubmit={(event) => { event.preventDefault(); update({ search: text.trim() }); }} className="grid gap-3 rounded-2xl border border-blue-100 bg-white p-3 shadow-sm">
          <label className="flex items-center gap-2 rounded-xl bg-loco-ice px-3">
            <Search size={18} className="text-loco-navy" />
            <input type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder={t("shops.searchPh")} aria-label={t("common.search")} className="w-full bg-transparent py-3 outline-none" />
          </label>
          <div className="flex items-start gap-2 rounded-xl bg-loco-ice px-3 py-1">
            <MapPin size={18} className="mt-3 shrink-0 text-loco-blue" />
            <LocationPicker value={place} onChange={(next) => update(next)} className="w-full sm:grid-cols-2 md:grid-cols-4" selectClassName="border-0! bg-transparent! px-0! py-2! focus:ring-0!" />
          </div>
          <Button type="submit" variant="orange">{t("common.search")}</Button>
        </form>

        <div className="mt-6">
          {loading ? (
            <Spinner label={t("common.loading")} />
          ) : data?.shops?.length ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.shops.map((shop) => <ShopTile key={shop.id} shop={shop} />)}
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
