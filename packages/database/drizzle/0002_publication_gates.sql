ALTER TABLE stories
  ADD CONSTRAINT stories_status_check
  CHECK (status IN (
    'IDEA', 'RESEARCHING', 'DRAFT', 'FACT_CHECK', 'READY',
    'PUBLISHED', 'NEEDS_REVIEW', 'ARCHIVED'
  ));
--> statement-breakpoint
ALTER TABLE stories
  ADD CONSTRAINT stories_verification_check
  CHECK (verification_status IN (
    'UNVERIFIED', 'PARTIALLY_VERIFIED', 'VERIFIED', 'DISPUTED'
  ));
--> statement-breakpoint
ALTER TABLE stories
  ADD CONSTRAINT stories_published_place_check
  CHECK (
    status <> 'PUBLISHED'
    OR geometry IS NOT NULL
    OR primary_place_id IS NOT NULL
  );
