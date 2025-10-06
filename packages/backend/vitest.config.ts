import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "integration",
          include: ["**/*/tests/integration/**/*.test.ts"],
        },
      },
    ],
  },
  plugins: [tsconfigPaths()],
});
