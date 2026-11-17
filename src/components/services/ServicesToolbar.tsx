"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { CATEGORIES, SERVICE_MODES } from "@/lib/constants";

export interface ToolbarValues {
  search: string;
  category: string;
  serviceMode: string;
  sort: string;
}

const SORT_OPTIONS = [
  { value: "", label: "Newest first" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

/**
 * URL-driven toolbar: every change writes to the query string, so filters
 * survive reloads and are applied by the SERVER (Challenge 1).
 */
export function ServicesToolbar({ values, total }: { values: ToolbarValues; total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(values.search);

  const update = (patch: Record<string, string | undefined>, keepPage = false) => {
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(patch)) {
      if (value && value !== "All") params.set(key, value);
      else params.delete(key);
    }
    if (!keepPage) params.delete("page");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const hasFilters =
    !!values.search || !!values.category || !!values.serviceMode || !!values.sort;

  return (
    <div className="card-surface p-4 md:p-5 mb-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          update({ search: query.trim() });
        }}
        className="flex flex-col lg:flex-row gap-3"
      >
        <label className="relative flex-1 min-w-0">
          <span className="sr-only">Search services</span>
          <Search
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or category…"
            className="input input-bordered rounded-xl h-11 pl-11 focus:border-primary focus:ring-2 focus:ring-primary/25 w-full"
          />
        </label>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:w-auto">
          <select
            aria-label="Filter by category"
            value={values.category}
            onChange={(e) => update({ category: e.target.value })}
            className="select select-bordered rounded-xl h-11 min-w-0 focus:border-primary"
          >
            <option value="All">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by service mode"
            value={values.serviceMode}
            onChange={(e) => update({ serviceMode: e.target.value })}
            className="select select-bordered rounded-xl h-11 min-w-0 focus:border-primary"
          >
            <option value="All">All modes</option>
            {SERVICE_MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            aria-label="Sort services"
            value={values.sort}
            onChange={(e) => update({ sort: e.target.value })}
            className="select select-bordered rounded-xl h-11 min-w-0 focus:border-primary"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <button type="submit" className="btn btn-primary rounded-xl h-11 gap-2 whitespace-nowrap">
            <SlidersHorizontal size={16} /> Apply
          </button>
        </div>
      </form>

      <div className="flex items-center justify-between gap-3 mt-4 px-1">
        <p className="text-xs font-medium opacity-65">
          <span className="font-bold text-base-content">{total}</span> service{total === 1 ? "" : "s"} found
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              router.replace(pathname, { scroll: false });
            }}
            className="btn btn-ghost btn-xs rounded-lg gap-1 text-error"
          >
            <X size={13} /> Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}
