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
      // Disable strict TypeScript rules that are annoying
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": "warn", // Just warn, don't error
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/prefer-as-const": "off",
      
      // React/Next.js lenient rules
      "react-hooks/exhaustive-deps": "warn", // Just warn instead of error
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
      
      // General lenient rules
      "no-console": "off", // Allow console.log
      "no-debugger": "warn", // Just warn about debugger
      "prefer-const": "warn", // Just warn instead of error
    },
  },
];

export default eslintConfig;
