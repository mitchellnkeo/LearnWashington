import { MVP_CATEGORIES } from "./enums";

export type StoriesBrowseFilter = {
  q?: string;
  category?: string;
  region?: string;
};

const MAX_QUERY = 80;

export function parseStoriesBrowseQuery(
  searchParams: URLSearchParams,
): StoriesBrowseFilter {
  const q = searchParams.get("q")?.trim() ?? "";
  const category = searchParams.get("category")?.trim() || undefined;
  const region = searchParams.get("region")?.trim() || undefined;
  const knownCategory = MVP_CATEGORIES.some((item) => item.slug === category);

  return {
    q: q.length >= 2 ? q.slice(0, MAX_QUERY) : undefined,
    category: knownCategory ? category : undefined,
    region: region ? region.slice(0, MAX_QUERY) : undefined,
  };
}
