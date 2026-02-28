import { useState, useMemo, useCallback } from "react";
import type { Plot } from "../types";

export function useGisSearch(plots: Plot[]) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return plots
      .filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.data?.deceased?.name.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [plots, query]);

  const openSearch = useCallback(() => setIsOpen(true), []);
  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  return { query, setQuery, results, isOpen, openSearch, closeSearch };
}
