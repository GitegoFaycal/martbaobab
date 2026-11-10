import {
  Briefcase,
  CalendarDays,
  ClipboardList,
  Link2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Store,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button, Container } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { useI18n } from "../../i18n";
import { formatDate } from "../../lib/format";
import { formatPhoneForDisplay } from "../../lib/rwanda";

export default function ProfilePage() {
  const { t, lang } = useI18n();
  const { user } = useAuth();

  const shortcuts = [
    { to: "/connections", icon: Link2, label: t("nav.myConnections") },
    { to: "/applications", icon: ClipboardList, label: t("nav.myApplications") },
    { to: "/hiring", icon: Briefcase, label: t("nav.hiring") },
    user.role === "SELLER" || user.role === "ADMIN"
      ? { to: "/seller", icon: Store, label: t("nav.sellerDashboard") }
      : { to: "/register?role=SELLER", icon: Store, label: t("home.becomeSeller") },
  ];

  return (
    <main className="min-h-[75vh] bg-loco-ice py-10">
      <Container className="max-w-4xl">
        <div className="overflow-hidden rounded-3xl bg-white shadow-lg">
          <div className="h-32 bg-linear-to-r from-loco-navy to-loco-blue" />
          <div className="px-6 pb-8 sm:px-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="-mt-12 grid h-24 w-24 place-items-center overflow-hidden rounded-full border-8 border-white bg-loco-sky text-4xl font-black text-loco-navy shadow-lg">
                {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" /> : user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button as={Link} to="/profile/edit" size="sm">{t("common.edit")}</Button>
                <Button as={Link} to="/profile/change-password" variant="outline" size="sm">{t("auth.password")}</Button>
              </div>
            </div>

            <h1 className="mt-4 text-2xl font-black text-loco-navy">{user.name}</h1>
            {user.headline && <p className="font-semibold text-loco-blue">{user.headline}</p>}
            <p className="text-sm text-gray-500">{t(`labels.roles.${user.role}`)}{user.district ? ` · ${user.district}` : ""}</p>
            {user.skills?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {user.skills.map((skill) => <span key={skill} className="rounded-full bg-loco-ice px-2.5 py-1 text-xs font-semibold text-loco-navy">{skill}</span>)}
              </div>
            )}
            {user.bio && <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-700">{user.bio}</p>}
            {(user.headline || user.role === "SELLER") && (
              <Link to={`/people/${user.id}`} className="mt-3 inline-block text-sm font-bold text-loco-navy hover:text-loco-blue">{t("people.yourProfile")} →</Link>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Item icon={Mail} label={t("auth.email")} value={user.email} />
              <Item icon={Phone} label={t("checkout.phone")} value={formatPhoneForDisplay(user.phone) || "–"} />
              <Item icon={MapPin} label={t("common.district")} value={user.district || "–"} />
              <Item icon={ShieldCheck} label={t("common.status")} value={t(`labels.roles.${user.role}`)} />
              <Item icon={CalendarDays} label="LOCO" value={formatDate(user.createdAt, { day: "numeric", month: "long", year: "numeric" }, lang)} />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {shortcuts.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm transition hover:border-loco-blue">
              <Icon size={22} className="text-loco-navy" />
              <strong className="mt-3 block text-loco-ink">{label}</strong>
            </Link>
          ))}
        </div>
      </Container>
    </main>
  );
}

function Item({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-loco-ice p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-loco-navy shadow-sm"><Icon size={19} /></span>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{label}</p>
        <p className="mt-0.5 break-all font-semibold text-loco-ink">{value}</p>
      </div>
    </div>
  );
}
