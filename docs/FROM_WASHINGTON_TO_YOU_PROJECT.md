# From Washington To You

## Project Charter, Product Scope, Architecture, and AI Development Guide

> **Project name:** From Washington To You  
> **Tagline:** Explore Washington, one story at a time.  
> **Concept:** A source-backed, interactive cultural and natural-history atlas of Washington State presented through a playful postcard-inspired map experience.

---

# 1. Purpose of This Document

This file is the primary source of truth for AI-assisted development of **From Washington To You**.

Cursor and any other coding assistant working in this repository should use this document to understand:

- the mission of the product;
- what is and is not in scope;
- the expected user experience;
- the editorial and sourcing standards;
- the preferred technical architecture;
- the data model;
- the geospatial design;
- the API conventions;
- the frontend structure;
- the content ingestion workflow;
- accessibility, security, and performance expectations;
- MVP priorities;
- implementation order;
- future expansion paths.

When implementation choices conflict with this document, prefer the simplest solution that preserves the product principles defined here.

Do **not** turn this project into a generic GIS dashboard, tourism directory, social network, or AI-generated trivia site.

---



# 2. Product Vision

**From Washington To You** is an interactive map of Washington State filled with verified stories about the state's geography, geology, wildlife, ecology, history, Indigenous history, music, art, science, industry, agriculture, maritime history, outdoor culture, and unusual local facts.

The experience should feel like opening a box of postcards and discovering the state one story at a time.

The core emotional loop is:

> **See a place → get curious → open a postcard → learn something surprising → follow a related story → keep exploring.**

The map is not the final product by itself. It is the interface to a structured, source-backed knowledge base about Washington.

The product should sit conceptually somewhere between:

- a beautiful atlas;
- a museum exhibit;
- a local-history archive;
- a geographic Wikipedia;
- a field guide;
- an exploratory map;
- a box of postcards.

The website should be approachable enough for a casual visitor but rigorous enough that teachers, students, researchers, journalists, tourists, and Washington residents can trust the factual content.

---

# 3. North Star

## Product promise

> **Every story has a source.**

Every factual claim published on the site must be supported by one or more references.

Preferred references are:

1. primary government sources;
2. tribal government or tribal cultural resources;
3. peer-reviewed research;
4. university or academic sources;
5. archives, libraries, museums, and historical societies;
6. reputable books or established journalism when primary material is not available.

Wikipedia, blogs, social media, AI-generated text, tourism listicles, and general-interest websites may be used for **discovery**, but should not normally be used as final evidence for publication.

AI is a research and writing assistant, not an authority.

---

# 4. Core Product Principles



## 4.1 Source-first

No published factual content without evidence.

A source should be stored as structured data, not embedded only as prose.

Where reasonable, evidence should exist at the **claim level**, not merely at the story level.

---



## 4.2 Curiosity over comprehensiveness

The first version does not need to contain everything about Washington.

A smaller collection of excellent, well-researched stories is better than thousands of low-quality facts.

Initial target:

**100–250 high-quality postcards.**

---



## 4.3 Storytelling over raw data

Government and scientific datasets may be complex.

The application should translate them into understandable stories while preserving links to the underlying evidence.

Bad:

> `Qgo — Pleistocene glacial outwash`

Better:

> Much of the ground beneath this area was deposited by meltwater flowing from Ice Age glaciers.

The original source should remain available from the postcard.

---



## 4.4 Geographic discovery

Every story should have a meaningful geographic relationship.

That relationship may be:

- an exact point;
- a city;
- a landmark;
- a river;
- a park;
- a county;
- a watershed;
- a polygon;
- a route;
- a broad region.

Avoid assigning artificially precise coordinates to stories that are regional.

---



## 4.5 Clear uncertainty

Not every historical or scientific claim is equally certain.

The system should support:

- verified;
- strongly supported;
- uncertain;
- disputed;
- approximate.

The UI should not present disputed or approximate facts as certain.

---



## 4.6 Respectful treatment of Indigenous knowledge

Indigenous history and culture must not be treated as novelty trivia.

For Indigenous-related content:

- prioritize tribal governments and tribal cultural departments;
- use Indigenous names and spellings as provided by authoritative sources;
- preserve nuance where multiple names or traditions exist;
- avoid publishing sensitive archaeological, burial, sacred, or restricted cultural locations;
- avoid implying that historical tribal territories are equivalent to modern political boundaries;
- distinguish archaeological interpretation from community knowledge;
- do not publish culturally sensitive information merely because it is technically public.

---



## 4.7 Delight without sensationalism

The website should be playful and visually inviting.

It should not rely on:

- clickbait;
- exaggerated historical claims;
- fabricated legends;
- paranormal claims presented as fact;
- unsupported superlatives;
- sensational framing of tragedy.

A "Weird Washington" category is welcome, but claims must still be sourced and clearly characterized.

---



# 5. Target Users

Primary audiences:

### Washington residents

People curious about the places around them.

### Visitors

People who want context beyond standard tourism recommendations.

### Students and educators

People looking for accessible, source-backed Washington information.

### Outdoor enthusiasts

People interested in geology, ecology, wildlife, rivers, mountains, forests, and public lands.

### History and culture enthusiasts

People interested in local history, music, architecture, industry, and community stories.

### Casual explorers

People who simply want to click "Surprise Me" and learn something interesting.

The site should not require domain expertise.

---



# 6. Core Experience

The default page is a full or near-full-screen interactive map of Washington.

Users should be able to:

1. pan and zoom;
2. see story markers;
3. filter by category;
4. click a marker;
5. open a postcard;
6. read a short, engaging story;
7. inspect sources;
8. follow related stories;
9. search for places, people, topics, species, or events;
10. click "Surprise Me";
11. eventually click anywhere and ask "What's interesting around here?"

The experience should reward exploration rather than make the user configure a complicated search interface.

---



# 7. Primary Content Categories

Initial taxonomy:

