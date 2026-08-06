import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const published = process.argv.includes("--published");
const buildRoot = published ? projectRoot : resolve(projectRoot, "dist/client");
const siteUrl = "https://mrbacksplash.info";
const failures = [];

const routes = [
  {
    route: "/service-areas/",
    title: "Tile &amp; Flooring Service Areas | Mr. Backsplash",
    description: "Review tile and flooring service coverage for Saratoga Springs, Clifton Park, Lake George, and nearby 518-area communities.",
    schemaType: "CollectionPage",
    faqCount: 0,
  },
  {
    route: "/service-areas/saratoga-springs/",
    title: "Saratoga Springs Tile &amp; Flooring | Mr. Backsplash",
    description: "Plan owner-installed kitchen backsplash, bathroom tile, tile floors, repairs, regrouting, or laminate flooring service in Saratoga Springs.",
    schemaType: "Service",
    faqCount: 5,
  },
  {
    route: "/service-areas/clifton-park/",
    title: "Clifton Park Tile &amp; Flooring | Mr. Backsplash",
    description: "Plan tile or flooring work in an occupied Clifton Park home, including backsplash, bathroom tile, floors, repair, regrouting, and laminate.",
    schemaType: "Service",
    faqCount: 5,
  },
  {
    route: "/service-areas/lake-george/",
    title: "Lake George Tile &amp; Flooring | Mr. Backsplash",
    description: "Plan tile and flooring work for a year-round, seasonal, or guest-use Lake George property with owner-installer David LaFaver Jr.",
    schemaType: "Service",
    faqCount: 5,
  },
];

const serviceLinks = [
  "/services/kitchen-backsplash-installation/",
  "/services/bathroom-shower-tile/",
  "/services/tile-floor-installation/",
  "/services/tile-repair/",
  "/services/regrouting/",
  "/services/laminate-flooring/",
];

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

function pagePath(route) {
  return route === "/" ? resolve(buildRoot, "index.html") : resolve(buildRoot, route.slice(1), "index.html");
}

function expectIncludes(content, expected, label) {
  if (!content.includes(expected)) fail(`${label}: expected ${JSON.stringify(expected)}`);
}

function extract(content, pattern) {
  return content.match(pattern)?.[1] || "";
}

function localTarget(url) {
  const clean = url.split("#")[0].split("?")[0];
  if (!clean || !clean.startsWith("/")) return null;
  if (clean === "/") return resolve(buildRoot, "index.html");
  if (clean.endsWith("/")) return resolve(buildRoot, clean.slice(1), "index.html");
  return resolve(buildRoot, clean.slice(1));
}

function htmlFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory)) {
    const path = resolve(directory, entry);
    const stats = statSync(path);
    if (published && stats.isDirectory() && [".git", "dist", "node_modules", "source"].includes(entry)) continue;
    if (stats.isDirectory()) files.push(...htmlFiles(path));
    else if (entry.endsWith(".html")) files.push(path);
  }
  return files;
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

const titles = new Set();
const descriptions = new Set();
const canonicals = new Set();

