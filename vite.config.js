import { defineConfig } from "vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { projects } from "./scripts/project-data.mjs";

const rootDirectory = fileURLToPath(new URL(".", import.meta.url));
const sourceDirectory = resolve(rootDirectory, "source");
const projectInputs = Object.fromEntries(
  projects.map((project) => [
    `project-${project.slug}`,
    resolve(sourceDirectory, `work/projects/${project.slug}/index.html`),
  ]),
);

export default defineConfig({
  root: sourceDirectory,
  base: "/",
  publicDir: resolve(rootDirectory, "public"),
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
  },
  build: {
    outDir: resolve(rootDirectory, "dist/client"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(sourceDirectory, "index.html"),
        about: resolve(sourceDirectory, "about/index.html"),
        services: resolve(sourceDirectory, "services/index.html"),
        kitchenBacksplash: resolve(sourceDirectory, "services/kitchen-backsplash-installation/index.html"),
        bathroomShowerTile: resolve(sourceDirectory, "services/bathroom-shower-tile/index.html"),
        tileFloorInstallation: resolve(sourceDirectory, "services/tile-floor-installation/index.html"),
        tileRepair: resolve(sourceDirectory, "services/tile-repair/index.html"),
        regrouting: resolve(sourceDirectory, "services/regrouting/index.html"),
        laminateFlooring: resolve(sourceDirectory, "services/laminate-flooring/index.html"),
        serviceAreas: resolve(sourceDirectory, "service-areas/index.html"),
        serviceAreaSaratogaSprings: resolve(sourceDirectory, "service-areas/saratoga-springs/index.html"),
        serviceAreaCliftonPark: resolve(sourceDirectory, "service-areas/clifton-park/index.html"),
        serviceAreaLakeGeorge: resolve(sourceDirectory, "service-areas/lake-george/index.html"),
        advice: resolve(sourceDirectory, "advice/index.html"),
        adviceKitchenBacksplash: resolve(sourceDirectory, "advice/planning-a-kitchen-backsplash/index.html"),
        adviceBathroomShower: resolve(sourceDirectory, "advice/planning-bathroom-shower-tile/index.html"),
        adviceRegroutingRepair: resolve(sourceDirectory, "advice/regrouting-or-tile-repair/index.html"),
        adviceInstallationPrep: resolve(sourceDirectory, "advice/preparing-for-tile-flooring-installation/index.html"),
        adviceEstimatePhotos: resolve(sourceDirectory, "advice/photos-details-for-tile-estimate/index.html"),
        work: resolve(sourceDirectory, "work/index.html"),
        ...projectInputs,
        contact: resolve(sourceDirectory, "contact/index.html"),
      },
    },
  },
});
