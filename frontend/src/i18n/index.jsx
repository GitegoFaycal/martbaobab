import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import en from "./en";
import fr from "./fr";
import rw from "./rw";

export const LANGUAGES = [
  { code: "rw", label: "Kinyarwanda", short: "RW" },
  { code: "en", label: "English", short: "EN" },
  { code: "fr", label: "Français", short: "FR" },
];

const DICTIONARIES = { en, rw, fr };
const STORAGE_KEY = "loco.lang";

function detectLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && DICTIONARIES[saved]) {
      return saved;
    }
  } catch {
    // Storage unavailable.
  }

  const browser = (navigator.language || "en").toLowerCase();
  if (browser.startsWith("rw")) return "rw";
  if (browser.startsWith("fr")) return "fr";
  return "en";
}

function lookup(dictionary, key) {
  return key.split(".").reduce((node, part) => (node == null ? undefined : node[part]), dictionary);
}

function interpolate(text, params) {
  if (!params) {
    return text;
  }

  return text.replace(/\{(\w+)\}/g, (match, name) =>
    params[name] === undefined ? match : String(params[name])
  );
}

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(detectLanguage);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Storage unavailable.
    }
  }, [lang]);

  const setLang = useCallback((code) => {
    if (DICTIONARIES[code]) {
      setLangState(code);
    }
  }, []);

  const t = useCallback(
    (key, params) => {
      const value = lookup(DICTIONARIES[lang], key) ?? lookup(en, key);

      if (value === undefined) {
        return key;
      }

      return typeof value === "string" ? interpolate(value, params) : value;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }

  return context;
}

export function useT() {
  return useI18n().t;
}
