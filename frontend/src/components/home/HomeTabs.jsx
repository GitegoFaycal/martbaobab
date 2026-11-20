import { Store, Users } from "lucide-react";
import { useT } from "../../i18n";

// Compact Market / People switch for the landing page.
export default function HomeTabs({ active, onChange }) {
  const t = useT();

  const tabs = [
    { key: "market", label: t("landing.market"), icon: Store },
    { key: "people", label: t("landing.people"), icon: Users },
  ];

  return (
    <div role="tablist" aria-label="LOCO" className="inline-flex rounded-full border border-blue-100 bg-white p-1 shadow-sm">
      {tabs.map(({ key, label, icon: Icon }) => {
        const selected = active === key;
        return (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={selected}
            onClick={() => onChange(key)}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-black uppercase tracking-wide transition ${
              selected ? "bg-loco-navy text-white shadow" : "text-loco-navy hover:bg-loco-ice"
            }`}
          >
            <Icon size={17} className={selected ? "text-loco-sky" : "text-loco-blue"} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
