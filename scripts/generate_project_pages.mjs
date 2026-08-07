import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { indexableProjects, projects } from "./project-data.mjs";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const sourceRoot = resolve(projectRoot, "source");
const siteUrl = "https://mrbacksplash.info";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function imagePath(project, size) {
  return `/assets/portfolio/${project.image.stem}-${size}.webp`;
}

function galleryImagePath(image, size) {
  return `/assets/project-galleries/${image.stem}-${size}.webp`;
}

function projectUrl(project) {
  return `${siteUrl}/work/projects/${project.slug}/`;
}

function relatedProjects(project) {
  const relatedFamilies = {
    "Kitchen backsplash": ["pale-blue-arabesque-kitchen", "white-subway-kitchen", "herringbone-feature-shower"],
    "Kitchen finish detail": ["pale-blue-arabesque-kitchen", "white-subway-kitchen", "herringbone-feature-shower"],
    "Bathroom and shower tile": ["herringbone-feature-shower", "patterned-bathroom-floor", "pale-blue-arabesque-kitchen"],
    "Bathroom tile": ["herringbone-feature-shower", "patterned-bathroom-floor", "pale-blue-arabesque-kitchen"],
    "Tile flooring": ["patterned-bathroom-floor", "wood-look-plank-floor", "stone-feature-wall"],
    "Flooring installation": ["wood-look-plank-floor", "patterned-bathroom-floor", "stone-feature-wall"],
    "Specialty surface installation": ["stone-feature-wall", "pale-blue-arabesque-kitchen", "herringbone-feature-shower"],
  };

  const orderedSlugs = relatedFamilies[project.category] || indexableProjects.map(({ slug }) => slug);
  const selected = orderedSlugs
    .filter((slug) => slug !== project.slug)
    .map((slug) => indexableProjects.find((candidate) => candidate.slug === slug))
    .filter(Boolean);

  for (const candidate of indexableProjects) {
    if (candidate.slug !== project.slug && !selected.some(({ slug }) => slug === candidate.slug)) {
      selected.push(candidate);
    }
  }

  return selected.slice(0, 3);
}

function schemaFor(project) {
  const url = projectUrl(project);
  const imageUrl = `${siteUrl}/assets/project-share/${project.image.stem}.webp`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: project.seoTitle,
        description: project.description,
        inLanguage: "en-US",
        isPartOf: { "@id": `${siteUrl}/#website` },
        primaryImageOfPage: { "@id": `${url}#primaryimage` },
        about: {
          "@type": "Thing",
          name: project.category,
        },
      },
      {
        "@type": "ImageObject",
        "@id": `${url}#primaryimage`,
        contentUrl: imageUrl,
        url: imageUrl,
        caption: project.caption,
        description: project.image.alt,
        width: project.image.width,
        height: project.image.height,
        representativeOfPage: true,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: "Our Work", item: `${siteUrl}/work/` },
          { "@type": "ListItem", position: 3, name: project.title, item: url },
        ],
      },
    ],
  };
}

function observationsMarkup(project) {
  return project.observations
    .map(
      ({ title, text }) => `
            <article class="project-observation">
              <h3>${escapeHtml(title)}</h3>
              <p>${escapeHtml(text)}</p>
            </article>`,
    )
    .join("");
}

function planningMarkup(project) {
  return project.planning
    .map(
      ({ title, text }) => `
              <li>
                <h3>${escapeHtml(title)}</h3>
                <p>${escapeHtml(text)}</p>
              </li>`,
    )
    .join("");
}

function projectStoryMarkup(project) {
  if (!project.gallery?.length) return "";

  const cards = project.gallery
    .map((image) => {
      const imageSmall = galleryImagePath(image, "sm");
      const imageLarge = galleryImagePath(image, "lg");
      const responsiveAttributes =
        image.width > 720
          ? ` srcset="${imageSmall} 720w, ${imageLarge} ${image.width}w" sizes="(max-width: 800px) 100vw, 33vw"`
          : "";

      return `
            <figure class="project-sequence-card">
              <button class="project-sequence-card__button project-gallery-item" type="button" data-image-alt="${escapeHtml(image.alt)}" data-caption="${escapeHtml(image.caption)}" aria-label="Enlarge ${escapeHtml(image.label)} project photo">
                <img src="${imageSmall}"${responsiveAttributes} alt="${escapeHtml(image.alt)}" width="${image.width}" height="${image.height}" loading="lazy" style="object-position: ${escapeHtml(image.position)}" />
                <span>${escapeHtml(image.label)}</span>
              </button>
              <figcaption>${escapeHtml(image.caption)}</figcaption>
            </figure>`;
    })
    .join("");

  return `
      <section class="project-sequence" aria-labelledby="${escapeHtml(project.slug)}-sequence-title">
        <div class="shell">
          <div class="project-section-heading">
            <p class="eyebrow">Same-job sequence</p>
            <h2 id="${escapeHtml(project.slug)}-sequence-title">From first look to finished work.</h2>
            <p>Every view below comes from this project. The sequence is limited to distinct photos that show a different stage or useful angle.</p>
          </div>
          <div class="project-sequence__grid">${cards}
          </div>
        </div>
      </section>
`;
}

