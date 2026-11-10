import {
  ArrowRight,
  Banknote,
  Bike,
  Briefcase,
  HandCoins,
  Link2,
  MapPin,
  Package,
  Search,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import WhatsAppIcon from "./WhatsAppIcon";
import useFetch from "../hooks/useFetch";
import { useT } from "../i18n";
import CategoryIcon from "./CategoryIcon";
import JobCard from "./JobCard";
import ListingCard from "./ListingCard";
import { Container, Spinner } from "./ui";

function SectionHeading({ eyebrow, title, to, linkLabel }) {
  const t = useT();
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <p className="font-bold text-loco-blue">{eyebrow}</p>
        <h2 className="text-2xl font-black text-loco-navy sm:text-3xl">{title}</h2>
      </div>
      {to && (
        <Link to={to} className="hidden shrink-0 items-center gap-1 font-bold text-loco-navy hover:text-loco-blue sm:inline-flex">
          {linkLabel || t("home.seeAll")} <ArrowRight size={18} />
        </Link>
      )}
    </div>
  );
}

export function CategoryStrip({ kind = "GOODS", basePath = "/shop", title, eyebrow }) {
  const { data, loading } = useFetch(`/categories?kind=${kind}`);
  const categories = data?.categories || [];

  return (
    <section className="py-12">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} to={basePath} />
        {loading ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {categories.map((category) => (
              <Link key={category.id} to={`${basePath}?category=${category.slug}`} className="group rounded-2xl border border-blue-100 bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-loco-blue">
                <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-loco-ice text-loco-navy group-hover:bg-loco-blue group-hover:text-white">
                  <CategoryIcon name={category.icon} />
                </span>
                <b className="line-clamp-2 text-xs sm:text-sm">{category.name}</b>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

export function ListingStrip({ query, title, eyebrow, to, emptyText }) {
  const { data, loading } = useFetch(`/listings${query}`);
  const listings = data?.listings || [];

  return (
    <section className="py-12">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} to={to} />
        {loading ? (
          <Spinner />
        ) : listings.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-blue-200 bg-white p-8 text-center text-gray-500">{emptyText}</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {listings.slice(0, 8).map((listing) => <ListingCard key={listing.id} listing={listing} />)}
          </div>
        )}
      </Container>
    </section>
  );
}

export function JobStrip() {
  const t = useT();
  const { data, loading } = useFetch("/jobs?perPage=6");
  const jobs = data?.jobs || [];

  return (
    <section className="bg-white py-12">
      <Container>
        <SectionHeading eyebrow={t("home.workNearYou")} title={t("home.latestJobs")} to="/jobs" linkLabel={t("home.allJobs")} />
        {loading ? (
          <Spinner />
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-blue-200 bg-loco-ice p-8 text-center">
            <p className="text-gray-600">{t("home.noJobs")}</p>
            <Link to="/jobs/new" className="mt-4 inline-block rounded-full bg-loco-navy px-6 py-3 font-bold text-white">{t("home.postJob")}</Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((job) => <JobCard key={job.id} job={job} />)}
          </div>
        )}
      </Container>
    </section>
  );
}

export function HowItWorks() {
  const t = useT();
  const steps = [
    { icon: Search, title: t("home.step1"), text: t("home.step1Text") },
    { icon: WhatsAppIcon, title: t("home.step2"), text: t("home.step2Text") },
    { icon: HandCoins, title: t("home.step3"), text: t("home.step3Text") },
    { icon: Bike, title: t("home.step4"), text: t("home.step4Text") },
  ];

  return (
    <section className="py-12">
      <Container>
        <SectionHeading eyebrow={t("home.simpleLocal")} title={t("home.howItWorks")} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <div key={title} className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-loco-ice text-loco-navy"><Icon size={22} /></span>
                <span className="text-3xl font-black text-blue-100">{index + 1}</span>
              </div>
              <strong className="mt-4 block text-loco-ink">{title}</strong>
              <p className="mt-1 text-sm text-gray-500">{text}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function PillarStrip() {
  const t = useT();
  const pillars = [
    { to: "/shop", title: t("hero.pillarShop"), text: t("hero.pillarShopText"), accent: "bg-loco-blue" },
    { to: "/second-hand", title: t("hero.pillarSecondHand"), text: t("hero.pillarSecondHandText"), accent: "bg-loco-sky" },
    { to: "/jobs", title: t("hero.pillarJobs"), text: t("hero.pillarJobsText"), accent: "bg-loco-navy" },
    { to: "/services", title: t("hero.pillarServices"), text: t("hero.pillarServicesText"), accent: "bg-loco-blue" },
  ];

  return (
    <section className="py-10">
      <Container>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map(({ to, title, text, accent }) => (
            <Link key={to} to={to} className="group flex items-start gap-4 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-loco-blue">
              <span className={`mt-1 h-10 w-1.5 shrink-0 rounded-full ${accent}`} />
              <span>
                <strong className="block text-loco-ink">{title}</strong>
                <span className="mt-0.5 block text-sm text-gray-500">{text}</span>
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-loco-navy group-hover:gap-2">{t("hero.explore")} <ArrowRight size={14} /></span>
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function TrustStrip() {
  const t = useT();
  const { data } = useFetch("/stats");
  const s = data?.stats;
  const items = s
    ? [
        { icon: Link2, text: t("connections.madeOnLoco", { count: s.connections.toLocaleString() }), strong: true },
        { icon: Users, text: t("connections.peopleOnLoco", { count: s.people }) },
        { icon: Package, text: t("connections.listingsOnLoco", { count: s.listings }) },
        { icon: Briefcase, text: t("connections.jobsOpen", { count: s.jobs }) },
        { icon: MapPin, text: t("home.trust2") },
      ]
    : [
        { icon: ShieldCheck, text: t("home.trust1") },
        { icon: MapPin, text: t("home.trust2") },
        { icon: Banknote, text: t("home.trust3") },
      ];

  return (
    <div className="border-y border-blue-100 bg-white">
      <Container className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 py-4 text-sm font-semibold text-gray-600">
        {items.map(({ icon: Icon, text, strong }) => (
          <span key={text} className={`inline-flex items-center gap-2 ${strong ? "text-loco-navy" : ""}`}><Icon size={17} className={strong ? "text-loco-blue" : "text-loco-sky-dark"} />{text}</span>
        ))}
      </Container>
    </div>
  );
}

export function SellerCTA() {
  const t = useT();
  return (
    <section className="py-12">
      <Container>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="overflow-hidden rounded-3xl bg-loco-blue p-8 text-white">
            <Store size={34} className="text-loco-navy" />
            <p className="mt-5 font-bold text-loco-navy">{t("home.sellOn")}</p>
            <h2 className="mt-1 text-2xl font-black sm:text-3xl">{t("home.sellTitle")}</h2>
            <p className="mt-2 max-w-md text-white/90">{t("home.sellText")}</p>
            <Link to="/register?role=SELLER" className="mt-6 inline-flex rounded-full bg-loco-navy px-7 py-3 font-bold">{t("home.becomeSeller")}</Link>
          </div>
          <div className="overflow-hidden rounded-3xl bg-loco-navy p-8 text-white">
            <HandCoins size={34} className="text-loco-sky" />
            <p className="mt-5 font-bold text-loco-sky">{t("home.hireOn")}</p>
            <h2 className="mt-1 text-2xl font-black sm:text-3xl">{t("home.hireTitle")}</h2>
            <p className="mt-2 max-w-md text-white/75">{t("home.hireText")}</p>
            <Link to="/jobs/new" className="mt-6 inline-flex rounded-full bg-loco-sky px-7 py-3 font-bold text-loco-navy-dark">{t("home.postJob")}</Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
