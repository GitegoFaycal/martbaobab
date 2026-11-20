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
import { categoryImage } from "../lib/categoryImages";
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`${basePath}?category=${category.slug}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-900 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <img
                  src={categoryImage(category.slug)}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
                <span className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent" />
                <b className="absolute inset-x-0 bottom-0 line-clamp-2 p-3 text-sm leading-tight text-white drop-shadow sm:text-[15px]">{category.name}</b>
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
    { to: "/shop", title: t("hero.pillarShop"), text: t("hero.pillarShopText"), image: "/pillars/shop.jpg" },
    { to: "/second-hand", title: t("hero.pillarSecondHand"), text: t("hero.pillarSecondHandText"), image: "/pillars/second-hand.jpg" },
    { to: "/jobs", title: t("hero.pillarJobs"), text: t("hero.pillarJobsText"), image: "/pillars/jobs.jpg" },
    { to: "/services", title: t("hero.pillarServices"), text: t("hero.pillarServicesText"), image: "/pillars/services.jpg" },
  ];

  return (
    <section className="py-10">
      <Container>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map(({ to, title, text, image }) => (
            <Link key={to} to={to} className="group relative flex min-h-44 flex-col justify-end overflow-hidden rounded-2xl bg-loco-navy p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
              <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <span className="absolute inset-0 bg-linear-to-t from-black/85 via-black/45 to-black/10" />
              <span className="relative">
                <strong className="block text-lg text-white drop-shadow">{title}</strong>
                <span className="mt-0.5 block text-sm text-white/80">{text}</span>
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-loco-sky group-hover:gap-2">{t("hero.explore")} <ArrowRight size={14} /></span>
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
