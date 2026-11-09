import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Hero from "../components/Hero";
import HomeTabs from "../components/home/HomeTabs";
import PeopleFeed from "../components/home/PeopleFeed";
import {
  CategoryStrip,
  HowItWorks,
  JobStrip,
  ListingStrip,
  PillarStrip,
  SellerCTA,
  TrustStrip,
} from "../components/Sections";
import { Container } from "../components/ui";
import { useT } from "../i18n";
import { getSavedDistrict } from "../lib/rwanda";

const TAB_KEY = "loco.homeTab";

function initialTab(param) {
  if (param === "market" || param === "people") return param;
  try {
    const saved = localStorage.getItem(TAB_KEY);
    if (saved === "market" || saved === "people") return saved;
  } catch {
    // Storage unavailable.
  }
  return "people";
}

export default function HomePage() {
  const t = useT();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState(() => initialTab(params.get("tab")));

  useEffect(() => {
    try {
      localStorage.setItem(TAB_KEY, tab);
    } catch {
      // Storage unavailable.
    }
  }, [tab]);

  function changeTab(next) {
    setTab(next);
    const search = new URLSearchParams(params);
    if (next === "people") search.delete("tab"); else search.set("tab", next);
    setParams(search, { replace: true });
  }

  const district = getSavedDistrict();
  const districtQuery = district ? `&district=${encodeURIComponent(district)}` : "";

  return (
    <main className="bg-loco-cream">
      <div className="bg-white">
        <Container className="pb-6 pt-5">
          <HomeTabs active={tab} onChange={changeTab} />
        </Container>
      </div>

      <TrustStrip />

      {tab === "people" ? (
        <Container className="py-8">
          <PeopleFeed />
        </Container>
      ) : (
        <>
          <Hero />
          <PillarStrip />
          <CategoryStrip kind="GOODS" basePath="/shop" eyebrow={t("home.browseLocally")} title={t("landing.marketTitle")} />
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
        </>
      )}

      <HowItWorks />
      <SellerCTA />
    </main>
  );
}