- Geography
- Geology
- Ecology
- Wildlife
- History
- Indigenous History & Place
- Music
- Art & Culture
- Science & Technology
- Industry
- Agriculture & Food
- Maritime
- Outdoors
- Cities & Communities
- Transportation
- Architecture
- Strange / Unusual Washington

Categories may have subcategories.

Example:

```text
Wildlife
├── Mammals
├── Birds
├── Fish
├── Marine Life
├── Amphibians
└── Invertebrates
```

Do not over-engineer the taxonomy during the MVP.

Use tags for fine-grained classification.

---



# 8. The Postcard

The postcard is the core content unit.

A postcard should contain:

- title;
- short hook;
- story body;
- location;
- optional date or date range;
- category;
- tags;
- hero image when licensing allows;
- map geometry;
- sources;
- related postcards;
- verification status;
- last reviewed date.

Example conceptual UI:

```text
┌─────────────────────────────────────┐
│            [ HERO IMAGE ]           │
│                                     │
│         MOUNT ST. HELENS            │
│         Skamania County             │
├─────────────────────────────────────┤
│                                     │
│ On May 18, 1980...                  │
│                                     │
│ Related: Volcanoes · Geology        │
│                                     │
├─────────────────────────────────────┤
│ Sources                             │
│ USGS                                │
│ Washington Geological Survey        │
│                                     │
│ Last reviewed: 2026                 │
└─────────────────────────────────────┘
```

The tone should be concise, human, informative, and curious.

Avoid sounding like encyclopedia boilerplate.

---



# 9. Source Hierarchy

Use the following editorial hierarchy.

## Tier S — Primary / authoritative

Examples:

- Washington Department of Natural Resources
- Washington Department of Fish & Wildlife
- Washington State Parks
- Washington State Department of Archaeology & Historic Preservation
- Washington State Library
- Washington State Archives
- Washington State Historical Society primary collections
- Washington Department of Ecology
- Washington State Department of Transportation
- Washington Department of Agriculture
- United States Geological Survey
- National Park Service
- NOAA
- USDA / U.S. Forest Service
- U.S. Fish & Wildlife Service
- National Archives
- Library of Congress
- Smithsonian
- Census Bureau
- tribal governments
- tribal cultural departments and official tribal publications
- original laws, treaties, surveys, maps, reports, photographs, recordings, and archival material



## Tier A — Academic

Examples:

- peer-reviewed papers;
- university research;
- university archives;
- scholarly monographs;
- Pacific Northwest National Laboratory;
- established research institutes.



## Tier B — Cultural institution

Examples:

- accredited museums;
- public libraries;
- archives;
- historical societies;
- institutional oral-history collections.



## Tier C — Reputable secondary sources

Examples:

- established journalism;
- respected books;
- professionally edited reference publications.

Use when better evidence is unavailable or when context requires secondary analysis.

## Tier D — Discovery only

Examples:

- Wikipedia;
- blogs;
- Reddit;
- tourism websites;
- fan sites;
- general websites;
- unsourced articles.

These may identify a lead.

They should normally be replaced with stronger sources before publication.

## Prohibited as final evidence

- AI-generated text;
- unsourced social posts;
- anonymous claims;
- SEO content farms;
- copied trivia collections;
- claims with no identifiable origin.

---



# 10. Source Data Requirements

Every source record should store as much of the following as available:

```ts
type Source = {
  id: string;
  title: string;
  publisher: string;
  author?: string;
  url: string;
  sourceType:
    | "government"
    | "tribal"
    | "academic"
    | "archive"
    | "museum"
    | "book"
    | "journalism"
    | "dataset"
    | "primary_document"
    | "other";
  tier: "S" | "A" | "B" | "C" | "D";
  publicationDate?: string;
  accessedAt: string;
  archiveUrl?: string;
  doi?: string;
  notes?: string;
};
```

Do not assume URLs are permanent.

Long-term, support:

- archived URLs;
- document identifiers;
- DOIs;
- agency dataset IDs;
- publication numbers.

---



# 11. Claims and Evidence

For a robust provenance system, stories should contain structured claims.

Example:

```text
Story
  ├── Claim A
  │     ├── Source 1
  │     └── Source 2
  │
  ├── Claim B
  │     └── Source 3
  │
  └── Claim C
        ├── Source 1
        └── Source 4
```

Suggested fields:

```ts
type Claim = {
  id: string;
  storyId: string;
  text: string;
  claimType:
    | "factual"
    | "historical"
    | "scientific"
    | "interpretive";
  confidence:
    | "verified"
    | "strongly_supported"
    | "uncertain"
    | "disputed"
    | "approximate";
  notes?: string;
};
```

A join table associates claims with sources.

This lets the UI eventually support:

> "Why do we say this?"

without requiring the reader to guess which source supports which assertion.

MVP may display sources at the story level while still storing claim-level relationships internally.

---



# 12. Core Domain Model

Preferred entities:

```text
Story
Place
Claim
Source
Category
Tag
MediaAsset
StoryPlace
StoryCategory
StoryTag
ClaimSource
RelatedStory
Person
Organization
Species
Event
```

Do not build every entity on day one.

MVP minimum:

```text
stories
places
categories
tags
story_tags
sources
claims
claim_sources
story_sources
media_assets
related_stories
```

---



# 13. Geographic Model

Use **PostgreSQL + PostGIS**.

Geometry must support more than points.

Examples:

- a historic venue: Point;
- Mount Rainier National Park: Polygon/MultiPolygon;
- Columbia River: LineString/MultiLineString;
- Cascadia Subduction Zone: broad geometry;
- Ice Age Floods: regional polygon;
- a historic railroad route: LineString.

Recommended geometry approach:

```sql
geometry GEOMETRY(Geometry, 4326)
```

Create GiST indexes on geometry columns.

For distance calculations, transform appropriately or use PostGIS geography functions.

Do not calculate geographic distance manually in JavaScript.

---



# 14. Suggested Database Schema

Conceptual schema:

