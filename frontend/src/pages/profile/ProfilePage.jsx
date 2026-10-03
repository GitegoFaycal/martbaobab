import {
  CalendarDays,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export default function ProfilePage() {
  const { user } = useAuth();

  const joinedDate = new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(user.createdAt));

  return (
    <main className="min-h-[75vh] bg-baobab-cream px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-3xl bg-white shadow-lg">
          <div className="h-36 bg-gradient-to-r from-baobab-wine to-baobab-orange" />

          <div className="px-6 pb-8 sm:px-10">
            <div className="-mt-14 grid h-28 w-28 place-items-center rounded-full border-8 border-white bg-baobab-mint text-4xl font-black text-baobab-wine shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div className="flex flex-wrap gap-3">
  <Link
    to="/profile/edit"
    className="rounded-full bg-baobab-wine px-6 py-3 font-bold text-white hover:bg-baobab-wine-dark"
  >
    Edit profile
  </Link>

  <Link
    to="/profile/change-password"
    className="rounded-full border border-baobab-wine px-6 py-3 font-bold text-baobab-wine hover:bg-baobab-cream"
  >
    Change password
  </Link>
</div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <ProfileItem
                icon={Mail}
                label="Email address"
                value={user.email}
              />

              <ProfileItem
                icon={Phone}
                label="Telephone number"
                value={user.phone || "Not provided"}
              />

              <ProfileItem
                icon={ShieldCheck}
                label="Account type"
                value={formatRole(user.role)}
              />

              <ProfileItem
                icon={CalendarDays}
                label="Member since"
                value={joinedDate}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function formatRole(role) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

function ProfileItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-orange-100 bg-baobab-cream p-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-baobab-wine shadow-sm">
        <Icon size={21} />
      </span>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
          {label}
        </p>

        <p className="mt-1 break-all font-semibold text-baobab-ink">
          {value}
        </p>
      </div>
    </div>
  );
}