import { describe, expect, it } from "vitest";
import { escapeHoverText, storyHoverHtml } from "./story-hover";

describe("storyHoverHtml", () => {
  it("escapes title text and names the category", () => {
    const html = storyHoverHtml({
      title: `Rainier & <Ash>`,
      hook: 'A "threat" in the Cascades.',
      category: "geography-geology",
    });

    expect(html).toContain("Geography &amp; Geology");
    expect(html).toContain("Rainier &amp; &lt;Ash&gt;");
    expect(html).toContain("A &quot;threat&quot; in the Cascades.");
    expect(html).not.toContain("<Ash>");
  });

  it("omits an empty hook", () => {
    expect(storyHoverHtml({ title: "Dry Falls" })).not.toContain("story-hover-hook");
    expect(escapeHoverText("a < b")).toBe("a &lt; b");
  });
});
