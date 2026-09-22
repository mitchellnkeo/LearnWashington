import { MVP_CATEGORIES } from "@fwty/shared";

export function escapeHoverText(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function storyHoverHtml(input: {
  title: string;
  hook?: string | null;
  category?: string | null;
}) {
  const category = MVP_CATEGORIES.find((item) => item.slug === input.category);
  const hook = input.hook?.trim();

  return `<div class="story-hover-card">
    ${category ? `<p class="story-hover-kicker">${escapeHoverText(category.name)}</p>` : ""}
    <p class="story-hover-title">${escapeHoverText(input.title)}</p>
    ${hook ? `<p class="story-hover-hook">${escapeHoverText(hook)}</p>` : ""}
  </div>`;
}
