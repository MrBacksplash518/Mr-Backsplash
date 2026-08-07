import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const published = process.argv.includes("--published");
const buildRoot = published ? projectRoot : resolve(projectRoot, "dist/client");
const siteUrl = "https://mrbacksplash.info";
const expectedPageCount = 35;
const expectedIndexableCount = 29;
const failures = [];

const publishedRoots = [
  "index.html",
  "about",
  "contact",
  "services",
  "service-areas",
  "advice",
  "work",
];

function fail(message) {
  failures.push(message);
}

function read(path) {
  if (!existsSync(path)) {
    fail(`Missing file: ${relative(projectRoot, path)}`);
    return "";
  }
  return readFileSync(path, "utf8");
}

function walkHtml(path) {
  if (!existsSync(path)) return [];
  const stats = statSync(path);
  if (stats.isFile()) return path.endsWith(".html") ? [path] : [];
  return readdirSync(path).flatMap((entry) => walkHtml(resolve(path, entry)));
}

function htmlFiles() {
  if (!published) return walkHtml(buildRoot);
  return publishedRoots.flatMap((target) => walkHtml(resolve(buildRoot, target)));
}

function routeFor(path) {
  const pathRelative = relative(buildRoot, path).split(sep).join("/");
  return pathRelative === "index.html" ? "/" : `/${dirname(pathRelative).split(sep).join("/")}/`;
}

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((match) => match[0]);
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\s${name}=["']([^"']*)["']`, "i"))?.[1] ?? "";
}

function meta(html, key, value) {
  return tags(html, "meta").find((tag) => attribute(tag, key).toLowerCase() === value.toLowerCase());
}

function link(html, relValue) {
  return tags(html, "link").find((tag) =>
    attribute(tag, "rel")
      .toLowerCase()
      .split(/\s+/)
      .includes(relValue.toLowerCase()),
  );
}

function title(html) {
  return html.match(/<title>\s*([\s\S]*?)\s*<\/title>/i)?.[1] ?? "";
}

function localTarget(url) {
  let clean = url;
  if (clean.startsWith(siteUrl)) clean = clean.slice(siteUrl.length) || "/";
  if (!clean.startsWith("/")) return null;
  clean = clean.split("#")[0].split("?")[0];
  if (clean === "/") return resolve(buildRoot, "index.html");
  const target = clean.slice(1).split("/").join(sep);
  return clean.endsWith("/") ? resolve(buildRoot, target, "index.html") : resolve(buildRoot, target);
}

function localReferences(html) {
  const urls = new Set();
  for (const match of html.matchAll(/(?:href|src|poster|data-image-src)=["']([^"']+)["']/gi)) urls.add(match[1]);
  for (const match of html.matchAll(/srcset=["']([^"']+)["']/gi)) {
    for (const candidate of match[1].split(",")) urls.add(candidate.trim().split(/\s+/)[0]);
  }
  return urls;
}

const files = htmlFiles().sort();
const pages = new Map(files.map((file) => [routeFor(file), { file, html: read(file) }]));
const titles = new Map();
const descriptions = new Map();
const canonicals = new Map();
const indexableCanonicals = [];
const noindexCanonicals = [];

if (files.length !== expectedPageCount) fail(`Expected ${expectedPageCount} HTML pages, found ${files.length}`);

for (const [route, page] of pages) {
  const label = route;
  const pageTitle = title(page.html);
  const descriptionTag = meta(page.html, "name", "description");
  const robotsTag = meta(page.html, "name", "robots");
  const ogTitleTag = meta(page.html, "property", "og:title");
  const ogDescriptionTag = meta(page.html, "property", "og:description");
  const ogUrlTag = meta(page.html, "property", "og:url");
  const ogImageTag = meta(page.html, "property", "og:image");
  const canonicalTag = link(page.html, "canonical");
  const faviconTag = link(page.html, "icon");
  const description = attribute(descriptionTag || "", "content");
  const robots = attribute(robotsTag || "", "content");
  const canonical = attribute(canonicalTag || "", "href");
  const expectedCanonical = `${siteUrl}${route}`;

  if (!pageTitle) fail(`${label}: missing title`);
  if (!description) fail(`${label}: missing meta description`);
  if (!robots) fail(`${label}: missing robots directive`);
  if (canonical !== expectedCanonical) fail(`${label}: canonical is ${JSON.stringify(canonical)}, expected ${expectedCanonical}`);
  if (attribute(ogTitleTag || "", "content") === "") fail(`${label}: missing OG title`);
  if (attribute(ogDescriptionTag || "", "content") === "") fail(`${label}: missing OG description`);
  if (attribute(ogUrlTag || "", "content") !== expectedCanonical) fail(`${label}: OG URL does not match canonical`);
  if (attribute(ogImageTag || "", "content") === "") fail(`${label}: missing OG image`);
  if (attribute(faviconTag || "", "href") !== "/assets/mr-backsplash-favicon.png") fail(`${label}: missing branded favicon`);
  if ((page.html.match(/<h1\b/gi) || []).length !== 1) fail(`${label}: expected exactly one H1`);
  if (!/class=["'][^"']*skip-link/.test(page.html) || !/<main\b[^>]*id=["']main-content["']/i.test(page.html)) {
    fail(`${label}: missing skip-link/main-content pairing`);
  }

  const idCounts = new Map();
  for (const match of page.html.matchAll(/\sid=["']([^"']+)["']/gi)) idCounts.set(match[1], (idCounts.get(match[1]) || 0) + 1);
  for (const [id, count] of idCounts) if (count > 1) fail(`${label}: duplicate id ${id}`);

  for (const imageTag of tags(page.html, "img")) {
    const className = attribute(imageTag, "class");
    const dynamicLightbox = className.split(/\s+/).includes("lightbox__image");
    if (!/\salt=["'][^"']*["']/i.test(imageTag)) fail(`${label}: image missing alt attribute`);
    if (!dynamicLightbox && (!attribute(imageTag, "width") || !attribute(imageTag, "height"))) {
      fail(`${label}: image missing explicit dimensions (${attribute(imageTag, "src")})`);
    }
  }

  for (const buttonTag of [...page.html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)]) {
    const visibleText = buttonTag[2].replace(/<[^>]+>/g, "").replace(/&\w+;/g, " ").trim();
    if (!visibleText && !/\saria-label(?:ledby)?=["'][^"']+["']/i.test(buttonTag[1])) fail(`${label}: unnamed button`);
  }

  for (const anchorTag of tags(page.html, "a")) {
    if (attribute(anchorTag, "target") === "_blank" && !attribute(anchorTag, "rel").split(/\s+/).includes("noopener")) {
      fail(`${label}: target=_blank link missing noopener`);
    }
  }

  for (const url of localReferences(page.html)) {
    if (/^(?:tel:|sms:|mailto:|#)/i.test(url)) continue;
    if (/^https?:/i.test(url) && !url.startsWith(siteUrl)) continue;
    const target = localTarget(url);
    if (target && !existsSync(target)) fail(`${label}: broken local reference ${url}`);

    const fragment = url.includes("#") ? url.split("#")[1].split("?")[0] : "";
    if (target && fragment && existsSync(target) && target.endsWith(".html")) {
      const targetHtml = readFileSync(target, "utf8");
      if (!new RegExp(`\\sid=["']${fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`, "i").test(targetHtml)) {
        fail(`${label}: missing fragment target ${url}`);
      }
    }
  }

  for (const match of page.html.matchAll(/https:\/\/mrbacksplash\.info\/assets\/[A-Za-z0-9_./-]+/g)) {
    const target = localTarget(match[0]);
    if (!target || !existsSync(target)) fail(`${label}: absolute metadata asset is not published (${match[0]})`);
  }

  const jsonBlocks = [...page.html.matchAll(/<script\s+type=["']application\/ld\+json["']>\s*([\s\S]*?)\s*<\/script>/gi)];
  for (const block of jsonBlocks) {
    try {
      JSON.parse(block[1]);
    } catch (error) {
      fail(`${label}: invalid JSON-LD (${error.message})`);
    }
  }

  if (/"@type"\s*:\s*"Article"/i.test(page.html) && /#david-lafaver-jr/i.test(page.html.match(/"author"[\s\S]*?\n/)?.[0] || "")) {
    fail(`${label}: Article uses unsupported personal author attribution`);
  }
  if (/\b(?:The Adirondacks|throughout the Capital Region|throughout the Adirondacks|Serving Upstate (?:NY|New York)|nearby Upstate (?:NY|New York) communities)\b/i.test(page.html)) {
    fail(`${label}: contains an overbroad service-area claim`);
  }

  if (titles.has(pageTitle)) fail(`${label}: duplicate title with ${titles.get(pageTitle)}`);
  if (descriptions.has(description)) fail(`${label}: duplicate description with ${descriptions.get(description)}`);
  if (canonicals.has(canonical)) fail(`${label}: duplicate canonical with ${canonicals.get(canonical)}`);
  titles.set(pageTitle, label);
  descriptions.set(description, label);
  canonicals.set(canonical, label);

  if (/(^|,)noindex(,|$)/i.test(robots)) noindexCanonicals.push(canonical);
  else indexableCanonicals.push(canonical);
}

if (indexableCanonicals.length !== expectedIndexableCount) {
  fail(`Expected ${expectedIndexableCount} indexable pages, found ${indexableCanonicals.length}`);
}
if (noindexCanonicals.length !== expectedPageCount - expectedIndexableCount) {
  fail(`Expected ${expectedPageCount - expectedIndexableCount} noindex pages, found ${noindexCanonicals.length}`);
}

const sitemap = read(resolve(buildRoot, "sitemap.xml"));
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (sitemapUrls.length !== expectedIndexableCount) fail(`Sitemap contains ${sitemapUrls.length} URLs; expected ${expectedIndexableCount}`);
for (const canonical of indexableCanonicals) {
  if (sitemapUrls.filter((url) => url === canonical).length !== 1) fail(`Indexable canonical missing or duplicated in sitemap: ${canonical}`);
}
for (const canonical of noindexCanonicals) if (sitemapUrls.includes(canonical)) fail(`Noindex URL appears in sitemap: ${canonical}`);
for (const url of sitemapUrls) if (!indexableCanonicals.includes(url)) fail(`Sitemap contains unknown or non-indexable URL: ${url}`);

if (read(resolve(buildRoot, "CNAME")).trim() !== "mrbacksplash.info") fail("CNAME must contain mrbacksplash.info");
const robotsText = read(resolve(buildRoot, "robots.txt"));
if (!robotsText.includes("User-agent: *") || !robotsText.includes("Allow: /") || !robotsText.includes(`${siteUrl}/sitemap.xml`)) {
  fail("robots.txt is missing the expected crawl or sitemap directives");
}
for (const asset of ["assets/mr-backsplash-favicon.png", "assets/social-share.jpg"]) {
  const path = resolve(buildRoot, asset);
  if (!existsSync(path) || statSync(path).size === 0) fail(`Missing required social/favicon asset: ${asset}`);
}

for (const entry of readdirSync(resolve(buildRoot, "assets"))) {
  const path = resolve(buildRoot, "assets", entry);
  if (!statSync(path).isFile()) continue;
  const size = statSync(path).size;
  if (/^script-.*\.js$/.test(entry) && size > 160_000) fail(`${entry}: JavaScript bundle exceeds 160 KB (${size} bytes)`);
  if (/^script-.*\.css$/.test(entry) && size > 160_000) fail(`${entry}: CSS bundle exceeds 160 KB (${size} bytes)`);
  if (/hero-.*\.mp4$/.test(entry) && size > 3_000_000) fail(`${entry}: hero video exceeds 3 MB (${size} bytes)`);
}

const javascriptBundle = readdirSync(resolve(buildRoot, "assets"))
  .filter((entry) => /^script-.*\.js$/.test(entry))
  .map((entry) => read(resolve(buildRoot, "assets", entry)))
  .join("\n");
for (const marker of ["G-9SVF6S3JRG", "contact_intent", "estimate_text_prepared", "allow_ad_personalization_signals"]) {
  if (!javascriptBundle.includes(marker)) fail(`Analytics marker missing from JavaScript bundle: ${marker}`);
}

if (failures.length) {
  console.error(`Site verification failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Verified ${published ? "published root" : "production build"}: ${files.length} routes, ${indexableCanonicals.length} indexable, ${noindexCanonicals.length} noindex, metadata, JSON-LD, sitemap, links, fragments, assets, accessibility basics, and bundle budgets.`,
);
