CREATE INDEX stories_published_fts_idx
  ON stories
  USING GIN (to_tsvector('english', title || ' ' || hook))
  WHERE status = 'PUBLISHED';
--> statement-breakpoint
CREATE INDEX stories_title_trgm_idx
  ON stories
  USING GIN (title gin_trgm_ops)
  WHERE status = 'PUBLISHED';
--> statement-breakpoint
CREATE INDEX places_name_fts_idx
  ON places
  USING GIN (to_tsvector('english', name));
--> statement-breakpoint
CREATE INDEX places_name_trgm_idx
  ON places
  USING GIN (name gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX tags_name_trgm_idx
  ON tags
  USING GIN (name gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX categories_name_trgm_idx
  ON categories
  USING GIN (name gin_trgm_ops);
