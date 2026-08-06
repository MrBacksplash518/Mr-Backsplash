import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { indexableProjects, projects } from "./project-data.mjs";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const verifyPublishedRoot = process.argv.includes("--published");
const buildRoot = verifyPublishedRoot ? projectRoot : resolve(projectRoot, "dist/client");
const siteUrl = "https://mrbacksplash.info";
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(path) {
  if (!existsSync(path)) {
    fail(`Missing file: ${path}`);
    return "";
  }
  return readFileSync(path, "utf8");
}

function expectIncludes(content, expected, label) {
  if (!content.includes(expected)) fail(`${label}: expected ${JSON.stringify(expected)}`);
}

function localTarget(url) {
  const clean = url.split("#")[0].split("?")[0];
  if (!clean || !clean.startsWith("/")) return null;
  if (clean.startsWith("/assets/")) return resolve(buildRoot, clean.slice(1));
  if (clean === "/") return resolve(buildRoot, "index.html");
  if (clean.endsWith("/")) return resolve(buildRoot, clean.slice(1), "index.html");
  return resolve(buildRoot, clean.slice(1));
}

function verifyLocalReferences(html, label) {
  const urls = new Set();
  for (const match of html.matchAll(/(?:href|src|data-image-src)="([^"]+)"/g)) urls.add(match[1]);
  for (const match of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const candidate of match[1].split(",")) urls.add(candidate.trim().split(/\s+/)[0]);
  }

  for (const url of urls) {
    if (/^(?:https?:|tel:|sms:|mailto:|#)/.test(url)) continue;
    const target = localTarget(url);
    if (target && !existsSync(target)) fail(`${label}: broken local reference ${url}`);
  }
}

const seenTitles = new Set();
const seenDescriptions = new Set();
const seenCanonicals = new Set();

for (const project of projects) {
  const route = `/work/projects/${project.slug}/`;
  const pagePath = resolve(buildRoot, "work", "projects", project.slug, "index.html");
  const html = read(pagePath);
  const label = project.slug;
  const expectedRobots = project.indexable
    ? "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
    : "noindex,follow,max-image-preview:large";

  expectIncludes(html, `<title>${project.seoTitle}</title>`, `${label} title`);
  expectIncludes(html, `content="${project.description}"`, `${label} description`);
  expectIncludes(html, `content="${expectedRobots}"`, `${label} robots`);
  expectIncludes(html, `rel="canonical" href="${siteUrl}${route}"`, `${label} canonical`);
  expectIncludes(html, `property="og:url" content="${siteUrl}${route}"`, `${label} OG URL`);
  expectIncludes(html, `property="og:image" content="${siteUrl}/assets/project-share/${project.image.stem}.webp"`, `${label} OG image`);
  expectIncludes(html, `name="twitter:card" content="summary_large_image"`, `${label} Twitter card`);
  expectIncludes(html, '"@type": "WebPage"', `${label} WebPage schema`);
  expectIncludes(html, '"@type": "ImageObject"', `${label} ImageObject schema`);
  expectIncludes(html, '"@type": "BreadcrumbList"', `${label} breadcrumb schema`);
  expectIncludes(html, `<nav class="breadcrumbs shell" aria-label="Breadcrumb">`, `${label} visible breadcrumbs`);
  expectIncludes(html, project.image.alt, `${label} image alt`);
  expectIncludes(html, project.service.href, `${label} service link`);
  expectIncludes(html, project.advice.href, `${label} advice link`);

  const main = html.match(/<main[\s\S]*?<\/main>/)?.[0] || "";
  if (/Saratoga Springs|Clifton Park|Lake George/i.test(main)) {
    fail(`${label}: project main content contains an unverified place name`);
  }
  if (/customer said|testimonial|completed in \d|\b\d+ (?:day|week|month)s?\b/i.test(main)) {
    fail(`${label}: project main content contains an unverified customer or duration claim`);
  }

  for (const jsonMatch of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(jsonMatch[1]);
    } catch (error) {
      fail(`${label}: invalid JSON-LD (${error.message})`);
    }
  }

  if (seenTitles.has(project.seoTitle)) fail(`${label}: duplicate SEO title`);
  if (seenDescriptions.has(project.description)) fail(`${label}: duplicate meta description`);
  if (seenCanonicals.has(route)) fail(`${label}: duplicate canonical route`);
  seenTitles.add(project.seoTitle);
  seenDescriptions.add(project.description);
  seenCanonicals.add(route);
  verifyLocalReferences(html, label);

  if (!existsSync(resolve(buildRoot, "assets", "project-share", `${project.image.stem}.webp`))) {
    fail(`${label}: stable project share image is missing from the build`);
  }
}

const workHtml = read(resolve(buildRoot, "work", "index.html"));
const projectCardLinks = [...workHtml.matchAll(/class="work-item__link" href="\/work\/projects\//g)].length;
const zoomControls = [...workHtml.matchAll(/class="work-item__zoom project-gallery-item"/g)].length;
const lightboxDetailLinks = [...workHtml.matchAll(/class="lightbox__project-link"/g)].length;
if (projectCardLinks !== projects.length) fail(`Gallery has ${projectCardLinks} project links; expected ${projects.length}`);
if (zoomControls !== projects.length) fail(`Gallery has ${zoomControls} zoom controls; expected ${projects.length}`);
if (lightboxDetailLinks !== 1) fail(`Gallery has ${lightboxDetailLinks} lightbox detail links; expected 1`);
verifyLocalReferences(workHtml, "work gallery");

const sitemap = read(resolve(buildRoot, "sitemap.xml"));
for (const project of projects) {
  const absoluteUrl = `${siteUrl}/work/projects/${project.slug}/`;
  const isListed = sitemap.includes(`<loc>${absoluteUrl}</loc>`);
  if (project.indexable && !isListed) fail(`${project.slug}: indexable route missing from sitemap`);
  if (!project.indexable && isListed) fail(`${project.slug}: held route must not appear in sitemap`);
}

const sitemapProjectCount = [...sitemap.matchAll(/<loc>https:\/\/mrbacksplash\.info\/work\/projects\//g)].length;
if (sitemapProjectCount !== indexableProjects.length) {
  fail(`Sitemap has ${sitemapProjectCount} project URLs; expected ${indexableProjects.length}`);
}

if (failures.length) {
  console.error(`Project verification failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Verified ${verifyPublishedRoot ? "published root" : "production build"}: ${projects.length} project routes, ${projects.length} gallery detail links, ${projects.length} zoom controls, ${indexableProjects.length} sitemap entries, metadata, JSON-LD, image alts, and local references.`,
);
