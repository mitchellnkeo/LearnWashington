"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export function StoryViewed({ slug }: { slug: string }) {
  useEffect(() => {
    trackEvent("story_opened", { slug, surface: "page" });
  }, [slug]);

  return null;
}
