# Mr. Backsplash Project Case-Study Intake

This is a private editor-facing checklist. It is not copied into the public build.

The current portfolio images do not contain trustworthy location, date, duration, customer, permission, product, or scope metadata. Do not add any of those facts to a public page until David confirms them and the confirmation source is recorded here or in an equivalent project record.

## One record per real project

Before combining photos, first confirm that they show the same job. Similar cabinets, fixtures, upload dates, or filenames are not enough.

Record these identification fields:

- Internal project ID or job name
- Exact public photo filenames that belong to this job
- David's confirmation that the listed photos are the same project
- Date confirmed and who recorded the confirmation

## Facts David must confirm

### Location

- Town or municipality
- State
- Whether the town may be named publicly
- Whether a broader label such as “Saratoga County” is preferred
- Never publish a street address, customer name, or identifying exterior detail

### Timing

- Completion date, ideally month and year
- Approximate working duration
- What “duration” means: active installation days, elapsed calendar days, or another measure
- Any pauses or separate phases that would make a simple duration misleading

### Product and material

- Surface type: tile, laminate, vinyl, natural stone, manufactured stone, or other
- Manufacturer and product line, if known
- Product name, color, finish, dimensions, and pattern
- Grout product and color, if David wants it published
- Trim or edge product, if relevant
- A product label, invoice, order record, or David's direct confirmation as the source

Appearance is not proof of material. In particular, the dark wood-look plank photo must not be labeled tile, laminate, or vinyl without confirmation.

### Scope

- Exact surfaces David installed
- Whether removal or demolition was included
- Preparation David performed
- Substrate work David performed
- Waterproofing work David performed, if any
- Layout, setting, grout, trim, transitions, fixture work, or cleanup actually included
- Work completed by others that must not be attributed to David

Do not infer waterproofing, substrate preparation, demolition, plumbing, electrical work, cabinetry, counters, painting, or full-room renovation from a finished photo.

### Challenge and solution

- The real project constraint or customer goal
- Why it mattered in this specific space
- The exact option David recommended or carried out
- The visible or practical result
- David's confirmation that this description is accurate and may be published

Avoid generic case-study language such as “the challenge was a dated room” unless that was the documented project brief.

### Photo permission

- Who took each photo
- Who owns the photo
- Customer or property-owner permission to use interior photos for website marketing
- Whether permission covers social media and other marketing, if relevant
- Any requested crop, privacy restriction, or identifying detail to remove
- Permission source: signed release, email, text message, contract clause, or other record
- Date permission was received and where the record is stored

### Testimonial

- Exact customer wording, copied without rewriting
- Original source: email, text, platform review URL, or signed note
- Date received or posted
- Customer's permission to republish it on the website
- Approved attribution: full name, first name and last initial, initials, or anonymous
- Approved town attribution, if any
- Whether the quote may be lightly shortened and how omissions will be marked

Never turn a private message into a public testimonial without explicit permission.

## Editorial decision fields

For each route, record:

- Public slug
- Page title
- Search title and meta description
- Index status: `publish`, `noindex`, or `draft`
- Reason for the status
- Last fact-check date
- Editor who completed the fact check

Use `publish` only when the page is useful, visually distinct, and all claims on it are supportable. Use `noindex` when visitors need a stable detail route but the page lacks enough unique verified facts for search. Use `draft` when permission, project identity, or basic accuracy is unresolved.

## Minimum facts to upgrade a held page

A held page can be reconsidered for indexing after David provides, at minimum:

1. Confirmation that the photo belongs to his work and may be used publicly.
2. Confirmation of which photos, if any, show the same project.
3. Public location at the town or broader approved level.
4. Completion month and year.
5. Exact installed product or material.
6. Exact scope David completed.
7. One specific project constraint and the action David took to address it.

Duration and testimonial are valuable but are not required for indexing if they are omitted rather than guessed. If either is published, its source and permission must still be recorded.

## Current route policy

The source of truth for route content and index status is `scripts/project-data.mjs`. The build runs `scripts/generate_project_pages.mjs`, which produces static HTML in `source/work/projects/`.

The six current `publish` routes rely only on strong, visually distinct images and conservative visual observations. The remaining eight routes are `noindex,follow` and intentionally excluded from the sitemap until their records are strengthened.
