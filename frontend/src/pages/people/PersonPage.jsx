import { BadgeCheck, Briefcase, Eye, Link2, MapPin, Package, Phone, Store } from "lucide-react";
import ProfileActions from "../../components/ProfileActions";
import { Link, useParams } from "react-router-dom";
import JobCard from "../../components/JobCard";
import ListingCard from "../../components/ListingCard";
import { Badge, Breadcrumbs, Button, Container, EmptyState, Spinner } from "../../components/ui";
import useFetch from "../../hooks/useFetch";
import { useI18n } from "../../i18n";
import { formatDate } from "../../lib/format";
import { recordConnection } from "../../lib/connect";
import { formatPhoneForDisplay } from "../../lib/rwanda";
import { placeLabel } from "../../lib/locations";

function Stat({ icon: Icon, label, value, accent = false }) {
  return (
    <div className={`rounded-2xl p-3 ${accent ? "bg-loco-sky/20" : "bg-loco-ice"}`}>
      <dt className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-gray-500"><Icon size={12} /> {label}</dt>
      <dd className="mt-1 text-2xl font-black text-loco-navy">{value}</dd>
    </div>
  );
}

export default function PersonPage() {
  const { t, lang } = useI18n();
  const { id } = useParams();
  const { data, loading, error } = useFetch(`/people/${id}`);

  if (loading) {
    return <main className="min-h-[75vh] bg-loco-ice py-10"><Spinner label={t("common.loading")} /></main>;
  }

  if (error || !data?.person) {
    return (
      <main className="min-h-[75vh] bg-loco-ice py-10">
        <Container><EmptyState title={t("people.notFound")} description={t("people.notFoundText")} action={<Button as={Link} to="/people">{t("people.seeAll")}</Button>} /></Container>
      </main>
    );
  }

  const { person, listings, jobs } = data;
  const shop = person.shop;

  return (
    <main className="min-h-[75vh] bg-loco-ice pb-12">
      <Container>
        <section className="relative mt-6 flex min-h-[28rem] flex-col justify-end overflow-hidden rounded-3xl bg-gray-900 shadow-lg sm:min-h-[30rem]">
          {person.avatarUrl ? (
            <img src={person.avatarUrl} alt="" className="absolute inset-0 h-full w-full object-cover object-top" />
          ) : shop?.coverUrl ? (
            <img src={shop.coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : null}
          <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-transparent" />

          <div className="relative flex flex-col gap-5 p-6 text-white sm:flex-row sm:items-end sm:justify-between sm:p-8">
            <div className="min-w-0">
              <h1 className="flex flex-wrap items-center gap-2 text-3xl font-black drop-shadow sm:text-4xl">
                {person.name}
                {shop?.verified && <span className="inline-flex items-center gap-1 rounded-full bg-green-500/90 px-2.5 py-1 text-xs font-bold"><BadgeCheck size={14} /> {t("common.verified")}</span>}
              </h1>
              <p className="mt-1 text-lg font-semibold text-loco-sky">{person.headline}</p>
              <p className="mt-1 flex items-center gap-1 text-sm text-white/80"><MapPin size={14} />{placeLabel({ district: person.district, sector: person.sector || shop?.sector, cell: person.cell || shop?.cell, village: person.village || shop?.village })}</p>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:w-56">
              <ProfileActions person={{ ...person, whatsapp: person.whatsapp || person.phone }} layout="column" size="lg" tone="dark" />
              {person.phone && <a href={`tel:${person.phone}`} onClick={() => recordConnection({ personId: person.id, channel: "CALL" })} className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-base font-bold text-white hover:bg-white/15"><Phone size={17} /> {formatPhoneForDisplay(person.phone)}</a>}
            </div>
          </div>
        </section>

        <div className="mt-6 rounded-3xl border border-blue-100 bg-white p-6 shadow-lg sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-2">
                <Badge tone={shop ? "blue" : "mint"}>{shop ? <><Store size={12} /> {t("people.shopOwner")}</> : <><Briefcase size={12} /> {t("people.specialist")}</>}</Badge>
                {person.skills?.map((skill) => <span key={skill} className="rounded-full bg-loco-ice px-2.5 py-1 text-xs font-semibold text-loco-navy">{skill}</span>)}
              </div>

              {person.bio && (
                <section className="mt-5">
                  <h2 className="text-xs font-bold uppercase tracking-wide text-gray-400">{t("people.about")}</h2>
                  <p className="mt-1 max-w-2xl whitespace-pre-line leading-7 text-gray-700">{person.bio}</p>
                </section>
              )}

              <dl className="mt-5 grid max-w-md grid-cols-3 gap-3">
                <Stat icon={Link2} label={t("connections.stat")} value={person.connections ?? 0} accent />
                <Stat icon={Eye} label={t("connections.statViews")} value={person.views ?? 0} />
                <Stat icon={Package} label={t("connections.statListings")} value={shop?._count?.listings ?? listings.length} />
              </dl>

              <p className="mt-4 text-xs text-gray-400">{t("people.memberSince", { date: formatDate(person.createdAt, { month: "long", year: "numeric" }, lang) })}</p>
            </div>

          </div>
        </div>

        <div className="mt-8">
          <Breadcrumbs items={[{ label: t("common.home"), to: "/" }, { label: t("nav.people"), to: "/people" }, { label: person.name }]} />
        </div>

        {listings?.length > 0 && (
          <section className="mt-4">
            <h2 className="mb-5 text-2xl font-black text-loco-navy">{t("people.listings")}</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
            </div>
          </section>
        )}

        {jobs?.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-5 text-2xl font-black text-loco-navy">{t("people.hiring")}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {jobs.map((job) => <JobCard key={job.id} job={job} />)}
            </div>
          </section>
        )}
      </Container>
    </main>
  );
}