```text
stories
-------
id UUID PK
slug TEXT UNIQUE
title TEXT
hook TEXT
body_md TEXT
status TEXT
verification_status TEXT
primary_place_id UUID NULL
start_date DATE NULL
end_date DATE NULL
date_label TEXT NULL
geometry GEOMETRY NULL
featured BOOLEAN
published_at TIMESTAMP NULL
last_reviewed_at TIMESTAMP NULL
created_at TIMESTAMP
updated_at TIMESTAMP

places
------
id UUID PK
slug TEXT UNIQUE
name TEXT
place_type TEXT
description TEXT NULL
geometry GEOMETRY NOT NULL
county TEXT NULL
region TEXT NULL
created_at TIMESTAMP
updated_at TIMESTAMP

categories
----------
id UUID PK
slug TEXT UNIQUE
name TEXT
description TEXT
icon TEXT NULL
sort_order INT

story_categories
----------------
story_id UUID
category_id UUID

tags
----
id UUID PK
slug TEXT UNIQUE
name TEXT

story_tags
----------
story_id UUID
tag_id UUID

claims
------
id UUID PK
story_id UUID
text TEXT
claim_type TEXT
confidence TEXT
sort_order INT
created_at TIMESTAMP

sources
-------
id UUID PK
title TEXT
publisher TEXT
author TEXT NULL
url TEXT
archive_url TEXT NULL
source_type TEXT
tier TEXT
publication_date DATE NULL
accessed_at DATE
doi TEXT NULL
notes TEXT NULL
created_at TIMESTAMP

claim_sources
-------------
claim_id UUID
source_id UUID
locator TEXT NULL
notes TEXT NULL

story_sources
-------------
story_id UUID
source_id UUID
relationship TEXT NULL

media_assets
------------
id UUID PK
story_id UUID NULL
url TEXT
thumbnail_url TEXT NULL
media_type TEXT
title TEXT NULL
creator TEXT NULL
source_url TEXT NULL
license TEXT NULL
license_url TEXT NULL
alt_text TEXT
credit_line TEXT NULL

related_stories
---------------
story_id UUID
related_story_id UUID
relationship_type TEXT NULL
weight REAL NULL
```

---



# 15. Content Status Workflow

Stories should move through an editorial lifecycle:

```text
idea
  ↓
researching
  ↓
draft
  ↓
fact_checked
  ↓
ready
  ↓
published
  ↓
needs_review
  ↓
archived
```

Recommended `status` values:

```text
IDEA
RESEARCHING
DRAFT
FACT_CHECK
READY
PUBLISHED
NEEDS_REVIEW
ARCHIVED
```

Verification should be independent:

```text
UNVERIFIED
PARTIALLY_VERIFIED
VERIFIED
DISPUTED
```

Only verified or deliberately labeled disputed content should be publicly visible.

---



# 16. Media and Copyright

Do not assume images found on the internet may be reused.

Every media asset should include:

- creator;
- original source;
- license;
- required credit;
- alt text.

Preferred image sources:

- public-domain government photography;
- Library of Congress;
- National Archives;
- state archives;
- agency media libraries;
- Creative Commons resources with compatible licenses;
- original photography.

Do not download or republish copyrighted photography without permission.

Remote linking should also comply with the source's terms.

---



# 17. Recommended Technology Stack

The stack should favor technologies already familiar to the project owner and avoid unnecessary infrastructure.

## Repository

**pnpm workspace monorepo**

```text
from-washington-to-you/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── database/
│   ├── shared/
│   └── config/
├── scripts/
├── data/
├── docs/
├── docker/
├── .github/
├── README.md
└── PROJECT.md
```

This file can live as:

```text
PROJECT.md
```

---



# 18. Frontend

Recommended:

- React
- TypeScript
- Vite
- Tailwind CSS
- MapLibre GL JS
- TanStack Query
- React Router
- Zod
- lightweight local state with React state/context or Zustand only when useful

Avoid Redux unless application complexity actually requires it.

## Why MapLibre

MapLibre provides:

- WebGL map rendering;
- vector tile support;
- custom layers;
- clustering;
- GeoJSON;
- styling control;
- open ecosystem;
- freedom from locking the product around a single proprietary map provider.

Do not use Leaflet as the primary renderer if vector tiles, large numbers of features, or rich map transitions are central to the experience.

---



# 19. Backend

Recommended:

- Node.js
- TypeScript
- Express
- Zod validation
- PostgreSQL
- PostGIS
- Drizzle ORM or direct SQL where geospatial operations require it

Keep REST simple.

GraphQL is not necessary for the MVP.

Suggested layout:

```text
apps/api/src/
├── app.ts
├── server.ts
├── config/
├── db/
├── middleware/
├── modules/
│   ├── stories/
│   ├── places/
│   ├── categories/
│   ├── search/
│   └── discovery/
├── routes/
├── services/
├── lib/
└── types/
```

Prefer domain-based modules over one enormous controllers/services directory.

---



# 20. Database Tooling

Recommended:

- PostgreSQL 16+
- PostGIS
- Drizzle ORM
- SQL migrations
- local database via Docker Compose

Example local services:

```text
postgres + postgis
api
web
```

The database should remain deployable to any managed PostgreSQL provider with PostGIS support.

Avoid provider-specific database features unless justified.

---



# 21. Search

MVP search should support:

- story titles;
- places;
- tags;
- categories;
- people/topics appearing in searchable metadata.

Start with PostgreSQL:

- full-text search;
- `pg_trgm`;
- indexed normalized search fields.

Do not add Elasticsearch/Algolia/OpenSearch until PostgreSQL search is demonstrably insufficient.

Potential endpoint:

```http
GET /api/search?q=rainier
```

Response groups:

```json
{
  "stories": [],
  "places": [],
  "tags": []
}
```

---



# 22. API Design

Initial public read endpoints:

```http
GET /api/stories
GET /api/stories/:slug
GET /api/stories/:slug/related

GET /api/categories
GET /api/places/:slug

GET /api/map/stories
GET /api/search

GET /api/discovery/random
GET /api/discovery/nearby
```

Example map query:

```http
GET /api/map/stories?bbox=-124.9,45.5,-116.8,49.1&zoom=7&categories=geology,wildlife
```

Return only fields needed to render the map.

