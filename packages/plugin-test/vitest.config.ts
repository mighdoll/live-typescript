/// <reference types="vitest" />
import tsConfigPaths from "vite-tsconfig-paths";

// Configure Vitest (https://vitest.dev/config/)

import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tsConfigPaths()],
  test: {
    /* for example, use global to avoid globals imports (describe, test, expect): */
    // globals: true,
  },
});
