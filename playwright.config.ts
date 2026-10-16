import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  timeout: 30000,
  expect: { timeout: 7000 },
  fullyParallel: true,
  workers: 3,
  use: { trace: "retain-on-failure" },
  webServer: [
    {
      command: "npm run dev --prefix .consumers/react18",
      url: "http://127.0.0.1:7311",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "npm run dev --prefix .consumers/react19",
      url: "http://127.0.0.1:7312",
      reuseExistingServer: !process.env.CI,
    },
    {
      command:
        "npm exec --prefix .consumers/next -- next start .consumers/next -p 7313",
      url: "http://127.0.0.1:7313",
      reuseExistingServer: !process.env.CI,
    },
  ],
  projects: [
    {
      name: "react18-chromium",
      use: { browserName: "chromium", baseURL: "http://127.0.0.1:7311" },
    },
    {
      name: "react19-tailwind",
      use: { browserName: "chromium", baseURL: "http://127.0.0.1:7312" },
    },
    {
      name: "next-app",
      use: { browserName: "chromium", baseURL: "http://127.0.0.1:7313" },
    },
    {
      name: "firefox",
      use: { browserName: "firefox", baseURL: "http://127.0.0.1:7311" },
    },
    {
      name: "webkit",
      use: { browserName: "webkit", baseURL: "http://127.0.0.1:7311" },
    },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], baseURL: "http://127.0.0.1:7311" },
    },
  ],
});