function relatedMarkup(project) {
  return relatedProjects(project)
    .map(
      (related) => `
            <a class="project-related-card reveal-image" href="/work/projects/${escapeHtml(related.slug)}/">
              <span class="project-related-card__image">
                <img
                  src="${imagePath(related, "sm")}"
                  srcset="${imagePath(related, "sm")} 720w, ${imagePath(related, "lg")} 1600w"
                  sizes="(max-width: 720px) 100vw, 33vw"
                  alt="${escapeHtml(related.image.alt)}"
                  width="${related.image.width}"
                  height="${related.image.height}"
                  loading="lazy"
                  style="object-position: ${escapeHtml(related.image.position)}"
                />
              </span>
              <span class="project-related-card__copy">
                <strong>${escapeHtml(related.title)}</strong>
                <span>View project detail</span>
              </span>
            </a>`,
    )
    .join("");
}

function galleryMarkup() {
  return projects
    .map((project) => {
      const floorClass = project.category.toLowerCase().includes("floor") ? " work-item--floor" : "";
      const imageSmall = imagePath(project, "sm");
      const imageLarge = imagePath(project, "lg");
      return `
          <article class="work-item${floorClass} reveal-image">
            <a class="work-item__link" href="/work/projects/${escapeHtml(project.slug)}/" aria-label="View the ${escapeHtml(project.title)} project">
              <img
                src="${imageSmall}"
                srcset="${imageSmall} 720w, ${imageLarge} 1600w"
                sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw"
                alt="${escapeHtml(project.image.alt)}"
                width="${project.image.width}"
                height="${project.image.height}"
                loading="lazy"
                style="object-position: ${escapeHtml(project.image.position)}"
              />
              <span class="work-item__overlay">
                <span class="work-item__tag">${escapeHtml(project.category)}</span>
                <span class="work-item__title">${escapeHtml(project.title)}</span>
                <span class="work-item__cta">View Project &rarr;</span>
              </span>
            </a>
            <button
              class="work-item__zoom project-gallery-item"
              type="button"
              data-image-alt="${escapeHtml(project.image.alt)}"
              data-caption="${escapeHtml(project.caption)}"
              data-project-href="/work/projects/${escapeHtml(project.slug)}/"
              aria-label="Enlarge ${escapeHtml(project.title)} photo"
            ><i class="ph ph-arrows-out" aria-hidden="true"></i></button>
          </article>`;
    })
    .join("\n");
}

function pageTemplate(project) {
  const url = projectUrl(project);
  const imageSmall = imagePath(project, "sm");
  const imageLarge = imagePath(project, "lg");
  const robots = project.indexable
    ? "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
    : "noindex,follow,max-image-preview:large";
  const smsBody = encodeURIComponent(
    `Hi David, I am planning something similar to the ${project.title} shown on your website. My town or ZIP is ____. I can send photos of the space and the exact product I am considering.`,
  );
  const schema = JSON.stringify(schemaFor(project), null, 2).replaceAll("<", "\\u003c");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(project.seoTitle)}</title>
    <meta name="description" content="${escapeHtml(project.description)}" />
    <meta name="robots" content="${robots}" />
    <meta name="theme-color" content="#141414" />
    <link rel="canonical" href="${url}" />
    <link rel="icon" type="image/png" sizes="128x128" href="/assets/mr-backsplash-favicon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&amp;family=Manrope:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet" />
    <meta property="og:site_name" content="Mr. Backsplash" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(project.seoTitle)}" />
    <meta property="og:description" content="${escapeHtml(project.description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${siteUrl}/assets/project-share/${escapeHtml(project.image.stem)}.webp" />
    <meta property="og:image:alt" content="${escapeHtml(project.image.alt)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(project.seoTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(project.description)}" />
    <meta name="twitter:image" content="${siteUrl}/assets/project-share/${escapeHtml(project.image.stem)}.webp" />
    <script type="application/ld+json">
