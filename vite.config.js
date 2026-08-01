import { defineConfig } from "vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = fileURLToPath(new URL(".", import.meta.url));
const sourceDirectory = resolve(rootDirectory, "source");

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
        work: resolve(sourceDirectory, "work/index.html"),
        contact: resolve(sourceDirectory, "contact/index.html"),
      },
    },
  },
});
