import { BadgeCheck, Briefcase, Eye, Link2, MapPin, Package, Phone, Store } from "lucide-react";
import WhatsAppIcon from "../../components/WhatsAppIcon";
import { Link, useParams } from "react-router-dom";
import JobCard from "../../components/JobCard";
import ListingCard from "../../components/ListingCard";
import { Avatar } from "../../components/PersonCard";
import { Badge, Breadcrumbs, Button, Container, EmptyState, Spinner } from "../../components/ui";
import useFetch from "../../hooks/useFetch";
import { useI18n } from "../../i18n";
import { formatDate } from "../../lib/format";
import { recordConnection } from "../../lib/connect";
import { formatPhoneForDisplay, whatsappLink } from "../../lib/rwanda";

function Stat({ icon: Icon, label, value, accent = false }) {
  return (
    <div className={`rounded-2xl p-3 ${accent ? "bg-loco-mint/20" : "bg-loco-cream"}`}>
      <dt className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-gray-500"><Icon size={12} /> {label}</dt>
      <dd className="mt-1 text-2xl font-black text-loco-wine">{value}</dd>
    </div>
  );
}

export default function PersonPage() {
  const { t, lang } = useI18n();
  const { id } = useParams();
  const { data, loading, error } = useFetch(`/people/${id}`);

  if (loading) {
    return <main className="min-h-[75vh] bg-loco-cream py-10"><Spinner label={t("common.loading")} /></main>;
  }

  if (error || !data?.person) {
    return (
      <main className="min-h-[75vh] bg-loco-cream py-10">
        <Container><EmptyState title={t("people.notFound")} description={t("people.notFoundText")} action={<Button as={Link} to="/people">{t("people.seeAll")}</Button>} /></Container>
      </main>
    );
  }

  const { person, listings, jobs } = data;
  const shop = person.shop;
  const whatsapp = whatsappLink(person.whatsapp || person.phone, `Hello ${person.name}, I found your profile on LOCO.`);

  return (
    <main className="min-h-[75vh] bg-loco-cream pb-12">
      <div className="h-40 bg-linear-to-r from-loco-wine to-loco-orange sm:h-48">
        {shop?.coverUrl && <img src={shop.coverUrl} alt="" className="h-full w-full object-cover opacity-80" />}
      </div>

      <Container>
        <div className="-mt-14 rounded-3xl border border-orange-100 bg-white p-6 shadow-lg sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <Avatar person={person} size="h-28 w-28" textSize="text-4xl" />

            <div className="min-w-0 flex-1">
              <h1 className="flex flex-wrap items-center gap-2 text-2xl font-black text-loco-wine sm:text-3xl">
                {person.name}
                {shop?.verified && <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700"><BadgeCheck size={14} /> {t("common.verified")}</span>}
              </h1>
              <p className="mt-1 text-lg font-semibold text-loco-orange">{person.headline}</p>
              <p className="mt-1 flex items-center gap-1 text-sm text-gray-500"><MapPin size={14} className="text-loco-orange" />{person.district || "Rwanda"}{shop?.sector ? `, ${shop.sector}` : ""}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone={shop ? "blue" : "mint"}>{shop ? <><Store size={12} /> {t("people.shopOwner")}</> : <><Briefcase size={12} /> {t("people.specialist")}</>}</Badge>
                {person.skills?.map((skill) => <span key={skill} className="rounded-full bg-loco-cream px-2.5 py-1 text-xs font-semibold text-loco-wine">{skill}</span>)}
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

            <div className="flex shrink-0 flex-col gap-2 sm:w-56">
              <h2 className="text-xs font-bold uppercase tracking-wide text-gray-400">{t("people.contact")}</h2>
              {person.phone && <Button as="a" href={`tel:${person.phone}`} variant="outline" onClick={() => recordConnection({ personId: person.id, channel: "CALL" })}><Phone size={17} /> {formatPhoneForDisplay(person.phone)}</Button>}
              {whatsapp && <Button as="a" href={whatsapp} target="_blank" rel="noreferrer" variant="whatsapp" onClick={() => recordConnection({ personId: person.id, channel: "WHATSAPP" })}><WhatsAppIcon size={18} /> WhatsApp</Button>}
              {shop && <Button as={Link} to={`/shops/${shop.slug}`} variant="primary"><Store size={17} /> {t("people.visitShop")}</Button>}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Breadcrumbs items={[{ label: t("common.home"), to: "/" }, { label: t("nav.people"), to: "/people" }, { label: person.name }]} />
        </div>

        {listings?.length > 0 && (
          <section className="mt-4">
            <h2 className="mb-5 text-2xl font-black text-loco-wine">{t("people.listings")}</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
            </div>
          </section>
        )}

        {jobs?.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-5 text-2xl font-black text-loco-wine">{t("people.hiring")}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {jobs.map((job) => <JobCard key={job.id} job={job} />)}
            </div>
          </section>
        )}
      </Container>
    </main>
  );
}
