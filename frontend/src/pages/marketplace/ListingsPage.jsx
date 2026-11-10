import { Filter, MapPin, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ListingCard from "../../components/ListingCard";
import {
  Button,
  Container,
  DistrictSelect,
  EmptyState,
  Input,
  Message,
  PageHeader,
  Pagination,
  Select,
  Spinner,
} from "../../components/ui";
import useFetch from "../../hooks/useFetch";
import { useT } from "../../i18n";
import { buildQuery } from "../../api/api";
import { getSavedDistrict, saveDistrict } from "../../lib/rwanda";

const MODES = {
  shop: { key: "shop", fixed: { condition: "NEW", type: "PRODUCT" }, categoryKind: "GOODS" },
  "second-hand": { key: "secondHand", fixed: { condition: "USED" }, categoryKind: "GOODS" },
  services: { key: "services", fixed: { type: "SERVICE" }, categoryKind: "SERVICES" },
};

export default function ListingsPage({ mode = "shop" }) {
  const t = useT();
  const config = MODES[mode];
  const [params, setParams] = useSearchParams();

  const filters = {
    search: params.get("search") || "",
    category: params.get("category") || "",
    district: params.get("district") ?? getSavedDistrict(),
    sort: params.get("sort") || "newest",
    minPrice: params.get("minPrice") || "",
    maxPrice: params.get("maxPrice") || "",
    page: Number(params.get("page")) || 1,
  };

  const [searchText, setSearchText] = useState(filters.search);
  useEffect(() => setSearchText(filters.search), [filters.search]);

  const query = useMemo(
    () => buildQuery({ ...config.fixed, ...filters, perPage: 24 }),
    [config, filters.search, filters.category, filters.district, filters.sort, filters.minPrice, filters.maxPrice, filters.page]
  );

  const { data, loading, error } = useFetch(`/listings${query}`);
  const { data: categoryData } = useFetch(`/categories?kind=${config.categoryKind}`);
  const categories = categoryData?.categories || [];

  function update(changes) {
    const next = new URLSearchParams(params);
    Object.entries({ ...changes, page: changes.page ?? 1 }).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined || (key === "page" && value === 1)) next.delete(key);
      else next.set(key, String(value));
    });
    if ("district" in changes) {
      saveDistrict(changes.district);
      if (!changes.district) next.set("district", "");
    }
    setParams(next);
  }

  const activeFilterCount = [filters.category, filters.minPrice, filters.maxPrice].filter(Boolean).length;

  return (
    <main className="min-h-[75vh] bg-loco-ice py-10">
      <Container>
        <PageHeader eyebrow={t(`sections.${config.key}Eyebrow`)} title={t(`sections.${config.key}Title`)} description={t(`sections.${config.key}Text`)} />

        <form onSubmit={(event) => { event.preventDefault(); update({ search: searchText.trim() }); }} className="grid gap-3 rounded-2xl border border-blue-100 bg-white p-3 shadow-sm md:grid-cols-[1fr_220px_auto]">
          <label className="flex items-center gap-2 rounded-xl bg-loco-ice px-3">
            <Search size={18} className="shrink-0 text-loco-navy" />
            <input type="search" value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder={t("sections.searchPh")} aria-label={t("common.search")} className="w-full bg-transparent py-3 outline-none" />
          </label>
          <label className="flex items-center gap-2 rounded-xl bg-loco-ice px-3">
            <MapPin size={18} className="shrink-0 text-loco-blue" />
            <DistrictSelect aria-label={t("common.district")} value={filters.district} onChange={(event) => update({ district: event.target.value })} placeholder={t("common.allDistricts")} className="border-0! bg-transparent! px-0! py-3! focus:ring-0!" />
          </label>
          <Button type="submit" variant="orange">{t("common.search")}</Button>
        </form>

        <div className="mt-6 grid gap-6 lg:grid-cols-[250px_1fr]">
          <aside className="space-y-5 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm lg:sticky lg:top-24 lg:self-start">
            <div className="flex items-center justify-between">
              <h2 className="inline-flex items-center gap-2 font-black text-loco-navy"><Filter size={17} /> {t("common.filters")}</h2>
              {activeFilterCount > 0 && <button type="button" onClick={() => update({ category: "", minPrice: "", maxPrice: "" })} className="text-xs font-bold text-loco-blue">{t("common.clear")} ({activeFilterCount})</button>}
            </div>

            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">{t("common.category")}</h3>
              <ul className="max-h-72 space-y-1 overflow-y-auto pr-1 text-sm">
                <li><button type="button" onClick={() => update({ category: "" })} className={`w-full rounded-lg px-3 py-2 text-left font-semibold ${!filters.category ? "bg-loco-ice text-loco-navy" : "hover:bg-loco-ice"}`}>{t("common.allCategories")}</button></li>
                {categories.map((category) => (
                  <li key={category.id}><button type="button" onClick={() => update({ category: category.slug })} className={`w-full rounded-lg px-3 py-2 text-left font-semibold ${filters.category === category.slug ? "bg-loco-ice text-loco-navy" : "hover:bg-loco-ice"}`}>{category.name}</button></li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">{t("common.price")}</h3>
              <form onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); update({ minPrice: form.get("minPrice"), maxPrice: form.get("maxPrice") }); }} className="flex items-center gap-2">
                <Input name="minPrice" type="number" min="0" placeholder={t("common.min")} defaultValue={filters.minPrice} className="px-3! py-2! text-sm" />
                <Input name="maxPrice" type="number" min="0" placeholder={t("common.max")} defaultValue={filters.maxPrice} className="px-3! py-2! text-sm" />
                <Button type="submit" size="sm" variant="outline">{t("common.go")}</Button>
              </form>
            </div>
          </aside>

          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-600">
                {loading ? t("common.searching") : t("common.results", { count: data?.pagination?.total ?? 0 })} {filters.district ? t("common.in", { district: filters.district }) : t("common.acrossRwanda")}
              </p>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">{t("common.sort")}</span>
                <Select value={filters.sort} onChange={(event) => update({ sort: event.target.value })} className="w-auto! py-2! text-sm">
                  <option value="newest">{t("common.newest")}</option>
                  <option value="price_asc">{t("common.priceAsc")}</option>
                  <option value="price_desc">{t("common.priceDesc")}</option>
                  <option value="popular">{t("common.popular")}</option>
                </Select>
              </label>
            </div>

            {error && <Message className="mb-4">{error}</Message>}

            {loading ? (
              <Spinner label={t("common.loading")} />
            ) : data?.listings?.length ? (
              <>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                  {data.listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
                </div>
                <Pagination pagination={data.pagination} onPage={(page) => update({ page })} />
              </>
            ) : (
              <EmptyState
                title={t("common.nothingHere")}
                description={filters.district ? t("common.noResultsDistrict", { district: filters.district }) : t("common.tryAnother")}
                action={filters.district ? <Button variant="outline" onClick={() => update({ district: "" })}>{t("common.searchAll")}</Button> : null}
              />
            )}
          </section>
        </div>
      </Container>
    </main>
  );
}
