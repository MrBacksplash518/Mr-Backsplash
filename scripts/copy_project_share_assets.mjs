import { copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { projects } from "./project-data.mjs";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const sourceDirectory = resolve(projectRoot, "source", "assets", "portfolio");
const destinationDirectory = resolve(projectRoot, "dist", "client", "assets", "project-share");

await mkdir(destinationDirectory, { recursive: true });

for (const project of projects) {
  await copyFile(
    resolve(sourceDirectory, `${project.image.stem}-lg.webp`),
    resolve(destinationDirectory, `${project.image.stem}.webp`),
  );
}

console.log(`Copied ${projects.length} stable project share images into the production build.`);
