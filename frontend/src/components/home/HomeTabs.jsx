import { Store, Users } from "lucide-react";
import { useT } from "../../i18n";

export default function HomeTabs({ active, onChange }) {
  const t = useT();

  const tabs = [
    { key: "market", label: t("landing.market"), text: t("landing.marketText"), icon: Store },
    { key: "people", label: t("landing.people"), text: t("landing.peopleText"), icon: Users },
  ];

  return (
    <div role="tablist" aria-label="LOCO" className="grid grid-cols-2 gap-3">
      {tabs.map(({ key, label, text, icon: Icon }) => {
        const selected = active === key;
        return (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={selected}
            onClick={() => onChange(key)}
            className={`flex flex-col items-center rounded-2xl border-2 px-4 py-5 text-center transition sm:flex-row sm:gap-4 sm:text-left ${
              selected
                ? "border-loco-orange bg-loco-wine text-white shadow-lg shadow-orange-100"
                : "border-orange-100 bg-white text-loco-wine hover:border-loco-orange"
            }`}
          >
            <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${selected ? "bg-white/15 text-loco-mint" : "bg-loco-cream text-loco-wine"}`}>
              <Icon size={30} />
            </span>
            <span className="mt-3 sm:mt-0">
              <span className="block text-xl font-black uppercase tracking-wide">{label}</span>
              <span className={`mt-0.5 hidden text-sm sm:block ${selected ? "text-white/75" : "text-gray-500"}`}>{text}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
