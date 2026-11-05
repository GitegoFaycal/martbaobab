import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Scrolls to the top on every route change, like a classic multi-page site.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
