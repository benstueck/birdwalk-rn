export type SortOption = "date-desc" | "date-asc" | "count-desc" | "count-asc";

export const DEFAULT_SORT: SortOption = "date-desc";

export const sortOptions = {
  date: [
    { value: "date-desc" as const, label: "Newest first" },
    { value: "date-asc" as const, label: "Oldest first" },
  ],
  count: [
    { value: "count-desc" as const, label: "Most sightings" },
    { value: "count-asc" as const, label: "Fewest sightings" },
  ],
};

export type LiferSortOption =
  | "recent-desc" | "recent-asc"
  | "name-asc" | "name-desc"
  | "count-desc" | "count-asc";

export const DEFAULT_LIFER_SORT: LiferSortOption = "recent-desc";

export const liferSortOptions = {
  recent: [
    { value: "recent-desc" as const, label: "Most recent" },
    { value: "recent-asc" as const, label: "Least recent" },
  ],
  name: [
    { value: "name-asc" as const, label: "A → Z" },
    { value: "name-desc" as const, label: "Z → A" },
  ],
  count: [
    { value: "count-desc" as const, label: "Most sightings" },
    { value: "count-asc" as const, label: "Fewest sightings" },
  ],
};
