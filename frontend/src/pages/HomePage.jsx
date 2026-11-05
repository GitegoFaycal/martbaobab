import Hero from "../components/Hero";
import {
  CategoryStrip,
  HowItWorks,
  JobStrip,
  ListingStrip,
  PillarStrip,
  SellerCTA,
  TrustStrip,
} from "../components/Sections";
import { useT } from "../i18n";
import { getSavedDistrict } from "../lib/rwanda";

export default function HomePage() {
  const t = useT();
  const district = getSavedDistrict();
  const districtQuery = district ? `&district=${encodeURIComponent(district)}` : "";

  return (
    <main className="bg-loco-cream">
      <Hero />
      <TrustStrip />
      <PillarStrip />

      <CategoryStrip kind="GOODS" basePath="/shop" eyebrow={t("home.browseLocally")} title={t("home.whatToday")} />

      <ListingStrip
        query={`?condition=NEW&type=PRODUCT&perPage=8${districtQuery}`}
        eyebrow={district ? t("home.freshIn", { district }) : t("home.freshNearby")}
        title={t("home.everydayGoods")}
        to="/shop"
        emptyText={t("home.noProducts")}
      />

      <ListingStrip
        query={`?condition=USED&perPage=8${districtQuery}`}
        eyebrow={t("home.saveMoney")}
        title={t("home.secondHandDeals")}
        to="/second-hand"
        emptyText={t("home.noSecondHand")}
      />

      <JobStrip />

      <CategoryStrip kind="SERVICES" basePath="/services" eyebrow={t("home.skilledNearby")} title={t("home.localServices")} />

      <HowItWorks />
      <SellerCTA />
    </main>
  );
}
