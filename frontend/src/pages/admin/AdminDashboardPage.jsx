import { ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <main className="min-h-[75vh] bg-baobab-cream px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl bg-baobab-wine p-10 text-white">
          <ShieldCheck size={42} className="text-baobab-mint" />

          <p className="mt-6 font-bold text-baobab-orange">
            Administration
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Welcome, {user.name}
          </h1>

          <p className="mt-4 max-w-2xl text-white/70">
            The administrator dashboard will later include seller approval,
            shop verification, category management, user management and
            marketplace moderation.
          </p>
        </div>
      </div>
    </main>
  );
}