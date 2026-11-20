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
import UseMyLocation from "../components/UseMyLocation";
import { detectByNetwork } from "../lib/geo";
import { buildQuery } from "../api/api";
import { getSavedLocation, locationLabel, saveLocation } from "../lib/locations";

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

  const [place, setPlace] = useState(getSavedLocation);
  const district = place.district;
  const placeQuery = buildQuery(place).replace(/^\?/, "&");

  // First visit on this device: open on the district the network suggests.
  useEffect(() => {
    if (place.district) return;
    let cancelled = false;
    detectByNetwork().then((found) => { if (found && !cancelled) setPlace(found); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function changePlace(next) {
    saveLocation(next);
    setPlace(next);
  }

  return (
    <main className="bg-loco-ice">
      {tab === "people" ? (
        <PeopleFeed toolbar={<HomeTabs active={tab} onChange={changeTab} />} place={place} onPlaceChange={changePlace} locator={<UseMyLocation place={place} onChange={changePlace} />} />
      ) : (
        <>
          <div className="bg-white">
            <Container className="flex flex-col gap-4 pb-6 pt-5 lg:flex-row lg:items-center">
              <HomeTabs active={tab} onChange={changeTab} />
              <div className="min-w-0 flex-1"><Hero place={place} onPlaceChange={changePlace} /></div>
            </Container>
            <Container className="pb-5"><UseMyLocation place={place} onChange={changePlace} /></Container>
          </div>
          <PillarStrip />
          <CategoryStrip kind="GOODS" basePath="/shop" eyebrow={t("home.browseLocally")} title={t("landing.marketTitle")} />
          <ListingStrip
            query={`?condition=NEW&type=PRODUCT&perPage=8${placeQuery}`}
            eyebrow={district ? t("home.freshIn", { district: locationLabel(place) }) : t("home.freshNearby")}
            title={t("home.everydayGoods")}
            to="/shop"
            emptyText={t("home.noProducts")}
          />
          <ListingStrip
            query={`?condition=USED&perPage=8${placeQuery}`}
            eyebrow={t("home.saveMoney")}
            title={t("home.secondHandDeals")}
            to="/second-hand"
            emptyText={t("home.noSecondHand")}
          />
          <JobStrip place={place} />
          <CategoryStrip kind="SERVICES" basePath="/services" eyebrow={t("home.skilledNearby")} title={t("home.localServices")} />
        </>
      )}

      <TrustStrip />
      <HowItWorks />
      <SellerCTA />
    </main>
  );
}
