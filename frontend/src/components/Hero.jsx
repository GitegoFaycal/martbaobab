import {
  ArrowRight,
  Briefcase,
  MapPin,
  Recycle,
  Search,
  ShoppingBag,
  Smartphone,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getSavedDistrict, saveDistrict } from "../lib/rwanda";
import { DistrictSelect } from "./ui";

const tabs = [
  { key: "shop", label: "Goods", path: "/shop", placeholder: "Sugar, airtime, cooking oil, phone charger..." },
  { key: "second-hand", label: "Second-hand", path: "/second-hand", placeholder: "Used phone, sofa, bicycle, laptop..." },
  { key: "jobs", label: "Jobs", path: "/jobs", placeholder: "Mason, factory worker, driver, house help..." },
];

export default function Hero() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(tabs[0]);
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState(getSavedDistrict);

  function handleSearch(event) {
    event.preventDefault();
    saveDistrict(district);

    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    if (district) params.set("district", district);

    navigate(`${tab.path}${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <section className="relative overflow-hidden bg-loco-wine text-white">
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-loco-orange/25" />
      <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-loco-mint/15" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-loco-mint">
            <MapPin size={15} />
            Rwanda's local connect platform
          </span>

          <h1 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">
            Buy nearby. Sell locally.
            <br />
            <span className="text-loco-orange">Get hired today.</span>
          </h1>

          <p className="mt-5 max-w-xl text-lg text-white/80">
            LOCO connects you with the shops, second-hand deals and daily jobs
            in your district. Pay with MoMo or cash, and get it delivered by
            moto.
          </p>

          <form
            role="search"
            onSubmit={handleSearch}
            className="mt-8 overflow-hidden rounded-2xl bg-white p-2 text-loco-ink shadow-2xl"
          >
            <div className="mb-2 flex gap-1 px-1">
              {tabs.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTab(item)}
                  aria-pressed={tab.key === item.key}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-bold ${
                    tab.key === item.key
                      ? "bg-loco-wine text-white"
                      : "text-gray-500 hover:bg-loco-cream"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="flex flex-1 items-center gap-3 rounded-xl bg-loco-cream px-3">
                <Search className="shrink-0 text-loco-wine" size={20} />
                <input
                  type="search"
                  name="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label="What are you looking for?"
                  placeholder={tab.placeholder}
                  className="w-full bg-transparent py-3 outline-none"
                />
              </label>

              <label className="flex items-center gap-2 rounded-xl bg-loco-cream px-3 sm:w-52">
                <MapPin size={18} className="shrink-0 text-loco-orange" />
                <DistrictSelect
                  name="district"
                  aria-label="District"
                  value={district}
                  onChange={(event) => setDistrict(event.target.value)}
                  placeholder="All districts"
                  className="border-0! bg-transparent! px-0! py-3! focus:ring-0!"
                />
              </label>

              <button
                type="submit"
                className="rounded-xl bg-loco-orange px-6 py-3 font-bold text-white hover:bg-loco-orange-dark"
              >
                Search
              </button>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/register?role=SELLER"
              className="inline-flex items-center gap-2 rounded-full bg-loco-mint px-6 py-3 font-bold text-loco-wine-dark hover:bg-loco-mint-dark"
            >
              Open your shop <ArrowRight size={18} />
            </Link>
            <Link
              to="/jobs/new"
              className="rounded-full border border-white/40 px-6 py-3 font-bold hover:bg-white/10"
            >
              Hire workers
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <Pillar
            to="/shop"
            icon={ShoppingBag}
            title="Shop nearby"
            text="Everyday items from the shop next door, delivered fast."
            accent="bg-loco-orange"
          />
          <Pillar
            to="/second-hand"
            icon={Recycle}
            title="Second-hand deals"
            text="Good-as-new items at lower prices than the shop."
            accent="bg-loco-mint"
          />
          <Pillar
            to="/jobs"
            icon={Briefcase}
            title="Local jobs"
            text="Daily and contract work on building sites, factories and more."
            accent="bg-white"
          />
          <Pillar
            to="/services"
            icon={Smartphone}
            title="Local services"
            text="Plumbers, tailors, moto riders and repair shops near you."
            accent="bg-loco-orange"
          />
        </div>
      </div>
    </section>
  );
}

function Pillar({ to, icon: Icon, title, text, accent }) {
  return (
    <Link
      to={to}
      className="group rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur transition hover:-translate-y-1 hover:bg-white/15"
    >
      <span
        className={`grid h-12 w-12 place-items-center rounded-2xl text-loco-wine ${accent}`}
      >
        <Icon size={24} />
      </span>
      <strong className="mt-5 block text-lg">{title}</strong>
      <p className="mt-1 text-sm text-white/70">{text}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-loco-mint group-hover:gap-2">
        Explore <ArrowRight size={15} />
      </span>
    </Link>
  );
}