${schema}
    </script>
  </head>
  <body class="interior-page project-page">
    <a class="skip-link" href="#main-content">Skip to content</a>
    <header class="site-header is-scrolled" data-site-header>
      <div class="site-header__inner shell">
        <a class="brand" href="/" aria-label="Mr. Backsplash home"><span class="brand__name">MR. BACKSPLASH</span><span class="brand__detail">David LaFaver Jr. &mdash; Tile Contractor</span></a>
        <nav class="desktop-nav" aria-label="Primary navigation"><a href="/">Home</a><a href="/about/">About</a><a href="/services/">Services</a><a href="/work/" aria-current="page">Our Work</a><a href="/contact/">Contact</a></nav>
        <a class="header-phone" href="tel:+15186504248">518-650-4248</a>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open navigation"><i class="ph ph-list" aria-hidden="true"></i></button>
        <nav class="mobile-nav" id="mobile-menu" aria-label="Mobile navigation" hidden><a href="/">Home</a><a href="/about/">About</a><a href="/services/">Services</a><a href="/work/" aria-current="page">Our Work</a><a href="/contact/">Contact</a><a href="tel:+15186504248">Call 518-650-4248</a><a href="sms:+15186504248">Text David</a></nav>
      </div>
    </header>

    <main class="project-main" id="main-content" tabindex="-1">
      <section class="project-hero" aria-labelledby="project-title">
        <nav class="breadcrumbs shell" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/work/">Our Work</a></li><li aria-current="page">${escapeHtml(project.title)}</li></ol></nav>
        <div class="project-hero__grid shell">
          <div class="project-hero__copy">
            <p class="project-kicker">${escapeHtml(project.category)} &middot; ${escapeHtml(project.stage)}</p>
            <h1 id="project-title">${escapeHtml(project.title)}</h1>
            <p>${escapeHtml(project.summary)}</p>
            <div class="project-hero__actions">
              <button class="button button--gold project-gallery-item" type="button" data-image-target="#project-photo img" data-image-alt="${escapeHtml(project.image.alt)}" data-caption="${escapeHtml(project.caption)}">View photo larger</button>
              <a class="button button--outline" href="${escapeHtml(project.service.href)}">${escapeHtml(project.service.label)}</a>
            </div>
          </div>
          <figure class="project-hero__figure reveal-image" id="project-photo">
            <button class="project-photo-button project-gallery-item" type="button" data-image-alt="${escapeHtml(project.image.alt)}" data-caption="${escapeHtml(project.caption)}" aria-label="Enlarge project photo">
              <img src="${imageSmall}" srcset="${imageSmall} 720w, ${imageLarge} 1600w" sizes="(max-width: 800px) 100vw, 48vw" alt="${escapeHtml(project.image.alt)}" width="${project.image.width}" height="${project.image.height}" style="object-position: ${escapeHtml(project.image.position)}" />
              <span>Enlarge photo</span>
            </button>
            <figcaption>${escapeHtml(project.caption)}</figcaption>
          </figure>
        </div>
      </section>
