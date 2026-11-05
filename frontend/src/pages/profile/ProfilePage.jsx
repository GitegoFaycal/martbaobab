import {
  Briefcase,
  CalendarDays,
  ClipboardList,
  Mail,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Store,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button, Container } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { formatDate, titleCase } from "../../lib/format";
import { formatPhoneForDisplay } from "../../lib/rwanda";

export default function ProfilePage() {
  const { user } = useAuth();

  const shortcuts = [
    { to: "/orders", icon: Package, label: "My orders", text: "Things you bought" },
    { to: "/applications", icon: ClipboardList, label: "My applications", text: "Jobs you applied for" },
    { to: "/hiring", icon: Briefcase, label: "People I'm hiring", text: "Jobs you posted" },
    ...(user.role === "SELLER" || user.role === "ADMIN"
      ? [{ to: "/seller", icon: Store, label: "Seller dashboard", text: "Your shop and listings" }]
      : [{ to: "/register?role=SELLER", icon: Store, label: "Start selling", text: "Open a shop on LOCO" }]),
  ];

  return (
    <main className="min-h-[75vh] bg-loco-cream py-10">
      <Container className="max-w-4xl">
        <div className="overflow-hidden rounded-3xl bg-white shadow-lg">
          <div className="h-32 bg-linear-to-r from-loco-wine to-loco-orange" />
          <div className="px-6 pb-8 sm:px-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="-mt-12 grid h-24 w-24 place-items-center rounded-full border-8 border-white bg-loco-mint text-4xl font-black text-loco-wine shadow-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button as={Link} to="/profile/edit" size="sm">Edit profile</Button>
                <Button as={Link} to="/profile/change-password" variant="outline" size="sm">Change password</Button>
              </div>
            </div>

            <h1 className="mt-4 text-2xl font-black text-loco-wine">{user.name}</h1>
            <p className="text-sm text-gray-500">{titleCase(user.role)} on LOCO{user.district ? ` · ${user.district}` : ""}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Item icon={Mail} label="Email" value={user.email} />
              <Item icon={Phone} label="Telephone" value={formatPhoneForDisplay(user.phone) || "Not provided"} />
              <Item icon={MapPin} label="District" value={user.district || "Not set"} />
              <Item icon={ShieldCheck} label="Account type" value={titleCase(user.role)} />
              <Item icon={CalendarDays} label="Member since" value={formatDate(user.createdAt, { day: "numeric", month: "long", year: "numeric" })} />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {shortcuts.map(({ to, icon: Icon, label, text }) => (
            <Link key={to} to={to} className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm transition hover:border-loco-orange">
              <Icon size={22} className="text-loco-wine" />
              <strong className="mt-3 block text-loco-ink">{label}</strong>
              <span className="text-xs text-gray-500">{text}</span>
            </Link>
          ))}
        </div>
      </Container>
    </main>
  );
}

function Item({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-orange-100 bg-loco-cream p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-loco-wine shadow-sm"><Icon size={19} /></span>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{label}</p>
        <p className="mt-0.5 break-all font-semibold text-loco-ink">{value}</p>
      </div>
    </div>
  );
}