Do **not** return full story bodies for every marker.

Example:

```json
{
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-122.18, 46.19]
      },
      "properties": {
        "id": "...",
        "slug": "mount-st-helens-1980-eruption",
        "title": "Mount St. Helens",
        "category": "geology",
        "icon": "volcano"
      }
    }
  ]
}
```

Use GeoJSON where practical.

---



# 23. Bounding-Box Loading

Do not fetch every story in Washington on every map interaction.

The client should send the visible bounding box.

PostGIS query pattern:

```sql
WHERE ST_Intersects(
  geometry,
  ST_MakeEnvelope($west, $south, $east, $north, 4326)
)
```

At low zoom levels:

- cluster;
- aggregate;
- reduce marker density.

At high zoom levels:

- show individual stories.

Debounce map viewport queries.

---



# 24. Marker Clustering

The initial application should support clustering.

Potential options:

- MapLibre built-in GeoJSON clustering;
- server-side clustering later if dataset size becomes very large.

MVP should prefer client-side MapLibre clustering unless benchmarks indicate otherwise.

Cluster interaction:

1. user clicks cluster;
2. map smoothly zooms;
3. cluster separates into more localized stories.

---



# 25. Frontend Application Structure

Suggested:

```text
apps/web/src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   └── providers.tsx
├── components/
│   ├── ui/
│   ├── map/
│   ├── postcard/
│   ├── search/
│   ├── filters/
│   └── source/
├── features/
│   ├── stories/
│   ├── discovery/
│   ├── map/
│   └── search/
├── hooks/
├── lib/
├── services/
├── styles/
└── types/
```

Feature folders should own their domain logic.

Avoid giant components.

---



# 26. Major UI Components

Potential components:

```text
WashingtonMap
StoryMarker
StoryCluster
MapControls
CategoryFilter
SearchCommand
PostcardDrawer
PostcardCard
SourceList
SourceBadge
RelatedStories
RandomDiscoveryButton
NearbyDiscoveryButton
TimelineControl
ShareCard
MapLegend
MobileBottomSheet
```

TimelineControl is post-MVP unless needed earlier.

---



# 27. URL Design

Every important story should have a permanent URL.

Example:

```text
/story/mount-st-helens-1980-eruption
/story/hanford-b-reactor
/place/olympia
/category/geology
```

Map state may be encoded in query parameters:

```text
/?lat=47.2&lng=-120.7&zoom=7&category=music
```

This allows users to share a view.

---



# 28. SEO and Discoverability

Each story should be indexable outside the map.

A search engine should be able to find:

> "Mount St. Helens From Washington To You"

without requiring the map to load.

If the Vite SPA architecture makes SEO insufficient, add pre-rendering or server-side rendering later.

Do not prematurely migrate the entire stack solely for SEO.

Story metadata should include:

- page title;
- description;
- canonical URL;
- Open Graph data;
- image;
- structured metadata where useful.

---



# 29. Accessibility

Accessibility is a first-class requirement.

Minimum expectations:

- keyboard-accessible navigation;
- visible focus states;
- sufficient contrast;
- semantic buttons and links;
- appropriate landmarks;
- meaningful alt text;
- map content available through a non-map representation;
- postcard drawers correctly manage focus;
- screen-reader announcements for major state changes;
- reduced-motion preference respected.

The map cannot be the only way to access content.

Provide an accessible list/search representation of stories.

---



# 30. Responsive Design

Mobile is important.

Desktop:

- full map;
- side drawer or floating postcard.

Mobile:

- map;
- bottom sheet for postcards;
- touch-friendly category filters;
- search;
- prominent "Surprise Me."

Do not shrink a desktop layout into mobile.

Design mobile interaction intentionally.

---



# 31. Visual Direction

Keywords:

- modern postcard;
- Pacific Northwest;
- editorial;
- archival;
- tactile;
- field guide;
- warm;
- curious;
- restrained nostalgia.

Avoid:

- generic SaaS dashboard;
- government GIS aesthetic;
- cartoon tourist map;
- overly rustic "lumberjack" styling;
- fake-vintage clutter.

Potential motif:

```text
FROM: Washington
TO: You
```

Postcards may incorporate:

- stamp-like category markers;
- subtle paper texture;
- geographic coordinates;
- date labels;
- source stamps;
- region labels.

Visual design should remain readable and modern.

---



# 32. Map Basemap

The basemap should be visually quiet.

The content should be the star.

Prefer:

- subdued labels;
- clear geography;
- minimal POI clutter;
- strong state boundary;
- readable roads/water only when useful.

Do not let commercial map labels overpower the stories.

---



# 33. "Surprise Me"

This is an MVP feature.

Endpoint:

```http
GET /api/discovery/random
```

Optional filters:

```text
category
region
county
excludeStoryIds
```

Behavior:

1. select a random eligible published story;
2. fly the map to its geometry;
3. open the postcard;
4. allow another random discovery.

Do not repeat the same few stories continuously.

---



# 34. "What's Interesting Around Here?"

Post-MVP but architect for it.

Input:

```text
latitude
longitude
radius
optional category
```

Potential endpoint:

```http
GET /api/discovery/nearby?lat=47.25&lng=-120.9&radiusKm=30
```

PostGIS:

```sql
ST_DWithin(...)
```

Return ranked nearby stories.

Eventually rank by:

- geographic proximity;
- quality;
- uniqueness;
- category diversity;
- editorial importance.

---



# 35. Related Stories

A story may link to other stories.

Relationships may include:

```text
nearby
same_event
same_person
same_species
same_geologic_feature
same_movement
same_era
same_category
caused_by
part_of
influenced
```

MVP can use manually curated relationships.

Later, graph-based recommendations may be added.

Do not let AI-generated similarity automatically publish relationships without review.

---



# 36. Timeline

Timeline is a strong Phase 2 feature.

Stories may use:

- exact date;
- year;
- date range;
- approximate era;
- geological time.

The model must not force an exact Gregorian date when one is not appropriate.

Store:

```text
start_date
end_date
date_precision
date_label
```

