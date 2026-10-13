import js from "@eslint/js";
import tseslint from "typescript-eslint";
import hooks from "eslint-plugin-react-hooks";
export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      ".consumers/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-hooks": hooks },
    rules: {
      ...hooks.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["**/*.{mjs,js,ts,tsx}"],
    languageOptions: {
      globals: Object.fromEntries(
        [
          "console",
          "document",
          "window",
          "localStorage",
          "Storage",
          "HTMLElement",
          "HTMLDivElement",
          "HTMLButtonElement",
          "HTMLVideoElement",
          "Element",
          "Document",
          "MutationObserver",
          "PointerEvent",
          "FocusEvent",
          "Event",
          "getComputedStyle",
          "setTimeout",
          "clearTimeout",
          "process",
          "URL",
          "fetch",
          "vi",
        ].map((name) => [name, "readonly"]),
      ),
    },
  },
);
