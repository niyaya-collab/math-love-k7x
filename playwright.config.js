import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  testMatch: /e2e\.spec\.mjs/,
  fullyParallel: false,
  workers: 1,
  timeout: 180000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    reducedMotion: "reduce",
  },
  webServer: {
    command: "node tests/static.mjs",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
  },
});
