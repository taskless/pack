import { defineConfig } from "vite";
import { externalizeDeps } from "vite-plugin-externalize-deps";
import tsconfigPaths from "vite-tsconfig-paths";
import dts from "vite-plugin-dts";
import path from "node:path";

import tsconfigJson from "./tsconfig.json";

const entryPoints = ["./src/cli.ts"];

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    externalizeDeps(),
    dts({
      include: "src/**",
    }),
  ],
  resolve: { alias: { "@~/": path.resolve("src/") } },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    target: tsconfigJson.compilerOptions.target,
    lib: {
      entry: entryPoints,
      fileName: "[name]",
      formats: ["es"],
    },
    rollupOptions: {
      output: {
        preserveModules: true,
      },
    },
  },
});
