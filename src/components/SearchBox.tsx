import { useEffect, useMemo, useRef, useState } from "react";
import { searchData } from "../utils/searchData";
import type { SearchResult } from "../utils/searchData";

interface Props {
  query: string;
  onQueryChange: (query: string) => void;
  onSelectCountry: (iso3: string) => void;
  onSelectInstrument: (instrumentId: string) => void;
}

export function SearchBox({ query, onQueryChange, onSelectCountry, onSelectInstrument }: Props) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const results = useMemo<SearchResult[]>(() => searchData(query, 12), [query]);
  const listboxId = "global-search-results";
  const activeOptionId = results[activeIndex]
    ? `global-search-option-${results[activeIndex].kind}-${results[activeIndex].id}`
    : undefined;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleSelect(r: SearchResult) {
    if (r.kind === "country") onSelectCountry(r.id);
    else if (r.kind === "instrument") onSelectInstrument(r.id);
    // regulations: scroll to country side panel via country lookup not in scope; close box
    setOpen(false);
    onQueryChange("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative w-full max-w-md">
      <label className="sr-only" htmlFor="global-search">
        Search countries, acts, instruments
      </label>
      <div className="flex items-center gap-2 rounded-lg border border-canvas-line bg-white px-3 py-2 shadow-sm focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30">
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-ink-500"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          id="global-search"
          type="search"
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open && results.length > 0}
          aria-controls={listboxId}
          aria-activedescendant={open ? activeOptionId : undefined}
          value={query}
          onChange={(e) => {
            onQueryChange(e.target.value);
            setOpen(true);
            setActiveIndex(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search countries, acts, agreements, organizations…"
          className="w-full bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
        />
      </div>

      {open && results.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="policy-scroll absolute left-0 right-0 top-full z-40 mt-2 max-h-80 overflow-y-auto rounded-lg border border-canvas-line bg-white py-1 shadow-drawer"
        >
          {results.map((r, i) => (
            <li
              id={`global-search-option-${r.kind}-${r.id}`}
              key={`${r.kind}:${r.id}`}
              role="option"
              aria-selected={i === activeIndex}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(r);
              }}
              className={`flex cursor-pointer flex-col gap-0.5 px-3 py-2 text-sm ${
                i === activeIndex ? "bg-accent-soft text-ink-900" : "text-ink-700"
              }`}
            >
              <span className="font-medium leading-tight">{r.title}</span>
              <span className="text-[11px] uppercase tracking-wide text-ink-500">
                {r.kind} · {r.subtitle}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
