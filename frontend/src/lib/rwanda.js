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

const DISTRICT_KEY = "loco.district";

export function getSavedDistrict() {
  try {
    return localStorage.getItem(DISTRICT_KEY) || "";
  } catch {
    return "";
  }
}

export function saveDistrict(district) {
  try {
    if (district) {
      localStorage.setItem(DISTRICT_KEY, district);
    } else {
      localStorage.removeItem(DISTRICT_KEY);
    }
  } catch {
    // Storage unavailable (private mode); ignore.
  }
}

export function formatPhoneForDisplay(phone) {
  if (!phone) {
    return "";
  }

  const digits = String(phone).replace(/\D/g, "");
  const local = digits.startsWith("250") ? digits.slice(3) : digits.replace(/^0/, "");

  return local.length === 9
    ? `0${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`
    : phone;
}

export function whatsappLink(phone, text) {
  if (!phone) {
    return null;
  }

  const digits = String(phone).replace(/\D/g, "");
  const international = digits.startsWith("250")
    ? digits
    : `250${digits.replace(/^0/, "")}`;

  return `https://wa.me/${international}${
    text ? `?text=${encodeURIComponent(text)}` : ""
  }`;
}
