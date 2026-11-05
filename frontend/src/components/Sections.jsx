import {
  ArrowRight,
  Banknote,
  Bike,
  HandCoins,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Store,
} from "lucide-react";
import { Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import CategoryIcon from "./CategoryIcon";
import JobCard from "./JobCard";
import ListingCard from "./ListingCard";
import { Container, Spinner } from "./ui";

function SectionHeading({ eyebrow, title, to, linkLabel }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <p className="font-bold text-loco-orange">{eyebrow}</p>
        <h2 className="text-2xl font-black text-loco-wine sm:text-3xl">
          {title}
        </h2>
      </div>
      {to && (
        <Link
          to={to}
          className="hidden shrink-0 items-center gap-1 font-bold text-loco-wine hover:text-loco-orange sm:inline-flex"
        >
          {linkLabel || "See all"} <ArrowRight size={18} />
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
              <Link
                key={category.id}
                to={`${basePath}?category=${category.slug}`}
                className="group rounded-2xl border border-orange-100 bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-loco-orange"
              >
                <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-loco-cream text-loco-wine group-hover:bg-loco-orange group-hover:text-white">
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

  if (!loading && listings.length === 0) {
    return (
      <section className="py-12">
        <Container>
          <SectionHeading eyebrow={eyebrow} title={title} to={to} />
          <p className="rounded-2xl border border-dashed border-orange-200 bg-white p-8 text-center text-gray-500">
            {emptyText}
          </p>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-12">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} to={to} />
        {loading ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {listings.slice(0, 8).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

export function JobStrip() {
  const { data, loading } = useFetch("/jobs?perPage=6");
  const jobs = data?.jobs || [];

  return (
    <section className="bg-white py-12">
      <Container>
        <SectionHeading
          eyebrow="Work near you"
          title="Latest local jobs"
          to="/jobs"
          linkLabel="All jobs"
        />
        {loading ? (
          <Spinner />
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-orange-200 bg-loco-cream p-8 text-center">
            <p className="text-gray-600">
              No jobs posted yet. Be the first employer on LOCO.
            </p>
            <Link
              to="/jobs/new"
              className="mt-4 inline-block rounded-full bg-loco-wine px-6 py-3 font-bold text-white"
            >
              Post a job
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

const steps = [
  {
    icon: Search,
    title: "Find it nearby",
    text: "Search by district. See shops, deals and jobs in your own area first.",
  },
  {
    icon: MessageCircle,
    title: "Talk directly",
    text: "Call or WhatsApp the seller or employer. No middlemen.",
  },
  {
    icon: HandCoins,
    title: "Pay the local way",
    text: "MTN MoMo, Airtel Money or cash when the moto arrives.",
  },
  {
    icon: Bike,
    title: "Delivered by moto",
    text: "Orders from your district arrive the same day.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-12">
      <Container>
        <SectionHeading eyebrow="Simple and local" title="How LOCO works" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <div
              key={title}
              className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-loco-cream text-loco-wine">
                  <Icon size={22} />
                </span>
                <span className="text-3xl font-black text-orange-100">
                  {index + 1}
                </span>
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

export function TrustStrip() {
  const items = [
    { icon: ShieldCheck, text: "Verified shops are checked by the LOCO team" },
    { icon: MapPin, text: "All 30 districts of Rwanda" },
    { icon: Banknote, text: "Prices in RWF, no hidden fees" },
  ];

  return (
    <div className="border-y border-orange-100 bg-white">
      <Container className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 py-4 text-sm font-semibold text-gray-600">
        {items.map(({ icon: Icon, text }) => (
          <span key={text} className="inline-flex items-center gap-2">
            <Icon size={17} className="text-loco-mint-dark" />
            {text}
          </span>
        ))}
      </Container>
    </div>
  );
}

export function SellerCTA() {
  return (
    <section className="py-12">
      <Container>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="overflow-hidden rounded-3xl bg-loco-orange p-8 text-white">
            <Store size={34} className="text-loco-wine" />
            <p className="mt-5 font-bold text-loco-wine">Sell on LOCO</p>
            <h2 className="mt-1 text-2xl font-black sm:text-3xl">
              Turn your kiosk, boutique or garage into an online shop.
            </h2>
            <p className="mt-2 max-w-md text-white/90">
              List new or second-hand products and services. Receive orders on
              your phone and get paid by MoMo.
            </p>
            <Link
              to="/register?role=SELLER"
              className="mt-6 inline-flex rounded-full bg-loco-wine px-7 py-3 font-bold"
            >
              Become a seller
            </Link>
          </div>

          <div className="overflow-hidden rounded-3xl bg-loco-wine p-8 text-white">
            <HandCoins size={34} className="text-loco-mint" />
            <p className="mt-5 font-bold text-loco-mint">Hire on LOCO</p>
            <h2 className="mt-1 text-2xl font-black sm:text-3xl">
              Need builders, factory hands or a house help by tomorrow?
            </h2>
            <p className="mt-2 max-w-md text-white/75">
              Post the job in two minutes. Workers in your district apply with
              their phone number, and you call the ones you like.
            </p>
            <Link
              to="/jobs/new"
              className="mt-6 inline-flex rounded-full bg-loco-mint px-7 py-3 font-bold text-loco-wine-dark"
            >
              Post a job
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
