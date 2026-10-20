import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: "http://localhost:3101",
    headless: true,
    timezoneId: "Asia/Jerusalem",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run radar:seed && npm run dev -- --port 3101",
    url: "http://localhost:3101/en/ai-radar",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      RADAR_STORAGE: "local",
      RADAR_DATA_SUBDIR: "radar-e2e",
      NEXT_DIST_DIR: ".next-e2e",
      ADMIN_PASSWORD: "radar-browser-test-password",
      ADMIN_SESSION_SECRET:
        "radar-browser-test-secret-with-at-least-32-characters",
    },
  },
});
