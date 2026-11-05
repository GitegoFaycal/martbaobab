// Rwanda's provinces and their 30 districts. Used for validation and filters.
export const PROVINCES = {
  "Kigali City": ["Gasabo", "Kicukiro", "Nyarugenge"],
  "Northern Province": ["Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo"],
  "Southern Province": [
    "Gisagara",
    "Huye",
    "Kamonyi",
    "Muhanga",
    "Nyamagabe",
    "Nyanza",
    "Nyaruguru",
    "Ruhango",
  ],
  "Eastern Province": [
    "Bugesera",
    "Gatsibo",
    "Kayonza",
    "Kirehe",
    "Ngoma",
    "Nyagatare",
    "Rwamagana",
  ],
  "Western Province": [
    "Karongi",
    "Ngororero",
    "Nyabihu",
    "Nyamasheke",
    "Rubavu",
    "Rusizi",
    "Rutsiro",
  ],
};

export const DISTRICTS = Object.values(PROVINCES).flat().sort();

export function provinceOf(district) {
  return (
    Object.entries(PROVINCES).find(([, districts]) =>
      districts.includes(district)
    )?.[0] || null
  );
}

// Rwandan mobile numbers: 07X XXX XXXX, optionally with +250 / 250 prefix.
export const RWANDA_PHONE_PATTERN = /^(\+?250|0)?7[2389]\d{7}$/;

export function normalizePhone(value) {
  if (!value) {
    return null;
  }

  const digits = String(value).replace(/[\s()-]/g, "");

  if (!RWANDA_PHONE_PATTERN.test(digits)) {
    return null;
  }

  const local = digits.replace(/^(\+?250|0)/, "");

  return `+250${local}`;
}

export const CURRENCY = "RWF";
