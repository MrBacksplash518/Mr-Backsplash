import { copyFile, cp, lstat, rm } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const buildRoot = resolve(projectRoot, "dist/client");
const publishedTargets = [
  "index.html",
  "about",
  "contact",
  "services",
  "service-areas",
  "advice",
  "work",
  "assets",
  "CNAME",
  "robots.txt",
  "sitemap.xml",
  ".nojekyll",
];

for (const target of publishedTargets) {
  const source = resolve(buildRoot, target);
  const destination = resolve(projectRoot, target);
  const sourceRelative = relative(buildRoot, source);
  const destinationRelative = relative(projectRoot, destination);

  if (
    sourceRelative.startsWith("..") ||
    isAbsolute(sourceRelative) ||
    destinationRelative.startsWith("..") ||
    isAbsolute(destinationRelative)
  ) {
    throw new Error(`Refusing to publish outside the project: ${target}`);
  }

  const sourceStats = await lstat(source);
  await rm(destination, { recursive: true, force: true });

  if (sourceStats.isDirectory()) {
    await cp(source, destination, { recursive: true });
  } else {
    await copyFile(source, destination);
  }
}

console.log("GitHub Pages production files copied to the repository root.");
