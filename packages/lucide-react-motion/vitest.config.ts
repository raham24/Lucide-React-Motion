import { defineConfig } from "vitest/config";

// Pure-function tests only — no JSX rendering, no jsdom, no React.
// The resolver logic in src/modes/resolve.ts has zero React dependency,
// so a Node environment is enough and keeps the test setup minimal.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
