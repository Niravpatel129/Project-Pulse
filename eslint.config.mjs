import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      "react-hooks/exhaustive-deps": "warn",
      "react/no-array-index-key": "warn",
      "prefer-const": "error",
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/aria-role": "error",
      "@typescript-eslint/no-unused-vars": "off",
      "react/no-array-index-key": "off",
      "arrow-body-style": ["error", "always"],
    },
  },
];

export default eslintConfig;
