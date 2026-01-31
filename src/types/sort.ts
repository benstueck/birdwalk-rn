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
