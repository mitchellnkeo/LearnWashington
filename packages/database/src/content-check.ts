import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import {
  checkSeedStory,
  seedStorySchema,
  type ContentIssue,
  type SeedStory,
} from "@fwty/shared";

const repoRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");
const storiesDir = resolve(repoRoot, "data/stories");

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

    const story: SeedStory = parsed.data;
    const issues = checkSeedStory(story);
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
