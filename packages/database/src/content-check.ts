import { access, readdir, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import {
  checkSeedStory,
  seedStorySchema,
  type ContentIssue,
  type SeedStory,
} from "@fwty/shared";
import { resolveStoryGeometry } from "./story-files";

const repoRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");
const storiesDir = resolve(repoRoot, "data/stories");
const geometriesDir = resolve(repoRoot, "data/geometries");

type StoryCheckResult = {
  file: string;
  slug?: string;
  issues: ContentIssue[];
};

async function checkStoryDirectory(directory: string): Promise<StoryCheckResult[]> {
  const files = (await readdir(directory))
    .filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"))
    .sort();

  const results: StoryCheckResult[] = [];
  const slugs = new Map<string, string>();

  for (const file of files) {
    const raw = await readFile(resolve(directory, file), "utf8");
    const parsed = seedStorySchema.safeParse(parse(raw));

    if (!parsed.success) {
      results.push({
        file,
        issues: parsed.error.issues.map((issue) => ({
          code: "invalid-schema",
          message: `${issue.path.join(".") || "file"}: ${issue.message}`,
          level: "error",
        })),
      });
      continue;
    }

    let story: SeedStory = parsed.data;
    try {
      story = await resolveStoryGeometry(story, geometriesDir);
    } catch (error) {
      results.push({
        file,
        slug: parsed.data.slug,
        issues: [
          {
            code: "invalid-geometry-file",
            message: error instanceof Error ? error.message : "Could not load geometry file.",
            level: "error",
          },
        ],
      });
      continue;
    }

    const issues = checkSeedStory(story);
    for (const media of story.media) {
      if (!media.url.startsWith("/media/")) {
        continue;
      }
      const mediaPath = resolve(repoRoot, "apps/web/public", media.url.slice(1));
      try {
        await access(mediaPath, constants.F_OK);
      } catch {
        issues.push({
          code: "missing-media-file",
          message: `Media file ${media.url} is not in apps/web/public/media.`,
          level: "error",
        });
      }
    }
    const previous = slugs.get(story.slug);
    if (previous) {
      issues.push({
        code: "duplicate-slug",
        message: `Slug ${story.slug} also appears in ${previous}.`,
        level: "error",
      });
    }
    slugs.set(story.slug, file);
    results.push({ file, slug: story.slug, issues });
  }

  return results;
}

const results = await checkStoryDirectory(storiesDir);
let errors = 0;
let warnings = 0;

for (const result of results) {
  if (result.issues.length === 0) {
    console.log(`ok  ${result.file}`);
    continue;
  }

  for (const issue of result.issues) {
    const label = issue.level === "error" ? "ERR" : "WARN";
    console.log(`${label} ${result.file}: ${issue.message}`);
    if (issue.level === "error") {
      errors += 1;
    } else {
      warnings += 1;
    }
  }
}

console.log(
  `${results.length} stories checked · ${errors} errors · ${warnings} warnings`,
);

if (errors > 0) {
  process.exit(1);
}
