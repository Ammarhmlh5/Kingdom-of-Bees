import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  {
    rules: {
      "no-unused-vars": "warn",
      "no-console": "warn",
    },
  },
  globalIgnores([
    "node_modules/**",
    "dist/**",
    "build/**",
    ".next/**",
    "out/**",
  ]),
]);