Possible `date_precision`:

```text
day
month
year
decade
century
approximate
geologic
unknown
```

The display label may be:

> "About 13,000 years ago"

even though internal filtering uses an approximate numeric representation.

---



# 37. Data Ingestion Strategy

There are two fundamentally different content sources.

## Curated stories

Human-written stories researched from sources.

These are the core of the site.

## Structured public datasets

Examples:

- geology layers;
- species ranges;
- park boundaries;
- rivers;
- counties;
- historic sites;
- wildfire boundaries;
- trails;
- census geography.

Do not automatically turn every record in a government dataset into a postcard.

Datasets provide context and candidates.

Editorial content determines what becomes a story.

---



# 38. Research Workflow

Recommended workflow:

```text
DISCOVER
   ↓
LOCATE AUTHORITATIVE SOURCES
   ↓
CAPTURE SOURCE METADATA
   ↓
IDENTIFY CLAIMS
   ↓
WRITE DRAFT
   ↓
VERIFY CLAIMS
   ↓
CHECK LOCATION / DATE
   ↓
CHECK MEDIA RIGHTS
   ↓
EDITORIAL REVIEW
   ↓
PUBLISH
```

AI may assist with:

- discovering candidate topics;
- summarizing long reports;
- extracting candidate claims;
- suggesting tags;
- proposing coordinates for review;
- detecting duplicate stories;
- drafting prose;
- identifying weakly sourced statements.

AI must not be treated as evidence.

---



# 39. Content Seed Format

Before building an admin dashboard, content may be seeded from JSON/YAML/Markdown.

Example:

```yaml
slug: mount-st-helens-1980-eruption
title: Mount St. Helens
hook: The eruption that reshaped a mountain.
status: PUBLISHED

location:
  name: Mount St. Helens
  latitude: 46.1912
  longitude: -122.1944

categories:
  - geology
  - history

tags:
  - volcano
  - cascades
  - eruption

claims:
  - text: >
      Mount St. Helens erupted on May 18, 1980.
    confidence: verified
    sources:
      - usgs-msh-1980

sources:
  - id: usgs-msh-1980
    title: ...
    publisher: U.S. Geological Survey
    url: ...
    tier: S
```

Use schema validation before inserting seed files.

---



# 40. Admin / Editorial Tooling

Do not build a full CMS before the public experience works.

MVP content can be managed through:

- structured seed files;
- database scripts;
- lightweight internal forms if needed.

Later admin features:

- story editor;
- Markdown preview;
- source manager;
- claim/source linking;
- map coordinate picker;
- media licensing fields;
- review queue;
- duplicate detection;
- broken-link checks;
- source quality warnings;
- revision history.

---



# 41. Suggested MVP

The MVP should prove that exploring the map is enjoyable.

## MVP functionality

- Washington map;
- approximately 100 curated stories;
- point markers;
- marker clustering;
- category filters;
- postcard detail view;
- source list;
- search;
- random discovery;
- permanent story URLs;
- responsive layout;
- accessible list alternative;
- basic analytics;
- production deployment.



## MVP categories

Start with approximately six:

- Geography & Geology
- Wildlife & Ecology
- History
- Indigenous History & Place
- Music & Culture
- Science / Strange Washington

Expand later.

---



# 42. MVP Content Distribution

Suggested initial 100:

```text
20 Geography / Geology
15 Wildlife / Ecology
20 General History
10 Indigenous History / Place
15 Music / Culture
10 Science / Industry
10 Strange / Unexpected Washington
```

Do not force exact quotas.

Quality matters more than balance.

Geographic coverage should intentionally include:

- Puget Sound;
- Olympic Peninsula;
- southwest Washington;
- Cascades;
- north-central Washington;
- Columbia Basin;
- northeast Washington;
- southeast Washington;
- Columbia Gorge;
- coast.

Avoid accidentally making this a Seattle-only project.

---



# 43. Out of Scope for MVP

Do not build these initially:

- user accounts;
- comments;
- social feed;
- user-submitted facts;
- complex moderation;
- mobile native apps;
- AI chatbot;
- personalized recommendation engine;
- offline navigation;
- trip planning;
- live weather;
- real-time wildlife sightings;
- complex timeline;
- AR;
- gamification;
- badges;
- crowdsourcing;
- full CMS;
- graph visualization;
- vector-tile infrastructure unless actually needed.

These may be considered later.

---



# 44. Potential Phase 2 Features

After MVP validation:

### Timeline

Explore Washington through time.

### Nearby discovery

Click anywhere and discover nearby stories.

### "Take Me Somewhere"

Random map exploration.

### Collections

Examples:

- Ice Age Floods;
- Washington Volcanoes;
- Grunge;
- Salmon;
- Ghost Towns;
- Lighthouses;
- Indigenous place names;
- World's Fairs;
- Aviation;
- Famous Trees.



### Story relationships

Rabbit-hole exploration.

### Regional guides

Curated geographic collections.

### Classroom mode

Shareable collections for teachers.

### Historical map overlays

Compare historical and modern geography.

### Thematic scientific layers

Geology, watersheds, habitat, wildfire history.

---



# 45. Potential Phase 3 Features

Only if product demand exists:

- user accounts;
- saved postcards;
- visited places;
- personalized collections;
- educator accounts;
- public API;
- community submissions with editorial review;
- mobile application;
- downloadable field guides;
- physical postcard printing;
- partnerships with museums, libraries, parks, tribes, and universities.

---



# 46. Security

Minimum expectations:

- validate every request with Zod;
- parameterize SQL;
- no raw user input in SQL;
- sanitize rendered Markdown/HTML;
- restrict CORS;
- use secure headers;
- rate-limit public endpoints where appropriate;
- secrets only through environment variables;
- no secrets committed to git;
- dependency auditing;
- image upload restrictions if uploads are added later.

Because MVP is mostly read-only, keep the public attack surface small.

---



# 47. Performance

Targets:

