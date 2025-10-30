// @ts-check

import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import eslintPluginZodX from "eslint-plugin-zod-x";
import pluginQuery from "@tanstack/eslint-plugin-query";
import eslintPluginUnicorn from "eslint-plugin-unicorn";

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  eslintPluginZodX.configs.recommended,
  eslintPluginUnicorn.configs.recommended,
  ...pluginQuery.configs["flat/recommended"],
  {
    files: ["./packages/backend/migrations/*"],
    rules: {
      "unicorn/filename-case": "off",
    },
  },
  {
    rules: {
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "unicorn/no-null": "off",
      "unicorn/prevent-abbreviations": "off",
    },
  }
);
