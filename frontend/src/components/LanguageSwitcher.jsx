import { Globe } from "lucide-react";
import { LANGUAGES, useI18n } from "../i18n";

export default function LanguageSwitcher({ light = false, className = "" }) {
  const { lang, setLang, t } = useI18n();

  return (
    <label
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-bold ${
        light
          ? "border-white/30 text-white"
          : "border-blue-100 bg-white text-loco-navy"
      } ${className}`}
    >
      <Globe size={14} className={light ? "text-loco-sky" : "text-loco-blue"} />
      <span className="sr-only">{t("lang.label")}</span>
      <select
        value={lang}
        onChange={(event) => setLang(event.target.value)}
        aria-label={t("lang.label")}
        className={`cursor-pointer bg-transparent outline-none ${light ? "text-white [&>option]:text-loco-ink" : ""}`}
      >
        {LANGUAGES.map((item) => (
          <option key={item.code} value={item.code}>
            {item.short} · {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}