- first meaningful content quickly on mobile;
- map interactions remain smooth;
- do not ship the entire story database to the browser;
- lazy-load postcard media;
- cache category metadata;
- use bounding-box API queries;
- index all common database filters;
- use GiST indexes for spatial queries;
- compress GeoJSON responses;
- consider vector tiles only after scale requires them.

Measure before optimizing.

---



# 48. Caching

Potential caching strategy:

### Browser / CDN

- static assets;
- source images where permitted;
- category metadata;
- story pages.



### API

Cache:

- featured stories;
- category lists;
- low-change story details.

Map bounds are dynamic and may not be worth aggressively caching during MVP.

---



# 49. Testing

Minimum testing layers:

## Unit tests

- validation;
- slug generation;
- source rules;
- filtering logic;
- date formatting;
- content utilities.



## API integration tests

- story retrieval;
- map bounds;
- category filters;
- random story;
- search;
- source relationships.



## Database tests

- PostGIS bounding-box behavior;
- distance queries;
- constraints.



## Frontend tests

- postcard interaction;
- filters;
- keyboard controls;
- accessible dialogs/drawers.



## E2E

Use Playwright for critical journeys:

```text
Open site
→ see map
→ select category
→ open marker
→ read postcard
→ open source
→ close postcard

Search
→ select result
→ map flies to location
→ postcard opens

Click Surprise Me
→ new story opens
```

---



# 50. Data Integrity Rules

Database constraints should enforce as much editorial quality as practical.

Examples:

- published story must have a title;
- published story must have geometry or a linked place;
- published story must have at least one source;
- source URL must be valid;
- category slug must be unique;
- story slug must be unique;
- related story cannot reference itself;
- duplicate claim-source links forbidden.

Some publication checks may live in application logic if database constraints become unwieldy.

---



# 51. Observability

At minimum:

- structured API logs;
- error reporting;
- database query monitoring;
- frontend error tracking;
- health endpoint.

Suggested:

```http
GET /health
```

Do not log sensitive request data unnecessarily.

---



# 52. Analytics

Use privacy-respecting analytics where possible.

Useful events:

```text
story_opened
source_clicked
category_selected
search_used
surprise_me_clicked
related_story_clicked
map_region_explored
share_clicked
```

Questions analytics should answer:

- Which categories create the most exploration?
- Do users follow related stories?
- Do users click sources?
- How long do discovery sessions last?
- Are certain regions underexplored?
- Does "Surprise Me" increase engagement?

Do not optimize for addictive behavior.

---



# 53. Environment Variables

Potential variables:

```bash
DATABASE_URL=
PORT=
NODE_ENV=

WEB_ORIGIN=
API_BASE_URL=

MAP_STYLE_URL=
MAP_API_TOKEN=

S3_ENDPOINT=
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=

SENTRY_DSN=
ANALYTICS_ID=
```

Only add variables when the associated feature exists.

Provide `.env.example`.

Never commit real credentials.

---



# 54. Local Development

Preferred:

```bash
pnpm install
docker compose up -d db
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Root commands should orchestrate the workspace.

Example:

```json
{
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint",
    "typecheck": "pnpm -r typecheck"
  }
}
```

---



# 55. Coding Standards

Cursor should follow these rules.

## TypeScript

- strict mode enabled;
- avoid `any`;
- prefer explicit domain types;
- validate external data;
- do not use type assertions to silence genuine uncertainty.



## React

- functional components;
- hooks;
- small components;
- keep data fetching separate from presentation where sensible;
- avoid unnecessary global state;
- avoid effect-driven state when derived state will work.



## Backend

- thin route handlers;
- validation at boundaries;
- domain logic in services;
- database access isolated;
- consistent error structure.



## Database

- migrations committed;
- no schema changes manually applied only in production;
- spatial indexes added intentionally;
- use transactions for multi-step writes.

---



# 56. API Error Format

Use a consistent structure:

```json
{
  "error": {
    "code": "STORY_NOT_FOUND",
    "message": "Story not found."
  }
}
```

Validation example:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid map bounds.",
    "details": {}
  }
}
```

Do not leak stack traces in production.

---



# 57. Slugs and IDs

Use UUIDs internally.

Use human-readable slugs externally.

Example:

```text
UUID:
15b69254-f...

Slug:
mount-st-helens-1980-eruption
```

URLs should never depend on database integer IDs.

---



# 58. Dates and Historical Precision

Do not fabricate precision.

Bad:

```text
1847-01-01
```

when the source says only:

```text
1847
```

Store precision separately.

For BCE, geological, or approximate dates, use a representation appropriate to the domain rather than forcing everything into SQL `DATE`.

---



# 59. Place Names

Places may have:

- official name;
- alternate names;
- historical names;
- Indigenous names.

Long-term schema:

```text
place_names
-----------
id
place_id
name
language
name_type
start_date
end_date
source_id
notes
```

Avoid presenting a single place-name origin as settled when scholarship or community usage differs.

---



# 60. Geographic Regions

Do not rely solely on counties.

Washington is experienced through overlapping geographies:

- counties;
- watersheds;
- mountain ranges;
- tribal lands;
- ecosystems;
- river basins;
- cultural regions;
- metropolitan areas;
- public-land units.

Support flexible region tagging.

Never infer cultural boundaries from county borders.

---



# 61. Scientific Data Presentation

When using modeled or sampled scientific data, clearly distinguish:

```text
Observed
Modeled
Estimated
Historical
Current
```

Example:

A species range is not the same as a confirmed observation.

The UI and editorial copy should make that distinction clear.

---



# 62. Content Voice

Desired voice:

- clear;
- warm;
- curious;
- concise;
- intelligent;
- non-sensational;
- accessible.

Avoid:

- "You won't believe...";
- "craziest";
- unsupported hyperbole;
- generic AI phrasing;
- excessive adjectives;
- tourist-brochure clichés.

Good postcard hook:

> Beneath much of the Puget Lowland lies evidence of an enormous sheet of ice that once covered the region.

Bad:

> Washington's absolutely insane geological history will blow your mind!

---



# 63. Citation UX

Every postcard should expose its sources without requiring a separate research workflow.

Possible UI:

```text
Sources (3)

[Government] U.S. Geological Survey
1980 Cataclysmic Eruption

[Government] Washington Geological Survey
Volcano Hazards in Washington

[Academic] University of Washington
...
```

Display:

- organization;
- document title;
- publication date if available;
- source type.

External source links should open intentionally and safely.

---



# 64. Source Health

Long-term automated task:

- periodically check source URLs;
- flag 404/410;
- preserve archived URL;
- alert when government datasets move;
- record last successful verification.

A broken URL should not automatically invalidate a claim, but it should trigger review.

---



# 65. Editorial Audit Trail

Eventually store revisions:

```text
story_revisions
---------------
id
story_id
editor
previous_content
new_content
reason
created_at
```

For MVP, Git history of seed files may provide enough provenance.

---



# 66. Preferred Authoritative Source Families

Research should preferentially search the following domains and institutions.

## Washington

- Washington Department of Natural Resources
- Washington Department of Fish & Wildlife
- Washington State Parks
- Washington State Department of Ecology
- Washington State Archives
- Washington State Library
- Washington State Historical Society
- Washington State Department of Archaeology & Historic Preservation
- Washington State Department of Transportation
- Washington Department of Agriculture
- Washington Secretary of State
- Washington State University
- University of Washington
- Western Washington University
- Central Washington University
- Eastern Washington University
- tribal governments and official tribal cultural resources



## Federal

- USGS
- NOAA
- National Park Service
- U.S. Forest Service
- U.S. Fish & Wildlife Service
- EPA
- National Archives
- Library of Congress
- Smithsonian
- Census Bureau
- Bureau of Land Management
- U.S. Army Corps of Engineers
- Department of Energy
- National Register of Historic Places

This list is not exhaustive.

Source quality matters more than domain suffix alone.

A `.gov` page may summarize rather than substantiate a claim; the best source may be an underlying report or dataset.

---



# 67. AI Rules for Cursor

Cursor should treat this section as mandatory project guidance.

## When generating content

Do not invent facts.

Do not create a publishable story from model knowledge alone.

Use placeholder content when evidence has not been supplied.

Example:

```text
TODO: SOURCE REQUIRED
```

Do not fabricate:

- citations;
- URLs;
- coordinates;
- dates;
- quotations;
- source titles;
- publication identifiers.



## When writing seed content

Every factual seed story must include sources.

If sources are not known, keep the story in `IDEA` or `RESEARCHING`.

## When writing code

Prefer:

- maintainability;
- typed interfaces;
- simple abstractions;
- modularity;
- tests.

Avoid:

- premature microservices;
- unnecessary state libraries;
- unnecessary queues;
- unnecessary distributed systems;
- speculative abstractions.

---



# 68. AI-Assisted Research Rules

An AI research tool may produce a candidate like:

```text
Candidate fact:
The Channeled Scablands were shaped by Ice Age floods.
```

Before publication:

1. identify an authoritative source;
2. open/read the source;
3. verify the claim;
4. record the source;
5. record any limits or ambiguity;
6. write the public-facing text;
7. fact-check again.

AI-generated summaries should never be treated as the authoritative source.

---



# 69. Ethical Constraints

Do not publish exact locations for information that could create harm.

Examples:

- sensitive archaeological sites;
- burial sites;
- endangered-species nests or den locations;
- culturally restricted sites;
- private residences associated with living people;
- fragile ecological resources vulnerable to visitation.

Generalize location where appropriate.

Editorial safety overrides the desire for map precision.

---



# 70. Privacy

Do not collect precise user location unless a feature requires it and the user intentionally enables it.

For "near me":

- explain why location is needed;
- minimize retention;
- do not store precise coordinates by default;
- allow manual map selection.

Do not create user-location histories for the MVP.

---



# 71. Deployment

Suggested provider-agnostic setup:

```text
Frontend:
Vercel or equivalent static/CDN host

API:
Render / Fly.io / Railway / equivalent

Database:
Managed PostgreSQL with PostGIS

Media:
S3-compatible object storage / CDN
```

Avoid designing architecture around one vendor.

---



# 72. CI/CD

GitHub Actions should eventually run:

```text
install
lint
typecheck
test
build
```

On pull requests.

Production deploy only after checks pass.

Database migrations should be explicit and observable.

---



# 73. Git Practices

Use conventional, focused commits.

Examples:

```text
feat(map): add clustered story markers
feat(stories): add source panel
fix(api): validate map bounding box
chore(db): add postgis extension migration
content(geology): add mount st helens story
```

Avoid committing generated build output unless required.

---



# 74. Initial Repository Milestones



## Milestone 0 — Foundation

- initialize monorepo;
- TypeScript;
- linting;
- formatting;
- web app;
- API;
- PostgreSQL/PostGIS;
- migrations;
- shared environment config;
- basic CI.



## Milestone 1 — First Map

- MapLibre renders Washington;
- bounds constrained sensibly;
- sample GeoJSON marker;
- responsive map layout.



## Milestone 2 — Story Domain

- database story schema;
- source schema;
- category schema;
- seed script;
- story API;
- postcard UI.



## Milestone 3 — Spatial API

- bounding-box query;
- marker loading;
- clustering;
- map-to-card interaction.



## Milestone 4 — Discovery

- filters;
- search;
- Surprise Me;
- related stories.



## Milestone 5 — Editorial Quality

- 100 researched postcards;
- claim/source validation;
- media attribution;
- accessibility review;
- mobile polish.



## Milestone 6 — Production

- monitoring;
- analytics;
- caching;
- deployment;
- public launch.

---



# 75. Suggested First Development Slice

Cursor should prefer vertical slices over building all infrastructure first.

First slice:

```text
1. Render Washington map.
2. Seed one story.
3. Store one location.
4. Store two sources.
5. Query story from API.
6. Render marker.
7. Click marker.
8. Open postcard.
9. Display source links.
```

Once this complete path works, generalize it.

Do not create twenty tables and zero visible product.

---



# 76. Example First Story

Use a well-documented topic such as Mount St. Helens for the first end-to-end development story.