for (const spec of routes) {
  const html = read(pagePath(spec.route));
  const label = spec.route;
  const title = extract(html, /<title>([^<]+)<\/title>/);
  const description = extract(html, /<meta name="description" content="([^"]+)"/);
  const canonical = extract(html, /<link rel="canonical" href="([^"]+)"/);

  expectIncludes(html, `<title>${spec.title}</title>`, `${label} title`);
  expectIncludes(html, `content="${spec.description}"`, `${label} description`);
  expectIncludes(html, 'content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"', `${label} robots`);
  expectIncludes(html, `rel="canonical" href="${siteUrl}${spec.route}"`, `${label} canonical`);
  expectIncludes(html, `property="og:url" content="${siteUrl}${spec.route}"`, `${label} OG URL`);
  expectIncludes(html, 'property="og:image" content="https://mrbacksplash.info/assets/social-share.jpg"', `${label} generic OG image`);
  expectIncludes(html, '<nav class="breadcrumbs shell" aria-label="Breadcrumb">', `${label} breadcrumbs`);
  expectIncludes(html, "tel:+15186504248", `${label} call link`);
  expectIncludes(html, "sms:+15186504248", `${label} SMS link`);
  expectIncludes(html, "/service-areas/", `${label} service-area navigation`);
  expectIncludes(html, "/advice/", `${label} advice link`);
  expectIncludes(html, "/work/", `${label} work link`);
  expectIncludes(html, "/contact/", `${label} contact link`);

  if (/<img\b/i.test(html) || /\/assets\/(?:portfolio|project-share)\//i.test(html)) {
    fail(`${label}: location content must remain free of assigned portfolio or project imagery`);
  }
  if (/LocalBusiness|"address"\s*:/i.test(html)) fail(`${label}: unsafe location/address schema`);
  if (/Mr\. Backsplash 518/i.test(html)) fail(`${label}: incorrect public business name`);
  if (/\b(?:storefront|local crew|our crew|award-winning|fully insured|same-day service|available now)\b/i.test(html)) {
    fail(`${label}: contains an unverified business or availability claim`);
  }
  if (/\b\d+\s*(?:minute|mile)s?\s+(?:away|drive)\b/i.test(html)) fail(`${label}: contains an unverified travel claim`);

  const graphs = [];
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      graphs.push(JSON.parse(match[1]));
    } catch (error) {
      fail(`${label}: invalid JSON-LD (${error.message})`);
    }
  }
  if (graphs.length !== 1) fail(`${label}: expected one JSON-LD block`);
  const nodes = graphs.flatMap((graph) => graph["@graph"] || [graph]);
  if (!nodes.some((node) => node["@type"] === spec.schemaType)) fail(`${label}: missing ${spec.schemaType} schema`);
  if (!nodes.some((node) => node["@type"] === "BreadcrumbList")) fail(`${label}: missing BreadcrumbList schema`);

  const faq = nodes.find((node) => node["@type"] === "FAQPage");
  const visibleFaqCount = [...html.matchAll(/<details>/g)].length;
  if (spec.faqCount) {
    if (!faq || faq.mainEntity?.length !== spec.faqCount) fail(`${label}: expected ${spec.faqCount} schema FAQs`);
    if (visibleFaqCount !== spec.faqCount) fail(`${label}: expected ${spec.faqCount} visible FAQs`);
    for (const question of faq?.mainEntity || []) expectIncludes(html, `<summary>${question.name}</summary>`, `${label} FAQ parity`);
    for (const serviceLink of serviceLinks) expectIncludes(html, serviceLink, `${label} service link`);
    const service = nodes.find((node) => node["@type"] === "Service");
    if (service?.provider?.["@id"] !== `${siteUrl}/#organization`) fail(`${label}: service provider must reference the existing organization`);
    if (!service?.areaServed?.name) fail(`${label}: missing safe areaServed place`);
  } else if (faq || visibleFaqCount) {
    fail(`${label}: hub should not expose unmatched FAQ schema`);
  }

  if (titles.has(title)) fail(`${label}: duplicate title`);
  if (descriptions.has(description)) fail(`${label}: duplicate description`);
  if (canonicals.has(canonical)) fail(`${label}: duplicate canonical`);
  titles.add(title);
  descriptions.add(description);
  canonicals.add(canonical);
  verifyLocalReferences(html, label);
}

for (const file of htmlFiles(buildRoot)) verifyLocalReferences(read(file), file.slice(buildRoot.length));

const sitemap = read(resolve(buildRoot, "sitemap.xml"));
for (const spec of routes) {
  const absolute = `<loc>${siteUrl}${spec.route}</loc>`;
  const count = [...sitemap.matchAll(new RegExp(absolute.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"))].length;
  if (count !== 1) fail(`${spec.route}: expected one sitemap entry, found ${count}`);
}

const home = read(pagePath("/"));
const services = read(pagePath("/services/"));
for (const route of routes.map((entry) => entry.route)) expectIncludes(home, route, "homepage area discovery");
expectIncludes(services, "/service-areas/", "services area hub discovery");
for (const route of routes.slice(1).map((entry) => entry.route)) expectIncludes(services, route, "services location discovery");

if (failures.length) {
  console.error(`Service-area verification failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Verified ${published ? "published root" : "production build"}: 4 indexable service-area routes, unique metadata, JSON-LD, FAQ parity, safe service-area schema, sitemap entries, SMS/call controls, and local links/assets across all HTML.`,
);
