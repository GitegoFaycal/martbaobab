import Hero from "../components/Hero";
import {
  CategoryStrip,
  HowItWorks,
  JobStrip,
  ListingStrip,
  SellerCTA,
  TrustStrip,
} from "../components/Sections";
import { getSavedDistrict } from "../lib/rwanda";

export default function HomePage() {
  const district = getSavedDistrict();
  const districtQuery = district ? `&district=${encodeURIComponent(district)}` : "";

  return (
    <main className="bg-loco-cream">
      <Hero />
      <TrustStrip />

      <CategoryStrip
        kind="GOODS"
        basePath="/shop"
        eyebrow="Browse locally"
        title="What do you need today?"
      />

      <ListingStrip
        query={`?condition=NEW&type=PRODUCT&perPage=8${districtQuery}`}
        eyebrow={district ? `Fresh in ${district}` : "Fresh from nearby shops"}
        title="Everyday goods near you"
        to="/shop"
        emptyText="No products listed yet. Sellers are joining LOCO every day."
      />

      <ListingStrip
        query={`?condition=USED&perPage=8${districtQuery}`}
        eyebrow="Save money"
        title="Second-hand deals"
        to="/second-hand"
        emptyText="No second-hand items yet. Have something to sell? Open a shop in a minute."
      />

      <JobStrip />

      <CategoryStrip
        kind="SERVICES"
        basePath="/services"
        eyebrow="Skilled people nearby"
        title="Local services"
      />

      <HowItWorks />
      <SellerCTA />
    </main>
  );
}
