const STORAGE_KEY = "fwty:surprise-excludes";
const MAX_EXCLUDES = 20;

export function readSurpriseExcludes(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

export function rememberSurpriseSlug(slug: string): string[] {
  const next = [slug, ...readSurpriseExcludes().filter((item) => item !== slug)].slice(
    0,
    MAX_EXCLUDES,
  );
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