${projectStoryMarkup(project)}
      <section class="project-observations" aria-labelledby="observations-title">
        <div class="shell">
          <div class="project-section-heading">
            <h2 id="observations-title">What the photo shows</h2>
            <p>These notes describe only visible details. They do not assume a location, product specification, schedule, or hidden construction scope.</p>
          </div>
          <div class="project-observations__grid">${observationsMarkup(project)}
          </div>
        </div>
      </section>

      <section class="project-planning" aria-labelledby="planning-title">
        <div class="project-planning__grid shell">
          <div class="project-planning__intro">
            <h2 id="planning-title">Planning something similar?</h2>
            <p>A photo can start the conversation, but the actual space and selected product determine the work. These details help David review a new project without treating this example as a promise about scope or timing.</p>
            <a href="${escapeHtml(project.advice.href)}">Read the ${escapeHtml(project.advice.label).toLowerCase()} &rarr;</a>
          </div>
          <ol class="project-planning__list">${planningMarkup(project)}
          </ol>
        </div>
      </section>

      <section class="project-related" aria-labelledby="related-title">
        <div class="shell">
          <div class="project-section-heading project-section-heading--row">
            <h2 id="related-title">More project details</h2>
            <a href="/work/#project-gallery">View the full gallery &rarr;</a>
          </div>
          <div class="project-related__grid">${relatedMarkup(project)}
          </div>
        </div>
      </section>

      <section class="project-action" aria-labelledby="project-action-title">
        <div class="project-action__grid shell">
          <div>
            <h2 id="project-action-title">Show David the space you are planning.</h2>
            <p>Include your town or ZIP, wide photos, close details, approximate dimensions if available, and the exact product you are considering.</p>
          </div>
          <div class="project-action__buttons">
            <a class="button button--dark" href="sms:+15186504248?body=${smsBody}">Start a project text</a>
            <a href="tel:+15186504248">Call 518-650-4248</a>
          </div>
        </div>
      </section>
    </main>

    <footer class="site-footer"><div class="shell footer-grid"><div><p class="footer-brand">MR. BACKSPLASH</p><p>David LaFaver Jr. &mdash; Tile Contractor</p><p>Owner-installed tile work with pride in every detail.</p><div class="social-links"><a href="https://www.instagram.com/mr.backsplash518/" target="_blank" rel="noopener noreferrer" aria-label="Mr. Backsplash on Instagram"><i class="ph ph-instagram-logo" aria-hidden="true"></i></a><a href="https://www.facebook.com/profile.php?id=61586733069815" target="_blank" rel="noopener noreferrer" aria-label="Mr. Backsplash on Facebook"><i class="ph ph-facebook-logo" aria-hidden="true"></i></a></div></div><div><p class="footer-title">Navigate</p><a href="/">Home</a><a href="/about/">About</a><a href="/services/">Services</a><a href="/advice/">Advice</a><a href="/work/">Our Work</a><a href="/contact/">Contact</a></div><div class="footer-services"><p class="footer-title">Services</p><a href="/services/kitchen-backsplash-installation/">Kitchen Backsplashes</a><a href="/services/bathroom-shower-tile/">Bathroom &amp; Shower Tile</a><a href="/services/tile-floor-installation/">Tile Floor Installation</a><a href="/services/tile-repair/">Tile Repair</a><a href="/services/regrouting/">Regrouting</a><a href="/services/laminate-flooring/">Laminate Flooring</a></div><div><p class="footer-title">Serving the 518 area</p><p>Saratoga Springs, Clifton Park, Lake George, and nearby 518-area communities.</p><a class="footer-phone" href="tel:+15186504248">518-650-4248</a></div></div><div class="shell footer-bottom"><p>&copy; <span id="year"></span> Mr. Backsplash. All rights reserved.</p></div></footer>
    <div class="call-fab" data-call-fab><div class="call-fab__menu" id="call-options" aria-hidden="true" inert><a href="tel:+15186504248" tabindex="-1"><span class="call-fab__icon"><i class="ph ph-phone" aria-hidden="true"></i></span><span class="call-fab__copy"><small>Call David</small><strong>(518) 650-4248</strong></span></a></div><button class="call-fab__trigger" type="button" aria-controls="call-options" aria-expanded="false" aria-label="Open call options"><i class="ph ph-phone" aria-hidden="true"></i></button></div>
    <dialog class="lightbox" id="project-lightbox" aria-labelledby="lightbox-caption"><button class="lightbox__close" type="button" aria-label="Close image"><i class="ph ph-x" aria-hidden="true"></i></button><img class="lightbox__image" alt="" /><div class="lightbox__footer"><p id="lightbox-caption"></p><a class="lightbox__project-link" href="/work/" hidden>View project details</a></div></dialog>
    <script type="module" src="/script.js"></script>
  </body>
</html>
`;
}

for (const project of projects) {
  const destination = resolve(sourceRoot, "work", "projects", project.slug, "index.html");
  await mkdir(resolve(destination, ".."), { recursive: true });
  await writeFile(destination, pageTemplate(project), "utf8");
}

const galleryStart = "          <!-- PROJECT_GALLERY_START -->";
const galleryEnd = "          <!-- PROJECT_GALLERY_END -->";
const workPagePath = resolve(sourceRoot, "work", "index.html");
const workPage = await readFile(workPagePath, "utf8");
const startIndex = workPage.indexOf(galleryStart);
const endIndex = workPage.indexOf(galleryEnd);

if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
  throw new Error("Could not find the project gallery generation markers in source/work/index.html.");
}

const generatedWorkPage = `${workPage.slice(0, startIndex + galleryStart.length)}${galleryMarkup()}\n${workPage.slice(endIndex)}`;
await writeFile(workPagePath, generatedWorkPage, "utf8");

console.log(
  `Generated ${projects.length} project pages and gallery cards (${indexableProjects.length} indexable, ${projects.length - indexableProjects.length} held with noindex).`,
);
