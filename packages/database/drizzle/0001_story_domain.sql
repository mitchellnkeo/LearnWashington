CREATE TABLE places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  place_type text NOT NULL,
  description text,
  geometry geometry(Geometry, 4326) NOT NULL,
  county text,
  region text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX places_geometry_gix ON places USING GIST (geometry);
--> statement-breakpoint
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  icon text,
  sort_order integer NOT NULL DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL
);
--> statement-breakpoint
CREATE TABLE stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  hook text NOT NULL,
  body_md text NOT NULL,
  status text NOT NULL,
  verification_status text NOT NULL,
  primary_place_id uuid REFERENCES places (id),
  start_date date,
  end_date date,
  date_precision text,
  date_label text,
  geometry geometry(Geometry, 4326),
  featured boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  last_reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX stories_geometry_gix ON stories USING GIST (geometry);
--> statement-breakpoint
CREATE INDEX stories_public_idx ON stories (status, verification_status);
--> statement-breakpoint
CREATE TABLE story_categories (
  story_id uuid NOT NULL REFERENCES stories (id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories (id) ON DELETE CASCADE,
  PRIMARY KEY (story_id, category_id)
);
--> statement-breakpoint
CREATE TABLE story_tags (
  story_id uuid NOT NULL REFERENCES stories (id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags (id) ON DELETE CASCADE,
  PRIMARY KEY (story_id, tag_id)
);
--> statement-breakpoint
CREATE TABLE sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  publisher text NOT NULL,
  author text,
  url text NOT NULL,
  archive_url text,
  source_type text NOT NULL,
  tier text NOT NULL,
  publication_date date,
  accessed_at date NOT NULL,
  doi text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE story_sources (
  story_id uuid NOT NULL REFERENCES stories (id) ON DELETE CASCADE,
  source_id uuid NOT NULL REFERENCES sources (id) ON DELETE CASCADE,
  relationship text,
  PRIMARY KEY (story_id, source_id)
);
--> statement-breakpoint
CREATE TABLE claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES stories (id) ON DELETE CASCADE,
  text text NOT NULL,
  claim_type text NOT NULL,
  confidence text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE claim_sources (
  claim_id uuid NOT NULL REFERENCES claims (id) ON DELETE CASCADE,
  source_id uuid NOT NULL REFERENCES sources (id) ON DELETE CASCADE,
  locator text,
  notes text,
  PRIMARY KEY (claim_id, source_id)
);
--> statement-breakpoint
CREATE TABLE media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid REFERENCES stories (id) ON DELETE SET NULL,
  url text NOT NULL,
  thumbnail_url text,
  media_type text NOT NULL,
  title text,
  creator text,
  source_url text,
  license text,
  license_url text,
  alt_text text NOT NULL,
  credit_line text
);
--> statement-breakpoint
CREATE TABLE related_stories (
  story_id uuid NOT NULL REFERENCES stories (id) ON DELETE CASCADE,
  related_story_id uuid NOT NULL REFERENCES stories (id) ON DELETE CASCADE,
  relationship_type text,
  weight real,
  PRIMARY KEY (story_id, related_story_id),
  CHECK (story_id <> related_story_id)
);
