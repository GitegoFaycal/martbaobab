import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../api/api";

// Small data hook: refetches when the endpoint string changes.
export default function useFetch(endpoint, { enabled = true } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(enabled));
  const [version, setVersion] = useState(0);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    if (!enabled || !endpoint) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    apiRequest(endpoint)
      .then((response) => {
        if (!cancelled) {
          setData(response);
        }
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(requestError.message || "Something went wrong");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [endpoint, enabled, version]);

  return { data, error, loading, refetch, setData };
}
