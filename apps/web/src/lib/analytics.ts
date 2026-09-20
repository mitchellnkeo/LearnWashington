import { track } from "@vercel/analytics";

type EventPayload = {
  story_opened: { slug: string; surface: "map" | "page" };
  source_clicked: { slug: string; publisher: string };
  category_selected: { category: string };
  search_used: { kind: string; q: string };
  surprise_me_clicked: { slug: string };
  related_story_clicked: { from: string; to: string };
};

export function trackEvent<Name extends keyof EventPayload>(
  name: Name,
  payload: EventPayload[Name],
) {
  try {
    track(name, payload);
  } catch {
    // Analytics must never break the atlas.
  }
}
