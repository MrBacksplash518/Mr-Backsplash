# Design QA — Mr. Backsplash

## Scope

- Live visual reference: `https://alturaroofingexperts.com/`
- Local routes: `/`, `/about/`, `/services/`, `/work/`, and `/contact/`
- Reference captures: the desktop and mobile files under `qa-altura/`
- Implementation captures and comparison composites: `qa-iteration/`
- Desktop test viewport: 1440 × 1024 CSS px
- Mobile test viewport: 390 × 844 CSS px

## Side-by-side visual comparisons

- `comparison-about-top.png`: reference About hero/story beside the local About hero/story.
- `comparison-about-mobile-top.png`: same 390 × 844 mobile state for the reference and local About page.
- `comparison-services-top.png`: reference Services hero/first service beside the local equivalent.
- `comparison-contact-top.png`: reference Contact hero/form introduction beside the local equivalent.

The comparisons confirm the measured 80px white interior header, near-black and gold palette, Fraunces/Manrope hierarchy, hero proportions, generous white space, 4:3 imagery, alternating service rows, form panel, lower-right call control, inset gold footer CTA, and structured dark footer. Reference branding, copy, and imagery are not reused.

## Route and interaction checks

- Every header and mobile menu contains five real route links: Home, About, Services, Our Work, and Contact.
- Direct loads and in-page navigation were verified for `/`, `/about/`, `/services/`, `/work/`, and `/contact/`.
- Each route exposes the correct title and `aria-current="page"` state.
- Vite production inputs and both sitemap copies include all five routes.
- The fixed header hides on downward scrolling after the hero and returns on upward scrolling with `position: fixed` and the solid white treatment.
- Mobile navigation opens and closes, updates `aria-expanded`, locks body scrolling, closes on Escape, and returns focus to its trigger.
- The floating call control appears on every route. Closed state uses a cream halo and black circular trigger; open state uses a 218 × 60 white call capsule and 68 × 68 black close square.
- The call control updates `aria-expanded` and `aria-hidden`, removes the closed link from keyboard navigation, closes on click-away or Escape, and returns focus to its trigger.
- The contact route honors service query parameters, validates required form fields, prepares the correct `sms:` link, announces status, and does not transmit data automatically.
- The Work gallery contains 14 curated, authentic project images from David’s 169-photo album. Each card uses a 720px WebP and the lightbox opens the corresponding 1600px WebP, focuses its close button, and restores focus to the originating gallery item when closed.

## Responsive and accessibility checks

- No horizontal overflow at 1440 × 1024 or 390 × 844 on any tested route.
- About mobile uses an 80px header and 503px hero, then stacks the owner image, process items, differentiators, trust cards, footer CTA, and footer.
- Services mobile keeps text before imagery for all four services and alternates the measured white/light-gray section backgrounds.
- Contact mobile stacks the direct-contact content before the form and keeps the form within the 347px content width.
- Tap targets remain at least 44px, focus rings are visible, page landmarks and headings are semantic, and all meaningful images have descriptive alt text.
- The homepage, Services page, featured Work project, and Work gallery use David’s authentic project photography; the former laminate placeholder is no longer used in the public UI.
- Responsive `srcset` selection, meaningful alt text, fixed image dimensions, gallery anchor spacing, and floor-focused crops were verified at 1440 × 1024 and 390 × 844.
- `prefers-reduced-motion` removes nonessential animation without hiding content or controls.
- Browser console contains no warnings or errors; only Vite development connection messages are present. All rendered portfolio images completed without broken asset requests.

## Build verification

- `npm run build` succeeds with output for all five HTML routes and shared assets.
- Production output contains the sitemap, robots file, CNAME, and route HTML files.
- Authoring files live under `source/`; `npm run pages:prepare` builds and copies the tested production output to the repository root used by the existing legacy GitHub Pages configuration.
- The published root includes `.nojekyll`, the custom domain, all five routes, hashed application assets, and the un-hashed social sharing image.

final result: passed
