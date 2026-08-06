# Mr. Backsplash Design System

## Purpose

Build a local-service website for homeowners in Saratoga Springs, Clifton Park, Lake George, and nearby 518-area communities that communicates meticulous, owner-installed tile work and leads visitors to call, text, or request an estimate.

## Audience and positioning

- Primary audience: homeowners planning a kitchen backsplash, bathroom or shower tile project, tile flooring, repairs, regrouting, or laminate flooring installation.
- Positioning: an experienced local craftsperson who personally estimates and installs each job.
- Brand promise: customers work directly with David from the first conversation through final cleanup.
- Primary conversion: request a free estimate by text or phone.

## Personality

The brand is precise, neighborly, dependable, confident, and craft-focused.

The brand must not feel corporate, flashy, bargain-bin, vague, or overproduced.

## Voice and copy

- Write in direct, plain language.
- Use first person when David is speaking and avoid pretending there is a large crew.
- Lead with craftsmanship, communication, and owner accountability.
- Keep calls to action concrete: “Request a free estimate,” “Call or text David,” and “View recent work.”
- Never invent reviews, certifications, awards, project locations, warranties, or turnaround times.

## Visual identity

- Near black: `#0d0d0d`
- Primary black: `#141414`
- Bright gold: `#c9a227`
- Dark gold ink: `#7a5e12`
- Light gray: `#f4f4f4`
- Off white: `#efefef`
- White: `#ffffff`
- Charcoal body text: `#2e2e2e`
- Muted text: `#6c6c6c`
- Light border: `#e2e2e2`
- Display typography: Fraunces at 500–700 weights, with Georgia as fallback.
- Interface and body typography: Manrope at 400–800 weights, with system sans-serif fallbacks.
- Header navigation: 13px Manrope, weight 600, 1.3px tracking, uppercase, in an 80px header.
- Corners: restrained, generally 2–6px. Primary buttons use 2px corners and project imagery may use 6px corners.
- Borders: thin and quiet. Gold rules are used sparingly to mark emphasis.
- Shadows: soft and infrequent; project photography and black/white contrast create most of the depth.

The measured black, gray, gold, Fraunces, and Manrope system is intentionally adapted from the user’s visual reference. Reference branding, logos, copy, and imagery are not copied.

## Photography

- Use David’s real project photography and real portrait imagery wherever it exists.
- Treat the 169-photo `David's work` album as the authentic portfolio source of truth. Curated,
  web-optimized variants live in `source/assets/portfolio/`; use those before any generated or stock image.
- Favor completed installations, close material detail, visible alignment, and clean final spaces.
- Include selected process images only when they demonstrate care or technique.
- Hero images need room for centered text and should receive a near-black overlay for legibility.
- Generated imagery may fill a documented future service-image gap only when no suitable real photo exists, and it must never be presented as David’s completed work. The current public site uses real album photography for every service and project image.
- Do not use generic stock imagery or images borrowed from other contractors.
- Do not infer a project location or exact flooring material from a photo alone.
- Crop intentionally, provide responsive `srcset` variants, and preserve straight tile lines wherever possible.

## Layout and components

- The page follows Attention, Interest, Desire, Action: cinematic hero; owner story and services; project proof and service areas; estimate CTA.
- Use wide editorial headings and generous 84–110px section spacing.
- Services use four image-backed cards on desktop, two columns on tablet, and one column on mobile. Each card uses a dark lower overlay so its service title, explanation, and CTA remain legible.
- The homepage recent-work module uses three equal 4:3 image cards over a light-gray section. Each entire card links to `/work/`.
- The `/about/` page follows the measured reference structure: a dark editorial hero, two-column owner story, light process grid, dark differentiator grid, truthful owner-difference cards, and shared footer CTA. It uses singular language because David is the owner and sole installer.
- The `/services/` page uses a dark editorial hero and four generous alternating text-and-image rows. On mobile, every service keeps the text before the image. Every service is illustrated with David’s real work.
- The `/service-areas/` hub and its Saratoga Springs, Clifton Park, and Lake George pages describe service coverage rather than local offices or project history. Saratoga Springs emphasizes finish decisions, Clifton Park emphasizes occupied-home logistics, and Lake George emphasizes property-use and access planning. Location pages remain image-free so portfolio work is never assigned to a town.
- The `/work/` page uses a dark editorial hero, a featured-project case study, a three-column project gallery, and an accessible image lightbox that opens the larger optimized source. It never invents project locations, reviews, materials, or credentials.
- The `/contact/` page uses the measured two-tone hero, a direct-contact column, and a light-gray estimate form that prepares a text message without sending data automatically.
- Navigation, floating call control, phone, text, gallery lightbox, estimate form, and mobile menu must be functional.
- Avoid decorative badges, nested cards, artificial statistics, and redundant panels.

## Interaction and motion

- The 80px header is transparent over the homepage hero. After the hero, it hides while scrolling down and returns as a nearly opaque white header when scrolling up. The work page starts with the white header treatment.
- All interior routes start with the white header treatment. Every page uses the same five real routes: Home, About, Services, Our Work, and Contact.
- A fixed lower-right call control uses a cream halo around a black circular trigger. Opening it reveals a white phone capsule and turns the trigger into a black close square; click-away and Escape close it.
- Motion clarifies entry, hierarchy, and gallery progression.
- Use transform and opacity animations only.
- Image cards scale slightly on hover or keyboard focus; project CTAs reveal without shifting neighboring content.
- Respect `prefers-reduced-motion`; content must be complete without animation.
- Mobile keeps the floating call control within easy thumb reach without a bottom bar covering content.

## Accessibility and responsive behavior

- Maintain WCAG AA contrast for text and controls.
- Every interactive element must have a visible keyboard focus state.
- Provide meaningful alt text for project photos and an accessible dialog for enlarged images.
- At tablet and mobile sizes, collapse navigation into a labeled menu, stack the owner story and feature case study, and simplify image grids without horizontal overflow.
- Keep key tap targets at least 44px in both dimensions.
- Keep the main headline to two lines on wide screens and no more than three short lines on narrow screens.