The purpose is not to finalize editorial copy.

The purpose is to exercise:

- map coordinates;
- story content;
- category;
- claims;
- source records;
- postcard UI;
- related metadata.

Do not insert unsourced factual placeholder content into production fixtures.

---



# 77. Definition of Done for a Published Story

A story is publishable when:

- title is accurate;
- hook is accurate;
- story body has been edited;
- geographic placement is appropriate;
- dates are verified;
- every material factual claim is supported;
- at least one source meets publication standards;
- uncertainty is disclosed;
- media rights are understood;
- image has alt text;
- category and tags are assigned;
- links work;
- mobile presentation works;
- source UI works;
- story URL works.

---



# 78. Definition of Done for a Feature

A feature is complete when:

- it works on desktop and mobile;
- expected loading state exists;
- expected empty state exists;
- expected error state exists;
- types are correct;
- tests cover meaningful behavior;
- keyboard navigation works;
- accessibility concerns are addressed;
- no secrets or debug code remain;
- API errors are handled;
- performance is reasonable.

---



# 79. Avoid These Architectural Traps

Do not:

- create microservices;
- add Kafka;
- add Redis before a real caching need;
- add Elasticsearch before PostgreSQL search is tested;
- create a GraphQL layer without a clear need;
- build an elaborate CMS first;
- create an AI-generated content pipeline that bypasses editorial review;
- scrape the internet indiscriminately;
- store all geographic data as lat/lng points;
- embed citation strings directly inside prose without structured sources;
- treat a source list as equivalent to claim-level evidence;
- overfit the architecture to the first 100 stories.

---



# 80. Future Knowledge Graph

The relational model should leave room for a richer knowledge graph.

Potential entities:

```text
Person
Band
Species
Event
Organization
Tribe
River
Mountain
Building
Neighborhood
Industry
GeologicFeature
HistoricSite
```

Potential relationships:

```text
formed_in
born_in
occurred_at
inhabits
flows_through
named_after
recorded_at
played_at
built_by
affected
part_of
caused_by
connected_to
```

This is a future enhancement.

Do not require a graph database for the MVP.

PostgreSQL is sufficient.

---



# 81. Future Public API

A future public API could expose the dataset for education and research.

Possible:

```http
GET /v1/stories
GET /v1/places
GET /v1/sources
GET /v1/categories
```

Potential uses:

- classrooms;
- local journalism;
- museums;
- researchers;
- civic-tech projects.

Do not commit to this before the internal API is stable.

---



# 82. Product Identity

The project name is:

# **From Washington To You**

The postcard metaphor should remain subtle but present.

Possible supporting language:

> Explore Washington, one story at a time.

> Every corner of Washington has a story.

> From the Evergreen State, to you.

> Every story has a source.

Avoid renaming the project to:

- Washington Facts;
- Washington GIS;
- Washington Explorer;
- WA Data Map;

unless the owner explicitly changes direction.

---



# 83. Product Success

Early success is not measured by number of markers.

Better measures:

- users open multiple postcards per session;
- users follow related stories;
- users intentionally explore outside Seattle;
- users click source links;
- people share individual stories;
- users return to discover more;
- teachers or local organizations find the project useful;
- the content remains accurate as it grows.

---



# 84. Long-Term Vision

The project may eventually become a structured digital atlas containing thousands of interconnected, sourced stories.

A user could explore:

```text
Mount St. Helens
    ↓
1980 eruption
    ↓
David A. Johnston
    ↓
Coldwater Ridge
    ↓
Cascade volcanoes
    ↓
Mount Rainier
    ↓
Tahoma
    ↓
Indigenous place names
    ↓
Puyallup River
    ↓
salmon
    ↓
Puget Sound
```

The goal is to make Washington feel interconnected.

The map provides spatial discovery.

The relationships provide intellectual discovery.

The sources provide trust.

---



# 85. Immediate Build Order

Cursor should start here unless instructed otherwise:

```text
01. Initialize pnpm monorepo
02. Create React + Vite + TypeScript frontend
03. Create TypeScript Express API
04. Create PostgreSQL/PostGIS development database
05. Add migrations
06. Implement stories / places / categories / sources schema
07. Add one fully sourced seed story
08. Add MapLibre map
09. Add bbox story endpoint
10. Render story marker
11. Build postcard drawer
12. Display sources
13. Add additional seed stories
14. Add category filtering
15. Add search
16. Add Surprise Me
17. Add clustering
18. Add mobile polish
19. Add accessibility pass
20. Scale content toward first 100 postcards
```

---



# 86. Cursor Working Agreement

When asked to implement a feature:

1. Read this file first.
2. Inspect existing architecture before creating new patterns.
3. Reuse project conventions.
4. Prefer the smallest coherent implementation.
5. Explain important architectural tradeoffs.
6. Do not silently change the technology stack.
7. Do not add dependencies without justification.
8. Do not fabricate content or sources.
9. Preserve source-first editorial rules.
10. Write migration/test/docs changes when required.
11. Keep map performance in mind.
12. Keep accessibility in mind.
13. Keep mobile behavior in mind.
14. Ask for human editorial judgment when a decision concerns historical ambiguity, Indigenous cultural sensitivity, disputed facts, or source quality.

---



# 87. One-Sentence Architecture Summary

> **From Washington To You is a React/MapLibre client backed by a TypeScript API and PostgreSQL/PostGIS database, serving geographically indexed, source-backed stories whose factual claims maintain explicit provenance.**

---



# 88. One-Sentence Product Summary

> **From Washington To You is a playful, postcard-inspired interactive atlas that helps people discover the geography, history, wildlife, science, music, culture, and hidden stories of Washington State—with sources attached to every story.**

---



# 89. Final Rule

When there is tension between **more content** and **better-supported content**, choose better-supported content.

When there is tension between **more features** and **a better exploration experience**, choose the better exploration experience.

When there is tension between **technical cleverness** and **maintainability**, choose maintainability.

And when there is uncertainty about a fact:

> **Do not publish it as fact until the evidence supports it.**

