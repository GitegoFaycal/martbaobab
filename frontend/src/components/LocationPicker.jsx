import { useEffect, useState } from "react";
import { useT } from "../i18n";
import { cellsOf, loadLocations, sectorsOf, villagesOf, withLevel } from "../lib/locations";
import { DistrictSelect, Select } from "./ui";

// Cascading District > Sector > Cell > Village selects. Each level appears
// once the one above it is chosen; every level is optional.
export default function LocationPicker({ value, onChange, depth = "village", layout = "grid", className = "", selectClassName = "" }) {
  const t = useT();
  const [data, setData] = useState(null);
  const location = value || {};

  useEffect(() => {
    if (location.district && !data) loadLocations().then(setData);
  }, [location.district, data]);

  const levels = ["sector", "cell", "village"].slice(0, ["sector", "cell", "village"].indexOf(depth) + 1);
  const options = {
    sector: data ? sectorsOf(data, location.district) : [],
    cell: data ? cellsOf(data, location.district, location.sector) : [],
    village: data ? villagesOf(data, location.district, location.sector, location.cell) : [],
  };
  const labels = { sector: t("location.sector"), cell: t("location.cell"), village: t("location.village") };
  const parents = { sector: "district", cell: "sector", village: "cell" };

  const wrap = layout === "inline" ? `flex flex-wrap items-center gap-x-1 gap-y-1 ${className}` : `grid gap-2 sm:grid-cols-2 ${className}`;
  const sel = layout === "inline" ? `w-auto! min-w-0 max-w-44 ${selectClassName}` : selectClassName;

  return (
    <div className={wrap}>
      <DistrictSelect
        aria-label={t("common.district")}
        value={location.district}
        onChange={(event) => onChange(withLevel(location, "district", event.target.value))}
        placeholder={t("common.allDistricts")}
        className={sel}
      />
      {levels.map((level) =>
        location[parents[level]] ? (
          <Select
            key={level}
            aria-label={labels[level]}
            value={location[level]}
            onChange={(event) => onChange(withLevel(location, level, event.target.value))}
            className={sel}
          >
            <option value="">{t("location.all", { level: labels[level] })}</option>
            {options[level].map((name) => <option key={name} value={name}>{name}</option>)}
          </Select>
        ) : null
      )}
    </div>
  );
}
