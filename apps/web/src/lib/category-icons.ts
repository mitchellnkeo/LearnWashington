export const CATEGORY_ICON_NAMES = [
  "mountain",
  "fish",
  "leaf",
  "landmark",
  "sun",
  "music",
  "flask",
  "clapper",
] as const;

export type CategoryIconName = (typeof CATEGORY_ICON_NAMES)[number];

/** Inset 24×24 silhouettes so the category color stays visible around them. */
const ICON_MARKUP: Record<CategoryIconName, string> = {
  mountain: `<path d="M3.2 19.2h17.6L13.8 7.4l-2.2 3.8-2.8-5z"/>`,
  fish: `<ellipse cx="14.4" cy="12" rx="6.6" ry="4.3"/><path d="M8.6 12 2.6 7.1 4.8 12 2.6 16.9z"/>`,
  leaf: `<path d="M12.2 19.6c-3.4 0-6.2-2.8-6.4-6.2-.3-4.2 2.2-8.2 6.4-10.8 4.4 2.2 7.4 6.2 7.2 10.6-.2 3.6-3.2 6.4-7.2 6.4z"/><path d="M12.2 18.6c-.1-3.4 1.2-6.6 3.6-9.2"/>`,
  landmark: `<path d="M12 3.2 20.4 9.6H3.6z"/><path d="M5.2 10.4h13.6v1.7H5.2z"/><path d="M6.2 12.6h2V19H6.2z"/><path d="M11 12.6h2V19h-2z"/><path d="M15.8 12.6h2V19h-2z"/><path d="M4 19.2h16v1.5H4z"/>`,
  sun: `<circle cx="12" cy="12" r="3.7"/><path d="M11.2 3.1h1.6v2.6h-1.6z"/><path d="M11.2 18.3h1.6v2.6h-1.6z"/><path d="M3.1 11.2h2.6v1.6H3.1z"/><path d="M18.3 11.2h2.6v1.6h-2.6z"/><path d="m6.02 5.05.99-.99 1.84 1.84-.99.99z"/><path d="m15.15 14.16.99-.99 1.84 1.84-.99.99z"/><path d="m5.05 17.98.99.99 1.84-1.84-.99-.99z"/><path d="m15.15 9.84.99.99 1.84-1.84-.99-.99z"/>`,
  music: `<path d="M10.4 6.2v9.4a2.8 2.8 0 1 1-1.7-2.55V8.5l8.8-1.4v8.1a2.8 2.8 0 1 1-1.7-2.55V5.3z"/>`,
  flask: `<path d="M9.1 3.2h5.8v1.5h-1v4.6c0 .5.18 1.04.52 1.46l4.15 5.7A2 2 0 0 1 17 19.8H7a2 2 0 0 1-1.57-3.34l4.15-5.7A2.4 2.4 0 0 0 10.1 9.3V4.7h-1z"/>`,
  clapper: `<path d="M4.2 10.2h15.6v9.4H4.2z"/><path d="M4.2 4.4 8.6 9.8h11.2L15.4 4.4z"/>`,
};

export function isCategoryIconName(value: string): value is CategoryIconName {
  return (CATEGORY_ICON_NAMES as readonly string[]).includes(value);
}

export function categoryIconMarkup(icon: string, punchColor?: string) {
  const glyph = ICON_MARKUP[isCategoryIconName(icon) ? icon : "leaf"];
  if (icon === "fish" && punchColor) {
    return `${glyph}<circle cx="17.2" cy="10.7" r="1.05" fill="${punchColor}"/>`;
  }
  return glyph;
}
